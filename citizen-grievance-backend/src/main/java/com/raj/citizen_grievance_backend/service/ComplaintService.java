package com.raj.citizen_grievance_backend.service;

import com.raj.citizen_grievance_backend.dto.ComplaintRequest;
import com.raj.citizen_grievance_backend.dto.ComplaintResponse;
import com.raj.citizen_grievance_backend.entity.Complaint;
import com.raj.citizen_grievance_backend.entity.Status;
import com.raj.citizen_grievance_backend.entity.User;
import com.raj.citizen_grievance_backend.exception.AccessDeniedException;
import com.raj.citizen_grievance_backend.exception.ResourceNotFoundException;
import com.raj.citizen_grievance_backend.repository.ComplaintRepository;
import com.raj.citizen_grievance_backend.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class ComplaintService {

    private final ComplaintRepository complaintRepository;
    private final UserRepository userRepository;

    public ComplaintService(ComplaintRepository complaintRepository,
                            UserRepository userRepository) {
        this.complaintRepository = complaintRepository;
        this.userRepository = userRepository;
    }

    public ComplaintResponse createComplaint(ComplaintRequest request, User sessionUser) {
        User citizen = userRepository.findById(sessionUser.getId())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        Complaint complaint = Complaint.builder()
                .title(request.getTitle())
                .description(request.getDescription())
                .category(request.getCategory())
                .priority(request.getPriority())
                .status(Status.SUBMITTED)
                .citizen(citizen)
                .build();

        Complaint saved = complaintRepository.save(complaint);
        return toResponse(saved);
    }

    @Transactional(readOnly = true)
    public List<ComplaintResponse> getComplaintsByCitizen(Long citizenId) {
        return complaintRepository.findByCitizenIdOrderByCreatedAtDesc(citizenId)
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public ComplaintResponse getComplaintById(Long complaintId, User currentUser) {
        Complaint complaint = complaintRepository.findById(complaintId)
                .orElseThrow(() -> new ResourceNotFoundException("Complaint not found with id: " + complaintId));

        if (!complaint.getCitizen().getId().equals(currentUser.getId())) {
            throw new AccessDeniedException("You do not have permission to view this complaint");
        }

        return toResponse(complaint);
    }

    public ComplaintResponse updateComplaint(Long complaintId, ComplaintRequest request, User currentUser) {
        Complaint complaint = complaintRepository.findById(complaintId)
                .orElseThrow(() -> new ResourceNotFoundException("Complaint not found with id: " + complaintId));

        if (!complaint.getCitizen().getId().equals(currentUser.getId())) {
            throw new AccessDeniedException("You do not have permission to update this complaint");
        }

        if (complaint.getStatus() != Status.SUBMITTED) {
            throw new AccessDeniedException("Complaint can only be edited when status is SUBMITTED");
        }

        complaint.setTitle(request.getTitle());
        complaint.setDescription(request.getDescription());
        complaint.setCategory(request.getCategory());
        complaint.setPriority(request.getPriority());

        Complaint saved = complaintRepository.save(complaint);
        return toResponse(saved);
    }

    public void deleteComplaint(Long complaintId, User currentUser) {
        Complaint complaint = complaintRepository.findById(complaintId)
                .orElseThrow(() -> new ResourceNotFoundException("Complaint not found with id: " + complaintId));

        if (!complaint.getCitizen().getId().equals(currentUser.getId())) {
            throw new AccessDeniedException("You do not have permission to delete this complaint");
        }

        complaintRepository.delete(complaint);
    }

    private ComplaintResponse toResponse(Complaint complaint) {
        return ComplaintResponse.builder()
                .id(complaint.getId())
                .title(complaint.getTitle())
                .description(complaint.getDescription())
                .category(complaint.getCategory())
                .priority(complaint.getPriority())
                .status(complaint.getStatus())
                .createdAt(complaint.getCreatedAt())
                .updatedAt(complaint.getUpdatedAt())
                .build();
    }
}
