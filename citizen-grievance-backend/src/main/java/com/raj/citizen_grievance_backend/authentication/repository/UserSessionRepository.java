package com.raj.citizen_grievance_backend.authentication.repository;

import com.raj.citizen_grievance_backend.authentication.entity.UserSession;
import com.raj.citizen_grievance_backend.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface UserSessionRepository extends JpaRepository<UserSession, Long> {

    Optional<UserSession> findBySessionId(String sessionId);

    List<UserSession> findByUserAndIsValidTrueOrderByLastAccessedAtAsc(User user);

    List<UserSession> findByUserIdAndIsValidTrue(Long userId);

    @Query("SELECT us FROM UserSession us WHERE us.isValid = true AND (us.expiresAt < :now OR us.absoluteExpiryAt < :now)")
    List<UserSession> findExpiredSessions(@Param("now") LocalDateTime now);

    @Modifying
    @Query("DELETE FROM UserSession us WHERE us.isValid = false OR us.expiresAt < :now OR us.absoluteExpiryAt < :now")
    int deleteCleanupSessions(@Param("now") LocalDateTime now);
}
