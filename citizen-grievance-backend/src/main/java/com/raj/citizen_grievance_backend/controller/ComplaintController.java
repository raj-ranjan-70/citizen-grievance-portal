package com.raj.citizen_grievance_backend.controller;

import com.raj.citizen_grievance_backend.dto.ComplaintRequest;
import com.raj.citizen_grievance_backend.dto.ComplaintResponse;
import com.raj.citizen_grievance_backend.entity.ComplaintCategory;
import com.raj.citizen_grievance_backend.entity.User;
import com.raj.citizen_grievance_backend.repository.ComplaintCategoryRepository;
import com.raj.citizen_grievance_backend.service.ComplaintService;
import jakarta.servlet.http.HttpSession;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/complaints")
public class ComplaintController {

    private final ComplaintService complaintService;
    private final ComplaintCategoryRepository categoryRepository;

    public ComplaintController(ComplaintService complaintService,
                               ComplaintCategoryRepository categoryRepository) {
        this.complaintService = complaintService;
        this.categoryRepository = categoryRepository;
    }

    /**
     * POST /api/complaints — Create a new complaint.
     */
    @PostMapping
    public ResponseEntity<?> createComplaint(@Valid @RequestBody ComplaintRequest request,
                                             HttpSession session) {
        User currentUser = getAuthenticatedUser(session);
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
    public ResponseEntity<?> getMyComplaints(HttpSession session) {
        User currentUser = getAuthenticatedUser(session);
        if (currentUser == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("message", "Authentication required"));
        }

        List<ComplaintResponse> complaints = complaintService.getComplaintsByUser(currentUser.getId());
        return ResponseEntity.ok(complaints);
    }

    /**
     * GET /api/complaints/{id} — View a single complaint (must be owned by current user).
     */
    @GetMapping("/{id}")
    public ResponseEntity<?> getComplaintById(@PathVariable Long id, HttpSession session) {
        User currentUser = getAuthenticatedUser(session);
        if (currentUser == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("message", "Authentication required"));
        }

        ComplaintResponse response = complaintService.getComplaintById(id, currentUser);
        return ResponseEntity.ok(response);
    }

    /**
     * GET /api/complaints/categories — List all complaint categories.
     */
    @GetMapping("/categories")
    public ResponseEntity<?> getCategories(HttpSession session) {
        User currentUser = getAuthenticatedUser(session);
        if (currentUser == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("message", "Authentication required"));
        }

        List<ComplaintCategory> categories = categoryRepository.findAll();
        return ResponseEntity.ok(categories);
    }

    private User getAuthenticatedUser(HttpSession session) {
        return (User) session.getAttribute("currentUser");
    }
}
