package com.raj.citizen_grievance_backend.service;

import com.raj.citizen_grievance_backend.dto.ComplaintRequest;
import com.raj.citizen_grievance_backend.dto.ComplaintResponse;
import com.raj.citizen_grievance_backend.entity.Complaint;
import com.raj.citizen_grievance_backend.entity.ComplaintCategory;
import com.raj.citizen_grievance_backend.entity.User;
import com.raj.citizen_grievance_backend.exception.AccessDeniedException;
import com.raj.citizen_grievance_backend.exception.ResourceNotFoundException;
import com.raj.citizen_grievance_backend.repository.ComplaintCategoryRepository;
import com.raj.citizen_grievance_backend.repository.ComplaintRepository;
import com.raj.citizen_grievance_backend.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class ComplaintService {

    private final ComplaintRepository complaintRepository;
    private final ComplaintCategoryRepository categoryRepository;
    private final UserRepository userRepository;

    public ComplaintService(ComplaintRepository complaintRepository,
                            ComplaintCategoryRepository categoryRepository,
                            UserRepository userRepository) {
        this.complaintRepository = complaintRepository;
        this.categoryRepository = categoryRepository;
        this.userRepository = userRepository;
    }

    public ComplaintResponse createComplaint(ComplaintRequest request, User sessionUser) {
        // Re-fetch the full user from DB to get a managed entity
        User user = userRepository.findById(sessionUser.getId())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        ComplaintCategory category = categoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Category not found with id: " + request.getCategoryId()));

        Complaint complaint = Complaint.builder()
                .title(request.getTitle())
                .description(request.getDescription())
                .status("PENDING")
                .category(category)
                .user(user)
                .build();

        Complaint saved = complaintRepository.save(complaint);
        return toResponse(saved);
    }

    public List<ComplaintResponse> getComplaintsByUser(Long userId) {
        return complaintRepository.findByUserIdOrderByCreatedAtDesc(userId)
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    public ComplaintResponse getComplaintById(Long complaintId, User currentUser) {
        Complaint complaint = complaintRepository.findById(complaintId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Complaint not found with id: " + complaintId));

        if (!complaint.getUser().getId().equals(currentUser.getId())) {
            throw new AccessDeniedException("You do not have permission to view this complaint");
        }

        return toResponse(complaint);
    }

    private ComplaintResponse toResponse(Complaint complaint) {
        return ComplaintResponse.builder()
                .id(complaint.getId())
                .title(complaint.getTitle())
                .description(complaint.getDescription())
                .status(complaint.getStatus())
                .categoryName(complaint.getCategory().getName())
                .categoryId(complaint.getCategory().getId())
                .userId(complaint.getUser().getId())
                .userName(complaint.getUser().getName())
                .createdAt(complaint.getCreatedAt())
                .updatedAt(complaint.getUpdatedAt())
                .build();
    }
}
