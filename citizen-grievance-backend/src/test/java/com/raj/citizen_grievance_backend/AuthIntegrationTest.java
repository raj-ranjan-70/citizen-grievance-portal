package com.raj.citizen_grievance_backend;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.raj.citizen_grievance_backend.dto.LoginRequest;
import com.raj.citizen_grievance_backend.dto.SignupRequest;
import com.raj.citizen_grievance_backend.authentication.repository.UserSessionRepository;
import com.raj.citizen_grievance_backend.entity.Role;
import com.raj.citizen_grievance_backend.repository.UserRepository;
import jakarta.servlet.http.Cookie;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
public class AuthIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private UserSessionRepository sessionRepository;

    private final ObjectMapper objectMapper = new ObjectMapper();

    @BeforeEach
    void setup() {
        sessionRepository.deleteAll();
        userRepository.deleteAll();
    }

    @Test
    void shouldRegisterUserSuccessfully() throws Exception {
        SignupRequest request = SignupRequest.builder()
                .name("John Doe")
                .email("john.doe@example.com")
                .password("password123")
                .build();

        mockMvc.perform(post("/api/v1/auth/signup")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.message").value("User registered successfully"))
                .andExpect(jsonPath("$.data.id").exists())
                .andExpect(jsonPath("$.data.name").value("John Doe"))
                .andExpect(jsonPath("$.data.email").value("john.doe@example.com"))
                .andExpect(jsonPath("$.data.role").value("CITIZEN"));
    }

    @Test
    void shouldFailRegisterWithDuplicateEmail() throws Exception {
        SignupRequest request = SignupRequest.builder()
                .name("John Doe")
                .email("john.doe@example.com")
                .password("password123")
                .build();

        // Register first time
        mockMvc.perform(post("/api/v1/auth/signup")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated());

        // Register second time
        mockMvc.perform(post("/api/v1/auth/signup")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.message").value("Email 'john.doe@example.com' is already registered"));
    }

    @Test
    void shouldFailRegisterWithValidationErrors() throws Exception {
        SignupRequest request = SignupRequest.builder()
                .name("") // blank
                .email("invalid-email") // invalid email format
                .password("123") // too short
                .build();

        mockMvc.perform(post("/api/v1/auth/signup")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.errors").exists())
                .andExpect(jsonPath("$.errors.name").exists())
                .andExpect(jsonPath("$.errors.email").exists())
                .andExpect(jsonPath("$.errors.password").exists());
    }

    @Test
    void shouldLoginSuccessfully() throws Exception {
        // Register user
        SignupRequest signup = SignupRequest.builder()
                .name("Jane Doe")
                .email("jane.doe@example.com")
                .password("password123")
                .build();
        mockMvc.perform(post("/api/v1/auth/signup")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(signup)))
                .andExpect(status().isCreated());

        // Login
        LoginRequest login = LoginRequest.builder()
                .email("jane.doe@example.com")
                .password("password123")
                .build();

        mockMvc.perform(post("/api/v1/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(login)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.message").value("Login successful"))
                .andExpect(jsonPath("$.data.email").value("jane.doe@example.com"));
    }

    @Test
    void shouldFailLoginWithInvalidCredentials() throws Exception {
        LoginRequest login = LoginRequest.builder()
                .email("nobody@example.com")
                .password("wrongpassword")
                .build();

        mockMvc.perform(post("/api/v1/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(login)))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.message").value("Invalid email or password"));
    }

    @Test
    void shouldManageSessionLifecycle() throws Exception {
        // Signup
        SignupRequest signup = SignupRequest.builder()
                .name("Session User")
                .email("session@example.com")
                .password("password123")
                .build();
        mockMvc.perform(post("/api/v1/auth/signup")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(signup)))
                .andExpect(status().isCreated());

        // Login and get cookie
        LoginRequest login = LoginRequest.builder()
                .email("session@example.com")
                .password("password123")
                .build();

        MvcResult result = mockMvc.perform(post("/api/v1/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(login)))
                .andExpect(status().isOk())
                .andReturn();

        Cookie sessionCookie = result.getResponse().getCookie("JSESSIONID");
        org.junit.jupiter.api.Assertions.assertNotNull(sessionCookie);

        // Access /me with session
        mockMvc.perform(get("/api/v1/auth/me")
                        .cookie(sessionCookie))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.email").value("session@example.com"));

        // Logout
        mockMvc.perform(post("/api/v1/auth/logout")
                        .cookie(sessionCookie))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true));

        // Access /me after logout - should fail
        mockMvc.perform(get("/api/v1/auth/me")
                        .cookie(sessionCookie))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.success").value(false));
    }
}
