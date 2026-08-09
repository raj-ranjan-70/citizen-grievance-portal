package com.raj.citizen_grievance_backend;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.raj.citizen_grievance_backend.authentication.repository.UserSessionRepository;
import com.raj.citizen_grievance_backend.dto.AssignOfficerRequest;
import com.raj.citizen_grievance_backend.dto.CreateOfficerRequest;
import com.raj.citizen_grievance_backend.dto.LoginRequest;
import com.raj.citizen_grievance_backend.dto.SignupRequest;
import com.raj.citizen_grievance_backend.entity.Complaint;
import com.raj.citizen_grievance_backend.entity.Department;
import com.raj.citizen_grievance_backend.entity.Role;
import com.raj.citizen_grievance_backend.entity.User;
import com.raj.citizen_grievance_backend.repository.CommentRepository;
import com.raj.citizen_grievance_backend.repository.ComplaintRepository;
import com.raj.citizen_grievance_backend.repository.UserRepository;
import jakarta.servlet.http.Cookie;
import org.junit.jupiter.api.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import java.util.UUID;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@TestMethodOrder(MethodOrderer.OrderAnnotation.class)
@TestInstance(TestInstance.Lifecycle.PER_CLASS)
class AdminIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ComplaintRepository complaintRepository;

    @Autowired
    private CommentRepository commentRepository;

    @Autowired
    private UserSessionRepository sessionRepository;

    private final ObjectMapper objectMapper = new ObjectMapper();

    private Cookie adminCookie;
    private Cookie citizenCookie;
    private UUID citizenComplaintId;
    private UUID createdOfficerId;

    @BeforeAll
    void setup() throws Exception {
        // Clean up DB before seeding tests
        commentRepository.deleteAll();
        complaintRepository.deleteAll();
        sessionRepository.deleteAll();
        userRepository.deleteAll();

        // Note: The DatabaseSeeder runs on startup, but since we deleted users,
        // we can manually trigger the seed or create the admin user.
        // Let's create an admin user
        SignupRequest signupAdmin = SignupRequest.builder()
                .name("System Admin")
                .email("admin@citizen.com")
                .password("password")
                .build();
        
        // Actually, we want to test if database seeder seeded the admin.
        // But since we just cleared the database, let's manually re-seed the admin or simulate startup.
        // Let's manually register admin to simulate database state (since seeder only runs once on startup)
    }

    @Test
    @Order(1)
    void shouldVerifyAdminSeededOrCreatable() throws Exception {
        // Ensure admin user exists in DB. If not, create one to simulate startup seeder
        if (!userRepository.existsByEmail("admin@citizen.com")) {
            User admin = User.builder()
                    .name("System Admin")
                    .email("admin@citizen.com")
                    .passwordHash(new com.raj.citizen_grievance_backend.util.Sha256PasswordEncoder().encode("password"))
                    .role(Role.ADMIN)
                    .department(Department.NONE)
                    .build();
            userRepository.save(admin);
        }

        // Login as Admin
        LoginRequest adminLogin = LoginRequest.builder()
                .email("admin@citizen.com")
                .password("password")
                .build();

        MvcResult result = mockMvc.perform(post("/api/v1/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(adminLogin)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.role").value("ADMIN"))
                .andReturn();

        adminCookie = result.getResponse().getCookie("JSESSIONID");
    }

    @Test
    @Order(2)
    void shouldCreateCitizenAndComplaint() throws Exception {
        // Signup a Citizen
        SignupRequest signupCitizen = SignupRequest.builder()
                .name("Grievous Citizen")
                .email("citizen-admin-test@test.com")
                .password("password123")
                .build();

        mockMvc.perform(post("/api/v1/auth/signup")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(signupCitizen)))
                .andExpect(status().isCreated());

        // Login Citizen
        LoginRequest loginCitizen = LoginRequest.builder()
                .email("citizen-admin-test@test.com")
                .password("password123")
                .build();

        MvcResult result = mockMvc.perform(post("/api/v1/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(loginCitizen)))
                .andExpect(status().isOk())
                .andReturn();

        citizenCookie = result.getResponse().getCookie("JSESSIONID");

        // Citizen creates a complaint
        com.raj.citizen_grievance_backend.dto.ComplaintRequest req = com.raj.citizen_grievance_backend.dto.ComplaintRequest.builder()
                .title("Burst water pipe")
                .description("Flooding street with clean drinking water.")
                .category("Water Supply")
                .priority("HIGH")
                .build();

        MvcResult compResult = mockMvc.perform(post("/api/v1/citizen/complaints")
                        .cookie(citizenCookie)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isCreated())
                .andReturn();

        String responseContent = compResult.getResponse().getContentAsString();
        String idStr = responseContent.replaceAll(".*\"id\":\"([^\"]+)\".*", "$1");
        citizenComplaintId = UUID.fromString(idStr);
    }

    @Test
    @Order(3)
    void shouldDenyAccessToNonAdminForAdminEndpoints() throws Exception {
        // Try creating officer as citizen (Should be 403 Forbidden)
        CreateOfficerRequest createOfficer = CreateOfficerRequest.builder()
                .name("Officer Roy")
                .email("roy@citizen.com")
                .password("password123")
                .department(Department.WATER)
                .build();

        mockMvc.perform(post("/api/v1/admin/officers")
                        .cookie(citizenCookie)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(createOfficer)))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.success").value(false));

        // Try getting all complaints as citizen (Should be 403 Forbidden)
        mockMvc.perform(get("/api/v1/admin/complaints")
                        .cookie(citizenCookie))
                .andExpect(status().isForbidden());
    }

    @Test
    @Order(4)
    void shouldDenyAccessToUnauthenticatedForAdminEndpoints() throws Exception {
        // Try getting complaints without cookies (Should be 401 Unauthorized)
        mockMvc.perform(get("/api/v1/admin/complaints"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @Order(5)
    void shouldCreateOfficerSuccessfullyAsAdmin() throws Exception {
        CreateOfficerRequest createOfficer = CreateOfficerRequest.builder()
                .name("Officer Roy")
                .email("roy@citizen.com")
                .password("password123")
                .department(Department.WATER)
                .build();

        MvcResult result = mockMvc.perform(post("/api/v1/admin/officers")
                        .cookie(adminCookie)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(createOfficer)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.name").value("Officer Roy"))
                .andExpect(jsonPath("$.data.role").value("OFFICER"))
                .andExpect(jsonPath("$.data.department").value("WATER"))
                .andReturn();

        String responseContent = result.getResponse().getContentAsString();
        String idStr = responseContent.replaceAll(".*\"id\":\"([^\"]+)\".*", "$1");
        createdOfficerId = UUID.fromString(idStr);
    }

    @Test
    @Order(6)
    void shouldListOfficersAsAdmin() throws Exception {
        mockMvc.perform(get("/api/v1/admin/officers")
                        .cookie(adminCookie))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data").isArray())
                .andExpect(jsonPath("$.data[0].name").value("Officer Roy"));
    }

    @Test
    @Order(7)
    void shouldListAllComplaintsAsAdmin() throws Exception {
        mockMvc.perform(get("/api/v1/admin/complaints")
                        .cookie(adminCookie))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data").isArray())
                .andExpect(jsonPath("$.data[0].title").value("Burst water pipe"));
    }

    @Test
    @Order(8)
    @org.springframework.transaction.annotation.Transactional
    void shouldAssignComplaintToOfficerSuccessfully() throws Exception {
        AssignOfficerRequest assignReq = AssignOfficerRequest.builder()
                .officerId(createdOfficerId)
                .build();

        mockMvc.perform(put("/api/v1/admin/complaints/" + citizenComplaintId + "/assign")
                        .cookie(adminCookie)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(assignReq)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.status").value("ASSIGNED"))
                .andExpect(jsonPath("$.data.assignedOfficerName").value("Officer Roy"));

        // Verify database state
        Complaint comp = complaintRepository.findById(citizenComplaintId).orElseThrow();
        Assertions.assertEquals(com.raj.citizen_grievance_backend.entity.ComplaintStatus.ASSIGNED, comp.getStatus());
        Assertions.assertEquals("Officer Roy", comp.getAssignedOfficer().getName());
    }

    @Test
    @Order(9)
    void shouldFailToAssignComplaintToNonOfficer() throws Exception {
        // Fetch citizen ID to try and assign to citizen instead of officer
        User citizen = userRepository.findByEmail("citizen-admin-test@test.com").orElseThrow();
        UUID citizenId = citizen.getId();

        AssignOfficerRequest assignReq = AssignOfficerRequest.builder()
                .officerId(citizenId)
                .build();

        mockMvc.perform(put("/api/v1/admin/complaints/" + citizenComplaintId + "/assign")
                        .cookie(adminCookie)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(assignReq)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.message").value("Selected user is not an Officer"));
    }

    @AfterAll
    void cleanup() {
        commentRepository.deleteAll();
        complaintRepository.deleteAll();
        sessionRepository.deleteAll();
        userRepository.deleteAll();
    }
}
