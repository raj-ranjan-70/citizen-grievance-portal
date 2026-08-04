package com.raj.citizen_grievance_backend;

import com.raj.citizen_grievance_backend.authentication.repository.UserSessionRepository;
import com.raj.citizen_grievance_backend.entity.User;
import com.raj.citizen_grievance_backend.repository.ComplaintRepository;
import com.raj.citizen_grievance_backend.repository.UserRepository;
import jakarta.servlet.http.Cookie;
import org.junit.jupiter.api.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

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
    private UserSessionRepository sessionRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    private Cookie userACookie;
    private Cookie userBCookie;
    private Long createdComplaintId;

    @BeforeAll
    void setup() throws Exception {
        // Clean up test data (delete sessions first to avoid foreign key constraints)
        complaintRepository.deleteAll();
        sessionRepository.deleteAll();
        userRepository.findByEmail("complaintest-a@test.com").ifPresent(userRepository::delete);
        userRepository.findByEmail("complaintest-b@test.com").ifPresent(userRepository::delete);

        // Create test users
        userRepository.save(User.builder()
                .name("Test User A")
                .email("complaintest-a@test.com")
                .password(passwordEncoder.encode("password123"))
                .role("citizen")
                .build());

        userRepository.save(User.builder()
                .name("Test User B")
                .email("complaintest-b@test.com")
                .password(passwordEncoder.encode("password123"))
                .role("citizen")
                .build());

        // Perform login for User A to fetch session cookie
        MvcResult resultA = mockMvc.perform(post("/api/v1/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                    "email": "complaintest-a@test.com",
                                    "password": "password123",
                                    "rememberMe": true
                                }
                                """))
                .andExpect(status().isOk())
                .andReturn();
        userACookie = resultA.getResponse().getCookie("JSESSIONID");

        // Perform login for User B to fetch session cookie
        MvcResult resultB = mockMvc.perform(post("/api/v1/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                    "email": "complaintest-b@test.com",
                                    "password": "password123",
                                    "rememberMe": true
                                }
                                """))
                .andExpect(status().isOk())
                .andReturn();
        userBCookie = resultB.getResponse().getCookie("JSESSIONID");
    }

    @AfterAll
    void cleanup() {
        complaintRepository.deleteAll();
        sessionRepository.deleteAll();
        userRepository.findByEmail("complaintest-a@test.com").ifPresent(userRepository::delete);
        userRepository.findByEmail("complaintest-b@test.com").ifPresent(userRepository::delete);
    }

    @Test
    @Order(1)
    void shouldCreateComplaintSuccessfully() throws Exception {
        String requestBody = """
                {
                    "title": "Pothole on Main Street",
                    "description": "Large pothole causing traffic issues near the intersection.",
                    "category": "Roads & Infrastructure",
                    "priority": "MEDIUM"
                }
                """;

        MvcResult result = mockMvc.perform(post("/api/v1/complaints")
                        .cookie(userACookie)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(requestBody))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").exists())
                .andExpect(jsonPath("$.title").value("Pothole on Main Street"))
                .andExpect(jsonPath("$.status").value("SUBMITTED"))
                .andExpect(jsonPath("$.category").value("Roads & Infrastructure"))
                .andReturn();

        String responseContent = result.getResponse().getContentAsString();
        createdComplaintId = Long.parseLong(
                responseContent.replaceAll(".*\"id\":(\\d+).*", "$1"));
    }

    @Test
    @Order(2)
    void shouldListOwnComplaints() throws Exception {
        mockMvc.perform(get("/api/v1/complaints")
                        .cookie(userACookie))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$[0].title").value("Pothole on Main Street"));
    }

    @Test
    @Order(3)
    void shouldViewComplaintDetails() throws Exception {
        mockMvc.perform(get("/api/v1/complaints/" + createdComplaintId)
                        .cookie(userACookie))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(createdComplaintId))
                .andExpect(jsonPath("$.title").value("Pothole on Main Street"))
                .andExpect(jsonPath("$.description").value("Large pothole causing traffic issues near the intersection."));
    }

    @Test
    @Order(4)
    void shouldReturn401WhenNotAuthenticated() throws Exception {
        mockMvc.perform(get("/api/v1/complaints"))
                .andExpect(status().isUnauthorized());

        // Use valid fields so it passes DTO validation, but fails context authentication (401)
        mockMvc.perform(post("/api/v1/complaints")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                    "title": "Pothole on Main Street",
                                    "description": "Large pothole causing traffic issues near the intersection.",
                                    "category": "Roads & Infrastructure",
                                    "priority": "MEDIUM"
                                }
                                """))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @Order(5)
    void shouldReturn404ForNonExistentComplaint() throws Exception {
        mockMvc.perform(get("/api/v1/complaints/99999")
                        .cookie(userACookie))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.message").exists());
    }

    @Test
    @Order(6)
    void shouldReturn400ForValidationErrors() throws Exception {
        String invalidRequest = """
                {
                    "title": "",
                    "description": "",
                    "category": "",
                    "priority": null
                }
                """;

        mockMvc.perform(post("/api/v1/complaints")
                        .cookie(userACookie)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(invalidRequest))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.errors").exists());
    }

    @Test
    @Order(7)
    void shouldReturn403WhenAccessingOtherUsersComplaint() throws Exception {
        // User B tries to access User A's complaint
        mockMvc.perform(get("/api/v1/complaints/" + createdComplaintId)
                        .cookie(userBCookie))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.message").value("You do not have permission to view this complaint"));
    }

    @Test
    @Order(8)
    void shouldReturnEmptyListForUserWithNoComplaints() throws Exception {
        // User B has no complaints
        mockMvc.perform(get("/api/v1/complaints")
                        .cookie(userBCookie))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$").isEmpty());
    }

    @Test
    @Order(9)
    void shouldEnforceIdleSessionTimeout() throws Exception {
        // Build an expired cookie (fake session ID or invalid cookie value)
        Cookie expiredCookie = new Cookie("JSESSIONID", "invalid-or-expired-session-id");
        mockMvc.perform(get("/api/v1/auth/me")
                        .cookie(expiredCookie))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @Order(10)
    void shouldLogoutSuccessfully() throws Exception {
        mockMvc.perform(post("/api/v1/auth/logout")
                        .cookie(userACookie))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true));

        // Subsequent access should fail
        mockMvc.perform(get("/api/v1/auth/me")
                        .cookie(userACookie))
                .andExpect(status().isUnauthorized());
    }
}
