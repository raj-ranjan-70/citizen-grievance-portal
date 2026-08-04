package com.raj.citizen_grievance_backend.controller;

import com.raj.citizen_grievance_backend.dto.ComplaintRequest;
import com.raj.citizen_grievance_backend.dto.ComplaintResponse;
import com.raj.citizen_grievance_backend.entity.User;
import com.raj.citizen_grievance_backend.service.ComplaintService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/complaints")
public class ComplaintController {

    private final ComplaintService complaintService;

    public ComplaintController(ComplaintService complaintService) {
        this.complaintService = complaintService;
    }

    /**
     * POST /api/complaints — Create a new complaint.
     */
    @PostMapping
    public ResponseEntity<?> createComplaint(@Valid @RequestBody ComplaintRequest request) {
        User currentUser = getAuthenticatedUser();
        if (currentUser == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("message", "Authentication required"));
        }

        ComplaintResponse response = complaintService.createComplaint(request, currentUser);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    /**
     * GET /api/complaints — List all complaints for the authenticated user.
     */
    @GetMapping
    public ResponseEntity<?> getMyComplaints() {
        User currentUser = getAuthenticatedUser();
        if (currentUser == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("message", "Authentication required"));
        }

        List<ComplaintResponse> complaints = complaintService.getComplaintsByCitizen(currentUser.getId());
        return ResponseEntity.ok(complaints);
    }

    /**
     * GET /api/complaints/{id} — View a single complaint (must be owned by current user).
     */
    @GetMapping("/{id}")
    public ResponseEntity<?> getComplaintById(@PathVariable Long id) {
        User currentUser = getAuthenticatedUser();
        if (currentUser == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("message", "Authentication required"));
        }

        ComplaintResponse response = complaintService.getComplaintById(id, currentUser);
        return ResponseEntity.ok(response);
    }

    /**
     * PUT /api/complaints/{id} — Update an existing complaint.
     */
    @PutMapping("/{id}")
    public ResponseEntity<?> updateComplaint(@PathVariable Long id,
                                             @Valid @RequestBody ComplaintRequest request) {
        User currentUser = getAuthenticatedUser();
        if (currentUser == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("message", "Authentication required"));
        }

        ComplaintResponse response = complaintService.updateComplaint(id, request, currentUser);
        return ResponseEntity.ok(response);
    }

    /**
     * DELETE /api/complaints/{id} — Delete an existing complaint.
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteComplaint(@PathVariable Long id) {
        User currentUser = getAuthenticatedUser();
        if (currentUser == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("message", "Authentication required"));
        }

        complaintService.deleteComplaint(id, currentUser);
        return ResponseEntity.ok(Map.of("success", true, "message", "Complaint deleted successfully."));
    }

    private User getAuthenticatedUser() {
        var authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication != null && authentication.isAuthenticated() && authentication.getPrincipal() instanceof User) {
            return (User) authentication.getPrincipal();
        }
        return null;
    }
}
