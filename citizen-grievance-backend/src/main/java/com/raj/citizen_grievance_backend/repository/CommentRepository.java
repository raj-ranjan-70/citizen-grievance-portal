package com.raj.citizen_grievance_backend.repository;

import com.raj.citizen_grievance_backend.entity.Comment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface CommentRepository extends JpaRepository<Comment, UUID> {
    List<Comment> findByComplaintIdOrderByCreatedAtAsc(UUID complaintId);
}
