package com.raj.citizen_grievance_backend.authentication.repository;

import com.raj.citizen_grievance_backend.entity.UserSession;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserSessionRepository extends JpaRepository<UserSession, String> {
}
