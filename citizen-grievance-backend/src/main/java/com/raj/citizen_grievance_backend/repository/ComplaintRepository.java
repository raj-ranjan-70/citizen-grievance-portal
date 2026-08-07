package com.raj.citizen_grievance_backend.repository;

import com.raj.citizen_grievance_backend.entity.Complaint;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface ComplaintRepository extends JpaRepository<Complaint, UUID> {
    List<Complaint> findByCitizenIdOrderByCreatedAtDesc(UUID citizenId);
    Optional<Complaint> findByIdAndCitizenId(UUID id, UUID citizenId);
}
