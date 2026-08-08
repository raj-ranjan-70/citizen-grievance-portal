package com.raj.citizen_grievance_backend.repository;

import com.raj.citizen_grievance_backend.entity.ComplaintImage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface ComplaintImageRepository extends JpaRepository<ComplaintImage, UUID> {
    List<ComplaintImage> findByComplaintIdOrderByUploadedAtAsc(UUID complaintId);
}
