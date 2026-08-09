package com.raj.citizen_grievance_backend.service;

import com.raj.citizen_grievance_backend.dto.CommentRequest;
import com.raj.citizen_grievance_backend.dto.CommentResponse;
import com.raj.citizen_grievance_backend.dto.ComplaintImageResponse;
import com.raj.citizen_grievance_backend.dto.ComplaintResponse;
import com.raj.citizen_grievance_backend.entity.Comment;
import com.raj.citizen_grievance_backend.entity.Complaint;
import com.raj.citizen_grievance_backend.entity.ComplaintStatus;
import com.raj.citizen_grievance_backend.entity.Role;
import com.raj.citizen_grievance_backend.entity.User;
import com.raj.citizen_grievance_backend.entity.NotificationType;
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
    private final StorageService storageService;
    private final NotificationService notificationService;

    public OfficerService(UserRepository userRepository,
                          ComplaintRepository complaintRepository,
                          CommentRepository commentRepository,
                          StorageService storageService,
                          NotificationService notificationService) {
        this.userRepository = userRepository;
        this.complaintRepository = complaintRepository;
        this.commentRepository = commentRepository;
        this.storageService = storageService;
        this.notificationService = notificationService;
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

        // Notify citizen owner of status update
        notificationService.sendNotification(
            savedComplaint.getCitizen().getId(),
            "Your complaint status has changed to " + newStatus + ": " + savedComplaint.getTitle(),
            savedComplaint.getId(),
            NotificationType.STATUS,
            null
        );

        return mapToComplaintResponse(savedComplaint);
    }

    @Transactional
    public ComplaintResponse resolveComplaint(UUID complaintId, org.springframework.web.multipart.MultipartFile file, String remarks, UUID officerId) {
        verifyOfficer(officerId);

        if (file == null || file.isEmpty()) {
            throw new BadRequestException("Proof of resolution image is mandatory");
        }
        if (remarks == null || remarks.trim().isEmpty()) {
            throw new BadRequestException("Resolution remarks are mandatory");
        }

        Complaint complaint = complaintRepository.findById(complaintId)
                .orElseThrow(() -> new ResourceNotFoundException("Complaint not found with ID: " + complaintId));

        if (complaint.getAssignedOfficer() == null || !complaint.getAssignedOfficer().getId().equals(officerId)) {
            throw new ForbiddenException("Access Denied: This complaint is not assigned to you");
        }

        String imageUuid = storageService.uploadImage(file);
        complaint.setResolutionImageUuid(imageUuid);
        complaint.setRemarks(remarks.trim());
        complaint.setStatus(ComplaintStatus.RESOLVED);

        Complaint savedComplaint = complaintRepository.save(complaint);

        // Notify citizen owner of resolution
        notificationService.sendNotification(
            savedComplaint.getCitizen().getId(),
            "Your complaint has been RESOLVED: " + savedComplaint.getTitle(),
            savedComplaint.getId(),
            NotificationType.STATUS,
            null
        );

        return mapToComplaintResponse(savedComplaint);
    }

    @Transactional
    public ComplaintResponse rejectComplaint(UUID complaintId, String remarks, UUID officerId) {
        verifyOfficer(officerId);

        if (remarks == null || remarks.trim().isEmpty()) {
            throw new BadRequestException("Rejection remarks are mandatory");
        }

        Complaint complaint = complaintRepository.findById(complaintId)
                .orElseThrow(() -> new ResourceNotFoundException("Complaint not found with ID: " + complaintId));

        if (complaint.getAssignedOfficer() == null || !complaint.getAssignedOfficer().getId().equals(officerId)) {
            throw new ForbiddenException("Access Denied: This complaint is not assigned to you");
        }

        complaint.setRemarks(remarks.trim());
        complaint.setStatus(ComplaintStatus.REJECTED);

        Complaint savedComplaint = complaintRepository.save(complaint);

        // Notify citizen owner of rejection
        notificationService.sendNotification(
            savedComplaint.getCitizen().getId(),
            "Your complaint has been REJECTED: " + savedComplaint.getTitle(),
            savedComplaint.getId(),
            NotificationType.STATUS,
            null
        );

        return mapToComplaintResponse(savedComplaint);
    }

    @Transactional
    public CommentResponse addComment(UUID complaintId, CommentRequest request, UUID officerId) {
        verifyOfficer(officerId);

        Complaint complaint = complaintRepository.findById(complaintId)
                .orElseThrow(() -> new ResourceNotFoundException("Complaint not found with ID: " + complaintId));

        if (complaint.getAssignedOfficer() == null || !complaint.getAssignedOfficer().getId().equals(officerId)) {
            throw new ForbiddenException("Access Denied: This complaint is not assigned to you");
        }

        User author = userRepository.findById(officerId)
                .orElseThrow(() -> new UnauthorizedException("User not found"));

        Comment comment = Comment.builder()
                .complaint(complaint)
                .author(author)
                .content(request.getContent())
                .build();

        Comment savedComment = commentRepository.save(comment);

        // Notify citizen owner of comment
        notificationService.sendNotification(
            complaint.getCitizen().getId(),
            author.getName() + " commented on: " + complaint.getTitle(),
            complaint.getId(),
            NotificationType.COMMENT,
            savedComment.getId()
        );

        return CommentResponse.builder()
                .id(savedComment.getId())
                .content(savedComment.getContent())
                .authorName(savedComment.getAuthor().getName())
                .authorRole(savedComment.getAuthor().getRole().name())
                .createdAt(savedComment.getCreatedAt())
                .build();
    }

    private CommentResponse mapToCommentResponse(Comment comment) {
        return CommentResponse.builder()
                .id(comment.getId())
                .content(comment.getContent())
                .authorName(comment.getAuthor().getName())
                .authorRole(comment.getAuthor().getRole().name())
                .authorId(comment.getAuthor().getId())
                .createdAt(comment.getCreatedAt())
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

        List<String> imageUuids = complaint.getImages() != null ?
                complaint.getImages().stream()
                        .map(com.raj.citizen_grievance_backend.entity.ComplaintImage::getImageUuid)
                        .collect(Collectors.toList()) : java.util.Collections.emptyList();

        List<ComplaintImageResponse> imageDetails = complaint.getImages() != null ?
                complaint.getImages().stream()
                        .map(img -> ComplaintImageResponse.builder()
                                .id(img.getId())
                                .imageUuid(img.getImageUuid())
                                .uploadedAt(img.getUploadedAt())
                                .authorId(complaint.getCitizen().getId())
                                .build())
                        .collect(Collectors.toList()) : java.util.Collections.emptyList();

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
                .assignedOfficerDepartment(complaint.getAssignedOfficer() != null && complaint.getAssignedOfficer().getDepartment() != null ? complaint.getAssignedOfficer().getDepartment().name() : null)
                .citizenLastViewedAt(complaint.getCitizenLastViewedAt())
                .officerLastViewedAt(complaint.getOfficerLastViewedAt())
                .createdAt(complaint.getCreatedAt())
                .updatedAt(complaint.getUpdatedAt())
                .comments(comments)
                .imageUuids(imageUuids)
                .imageDetails(imageDetails)
                .resolutionImageUuid(complaint.getResolutionImageUuid())
                .remarks(complaint.getRemarks())
                .build();
    }

    public ComplaintResponse getComplaintDetails(UUID complaintId, UUID officerId) {
        verifyOfficer(officerId);
        Complaint complaint = complaintRepository.findById(complaintId)
                .orElseThrow(() -> new ResourceNotFoundException("Complaint not found with ID: " + complaintId));
        if (complaint.getAssignedOfficer() == null || !complaint.getAssignedOfficer().getId().equals(officerId)) {
            throw new ForbiddenException("Access Denied: This complaint is not assigned to you");
        }
        return mapToComplaintResponse(complaint);
    }
}
