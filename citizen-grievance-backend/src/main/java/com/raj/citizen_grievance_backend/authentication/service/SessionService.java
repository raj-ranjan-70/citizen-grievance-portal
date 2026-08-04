package com.raj.citizen_grievance_backend.authentication.service;

import com.raj.citizen_grievance_backend.authentication.config.SessionProperties;
import com.raj.citizen_grievance_backend.authentication.entity.UserSession;
import com.raj.citizen_grievance_backend.authentication.exception.InvalidSessionException;
import com.raj.citizen_grievance_backend.authentication.exception.SessionExpiredException;
import com.raj.citizen_grievance_backend.authentication.exception.UnauthenticatedException;
import com.raj.citizen_grievance_backend.authentication.repository.UserSessionRepository;
import com.raj.citizen_grievance_backend.entity.User;
import com.raj.citizen_grievance_backend.repository.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.HexFormat;
import java.util.List;
import java.util.Optional;

@Service
public class SessionService {

    private final UserSessionRepository sessionRepository;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final SessionProperties sessionProperties;
    private final SecureRandom secureRandom = new SecureRandom();

    public SessionService(UserSessionRepository sessionRepository,
                          UserRepository userRepository,
                          PasswordEncoder passwordEncoder,
                          SessionProperties sessionProperties) {
        this.sessionRepository = sessionRepository;
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.sessionProperties = sessionProperties;
    }

    /**
     * Authenticates a user manually, enforces concurrent session limits, and persists a new session.
     */
    @Transactional
    public UserSession authenticate(String email, String password, String ip, String userAgent, String deviceFingerprint, boolean rememberMe) {
        String normalizedEmail = email.toLowerCase().trim();
        User user = userRepository.findByEmail(normalizedEmail)
                .orElseThrow(() -> new UnauthenticatedException("Invalid email or password."));

        if (!passwordEncoder.matches(password, user.getPassword())) {
            throw new UnauthenticatedException("Invalid email or password.");
        }

        // Enforce concurrent session limit
        enforceConcurrentLimit(user);

        // Generate high-entropy Session ID
        byte[] randomBytes = new byte[32];
        secureRandom.nextBytes(randomBytes);
        String sessionId = HexFormat.of().formatHex(randomBytes);

        LocalDateTime now = LocalDateTime.now();
        
        // Timeout durations (extend if rememberMe is enabled)
        long idleMinutes = rememberMe ? sessionProperties.getTimeout().toMinutes() * 4 : sessionProperties.getTimeout().toMinutes();
        long absoluteHours = rememberMe ? sessionProperties.getAbsoluteTimeout().toHours() * 7 : sessionProperties.getAbsoluteTimeout().toHours();

        UserSession session = UserSession.builder()
                .sessionId(sessionId)
                .user(user)
                .createdAt(now)
                .lastAccessedAt(now)
                .expiresAt(now.plusMinutes(idleMinutes))
                .absoluteExpiryAt(now.plusHours(absoluteHours))
                .rememberMe(rememberMe)
                .ipAddress(ip)
                .userAgent(userAgent)
                .deviceFingerprint(deviceFingerprint)
                .isValid(true)
                .build();

        return sessionRepository.save(session);
    }

    /**
     * Validates an active session and applies sliding expiration (idle timeout renewal).
     */
    @Transactional
    public User validateAndRefreshSession(String sessionId, String ip, String userAgent) {
        UserSession session = sessionRepository.findBySessionId(sessionId)
                .orElseThrow(() -> new InvalidSessionException("Session not found."));

        if (!session.isValid()) {
            throw new InvalidSessionException("Session is invalid. Reason: " + session.getLogoutReason());
        }

        LocalDateTime now = LocalDateTime.now();

        // Check absolute expiry
        if (now.isAfter(session.getAbsoluteExpiryAt())) {
            session.setValid(false);
            session.setLogoutReason("ABSOLUTE_TIMEOUT");
            sessionRepository.save(session);
            throw new SessionExpiredException("Session absolute timeout reached.");
        }

        // Check idle timeout expiry
        if (now.isAfter(session.getExpiresAt())) {
            session.setValid(false);
            session.setLogoutReason("IDLE_TIMEOUT");
            sessionRepository.save(session);
            throw new SessionExpiredException("Session has expired due to inactivity.");
        }

        // Sliding Expiration: update last_accessed_at and expires_at
        session.setLastAccessedAt(now);
        long idleMinutes = session.isRememberMe() ? sessionProperties.getTimeout().toMinutes() * 4 : sessionProperties.getTimeout().toMinutes();
        session.setExpiresAt(now.plusMinutes(idleMinutes));
        
        // Audit update fields
        session.setIpAddress(ip);
        session.setUserAgent(userAgent);

        sessionRepository.save(session);
        return session.getUser();
    }

    /**
     * Invalidate a specific session by ID.
     */
    @Transactional
    public void invalidateSession(String sessionId, String reason) {
        Optional<UserSession> sessionOpt = sessionRepository.findBySessionId(sessionId);
        if (sessionOpt.isPresent()) {
            UserSession session = sessionOpt.get();
            session.setValid(false);
            session.setLogoutReason(reason);
            sessionRepository.save(session);
        }
    }

    /**
     * Enforces the concurrent session limit policy. Invalidates oldest sessions first.
     */
    private void enforceConcurrentLimit(User user) {
        List<UserSession> activeSessions = sessionRepository.findByUserAndIsValidTrueOrderByLastAccessedAtAsc(user);
        int limit = sessionProperties.getMaxConcurrent();
        if (activeSessions.size() >= limit) {
            int sessionsToRevoke = activeSessions.size() - limit + 1;
            for (int i = 0; i < sessionsToRevoke; i++) {
                UserSession oldSession = activeSessions.get(i);
                oldSession.setValid(false);
                oldSession.setLogoutReason("CONCURRENT_LIMIT");
                sessionRepository.save(oldSession);
            }
        }
    }
}
