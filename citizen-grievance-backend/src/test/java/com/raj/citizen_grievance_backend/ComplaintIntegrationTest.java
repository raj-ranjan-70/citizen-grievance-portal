package com.raj.citizen_grievance_backend;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.raj.citizen_grievance_backend.authentication.repository.UserSessionRepository;
import com.raj.citizen_grievance_backend.dto.CommentRequest;
import com.raj.citizen_grievance_backend.dto.ComplaintRequest;
import com.raj.citizen_grievance_backend.dto.LoginRequest;
import com.raj.citizen_grievance_backend.dto.SignupRequest;
import com.raj.citizen_grievance_backend.entity.Complaint;
import com.raj.citizen_grievance_backend.entity.ComplaintStatus;
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
class ComplaintIntegrationTest {

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

    private Cookie userACookie;
    private Cookie userBCookie;
    private UUID createdComplaintId;

    @BeforeAll
    void setup() throws Exception {
        // Clean up test data
        commentRepository.deleteAll();
        complaintRepository.deleteAll();
        sessionRepository.deleteAll();
        userRepository.deleteAll();

        // Create test user A
        SignupRequest signupA = SignupRequest.builder()
                .name("Test User A")
                .email("complaintest-a@test.com")
                .password("password123")
                .build();
        mockMvc.perform(post("/api/v1/auth/signup")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(signupA)))
                .andExpect(status().isCreated());

        // Create test user B
        SignupRequest signupB = SignupRequest.builder()
                .name("Test User B")
                .email("complaintest-b@test.com")
                .password("password123")
                .build();
        mockMvc.perform(post("/api/v1/auth/signup")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(signupB)))
                .andExpect(status().isCreated());

        // Login User A
        LoginRequest loginA = LoginRequest.builder()
                .email("complaintest-a@test.com")
                .password("password123")
                .build();
        MvcResult resultA = mockMvc.perform(post("/api/v1/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(loginA)))
                .andExpect(status().isOk())
                .andReturn();
        userACookie = resultA.getResponse().getCookie("JSESSIONID");

        // Login User B
        LoginRequest loginB = LoginRequest.builder()
                .email("complaintest-b@test.com")
                .password("password123")
                .build();
        MvcResult resultB = mockMvc.perform(post("/api/v1/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(loginB)))
                .andExpect(status().isOk())
                .andReturn();
        userBCookie = resultB.getResponse().getCookie("JSESSIONID");
    }

    @AfterAll
    void cleanup() {
        commentRepository.deleteAll();
        complaintRepository.deleteAll();
        sessionRepository.deleteAll();
        userRepository.deleteAll();
    }

    @Test
    @Order(1)
    void shouldCreateComplaintSuccessfully() throws Exception {
        ComplaintRequest request = ComplaintRequest.builder()
                .title("Pothole on Main Street")
                .description("Large pothole causing traffic issues near the intersection.")
                .category("Roads & Infrastructure")
                .priority("MEDIUM")
                .build();

        MvcResult result = mockMvc.perform(post("/api/v1/citizen/complaints")
                        .cookie(userACookie)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.id").exists())
                .andExpect(jsonPath("$.data.title").value("Pothole on Main Street"))
                .andExpect(jsonPath("$.data.status").value("PENDING"))
                .andExpect(jsonPath("$.data.category").value("Roads & Infrastructure"))
                .andReturn();

        String responseContent = result.getResponse().getContentAsString();
        String idStr = responseContent.replaceAll(".*\"id\":\"([^\"]+)\".*", "$1");
        createdComplaintId = UUID.fromString(idStr);
    }

    @Test
    @Order(2)
    void shouldListOwnComplaints() throws Exception {
        mockMvc.perform(get("/api/v1/citizen/complaints")
                        .cookie(userACookie))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data").isArray())
                .andExpect(jsonPath("$.data[0].title").value("Pothole on Main Street"));
    }

    @Test
    @Order(3)
    void shouldViewComplaintDetails() throws Exception {
        mockMvc.perform(get("/api/v1/citizen/complaints/" + createdComplaintId)
                        .cookie(userACookie))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.id").value(createdComplaintId.toString()))
                .andExpect(jsonPath("$.data.title").value("Pothole on Main Street"))
                .andExpect(jsonPath("$.data.description").value("Large pothole causing traffic issues near the intersection."));
    }

    @Test
    @Order(4)
    void shouldReturn401WhenNotAuthenticated() throws Exception {
        mockMvc.perform(get("/api/v1/citizen/complaints"))
                .andExpect(status().isUnauthorized());

        ComplaintRequest request = ComplaintRequest.builder()
                .title("Pothole on Main Street")
                .description("Large pothole causing traffic issues near the intersection.")
                .category("Roads & Infrastructure")
                .priority("MEDIUM")
                .build();

        mockMvc.perform(post("/api/v1/citizen/complaints")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @Order(5)
    void shouldReturn404ForNonExistentComplaint() throws Exception {
        UUID nonExistentId = UUID.randomUUID();
        mockMvc.perform(get("/api/v1/citizen/complaints/" + nonExistentId)
                        .cookie(userACookie))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.message").exists());
    }

    @Test
    @Order(6)
    void shouldReturn400ForValidationErrors() throws Exception {
        ComplaintRequest invalidRequest = ComplaintRequest.builder()
                .title("")
                .description("")
                .category("")
                .priority("INVALID")
                .build();

        mockMvc.perform(post("/api/v1/citizen/complaints")
                        .cookie(userACookie)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(invalidRequest)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.errors").exists());
    }

    @Test
    @Order(7)
    void shouldReturn403WhenAccessingOtherUsersComplaint() throws Exception {
        mockMvc.perform(get("/api/v1/citizen/complaints/" + createdComplaintId)
                        .cookie(userBCookie))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.message").value("You do not have permission to view this complaint"));
    }

    @Test
    @Order(8)
    void shouldReturnEmptyListForUserWithNoComplaints() throws Exception {
        mockMvc.perform(get("/api/v1/citizen/complaints")
                        .cookie(userBCookie))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data").isArray())
                .andExpect(jsonPath("$.data").isEmpty());
    }

    @Test
    @Order(9)
    void shouldAddCommentSuccessfully() throws Exception {
        CommentRequest commentRequest = CommentRequest.builder()
                .content("Citizen follow-up note.")
                .build();

        mockMvc.perform(post("/api/v1/citizen/complaints/" + createdComplaintId + "/comments")
                        .cookie(userACookie)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(commentRequest)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.content").value("Citizen follow-up note."))
                .andExpect(jsonPath("$.data.authorName").value("Test User A"))
                .andExpect(jsonPath("$.data.authorRole").value("CITIZEN"));
    }

    @Test
    @Order(10)
    void shouldUpdateComplaintSuccessfully() throws Exception {
        ComplaintRequest updateRequest = ComplaintRequest.builder()
                .title("Updated Pothole Title")
                .description("Updated description stating the pothole is getting wider.")
                .category("Roads & Infrastructure")
                .priority("HIGH")
                .build();

        mockMvc.perform(put("/api/v1/citizen/complaints/" + createdComplaintId)
                        .cookie(userACookie)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(updateRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.title").value("Updated Pothole Title"))
                .andExpect(jsonPath("$.data.priority").value("HIGH"));
    }

    @Test
    @Order(11)
    void shouldFailToDeleteAssignedComplaint() throws Exception {
        // Create new complaint
        ComplaintRequest req = ComplaintRequest.builder()
                .title("Trash pile on side road")
                .description("Accumulating garbage near public park area.")
                .category("Sanitation")
                .priority("LOW")
                .build();

        MvcResult result = mockMvc.perform(post("/api/v1/citizen/complaints")
                        .cookie(userACookie)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isCreated())
                .andReturn();

        String responseContent = result.getResponse().getContentAsString();
        String idStr = responseContent.replaceAll(".*\"id\":\"([^\"]+)\".*", "$1");
        UUID tempId = UUID.fromString(idStr);

        // Manually update the status in the database to ASSIGNED
        Complaint comp = complaintRepository.findById(tempId).orElseThrow();
        comp.setStatus(ComplaintStatus.ASSIGNED);
        complaintRepository.save(comp);

        // Attempt deletion, should fail with 400 Bad Request
        mockMvc.perform(delete("/api/v1/citizen/complaints/" + tempId)
                        .cookie(userACookie))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.message").value("Cannot delete complaint. It has already been assigned or processed."));
    }

    @Test
    @Order(12)
    void shouldDeleteComplaintSuccessfullyIfPending() throws Exception {
        // Create new complaint
        ComplaintRequest req = ComplaintRequest.builder()
                .title("Flickering street light")
                .description("Light flickering causing safety issues at night.")
                .category("Electricity")
                .priority("LOW")
                .build();

        MvcResult result = mockMvc.perform(post("/api/v1/citizen/complaints")
                        .cookie(userACookie)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isCreated())
                .andReturn();

        String responseContent = result.getResponse().getContentAsString();
        String idStr = responseContent.replaceAll(".*\"id\":\"([^\"]+)\".*", "$1");
        UUID tempId = UUID.fromString(idStr);

        // Delete the complaint
        mockMvc.perform(delete("/api/v1/citizen/complaints/" + tempId)
                        .cookie(userACookie))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.message").value("Complaint deleted successfully"));

        // Verify it no longer exists
        mockMvc.perform(get("/api/v1/citizen/complaints/" + tempId)
                        .cookie(userACookie))
                .andExpect(status().isNotFound());
    }
}
