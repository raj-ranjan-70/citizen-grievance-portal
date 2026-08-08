package com.raj.citizen_grievance_backend.filter;

import com.raj.citizen_grievance_backend.exception.ForbiddenException;
import com.raj.citizen_grievance_backend.service.AuthService;
import com.raj.citizen_grievance_backend.repository.UserRepository;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;

import java.util.UUID;

/**
 * Restores the authenticated userId and userRole into the HttpSession when a valid
 * JSESSIONID cookie is present but the in-memory session has expired or was invalidated.
 * This is the primary authentication gate for all protected API paths.
 */
@Component
public class AuthInterceptor implements HandlerInterceptor {

    private final AuthService authService;
    private final UserRepository userRepository;

    public AuthInterceptor(AuthService authService, UserRepository userRepository) {
        this.authService = authService;
        this.userRepository = userRepository;
    }

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) throws Exception {
        // Allow CORS preflight OPTIONS requests to pass
        if ("OPTIONS".equalsIgnoreCase(request.getMethod())) {
            return true;
        }

        HttpSession session = request.getSession(false);
        UUID userId = null;

        if (session != null) {
            userId = (UUID) session.getAttribute("userId");
        }

        if (userId == null) {
            // Read cookie and validate database-backed session
            Cookie[] cookies = request.getCookies();
            if (cookies != null) {
                for (Cookie c : cookies) {
                    if ("JSESSIONID".equals(c.getName())) {
                        userId = authService.validateAndRefreshSession(c.getValue());
                        if (userId != null) {
                            // Restore both userId and userRole into the session
                            final UUID finalUserId = userId;
                            userRepository.findById(finalUserId).ifPresent(user -> {
                                HttpSession newSession = request.getSession(true);
                                newSession.setAttribute("userId", finalUserId);
                                newSession.setAttribute("userRole", user.getRole().name());
                            });
                        }
                        break;
                    }
                }
            }
        }

        if (userId == null) {
            throw new com.raj.citizen_grievance_backend.exception.UnauthorizedException(
                    "Access Denied: You must be logged in to access this resource");
        }

        return true;
    }
}
