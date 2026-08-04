package com.raj.citizen_grievance_backend.authentication.cookie;

import com.raj.citizen_grievance_backend.authentication.config.SessionProperties;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseCookie;
import org.springframework.stereotype.Service;

import java.util.Arrays;
import java.util.Optional;

@Service
public class CookieService {

    private final SessionProperties sessionProperties;

    public CookieService(SessionProperties sessionProperties) {
        this.sessionProperties = sessionProperties;
    }

    /**
     * Creates and adds the session cookie to the response using ResponseCookie for SameSite support.
     */
    public void setSessionCookie(HttpServletResponse response, String sessionId, boolean rememberMe) {
        SessionProperties.Cookie cookieConfig = sessionProperties.getCookie();
        
        // If rememberMe is checked, use the configured maxAge (e.g. 24h/7d). 
        // Otherwise, make it a session cookie (maxAge = -1).
        long maxAge = rememberMe ? cookieConfig.getMaxAge() : -1;

        ResponseCookie.ResponseCookieBuilder builder = ResponseCookie.from(cookieConfig.getName(), sessionId)
                .httpOnly(true)
                .secure(cookieConfig.isSecure())
                .sameSite(cookieConfig.getSameSite())
                .path(cookieConfig.getPath());

        if (maxAge >= 0) {
            builder.maxAge(maxAge);
        }

        if (cookieConfig.getDomain() != null && !cookieConfig.getDomain().isBlank()) {
            builder.domain(cookieConfig.getDomain());
        }

        response.addHeader(HttpHeaders.SET_COOKIE, builder.build().toString());
    }

    /**
     * Deletes the session cookie from the client by setting maxAge to 0.
     */
    public void clearSessionCookie(HttpServletResponse response) {
        SessionProperties.Cookie cookieConfig = sessionProperties.getCookie();

        ResponseCookie builder = ResponseCookie.from(cookieConfig.getName(), "")
                .httpOnly(true)
                .secure(cookieConfig.isSecure())
                .sameSite(cookieConfig.getSameSite())
                .path(cookieConfig.getPath())
                .maxAge(0)
                .build();

        response.addHeader(HttpHeaders.SET_COOKIE, builder.toString());
    }

    /**
     * Extracts the session ID from the request cookies.
     */
    public Optional<String> extractSessionId(HttpServletRequest request) {
        if (request.getCookies() == null) {
            return Optional.empty();
        }
        return Arrays.stream(request.getCookies())
                .filter(cookie -> sessionProperties.getCookie().getName().equals(cookie.getName()))
                .map(Cookie::getValue)
                .findFirst();
    }
}
