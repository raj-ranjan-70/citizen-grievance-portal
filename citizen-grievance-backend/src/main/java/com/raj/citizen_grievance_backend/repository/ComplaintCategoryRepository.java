package com.raj.citizen_grievance_backend.repository;

import com.raj.citizen_grievance_backend.entity.ComplaintCategory;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface ComplaintCategoryRepository extends JpaRepository<ComplaintCategory, Long> {
    Optional<ComplaintCategory> findByName(String name);
}
