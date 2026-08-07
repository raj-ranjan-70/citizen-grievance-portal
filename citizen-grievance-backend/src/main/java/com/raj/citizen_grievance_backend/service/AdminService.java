package com.raj.citizen_grievance_backend.service;

import com.raj.citizen_grievance_backend.dto.*;
import com.raj.citizen_grievance_backend.entity.*;
import com.raj.citizen_grievance_backend.exception.*;
import com.raj.citizen_grievance_backend.repository.CommentRepository;
import com.raj.citizen_grievance_backend.repository.ComplaintRepository;
import com.raj.citizen_grievance_backend.repository.UserRepository;
import com.raj.citizen_grievance_backend.util.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@Transactional(readOnly = true)
public class AdminService {

    private final UserRepository userRepository;
    private final ComplaintRepository complaintRepository;
    private final CommentRepository commentRepository;
    private final PasswordEncoder passwordEncoder;

    public AdminService(UserRepository userRepository,
                        ComplaintRepository complaintRepository,
                        CommentRepository commentRepository,
                        PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.complaintRepository = complaintRepository;
        this.commentRepository = commentRepository;
        this.passwordEncoder = passwordEncoder;
    }

    private void verifyAdmin(UUID adminId) {
        User admin = userRepository.findById(adminId)
                .orElseThrow(() -> new UnauthorizedException("User session is invalid or user no longer exists"));
        if (admin.getRole() != Role.ADMIN) {
            throw new ForbiddenException("Access Denied: Admin role required");
        }
    }

    @Transactional
    public UserResponse createOfficer(CreateOfficerRequest request, UUID adminId) {
        verifyAdmin(adminId);

        if (userRepository.existsByEmail(request.getEmail())) {
            throw new EmailAlreadyExistsException("Email '" + request.getEmail() + "' is already registered");
        }

        User officer = User.builder()
                .name(request.getName())
                .email(request.getEmail())
                .passwordHash(passwordEncoder.encode(request.getPassword()))
                .role(Role.OFFICER)
                .department(request.getDepartment())
                .build();

        User savedOfficer = userRepository.save(officer);
        return mapToUserResponse(savedOfficer);
    }

    public List<ComplaintResponse> getAllComplaints(UUID adminId) {
        verifyAdmin(adminId);

        List<Complaint> complaints = complaintRepository.findAllByOrderByCreatedAtDesc();
        return complaints.stream()
                .map(this::mapToComplaintResponse)
                .collect(Collectors.toList());
    }

    public List<UserResponse> getAllOfficers(UUID adminId) {
        verifyAdmin(adminId);

        List<User> officers = userRepository.findByRole(Role.OFFICER);
        return officers.stream()
                .map(this::mapToUserResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public ComplaintResponse assignComplaint(UUID complaintId, UUID officerId, UUID adminId) {
        verifyAdmin(adminId);

        Complaint complaint = complaintRepository.findById(complaintId)
                .orElseThrow(() -> new ResourceNotFoundException("Complaint not found with ID: " + complaintId));

        User officer = userRepository.findById(officerId)
                .orElseThrow(() -> new ResourceNotFoundException("Officer not found with ID: " + officerId));

        if (officer.getRole() != Role.OFFICER) {
            throw new BadRequestException("Selected user is not an Officer");
        }

        complaint.setAssignedOfficer(officer);
        complaint.setStatus(ComplaintStatus.ASSIGNED);

        Complaint savedComplaint = complaintRepository.save(complaint);
        return mapToComplaintResponse(savedComplaint);
    }

    private UserResponse mapToUserResponse(User user) {
        return UserResponse.builder()
                .id(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .role(user.getRole())
                .department(user.getDepartment())
                .build();
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
