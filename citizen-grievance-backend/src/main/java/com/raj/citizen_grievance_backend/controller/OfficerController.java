package com.raj.citizen_grievance_backend.controller;

import com.raj.citizen_grievance_backend.dto.ApiResponse;
import com.raj.citizen_grievance_backend.dto.ComplaintResponse;
import com.raj.citizen_grievance_backend.dto.UpdateComplaintStatusRequest;
import com.raj.citizen_grievance_backend.exception.UnauthorizedException;
import com.raj.citizen_grievance_backend.service.OfficerService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/officer")
@Tag(name = "Officer Operations", description = "Endpoints for department officers to view active assignments, inspect history, and resolve grievances")
public class OfficerController {

    private final OfficerService officerService;

    public OfficerController(OfficerService officerService) {
        this.officerService = officerService;
    }

    private UUID getAuthenticatedUserId(HttpServletRequest request) {
        HttpSession session = request.getSession(false);
        if (session == null || session.getAttribute("userId") == null) {
            throw new UnauthorizedException("Access Denied: You must be logged in to access this resource");
        }
        return (UUID) session.getAttribute("userId");
    }

    @GetMapping("/complaints/active")
    @Operation(summary = "List active assigned complaints", description = "Retrieves all complaints assigned to the authenticated officer that are currently in ASSIGNED status")
    @ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "List of active complaints retrieved successfully",
                    content = @Content(schema = @Schema(implementation = ApiResponse.class))),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "401", description = "Not authenticated",
                    content = @Content(schema = @Schema(implementation = ApiResponse.class))),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "403", description = "Access denied: Officer role required",
                    content = @Content(schema = @Schema(implementation = ApiResponse.class)))
    })
    public ResponseEntity<ApiResponse<List<ComplaintResponse>>> getActiveComplaints(HttpServletRequest servletRequest) {
        UUID officerId = getAuthenticatedUserId(servletRequest);
        List<ComplaintResponse> response = officerService.getActiveComplaints(officerId);

        ApiResponse<List<ComplaintResponse>> apiResponse = ApiResponse.<List<ComplaintResponse>>builder()
                .success(true)
                .message("Active complaints retrieved successfully")
                .data(response)
                .build();
        return ResponseEntity.ok(apiResponse);
    }

    @GetMapping("/complaints/history")
    @Operation(summary = "List processed complaint history", description = "Retrieves all resolved or rejected complaints that were assigned to the authenticated officer")
    @ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "List of historical complaints retrieved successfully",
                    content = @Content(schema = @Schema(implementation = ApiResponse.class))),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "401", description = "Not authenticated",
                    content = @Content(schema = @Schema(implementation = ApiResponse.class))),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "403", description = "Access denied: Officer role required",
                    content = @Content(schema = @Schema(implementation = ApiResponse.class)))
    })
    public ResponseEntity<ApiResponse<List<ComplaintResponse>>> getComplaintHistory(HttpServletRequest servletRequest) {
        UUID officerId = getAuthenticatedUserId(servletRequest);
        List<ComplaintResponse> response = officerService.getComplaintHistory(officerId);

        ApiResponse<List<ComplaintResponse>> apiResponse = ApiResponse.<List<ComplaintResponse>>builder()
                .success(true)
                .message("Complaint history retrieved successfully")
                .data(response)
                .build();
        return ResponseEntity.ok(apiResponse);
    }

    @PutMapping("/complaints/{id}/status")
    @Operation(summary = "Update complaint status", description = "Transitions an assigned complaint's status to either RESOLVED or REJECTED")
    @ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Status updated successfully",
                    content = @Content(schema = @Schema(implementation = ApiResponse.class))),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "400", description = "Invalid status transitions",
                    content = @Content(schema = @Schema(implementation = ApiResponse.class))),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "401", description = "Not authenticated",
                    content = @Content(schema = @Schema(implementation = ApiResponse.class))),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "403", description = "Access denied: Officer role required or complaint not assigned to you",
                    content = @Content(schema = @Schema(implementation = ApiResponse.class))),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "Complaint not found",
                    content = @Content(schema = @Schema(implementation = ApiResponse.class)))
    })
    public ResponseEntity<ApiResponse<ComplaintResponse>> updateComplaintStatus(
            @PathVariable UUID id,
            @Valid @RequestBody UpdateComplaintStatusRequest request,
            HttpServletRequest servletRequest) {

        UUID officerId = getAuthenticatedUserId(servletRequest);
        ComplaintResponse response = officerService.updateComplaintStatus(id, request.getStatus(), officerId);

        ApiResponse<ComplaintResponse> apiResponse = ApiResponse.<ComplaintResponse>builder()
                .success(true)
                .message("Status updated successfully")
                .data(response)
                .build();
        return ResponseEntity.ok(apiResponse);
    }
}
