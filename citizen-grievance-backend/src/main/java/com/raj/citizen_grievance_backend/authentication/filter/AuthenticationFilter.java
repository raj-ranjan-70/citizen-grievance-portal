package com.raj.citizen_grievance_backend.authentication.filter;

import com.raj.citizen_grievance_backend.authentication.context.UserContext;
import com.raj.citizen_grievance_backend.authentication.cookie.CookieService;
import com.raj.citizen_grievance_backend.authentication.service.SessionService;
import com.raj.citizen_grievance_backend.entity.User;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Optional;

@Component
@Slf4j
public class AuthenticationFilter extends OncePerRequestFilter {

    private final CookieService cookieService;
    private final SessionService sessionService;
    private final UserContext userContext;

    public AuthenticationFilter(CookieService cookieService,
                                SessionService sessionService,
                                UserContext userContext) {
        this.cookieService = cookieService;
        this.sessionService = sessionService;
        this.userContext = userContext;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {

        Optional<String> sessionIdOpt = cookieService.extractSessionId(request);

        if (sessionIdOpt.isPresent()) {
            String sessionId = sessionIdOpt.get();
            String ip = getClientIp(request);
            String userAgent = request.getHeader("User-Agent");

            try {
                User user = sessionService.validateAndRefreshSession(sessionId, ip, userAgent);
                userContext.setCurrentUser(user);
                log.debug("Session authenticated successfully for user: {}", user.getEmail());
            } catch (Exception ex) {
                log.warn("Session validation failed for ID: {}. Error: {}", sessionId, ex.getMessage());
                // Invalidate the expired/corrupted cookie on the client side
                cookieService.clearSessionCookie(response);
            }
        }

        filterChain.doFilter(request, response);
    }

    private String getClientIp(HttpServletRequest request) {
        String xfHeader = request.getHeader("X-Forwarded-For");
        if (xfHeader == null || xfHeader.isBlank()) {
            return request.getRemoteAddr();
        }
        return xfHeader.split(",")[0].trim();
    }
}
