package com.raj.citizen_grievance_backend.service;

import com.raj.citizen_grievance_backend.dto.*;
import com.raj.citizen_grievance_backend.entity.*;
import com.raj.citizen_grievance_backend.exception.*;
import com.raj.citizen_grievance_backend.repository.CommentRepository;
import com.raj.citizen_grievance_backend.repository.ComplaintRepository;
import com.raj.citizen_grievance_backend.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@Transactional(readOnly = true)
public class ComplaintService {

    private final ComplaintRepository complaintRepository;
    private final CommentRepository commentRepository;
    private final UserRepository userRepository;
    private final com.raj.citizen_grievance_backend.repository.ComplaintImageRepository complaintImageRepository;
    private final StorageService storageService;
    private final NotificationService notificationService;

    public ComplaintService(ComplaintRepository complaintRepository,
                            CommentRepository commentRepository,
                            UserRepository userRepository,
                            com.raj.citizen_grievance_backend.repository.ComplaintImageRepository complaintImageRepository,
                            StorageService storageService,
                            NotificationService notificationService) {
        this.complaintRepository = complaintRepository;
        this.commentRepository = commentRepository;
        this.userRepository = userRepository;
        this.complaintImageRepository = complaintImageRepository;
        this.storageService = storageService;
        this.notificationService = notificationService;
    }

    @Transactional
    public ComplaintResponse createComplaint(ComplaintRequest request, UUID citizenId) {
        User citizen = userRepository.findById(citizenId)
                .orElseThrow(() -> new UnauthorizedException("User not found"));

        if (citizen.getRole() != com.raj.citizen_grievance_backend.entity.Role.CITIZEN) {
            throw new ForbiddenException("Only citizens can create complaints");
        }

        Complaint complaint = Complaint.builder()
                .citizen(citizen)
                .title(request.getTitle())
                .description(request.getDescription())
                .category(request.getCategory())
                .priority(Priority.valueOf(request.getPriority().toUpperCase()))
                .status(ComplaintStatus.PENDING)
                .build();

        Complaint savedComplaint = complaintRepository.save(complaint);

        // Notify all administrators about the new complaint
        List<User> admins = userRepository.findByRole(Role.ADMIN);
        for (User admin : admins) {
            notificationService.sendNotification(
                admin.getId(),
                "A new complaint has been created: " + savedComplaint.getTitle(),
                savedComplaint.getId(),
                NotificationType.STATUS,
                null
            );
        }

        return mapToResponse(savedComplaint);
    }

    public List<ComplaintResponse> getComplaintsByCitizen(UUID citizenId) {
        List<Complaint> complaints = complaintRepository.findByCitizenIdOrderByCreatedAtDesc(citizenId);
        return complaints.stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public ComplaintResponse getComplaintById(UUID id, UUID userId) {
        Complaint complaint = complaintRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Complaint not found with ID: " + id));

        if (!complaint.getCitizen().getId().equals(userId)) {
            throw new ForbiddenException("You do not have permission to view this complaint");
        }

        return mapToResponse(complaint);
    }

    @Transactional
    public ComplaintResponse updateComplaint(UUID id, ComplaintRequest request, UUID userId) {
        Complaint complaint = complaintRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Complaint not found with ID: " + id));

        if (!complaint.getCitizen().getId().equals(userId)) {
            throw new ForbiddenException("You do not have permission to update this complaint");
        }

        if (complaint.getStatus() != ComplaintStatus.PENDING) {
            throw new BadRequestException("Editing is disabled. This complaint is no longer in PENDING status.");
        }

        complaint.setTitle(request.getTitle());
        complaint.setDescription(request.getDescription());
        complaint.setCategory(request.getCategory());
        complaint.setPriority(Priority.valueOf(request.getPriority().toUpperCase()));

        Complaint updatedComplaint = complaintRepository.save(complaint);
        return mapToResponse(updatedComplaint);
    }

    @Transactional
    public void deleteComplaint(UUID id, UUID userId) {
        Complaint complaint = complaintRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Complaint not found with ID: " + id));

        if (!complaint.getCitizen().getId().equals(userId)) {
            throw new ForbiddenException("You do not have permission to delete this complaint");
        }

        // Business rule: unassigned or PENDING status only
        if (complaint.getAssignedOfficer() != null || complaint.getStatus() != ComplaintStatus.PENDING) {
            throw new BadRequestException("Cannot delete complaint. It has already been assigned or processed.");
        }

        complaintRepository.delete(complaint);
    }

    @Transactional
    public ComplaintResponse uploadComplaintImage(UUID complaintId, org.springframework.web.multipart.MultipartFile file, UUID citizenId) {
        Complaint complaint = complaintRepository.findById(complaintId)
                .orElseThrow(() -> new ResourceNotFoundException("Complaint not found with ID: " + complaintId));

        if (!complaint.getCitizen().getId().equals(citizenId)) {
            throw new ForbiddenException("You do not have permission to modify this complaint");
        }

        if (complaint.getStatus() == ComplaintStatus.RESOLVED || complaint.getStatus() == ComplaintStatus.REJECTED) {
            throw new BadRequestException("Cannot upload images to resolved or rejected complaints.");
        }

        String imageUuid = storageService.uploadImage(file);

        ComplaintImage complaintImage = ComplaintImage.builder()
                .complaint(complaint)
                .imageUuid(imageUuid)
                .build();

        complaintImageRepository.save(complaintImage);

        if (complaint.getImages() != null) {
            complaint.getImages().add(complaintImage);
        }

        // Notify the assigned officer that a new image has been uploaded
        if (complaint.getAssignedOfficer() != null) {
            notificationService.sendNotification(
                complaint.getAssignedOfficer().getId(),
                "Citizen " + complaint.getCitizen().getName() + " uploaded a new image to: " + complaint.getTitle(),
                complaint.getId(),
                NotificationType.IMAGE,
                complaintImage.getId()
            );
        }

        return mapToResponse(complaint);
    }

    @Transactional
    public CommentResponse addComment(UUID complaintId, CommentRequest request, UUID userId) {
        Complaint complaint = complaintRepository.findById(complaintId)
                .orElseThrow(() -> new ResourceNotFoundException("Complaint not found with ID: " + complaintId));

        // Authenticate ownership: only citizen owner or officer can add comments.
        // For Phase 2 citizen endpoints, we check that the logged-in citizen is the creator of the complaint.
        if (!complaint.getCitizen().getId().equals(userId) &&
                (complaint.getAssignedOfficer() == null || !complaint.getAssignedOfficer().getId().equals(userId))) {
            throw new ForbiddenException("You do not have permission to comment on this complaint");
        }

        User author = userRepository.findById(userId)
                .orElseThrow(() -> new UnauthorizedException("User not found"));

        Comment comment = Comment.builder()
                .complaint(complaint)
                .author(author)
                .content(request.getContent())
                .build();

        Comment savedComment = commentRepository.save(comment);

        // Trigger real-time notifications
        if (author.getRole() == Role.CITIZEN) {
            if (complaint.getAssignedOfficer() != null) {
                notificationService.sendNotification(
                    complaint.getAssignedOfficer().getId(),
                    "Citizen " + author.getName() + " commented on: " + complaint.getTitle(),
                    complaint.getId(),
                    NotificationType.COMMENT,
                    savedComment.getId()
                );
            }
        } else {
            notificationService.sendNotification(
                complaint.getCitizen().getId(),
                author.getName() + " commented on: " + complaint.getTitle(),
                complaint.getId(),
                NotificationType.COMMENT,
                savedComment.getId()
            );
        }

        return mapToCommentResponse(savedComment);
    }

    private ComplaintResponse mapToResponse(Complaint complaint) {
        List<CommentResponse> comments = commentRepository.findByComplaintIdOrderByCreatedAtAsc(complaint.getId())
                .stream()
                .map(this::mapToCommentResponse)
                .collect(Collectors.toList());

        List<String> imageUuids = complaint.getImages() != null ?
                complaint.getImages().stream()
                        .map(ComplaintImage::getImageUuid)
                        .collect(Collectors.toList()) : java.util.Collections.emptyList();

        List<ComplaintImageResponse> imageDetails = complaint.getImages() != null ?
                complaint.getImages().stream()
                        .map(img -> ComplaintImageResponse.builder()
                                .id(img.getId())
                                .imageUuid(img.getImageUuid())
                                .uploadedAt(img.getUploadedAt())
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

    @Transactional
    public void updateLastViewedAt(UUID complaintId, UUID userId, String roleStr) {
        Complaint complaint = complaintRepository.findById(complaintId)
                .orElseThrow(() -> new ResourceNotFoundException("Complaint not found with ID: " + complaintId));

        java.time.LocalDateTime now = java.time.LocalDateTime.now();
        if ("CITIZEN".equalsIgnoreCase(roleStr)) {
            if (complaint.getCitizen().getId().equals(userId)) {
                complaint.setCitizenLastViewedAt(now);
                complaintRepository.save(complaint);
            }
        } else if ("OFFICER".equalsIgnoreCase(roleStr)) {
            if (complaint.getAssignedOfficer() != null && complaint.getAssignedOfficer().getId().equals(userId)) {
                complaint.setOfficerLastViewedAt(now);
                complaintRepository.save(complaint);
            }
        }
    }
}
