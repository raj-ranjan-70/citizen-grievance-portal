package com.raj.citizen_grievance_backend.controller;

import com.raj.citizen_grievance_backend.dto.ApiResponse;
import com.raj.citizen_grievance_backend.dto.CommentRequest;
import com.raj.citizen_grievance_backend.dto.CommentResponse;
import com.raj.citizen_grievance_backend.dto.ComplaintResponse;
import com.raj.citizen_grievance_backend.dto.RejectComplaintRequest;
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

    @PostMapping(value = "/complaints/{id}/resolve", consumes = org.springframework.http.MediaType.MULTIPART_FORM_DATA_VALUE)
    @Operation(summary = "Resolve complaint with proof image and remarks", description = "Allows an assigned officer to mark a complaint as RESOLVED by uploading a proof image and entering remarks")
    @ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Complaint resolved successfully",
                    content = @Content(schema = @Schema(implementation = ApiResponse.class))),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "400", description = "Missing upload image or remarks",
                    content = @Content(schema = @Schema(implementation = ApiResponse.class))),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "401", description = "Not authenticated",
                    content = @Content(schema = @Schema(implementation = ApiResponse.class))),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "403", description = "Access denied: complaint belongs to another officer",
                    content = @Content(schema = @Schema(implementation = ApiResponse.class))),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "Complaint not found",
                    content = @Content(schema = @Schema(implementation = ApiResponse.class)))
    })
    public ResponseEntity<ApiResponse<ComplaintResponse>> resolveComplaint(
            @PathVariable UUID id,
            @RequestParam(value = "file", required = false) org.springframework.web.multipart.MultipartFile file,
            @RequestParam(value = "remarks", required = false) String remarks,
            HttpServletRequest servletRequest) {

        if (file == null || file.isEmpty()) {
            throw new com.raj.citizen_grievance_backend.exception.BadRequestException("Proof of resolution image is mandatory");
        }
        if (remarks == null || remarks.trim().isEmpty()) {
            throw new com.raj.citizen_grievance_backend.exception.BadRequestException("Resolution remarks are mandatory");
        }

        UUID officerId = getAuthenticatedUserId(servletRequest);
        ComplaintResponse response = officerService.resolveComplaint(id, file, remarks, officerId);

        ApiResponse<ComplaintResponse> apiResponse = ApiResponse.<ComplaintResponse>builder()
                .success(true)
                .message("Complaint resolved successfully")
                .data(response)
                .build();
        return ResponseEntity.ok(apiResponse);
    }

    @PutMapping("/complaints/{id}/reject")
    @Operation(summary = "Reject complaint with remarks", description = "Allows an assigned officer to reject a complaint by providing remarks")
    @ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Complaint rejected successfully",
                    content = @Content(schema = @Schema(implementation = ApiResponse.class))),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "400", description = "Remarks cannot be empty",
                    content = @Content(schema = @Schema(implementation = ApiResponse.class))),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "401", description = "Not authenticated",
                    content = @Content(schema = @Schema(implementation = ApiResponse.class))),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "403", description = "Access denied: complaint belongs to another officer",
                    content = @Content(schema = @Schema(implementation = ApiResponse.class))),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "Complaint not found",
                    content = @Content(schema = @Schema(implementation = ApiResponse.class)))
    })
    public ResponseEntity<ApiResponse<ComplaintResponse>> rejectComplaint(
            @PathVariable UUID id,
            @Valid @RequestBody RejectComplaintRequest request,
            HttpServletRequest servletRequest) {

        UUID officerId = getAuthenticatedUserId(servletRequest);
        ComplaintResponse response = officerService.rejectComplaint(id, request.getRemarks(), officerId);

        ApiResponse<ComplaintResponse> apiResponse = ApiResponse.<ComplaintResponse>builder()
                .success(true)
                .message("Complaint rejected successfully")
                .data(response)
                .build();
        return ResponseEntity.ok(apiResponse);
    }

    @PostMapping("/complaints/{id}/comments")
    @Operation(summary = "Add a comment to an assigned complaint", description = "Allows the assigned officer to add a comment to their assigned complaint")
    @ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "201", description = "Comment added successfully",
                    content = @Content(schema = @Schema(implementation = ApiResponse.class))),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "400", description = "Invalid comment request body",
                    content = @Content(schema = @Schema(implementation = ApiResponse.class))),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "401", description = "Not authenticated",
                    content = @Content(schema = @Schema(implementation = ApiResponse.class))),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "403", description = "Access denied: complaint is not assigned to you",
                    content = @Content(schema = @Schema(implementation = ApiResponse.class))),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "Complaint not found",
                    content = @Content(schema = @Schema(implementation = ApiResponse.class)))
    })
    public ResponseEntity<ApiResponse<CommentResponse>> addComment(
            @PathVariable UUID id,
            @Valid @RequestBody CommentRequest request,
            HttpServletRequest servletRequest) {

        UUID officerId = getAuthenticatedUserId(servletRequest);
        CommentResponse response = officerService.addComment(id, request, officerId);

        ApiResponse<CommentResponse> apiResponse = ApiResponse.<CommentResponse>builder()
                .success(true)
                .message("Comment added successfully")
                .data(response)
                .build();
        return ResponseEntity.status(org.springframework.http.HttpStatus.CREATED).body(apiResponse);
    }
}
