package com.raj.citizen_grievance_backend.controller;

import com.raj.citizen_grievance_backend.dto.ApiResponse;
import com.raj.citizen_grievance_backend.dto.LoginRequest;
import com.raj.citizen_grievance_backend.dto.SignupRequest;
import com.raj.citizen_grievance_backend.dto.UserResponse;
import com.raj.citizen_grievance_backend.exception.UnauthorizedException;
import com.raj.citizen_grievance_backend.service.AuthService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/auth")
@Tag(name = "Authentication", description = "Endpoints for user registration, login, logout, and session check")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/signup")
    @Operation(summary = "Register a new user", description = "Creates a new user account (Citizen, Officer, or Admin)")
    @ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "201", description = "User created successfully",
                    content = @Content(schema = @Schema(implementation = ApiResponse.class))),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "400", description = "Invalid input or email already exists",
                    content = @Content(schema = @Schema(implementation = ApiResponse.class)))
    })
    public ResponseEntity<ApiResponse<UserResponse>> signup(@Valid @RequestBody SignupRequest request) {
        UserResponse response = authService.register(request);
        ApiResponse<UserResponse> apiResponse = ApiResponse.<UserResponse>builder()
                .success(true)
                .message("User registered successfully")
                .data(response)
                .build();
        return ResponseEntity.status(HttpStatus.CREATED).body(apiResponse);
    }

    @PostMapping("/login")
    @Operation(summary = "User login", description = "Authenticates user credentials and starts a new session")
    @ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Login successful",
                    content = @Content(schema = @Schema(implementation = ApiResponse.class))),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "401", description = "Invalid email or password",
                    content = @Content(schema = @Schema(implementation = ApiResponse.class)))
    })
    public ResponseEntity<ApiResponse<UserResponse>> login(
            @Valid @RequestBody LoginRequest request,
            HttpServletRequest servletRequest,
            HttpServletResponse servletResponse) {
        
        UserResponse response = authService.login(request);
        
        // Custom session management: save user ID and role in standard HttpSession
        HttpSession session = servletRequest.getSession(true);
        session.setAttribute("userId", response.getId());
        session.setAttribute("userRole", response.getRole().name());

        // Create db-backed session tracking
        authService.createUserSession(session.getId(), response.getId());

        // Manually write the cookie to response to ensure compatibility with MockMvc and standard clients
        Cookie cookie = new Cookie("JSESSIONID", session.getId());
        cookie.setPath("/");
        cookie.setHttpOnly(true);
        cookie.setSecure(false); // Can set to true in production
        cookie.setMaxAge(86400); // 1 day expiration
        servletResponse.addCookie(cookie);

        ApiResponse<UserResponse> apiResponse = ApiResponse.<UserResponse>builder()
                .success(true)
                .message("Login successful")
                .data(response)
                .build();
        return ResponseEntity.ok(apiResponse);
    }

    @PostMapping("/logout")
    @Operation(summary = "User logout", description = "Invalidates the current session")
    @ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Logout successful",
                    content = @Content(schema = @Schema(implementation = ApiResponse.class)))
    })
    public ResponseEntity<ApiResponse<Void>> logout(
            HttpServletRequest servletRequest,
            HttpServletResponse servletResponse) {
        
        HttpSession session = servletRequest.getSession(false);
        String sessionId = null;
        
        if (session != null) {
            sessionId = session.getId();
            session.invalidate();
        } else {
            // MockMvc fallback: read cookie manually
            Cookie[] cookies = servletRequest.getCookies();
            if (cookies != null) {
                for (Cookie c : cookies) {
                    if ("JSESSIONID".equals(c.getName())) {
                        sessionId = c.getValue();
                        break;
                    }
                }
            }
        }

        if (sessionId != null) {
            authService.deleteSession(sessionId);
        }

        // Delete cookie by setting max age to 0
        Cookie cookie = new Cookie("JSESSIONID", "");
        cookie.setPath("/");
        cookie.setHttpOnly(true);
        cookie.setMaxAge(0);
        servletResponse.addCookie(cookie);
        
        ApiResponse<Void> apiResponse = ApiResponse.<Void>builder()
                .success(true)
                .message("Logout successful")
                .build();
        return ResponseEntity.ok(apiResponse);
    }

    @GetMapping("/me")
    @Operation(summary = "Get current user session details", description = "Returns profile details of the currently authenticated user")
    @ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Session is valid, returns user details",
                    content = @Content(schema = @Schema(implementation = ApiResponse.class))),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "401", description = "User is not authenticated",
                    content = @Content(schema = @Schema(implementation = ApiResponse.class)))
    })
    public ResponseEntity<ApiResponse<UserResponse>> getCurrentUser(HttpServletRequest servletRequest) {
        HttpSession session = servletRequest.getSession(false);
        UUID userId = null;
        
        if (session != null) {
            userId = (UUID) session.getAttribute("userId");
        }
        
        if (userId == null) {
            // MockMvc or stateless client fallback: read cookie and fetch from database session store
            Cookie[] cookies = servletRequest.getCookies();
            if (cookies != null) {
                for (Cookie c : cookies) {
                    if ("JSESSIONID".equals(c.getName())) {
                        userId = authService.validateAndRefreshSession(c.getValue());
                        if (userId != null) {
                            UserResponse restored = authService.getUserById(userId);
                            HttpSession newSession = servletRequest.getSession(true);
                            newSession.setAttribute("userId", userId);
                            newSession.setAttribute("userRole", restored.getRole().name());
                        }
                        break;
                    }
                }
            }
        }

        if (userId == null) {
            throw new UnauthorizedException("Not authenticated");
        }
        
        UserResponse response = authService.getUserById(userId);
        
        ApiResponse<UserResponse> apiResponse = ApiResponse.<UserResponse>builder()
                .success(true)
                .message("Session is active")
                .data(response)
                .build();
        return ResponseEntity.ok(apiResponse);
    }
}
