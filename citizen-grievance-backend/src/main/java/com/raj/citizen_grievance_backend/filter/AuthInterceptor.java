package com.raj.citizen_grievance_backend.filter;

import com.raj.citizen_grievance_backend.exception.UnauthorizedException;
import com.raj.citizen_grievance_backend.service.AuthService;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;

import java.util.UUID;

@Component
public class AuthInterceptor implements HandlerInterceptor {

    private final AuthService authService;

    public AuthInterceptor(AuthService authService) {
        this.authService = authService;
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
                            // Synchronize back to the mock http session
                            request.getSession(true).setAttribute("userId", userId);
                        }
                        break;
                    }
                }
            }
        }

        if (userId == null) {
            throw new UnauthorizedException("Access Denied: You must be logged in to access this resource");
        }

        return true;
    }
}
