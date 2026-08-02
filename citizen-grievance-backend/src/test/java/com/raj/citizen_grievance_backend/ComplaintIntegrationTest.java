package com.raj.citizen_grievance_backend;

import com.raj.citizen_grievance_backend.entity.ComplaintCategory;
import com.raj.citizen_grievance_backend.entity.User;
import com.raj.citizen_grievance_backend.repository.ComplaintCategoryRepository;
import com.raj.citizen_grievance_backend.repository.ComplaintRepository;
import com.raj.citizen_grievance_backend.repository.UserRepository;
import org.junit.jupiter.api.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.mock.web.MockHttpSession;
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
    private ComplaintCategoryRepository categoryRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    private MockHttpSession userASession;
    private MockHttpSession userBSession;
    private Long createdComplaintId;

    @BeforeAll
    void setup() {
        // Clean up test data
        complaintRepository.deleteAll();
        userRepository.findByEmail("complaintest-a@test.com")
                .ifPresent(u -> userRepository.delete(u));
        userRepository.findByEmail("complaintest-b@test.com")
                .ifPresent(u -> userRepository.delete(u));

        // Create test users
        User userA = userRepository.save(User.builder()
                .name("Test User A")
                .email("complaintest-a@test.com")
                .password(passwordEncoder.encode("password123"))
                .role("citizen")
                .build());

        User userB = userRepository.save(User.builder()
                .name("Test User B")
                .email("complaintest-b@test.com")
                .password(passwordEncoder.encode("password123"))
                .role("citizen")
                .build());

        // Build sessions with password-stripped users (matching AuthController login behavior)
        userASession = new MockHttpSession();
        userASession.setAttribute("currentUser", User.builder()
                .id(userA.getId())
                .name(userA.getName())
                .email(userA.getEmail())
                .role(userA.getRole())
                .build());

        userBSession = new MockHttpSession();
        userBSession.setAttribute("currentUser", User.builder()
                .id(userB.getId())
                .name(userB.getName())
                .email(userB.getEmail())
                .role(userB.getRole())
                .build());
    }

    @AfterAll
    void cleanup() {
        complaintRepository.deleteAll();
        userRepository.findByEmail("complaintest-a@test.com")
                .ifPresent(u -> userRepository.delete(u));
        userRepository.findByEmail("complaintest-b@test.com")
                .ifPresent(u -> userRepository.delete(u));
    }

    @Test
    @Order(1)
    void shouldCreateComplaintSuccessfully() throws Exception {
        // Get a valid category ID
        ComplaintCategory category = categoryRepository.findByName("Roads & Infrastructure")
                .orElseThrow();

        String requestBody = """
                {
                    "title": "Pothole on Main Street",
                    "description": "Large pothole causing traffic issues near the intersection.",
                    "categoryId": %d
                }
                """.formatted(category.getId());

        MvcResult result = mockMvc.perform(post("/api/complaints")
                        .session(userASession)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(requestBody))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").exists())
                .andExpect(jsonPath("$.title").value("Pothole on Main Street"))
                .andExpect(jsonPath("$.status").value("PENDING"))
                .andExpect(jsonPath("$.categoryName").value("Roads & Infrastructure"))
                .andExpect(jsonPath("$.userName").value("Test User A"))
                .andReturn();

        // Extract the complaint ID for later tests
        String response = result.getResponse().getContentAsString();
        createdComplaintId = Long.parseLong(
                response.replaceAll(".*\"id\":(\\d+).*", "$1"));
    }

    @Test
    @Order(2)
    void shouldListOwnComplaints() throws Exception {
        mockMvc.perform(get("/api/complaints")
                        .session(userASession))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$[0].title").value("Pothole on Main Street"))
                .andExpect(jsonPath("$[0].userName").value("Test User A"));
    }

    @Test
    @Order(3)
    void shouldViewComplaintDetails() throws Exception {
        mockMvc.perform(get("/api/complaints/" + createdComplaintId)
                        .session(userASession))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(createdComplaintId))
                .andExpect(jsonPath("$.title").value("Pothole on Main Street"))
                .andExpect(jsonPath("$.description").value("Large pothole causing traffic issues near the intersection."));
    }

    @Test
    @Order(4)
    void shouldReturn401WhenNotAuthenticated() throws Exception {
        mockMvc.perform(get("/api/complaints"))
                .andExpect(status().isUnauthorized());

        mockMvc.perform(post("/api/complaints")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"title": "Test", "description": "Test", "categoryId": 1}
                                """))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @Order(5)
    void shouldReturn404ForNonExistentComplaint() throws Exception {
        mockMvc.perform(get("/api/complaints/99999")
                        .session(userASession))
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
                    "categoryId": null
                }
                """;

        mockMvc.perform(post("/api/complaints")
                        .session(userASession)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(invalidRequest))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.errors").exists());
    }

    @Test
    @Order(7)
    void shouldReturn403WhenAccessingOtherUsersComplaint() throws Exception {
        // User B tries to access User A's complaint
        mockMvc.perform(get("/api/complaints/" + createdComplaintId)
                        .session(userBSession))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.message").value("You do not have permission to view this complaint"));
    }

    @Test
    @Order(8)
    void shouldReturnEmptyListForUserWithNoComplaints() throws Exception {
        // User B has no complaints
        mockMvc.perform(get("/api/complaints")
                        .session(userBSession))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$").isEmpty());
    }

    @Test
    @Order(9)
    void shouldListCategories() throws Exception {
        mockMvc.perform(get("/api/complaints/categories")
                        .session(userASession))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$[0].name").exists());
    }
}
