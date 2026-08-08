package com.raj.citizen_grievance_backend.controller;

import com.raj.citizen_grievance_backend.dto.*;
import com.raj.citizen_grievance_backend.exception.UnauthorizedException;
import com.raj.citizen_grievance_backend.service.ComplaintService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/complaints")
@Tag(name = "Complaints", description = "Endpoints for citizens to file and manage their grievances and comments")
public class ComplaintController {

    private final ComplaintService complaintService;

    public ComplaintController(ComplaintService complaintService) {
        this.complaintService = complaintService;
    }

    private UUID getAuthenticatedUserId(HttpServletRequest request) {
        HttpSession session = request.getSession(false);
        if (session == null || session.getAttribute("userId") == null) {
            throw new UnauthorizedException("Access Denied: You must be logged in to access this resource");
        }
        return (UUID) session.getAttribute("userId");
    }

    @PostMapping
    @Operation(summary = "Create a new complaint", description = "Allows an authenticated citizen to file a new grievance")
    @ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "201", description = "Complaint created successfully",
                    content = @Content(schema = @Schema(implementation = ApiResponse.class))),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "400", description = "Invalid complaint request body",
                    content = @Content(schema = @Schema(implementation = ApiResponse.class))),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "401", description = "Not authenticated",
                    content = @Content(schema = @Schema(implementation = ApiResponse.class)))
    })
    public ResponseEntity<ApiResponse<ComplaintResponse>> createComplaint(
            @Valid @RequestBody ComplaintRequest request,
            HttpServletRequest servletRequest) {

        UUID citizenId = getAuthenticatedUserId(servletRequest);
        ComplaintResponse response = complaintService.createComplaint(request, citizenId);

        ApiResponse<ComplaintResponse> apiResponse = ApiResponse.<ComplaintResponse>builder()
                .success(true)
                .message("Complaint filed successfully")
                .data(response)
                .build();
        return ResponseEntity.status(HttpStatus.CREATED).body(apiResponse);
    }

    @GetMapping
    @Operation(summary = "List citizen's own complaints", description = "Retrieves all grievances filed by the authenticated citizen")
    @ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "List of complaints retrieved successfully",
                    content = @Content(schema = @Schema(implementation = ApiResponse.class))),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "401", description = "Not authenticated",
                    content = @Content(schema = @Schema(implementation = ApiResponse.class)))
    })
    public ResponseEntity<ApiResponse<List<ComplaintResponse>>> getComplaints(HttpServletRequest servletRequest) {
        UUID citizenId = getAuthenticatedUserId(servletRequest);
        List<ComplaintResponse> response = complaintService.getComplaintsByCitizen(citizenId);

        ApiResponse<List<ComplaintResponse>> apiResponse = ApiResponse.<List<ComplaintResponse>>builder()
                .success(true)
                .message("Complaints list retrieved successfully")
                .data(response)
                .build();
        return ResponseEntity.ok(apiResponse);
    }

    @GetMapping("/{id}")
    @Operation(summary = "View specific complaint details", description = "Retrieves specific complaint details including a list of comments")
    @ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Complaint details retrieved",
                    content = @Content(schema = @Schema(implementation = ApiResponse.class))),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "401", description = "Not authenticated",
                    content = @Content(schema = @Schema(implementation = ApiResponse.class))),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "403", description = "Access denied: complaint belongs to another user",
                    content = @Content(schema = @Schema(implementation = ApiResponse.class))),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "Complaint not found",
                    content = @Content(schema = @Schema(implementation = ApiResponse.class)))
    })
    public ResponseEntity<ApiResponse<ComplaintResponse>> getComplaintDetails(
            @PathVariable UUID id,
            HttpServletRequest servletRequest) {

        UUID userId = getAuthenticatedUserId(servletRequest);
        ComplaintResponse response = complaintService.getComplaintById(id, userId);

        ApiResponse<ComplaintResponse> apiResponse = ApiResponse.<ComplaintResponse>builder()
                .success(true)
                .message("Complaint details retrieved successfully")
                .data(response)
                .build();
        return ResponseEntity.ok(apiResponse);
    }

    @PutMapping("/{id}")
    @Operation(summary = "Edit a complaint's details", description = "Modifies title/description of a complaint if it is still pending/unassigned")
    @ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Complaint updated successfully",
                    content = @Content(schema = @Schema(implementation = ApiResponse.class))),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "400", description = "Complaint cannot be edited (not in PENDING status) or invalid payload",
                    content = @Content(schema = @Schema(implementation = ApiResponse.class))),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "401", description = "Not authenticated",
                    content = @Content(schema = @Schema(implementation = ApiResponse.class))),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "403", description = "Access denied",
                    content = @Content(schema = @Schema(implementation = ApiResponse.class))),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "Complaint not found",
                    content = @Content(schema = @Schema(implementation = ApiResponse.class)))
    })
    public ResponseEntity<ApiResponse<ComplaintResponse>> updateComplaint(
            @PathVariable UUID id,
            @Valid @RequestBody ComplaintRequest request,
            HttpServletRequest servletRequest) {

        UUID userId = getAuthenticatedUserId(servletRequest);
        ComplaintResponse response = complaintService.updateComplaint(id, request, userId);

        ApiResponse<ComplaintResponse> apiResponse = ApiResponse.<ComplaintResponse>builder()
                .success(true)
                .message("Complaint updated successfully")
                .data(response)
                .build();
        return ResponseEntity.ok(apiResponse);
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete a complaint", description = "Deletes a complaint if it has not yet been assigned to an officer")
    @ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Complaint deleted successfully",
                    content = @Content(schema = @Schema(implementation = ApiResponse.class))),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "400", description = "Complaint cannot be deleted (already assigned/processed)",
                    content = @Content(schema = @Schema(implementation = ApiResponse.class))),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "401", description = "Not authenticated",
                    content = @Content(schema = @Schema(implementation = ApiResponse.class))),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "403", description = "Access denied",
                    content = @Content(schema = @Schema(implementation = ApiResponse.class))),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "Complaint not found",
                    content = @Content(schema = @Schema(implementation = ApiResponse.class)))
    })
    public ResponseEntity<ApiResponse<Void>> deleteComplaint(
            @PathVariable UUID id,
            HttpServletRequest servletRequest) {

        UUID userId = getAuthenticatedUserId(servletRequest);
        complaintService.deleteComplaint(id, userId);

        ApiResponse<Void> apiResponse = ApiResponse.<Void>builder()
                .success(true)
                .message("Complaint deleted successfully")
                .build();
        return ResponseEntity.ok(apiResponse);
    }

    @PostMapping("/{id}/comments")
    @Operation(summary = "Add a comment to a specific complaint", description = "Allows adding a thread comment to a specific complaint")
    @ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "201", description = "Comment added successfully",
                    content = @Content(schema = @Schema(implementation = ApiResponse.class))),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "400", description = "Invalid comment request body",
                    content = @Content(schema = @Schema(implementation = ApiResponse.class))),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "401", description = "Not authenticated",
                    content = @Content(schema = @Schema(implementation = ApiResponse.class))),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "403", description = "Access denied",
                    content = @Content(schema = @Schema(implementation = ApiResponse.class))),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "Complaint not found",
                    content = @Content(schema = @Schema(implementation = ApiResponse.class)))
    })
    public ResponseEntity<ApiResponse<CommentResponse>> addComment(
            @PathVariable UUID id,
            @Valid @RequestBody CommentRequest request,
            HttpServletRequest servletRequest) {

        UUID userId = getAuthenticatedUserId(servletRequest);
        CommentResponse response = complaintService.addComment(id, request, userId);

        ApiResponse<CommentResponse> apiResponse = ApiResponse.<CommentResponse>builder()
                .success(true)
                .message("Comment added successfully")
                .data(response)
                .build();
        return ResponseEntity.status(HttpStatus.CREATED).body(apiResponse);
    }

    @PostMapping(value = "/{id}/images", consumes = org.springframework.http.MediaType.MULTIPART_FORM_DATA_VALUE)
    @Operation(summary = "Upload an image for a specific complaint", description = "Allows an authenticated citizen to upload an image attachment for their grievance")
    @ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Image uploaded successfully",
                    content = @Content(schema = @Schema(implementation = ApiResponse.class))),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "400", description = "Invalid file or error during processing",
                    content = @Content(schema = @Schema(implementation = ApiResponse.class))),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "401", description = "Not authenticated",
                    content = @Content(schema = @Schema(implementation = ApiResponse.class))),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "403", description = "Access denied: complaint belongs to another user",
                    content = @Content(schema = @Schema(implementation = ApiResponse.class))),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "Complaint not found",
                    content = @Content(schema = @Schema(implementation = ApiResponse.class)))
    })
    public ResponseEntity<ApiResponse<ComplaintResponse>> uploadComplaintImage(
            @PathVariable UUID id,
            @RequestParam("file") org.springframework.web.multipart.MultipartFile file,
            HttpServletRequest servletRequest) {

        UUID citizenId = getAuthenticatedUserId(servletRequest);
        ComplaintResponse response = complaintService.uploadComplaintImage(id, file, citizenId);

        ApiResponse<ComplaintResponse> apiResponse = ApiResponse.<ComplaintResponse>builder()
                .success(true)
                .message("Image uploaded successfully")
                .data(response)
                .build();
        return ResponseEntity.ok(apiResponse);
    }
}
