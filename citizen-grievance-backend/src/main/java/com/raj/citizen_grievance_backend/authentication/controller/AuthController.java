package com.raj.citizen_grievance_backend.authentication.controller;

import com.raj.citizen_grievance_backend.authentication.context.CurrentUserProvider;
import com.raj.citizen_grievance_backend.authentication.cookie.CookieService;
import com.raj.citizen_grievance_backend.authentication.dto.LoginRequest;
import com.raj.citizen_grievance_backend.authentication.dto.SignupRequest;
import com.raj.citizen_grievance_backend.authentication.entity.UserSession;
import com.raj.citizen_grievance_backend.authentication.exception.UnauthenticatedException;
import com.raj.citizen_grievance_backend.authentication.service.SessionService;
import com.raj.citizen_grievance_backend.entity.User;
import com.raj.citizen_grievance_backend.repository.UserRepository;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/v1/auth")
public class AuthController {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final SessionService sessionService;
    private final CookieService cookieService;
    private final CurrentUserProvider currentUserProvider;

    public AuthController(UserRepository userRepository,
                          PasswordEncoder passwordEncoder,
                          SessionService sessionService,
                          CookieService cookieService,
                          CurrentUserProvider currentUserProvider) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.sessionService = sessionService;
        this.cookieService = cookieService;
        this.currentUserProvider = currentUserProvider;
    }

    /**
     * POST /api/v1/auth/signup — Registers a new user.
     */
    @PostMapping("/signup")
    public ResponseEntity<?> signup(@Valid @RequestBody SignupRequest request) {
        String email = request.getEmail().toLowerCase().trim();
        if (userRepository.findByEmail(email).isPresent()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("message", "Email address is already in use."));
        }

        // Determine default role
        String role = email.contains("officer") ? "officer" : "citizen";

        User user = User.builder()
                .name(request.getName())
                .email(email)
                .password(passwordEncoder.encode(request.getPassword()))
                .role(role)
                .build();

        User savedUser = userRepository.save(user);
        savedUser.setPassword(null); // Clear password hash before returning

        return ResponseEntity.status(HttpStatus.CREATED).body(savedUser);
    }

    /**
     * POST /api/v1/auth/login — Authenticates credentials and sets session cookie.
     */
    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody LoginRequest request,
                                   HttpServletRequest servletRequest,
                                   HttpServletResponse servletResponse) {
        String ip = getClientIp(servletRequest);
        String userAgent = servletRequest.getHeader("User-Agent");

        UserSession session = sessionService.authenticate(
                request.getEmail(),
                request.getPassword(),
                ip,
                userAgent,
                null,
                request.isRememberMe()
        );

        cookieService.setSessionCookie(servletResponse, session.getSessionId(), request.isRememberMe());

        User user = session.getUser();
        user.setPassword(null); // Clear password hash

        return ResponseEntity.ok(user);
    }

    /**
     * POST /api/v1/auth/logout — Invalidates database session and clears cookie.
     */
    @PostMapping("/logout")
    public ResponseEntity<?> logout(HttpServletRequest servletRequest, HttpServletResponse servletResponse) {
        Optional<String> sessionIdOpt = cookieService.extractSessionId(servletRequest);
        sessionIdOpt.ifPresent(sessionId -> sessionService.invalidateSession(sessionId, "MANUAL"));
        cookieService.clearSessionCookie(servletResponse);

        return ResponseEntity.ok(Map.of("success", true, "message", "Logged out successfully."));
    }

    /**
     * GET /api/v1/auth/me — Retrieves authenticated user context.
     */
    @GetMapping("/me")
    public ResponseEntity<?> getCurrentUser() {
        User user = currentUserProvider.getCurrentUser()
                .orElseThrow(() -> new UnauthenticatedException("No active session found."));
        user.setPassword(null); // Clear password hash

        return ResponseEntity.ok(user);
    }

    private String getClientIp(HttpServletRequest request) {
        String xfHeader = request.getHeader("X-Forwarded-For");
        if (xfHeader == null || xfHeader.isBlank()) {
            return request.getRemoteAddr();
        }
        return xfHeader.split(",")[0].trim();
    }
}
