package com.raj.citizen_grievance_backend.service;

import com.raj.citizen_grievance_backend.authentication.repository.UserSessionRepository;
import com.raj.citizen_grievance_backend.dto.LoginRequest;
import com.raj.citizen_grievance_backend.dto.SignupRequest;
import com.raj.citizen_grievance_backend.dto.UserResponse;
import com.raj.citizen_grievance_backend.entity.Department;
import com.raj.citizen_grievance_backend.entity.Role;
import com.raj.citizen_grievance_backend.entity.User;
import com.raj.citizen_grievance_backend.entity.UserSession;
import com.raj.citizen_grievance_backend.exception.EmailAlreadyExistsException;
import com.raj.citizen_grievance_backend.exception.InvalidCredentialsException;
import com.raj.citizen_grievance_backend.repository.UserRepository;
import com.raj.citizen_grievance_backend.util.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.UUID;

@Service
@Transactional(readOnly = true)
public class AuthService {

    private final UserRepository userRepository;
    private final UserSessionRepository sessionRepository;
    private final PasswordEncoder passwordEncoder;

    public AuthService(UserRepository userRepository, UserSessionRepository sessionRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.sessionRepository = sessionRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Transactional
    public UserResponse register(SignupRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new EmailAlreadyExistsException("Email '" + request.getEmail() + "' is already registered");
        }

        User user = User.builder()
                .name(request.getName())
                .email(request.getEmail())
                .passwordHash(passwordEncoder.encode(request.getPassword()))
                .role(Role.CITIZEN)
                .department(Department.NONE)
                .build();

        User savedUser = userRepository.save(user);
        return mapToResponse(savedUser);
    }

    public UserResponse login(LoginRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new InvalidCredentialsException("Invalid email or password"));

        if (!passwordEncoder.matches(request.getPassword(), user.getPasswordHash())) {
            throw new InvalidCredentialsException("Invalid email or password");
        }

        return mapToResponse(user);
    }

    public UserResponse getUserById(UUID id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new InvalidCredentialsException("User session is invalid or user no longer exists"));
        return mapToResponse(user);
    }

    @Transactional
    public void createUserSession(String sessionId, UUID userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        UserSession session = UserSession.builder()
                .id(sessionId)
                .user(user)
                .lastAccessTime(LocalDateTime.now())
                .expiryTime(LocalDateTime.now().plusMinutes(30)) // 30 minutes session timeout
                .build();

        sessionRepository.save(session);
    }

    @Transactional
    public UUID validateAndRefreshSession(String sessionId) {
        UserSession session = sessionRepository.findById(sessionId).orElse(null);
        if (session == null) {
            return null;
        }

        if (session.getExpiryTime().isBefore(LocalDateTime.now())) {
            sessionRepository.delete(session);
            return null;
        }

        // Update last access and expiry time (refresh session)
        session.setLastAccessTime(LocalDateTime.now());
        session.setExpiryTime(LocalDateTime.now().plusMinutes(30));
        sessionRepository.save(session);

        return session.getUser().getId();
    }

    @Transactional
    public void deleteSession(String sessionId) {
        sessionRepository.findById(sessionId).ifPresent(sessionRepository::delete);
    }

    private UserResponse mapToResponse(User user) {
        return UserResponse.builder()
                .id(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .role(user.getRole())
                .department(user.getDepartment())
                .build();
    }
}
