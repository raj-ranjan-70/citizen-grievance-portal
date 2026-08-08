package com.raj.citizen_grievance_backend.filter;

import com.raj.citizen_grievance_backend.exception.ForbiddenException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;

/**
 * Role Authorization Interceptor.
 * Enforces path-segment based role checks AFTER authentication has been confirmed by AuthInterceptor.
 *
 * Rules:
 *   /api/v1/citizen/** → only CITIZEN
 *   /api/v1/officer/** → only OFFICER
 *   /api/v1/admin/**   → only ADMIN
 *
 * /api/v1/notifications/** is excluded at WebConfig registration level so all roles can receive alerts.
 */
@Component
public class RoleAuthInterceptor implements HandlerInterceptor {

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) throws Exception {
        // Allow CORS preflight OPTIONS requests through
        if ("OPTIONS".equalsIgnoreCase(request.getMethod())) {
            return true;
        }

        HttpSession session = request.getSession(false);
        String role = (session != null) ? (String) session.getAttribute("userRole") : null;

        String path = request.getRequestURI();

        if (path.startsWith("/api/v1/citizen/")) {
            if (!"CITIZEN".equals(role)) {
                throw new ForbiddenException("Access Denied: Citizen role required to access this resource");
            }
        } else if (path.startsWith("/api/v1/officer/")) {
            if (!"OFFICER".equals(role)) {
                throw new ForbiddenException("Access Denied: Officer role required to access this resource");
            }
        } else if (path.startsWith("/api/v1/admin/")) {
            if (!"ADMIN".equals(role)) {
                throw new ForbiddenException("Access Denied: Admin role required to access this resource");
            }
        }

        return true;
    }
}
