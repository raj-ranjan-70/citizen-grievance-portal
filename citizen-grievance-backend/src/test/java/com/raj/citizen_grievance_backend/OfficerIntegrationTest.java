package com.raj.citizen_grievance_backend;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.raj.citizen_grievance_backend.authentication.repository.UserSessionRepository;
import com.raj.citizen_grievance_backend.dto.*;
import com.raj.citizen_grievance_backend.entity.*;
import com.raj.citizen_grievance_backend.repository.CommentRepository;
import com.raj.citizen_grievance_backend.repository.ComplaintRepository;
import com.raj.citizen_grievance_backend.repository.UserRepository;
import com.raj.citizen_grievance_backend.util.Sha256PasswordEncoder;
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
class OfficerIntegrationTest {

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
    private Cookie officerCookie;
    private Cookie citizenCookie;
    private Cookie otherOfficerCookie;

    private UUID createdOfficerId;
    private UUID otherOfficerId;
    private UUID citizenComplaintId;

    @BeforeAll
    void setup() throws Exception {
        // Clear DB
        commentRepository.deleteAll();
        complaintRepository.deleteAll();
        sessionRepository.deleteAll();
        userRepository.deleteAll();

        // Create Admin
        User admin = User.builder()
                .name("System Admin")
                .email("admin@citizen.com")
                .passwordHash(new Sha256PasswordEncoder().encode("password"))
                .role(Role.ADMIN)
                .department(Department.NONE)
                .build();
        userRepository.save(admin);

        // Login Admin
        LoginRequest adminLogin = LoginRequest.builder()
                .email("admin@citizen.com")
                .password("password")
                .build();
        MvcResult adminRes = mockMvc.perform(post("/api/v1/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(adminLogin)))
                .andExpect(status().isOk())
                .andReturn();
        adminCookie = adminRes.getResponse().getCookie("JSESSIONID");

        // Admin creates Officer A
        CreateOfficerRequest createOfficerA = CreateOfficerRequest.builder()
                .name("Officer A")
                .email("officer-a@test.com")
                .password("password123")
                .department(Department.ROADS)
                .build();
        MvcResult offARes = mockMvc.perform(post("/api/v1/admin/officers")
                        .cookie(adminCookie)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(createOfficerA)))
                .andExpect(status().isCreated())
                .andReturn();
        String offAContent = offARes.getResponse().getContentAsString();
        createdOfficerId = UUID.fromString(offAContent.replaceAll(".*\"id\":\"([^\"]+)\".*", "$1"));

        // Admin creates Officer B (Other Officer)
        CreateOfficerRequest createOfficerB = CreateOfficerRequest.builder()
                .name("Officer B")
                .email("officer-b@test.com")
                .password("password123")
                .department(Department.WATER)
                .build();
        MvcResult offBRes = mockMvc.perform(post("/api/v1/admin/officers")
                        .cookie(adminCookie)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(createOfficerB)))
                .andExpect(status().isCreated())
                .andReturn();
        String offBContent = offBRes.getResponse().getContentAsString();
        otherOfficerId = UUID.fromString(offBContent.replaceAll(".*\"id\":\"([^\"]+)\".*", "$1"));

        // Login Officer A
        LoginRequest loginOffA = LoginRequest.builder()
                .email("officer-a@test.com")
                .password("password123")
                .build();
        MvcResult logARes = mockMvc.perform(post("/api/v1/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(loginOffA)))
                .andExpect(status().isOk())
                .andReturn();
        officerCookie = logARes.getResponse().getCookie("JSESSIONID");

        // Login Officer B
        LoginRequest loginOffB = LoginRequest.builder()
                .email("officer-b@test.com")
                .password("password123")
                .build();
        MvcResult logBRes = mockMvc.perform(post("/api/v1/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(loginOffB)))
                .andExpect(status().isOk())
                .andReturn();
        otherOfficerCookie = logBRes.getResponse().getCookie("JSESSIONID");

        // Create and Login Citizen
        SignupRequest citizenSignup = SignupRequest.builder()
                .name("Grievous Citizen")
                .email("citizen-officer-test@test.com")
                .password("password123")
                .build();
        mockMvc.perform(post("/api/v1/auth/signup")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(citizenSignup)))
                .andExpect(status().isCreated());

        LoginRequest citizenLogin = LoginRequest.builder()
                .email("citizen-officer-test@test.com")
                .password("password123")
                .build();
        MvcResult citizenLogRes = mockMvc.perform(post("/api/v1/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(citizenLogin)))
                .andExpect(status().isOk())
                .andReturn();
        citizenCookie = citizenLogRes.getResponse().getCookie("JSESSIONID");

        // Citizen creates a complaint
        ComplaintRequest compReq = ComplaintRequest.builder()
                .title("Flooded Road")
                .description("Road blocked by major drainage flood.")
                .category("Roads & Infrastructure")
                .priority("HIGH")
                .build();
        MvcResult compRes = mockMvc.perform(post("/api/v1/citizen/complaints")
                        .cookie(citizenCookie)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(compReq)))
                .andExpect(status().isCreated())
                .andReturn();
        String compContent = compRes.getResponse().getContentAsString();
        citizenComplaintId = UUID.fromString(compContent.replaceAll(".*\"id\":\"([^\"]+)\".*", "$1"));

        // Admin assigns the complaint to Officer A
        AssignOfficerRequest assignReq = AssignOfficerRequest.builder()
                .officerId(createdOfficerId)
                .build();
        mockMvc.perform(put("/api/v1/admin/complaints/" + citizenComplaintId + "/assign")
                        .cookie(adminCookie)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(assignReq)))
                .andExpect(status().isOk());
    }

    @Test
    @Order(1)
    void shouldFetchActiveComplaintsForAssignedOfficer() throws Exception {
        mockMvc.perform(get("/api/v1/officer/complaints/active")
                        .cookie(officerCookie))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data").isArray())
                .andExpect(jsonPath("$.data[0].id").value(citizenComplaintId.toString()))
                .andExpect(jsonPath("$.data[0].title").value("Flooded Road"))
                .andExpect(jsonPath("$.data[0].status").value("ASSIGNED"));
    }

    @Test
    @Order(2)
    void shouldReturnEmptyActiveComplaintsForOtherOfficer() throws Exception {
        mockMvc.perform(get("/api/v1/officer/complaints/active")
                        .cookie(otherOfficerCookie))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data").isEmpty());
    }

    @Test
    @Order(3)
    void shouldDenyAccessToNonOfficerRoleForOfficerEndpoints() throws Exception {
        // Citizen accessing officer endpoints (Should be 403 Forbidden)
        mockMvc.perform(get("/api/v1/officer/complaints/active")
                        .cookie(citizenCookie))
                .andExpect(status().isForbidden());

        // Admin accessing officer endpoints (Should be 403 Forbidden)
        mockMvc.perform(get("/api/v1/officer/complaints/active")
                        .cookie(adminCookie))
                .andExpect(status().isForbidden());
    }

    @Test
    @Order(4)
    void shouldDenyUnauthorizedAccessToOfficerEndpoints() throws Exception {
        // No session cookie (Should be 401 Unauthorized)
        mockMvc.perform(get("/api/v1/officer/complaints/active"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @Order(5)
    void shouldDenyStatusUpdateFromNonAssignedOfficer() throws Exception {
        UpdateComplaintStatusRequest updateStatus = UpdateComplaintStatusRequest.builder()
                .status(ComplaintStatus.RESOLVED)
                .build();

        mockMvc.perform(put("/api/v1/officer/complaints/" + citizenComplaintId + "/status")
                        .cookie(otherOfficerCookie)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(updateStatus)))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.message").value("Access Denied: This complaint is not assigned to you"));
    }

    @Test
    @Order(6)
    void shouldDenyCommentFromNonAssignedOfficer() throws Exception {
        CommentRequest commentReq = CommentRequest.builder()
                .content("Comment from unrelated officer.")
                .build();

        mockMvc.perform(post("/api/v1/officer/complaints/" + citizenComplaintId + "/comments")
                        .cookie(otherOfficerCookie)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(commentReq)))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.message").value("Access Denied: This complaint is not assigned to you"));
    }

    @Test
    @Order(7)
    void shouldPostCommentSuccessfullyAsAssignedOfficer() throws Exception {
        CommentRequest commentReq = CommentRequest.builder()
                .content("We are dispatching crew immediately.")
                .build();

        mockMvc.perform(post("/api/v1/officer/complaints/" + citizenComplaintId + "/comments")
                        .cookie(officerCookie)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(commentReq)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.content").value("We are dispatching crew immediately."))
                .andExpect(jsonPath("$.data.authorRole").value("OFFICER"));
    }

    @Test
    @Order(8)
    void shouldUpdateStatusSuccessfullyAsAssignedOfficer() throws Exception {
        UpdateComplaintStatusRequest updateStatus = UpdateComplaintStatusRequest.builder()
                .status(ComplaintStatus.RESOLVED)
                .build();

        mockMvc.perform(put("/api/v1/officer/complaints/" + citizenComplaintId + "/status")
                        .cookie(officerCookie)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(updateStatus)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.status").value("RESOLVED"));

        // Verify state is RESOLVED in DB
        Complaint comp = complaintRepository.findById(citizenComplaintId).orElseThrow();
        Assertions.assertEquals(ComplaintStatus.RESOLVED, comp.getStatus());
    }

    @Test
    @Order(9)
    void shouldFetchResolvedComplaintInHistoryList() throws Exception {
        // Active list should be empty
        mockMvc.perform(get("/api/v1/officer/complaints/active")
                        .cookie(officerCookie))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data").isEmpty());

        // History list should contain the resolved complaint
        mockMvc.perform(get("/api/v1/officer/complaints/history")
                        .cookie(officerCookie))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data").isArray())
                .andExpect(jsonPath("$.data[0].id").value(citizenComplaintId.toString()))
                .andExpect(jsonPath("$.data[0].status").value("RESOLVED"));
    }

    @AfterAll
    void cleanup() {
        commentRepository.deleteAll();
        complaintRepository.deleteAll();
        sessionRepository.deleteAll();
        userRepository.deleteAll();
    }
}
