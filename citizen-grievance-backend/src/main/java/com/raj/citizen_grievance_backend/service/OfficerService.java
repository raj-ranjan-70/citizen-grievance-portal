package com.raj.citizen_grievance_backend.service;

import com.raj.citizen_grievance_backend.dto.CommentResponse;
import com.raj.citizen_grievance_backend.dto.ComplaintResponse;
import com.raj.citizen_grievance_backend.entity.Complaint;
import com.raj.citizen_grievance_backend.entity.ComplaintStatus;
import com.raj.citizen_grievance_backend.entity.Role;
import com.raj.citizen_grievance_backend.entity.User;
import com.raj.citizen_grievance_backend.exception.BadRequestException;
import com.raj.citizen_grievance_backend.exception.ForbiddenException;
import com.raj.citizen_grievance_backend.exception.ResourceNotFoundException;
import com.raj.citizen_grievance_backend.exception.UnauthorizedException;
import com.raj.citizen_grievance_backend.repository.CommentRepository;
import com.raj.citizen_grievance_backend.repository.ComplaintRepository;
import com.raj.citizen_grievance_backend.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Arrays;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@Transactional(readOnly = true)
public class OfficerService {

    private final UserRepository userRepository;
    private final ComplaintRepository complaintRepository;
    private final CommentRepository commentRepository;

    public OfficerService(UserRepository userRepository,
                          ComplaintRepository complaintRepository,
                          CommentRepository commentRepository) {
        this.userRepository = userRepository;
        this.complaintRepository = complaintRepository;
        this.commentRepository = commentRepository;
    }

    private void verifyOfficer(UUID officerId) {
        User officer = userRepository.findById(officerId)
                .orElseThrow(() -> new UnauthorizedException("User session is invalid or user no longer exists"));
        if (officer.getRole() != Role.OFFICER) {
            throw new ForbiddenException("Access Denied: Officer role required");
        }
    }

    public List<ComplaintResponse> getActiveComplaints(UUID officerId) {
        verifyOfficer(officerId);

        List<Complaint> complaints = complaintRepository
                .findByAssignedOfficerIdAndStatusOrderByCreatedAtDesc(officerId, ComplaintStatus.ASSIGNED);

        return complaints.stream()
                .map(this::mapToComplaintResponse)
                .collect(Collectors.toList());
    }

    public List<ComplaintResponse> getComplaintHistory(UUID officerId) {
        verifyOfficer(officerId);

        List<Complaint> complaints = complaintRepository
                .findByAssignedOfficerIdAndStatusInOrderByCreatedAtDesc(
                        officerId,
                        Arrays.asList(ComplaintStatus.RESOLVED, ComplaintStatus.REJECTED)
                );

        return complaints.stream()
                .map(this::mapToComplaintResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public ComplaintResponse updateComplaintStatus(UUID complaintId, ComplaintStatus newStatus, UUID officerId) {
        verifyOfficer(officerId);

        if (newStatus != ComplaintStatus.RESOLVED && newStatus != ComplaintStatus.REJECTED) {
            throw new BadRequestException("Officers can only transition complaint status to RESOLVED or REJECTED");
        }

        Complaint complaint = complaintRepository.findById(complaintId)
                .orElseThrow(() -> new ResourceNotFoundException("Complaint not found with ID: " + complaintId));

        if (complaint.getAssignedOfficer() == null || !complaint.getAssignedOfficer().getId().equals(officerId)) {
            throw new ForbiddenException("Access Denied: This complaint is not assigned to you");
        }

        complaint.setStatus(newStatus);
        Complaint savedComplaint = complaintRepository.save(complaint);
        return mapToComplaintResponse(savedComplaint);
    }

    private ComplaintResponse mapToComplaintResponse(Complaint complaint) {
        List<CommentResponse> comments = commentRepository.findByComplaintIdOrderByCreatedAtAsc(complaint.getId())
                .stream()
                .map(c -> CommentResponse.builder()
                        .id(c.getId())
                        .content(c.getContent())
                        .authorName(c.getAuthor().getName())
                        .authorRole(c.getAuthor().getRole().name())
                        .createdAt(c.getCreatedAt())
                        .build())
                .collect(Collectors.toList());

        return ComplaintResponse.builder()
                .id(complaint.getId())
                .title(complaint.getTitle())
                .description(complaint.getDescription())
                .category(complaint.getCategory())
                .priority(complaint.getPriority())
                .status(complaint.getStatus())
                .citizenName(complaint.getCitizen().getName())
                .citizenEmail(complaint.getCitizen().getEmail())
                .assignedOfficerName(complaint.getAssignedOfficer() != null ? complaint.getAssignedOfficer().getName() : null)
                .createdAt(complaint.getCreatedAt())
                .updatedAt(complaint.getUpdatedAt())
                .comments(comments)
                .build();
    }
}
