package com.raj.citizen_grievance_backend.controller;

import com.raj.citizen_grievance_backend.authentication.context.CurrentUserProvider;
import com.raj.citizen_grievance_backend.dto.ComplaintRequest;
import com.raj.citizen_grievance_backend.dto.ComplaintResponse;
import com.raj.citizen_grievance_backend.entity.User;
import com.raj.citizen_grievance_backend.service.ComplaintService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/complaints")
public class ComplaintController {

    private final ComplaintService complaintService;
    private final CurrentUserProvider currentUserProvider;

    public ComplaintController(ComplaintService complaintService, CurrentUserProvider currentUserProvider) {
        this.complaintService = complaintService;
        this.currentUserProvider = currentUserProvider;
    }

    /**
     * POST /api/v1/complaints — Create a new complaint.
     */
    @PostMapping
    public ResponseEntity<?> createComplaint(@Valid @RequestBody ComplaintRequest request) {
        User currentUser = currentUserProvider.getCurrentUserOrThrow();
        ComplaintResponse response = complaintService.createComplaint(request, currentUser);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    /**
     * GET /api/v1/complaints — List all complaints for the authenticated user.
     */
    @GetMapping
    public ResponseEntity<?> getMyComplaints() {
        User currentUser = currentUserProvider.getCurrentUserOrThrow();
        List<ComplaintResponse> complaints = complaintService.getComplaintsByCitizen(currentUser.getId());
        return ResponseEntity.ok(complaints);
    }

    /**
     * GET /api/v1/complaints/{id} — View a single complaint (must be owned by current user).
     */
    @GetMapping("/{id}")
    public ResponseEntity<?> getComplaintById(@PathVariable Long id) {
        User currentUser = currentUserProvider.getCurrentUserOrThrow();
        ComplaintResponse response = complaintService.getComplaintById(id, currentUser);
        return ResponseEntity.ok(response);
    }

    /**
     * PUT /api/v1/complaints/{id} — Update an existing complaint.
     */
    @PutMapping("/{id}")
    public ResponseEntity<?> updateComplaint(@PathVariable Long id,
                                             @Valid @RequestBody ComplaintRequest request) {
        User currentUser = currentUserProvider.getCurrentUserOrThrow();
        ComplaintResponse response = complaintService.updateComplaint(id, request, currentUser);
        return ResponseEntity.ok(response);
    }

    /**
     * DELETE /api/v1/complaints/{id} — Delete an existing complaint.
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteComplaint(@PathVariable Long id) {
        User currentUser = currentUserProvider.getCurrentUserOrThrow();
        complaintService.deleteComplaint(id, currentUser);
        return ResponseEntity.ok(Map.of("success", true, "message", "Complaint deleted successfully."));
    }
}
