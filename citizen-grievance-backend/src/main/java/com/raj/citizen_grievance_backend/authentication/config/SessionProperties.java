package com.raj.citizen_grievance_backend.authentication.config;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

import java.time.Duration;

@Data
@Configuration
@ConfigurationProperties(prefix = "session")
public class SessionProperties {
    private Duration timeout = Duration.ofMinutes(30);
    private Duration absoluteTimeout = Duration.ofHours(24);
    private int maxConcurrent = 5;
    private String cleanupInterval = "0 */10 * * * *"; // Every 10 minutes

    private final Cookie cookie = new Cookie();

    @Data
    public static class Cookie {
        private String name = "JSESSIONID";
        private int maxAge = 86400; // 24 hours in seconds
        private String sameSite = "Lax";
        private boolean secure = false;
        private String domain;
        private String path = "/";
    }
}
