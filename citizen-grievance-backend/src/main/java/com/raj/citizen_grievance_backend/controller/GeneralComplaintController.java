package com.raj.citizen_grievance_backend.controller;

import com.raj.citizen_grievance_backend.dto.ApiResponse;
import com.raj.citizen_grievance_backend.service.ComplaintService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/complaints")
@Tag(name = "General Complaint Operations", description = "Endpoints accessible by multiple roles for general complaint interactions")
public class GeneralComplaintController {

    private final ComplaintService complaintService;

    public GeneralComplaintController(ComplaintService complaintService) {
        this.complaintService = complaintService;
    }

    @PutMapping("/{id}/view")
    @Operation(summary = "Update last viewed timestamp", description = "Updates the last viewed timestamp for the citizen or officer based on the logged-in user session")
    @ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "View timestamp updated successfully",
                    content = @Content(schema = @Schema(implementation = ApiResponse.class))),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "401", description = "Not authenticated",
                    content = @Content(schema = @Schema(implementation = ApiResponse.class))),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "Complaint not found",
                    content = @Content(schema = @Schema(implementation = ApiResponse.class)))
    })
    public ResponseEntity<ApiResponse<Void>> updateViewTimestamp(
            @PathVariable UUID id,
            HttpServletRequest request) {

        HttpSession session = request.getSession(false);
        if (session == null || session.getAttribute("userId") == null) {
            throw new com.raj.citizen_grievance_backend.exception.UnauthorizedException("Access Denied: You must be logged in");
        }

        UUID userId = (UUID) session.getAttribute("userId");
        String role = (String) session.getAttribute("userRole");

        complaintService.updateLastViewedAt(id, userId, role);

        ApiResponse<Void> apiResponse = ApiResponse.<Void>builder()
                .success(true)
                .message("View timestamp updated successfully")
                .build();
        return ResponseEntity.ok(apiResponse);
    }
}
