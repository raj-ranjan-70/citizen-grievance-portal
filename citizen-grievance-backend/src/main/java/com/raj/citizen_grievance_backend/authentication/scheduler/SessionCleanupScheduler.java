package com.raj.citizen_grievance_backend.authentication.scheduler;

import com.raj.citizen_grievance_backend.authentication.repository.UserSessionRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Component
@EnableScheduling
@Slf4j
public class SessionCleanupScheduler {

    private final UserSessionRepository sessionRepository;

    public SessionCleanupScheduler(UserSessionRepository sessionRepository) {
        this.sessionRepository = sessionRepository;
    }

    /**
     * Periodically cleans up expired or invalidated user sessions from the database.
     * Driven by session.cleanup-interval property, defaults to every 10 minutes.
     */
    @Transactional
    @Scheduled(cron = "${session.cleanup-interval:0 */10 * * * *}")
    public void cleanupExpiredSessions() {
        log.info("Starting scheduled cleanup of expired and invalid sessions...");
        try {
            LocalDateTime now = LocalDateTime.now();
            int deletedCount = sessionRepository.deleteCleanupSessions(now);
            log.info("Cleanup completed. Deleted {} sessions.", deletedCount);
        } catch (Exception e) {
            log.error("Error occurred during session cleanup scheduler execution", e);
        }
    }
}
