package com.raj.citizen_grievance_backend.controller;

import com.raj.citizen_grievance_backend.dto.*;
import com.raj.citizen_grievance_backend.exception.UnauthorizedException;
import com.raj.citizen_grievance_backend.service.AdminService;
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
@RequestMapping("/api/v1/admin")
@Tag(name = "Admin Operations", description = "Endpoints for administrators to manage officers and assign complaints")
public class AdminController {

    private final AdminService adminService;

    public AdminController(AdminService adminService) {
        this.adminService = adminService;
    }

    private UUID getAuthenticatedUserId(HttpServletRequest request) {
        HttpSession session = request.getSession(false);
        if (session == null || session.getAttribute("userId") == null) {
            throw new UnauthorizedException("Access Denied: You must be logged in to access this resource");
        }
        return (UUID) session.getAttribute("userId");
    }

    @PostMapping("/officers")
    @Operation(summary = "Create a new officer account", description = "Allows admins to register a new municipal officer assigned to a specific department")
    @ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "201", description = "Officer created successfully",
                    content = @Content(schema = @Schema(implementation = ApiResponse.class))),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "400", description = "Invalid creation input or email already exists",
                    content = @Content(schema = @Schema(implementation = ApiResponse.class))),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "401", description = "Not authenticated",
                    content = @Content(schema = @Schema(implementation = ApiResponse.class))),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "403", description = "Access denied: Admin role required",
                    content = @Content(schema = @Schema(implementation = ApiResponse.class)))
    })
    public ResponseEntity<ApiResponse<UserResponse>> createOfficer(
            @Valid @RequestBody CreateOfficerRequest request,
            HttpServletRequest servletRequest) {

        UUID adminId = getAuthenticatedUserId(servletRequest);
        UserResponse response = adminService.createOfficer(request, adminId);

        ApiResponse<UserResponse> apiResponse = ApiResponse.<UserResponse>builder()
                .success(true)
                .message("Officer registered successfully")
                .data(response)
                .build();
        return ResponseEntity.status(HttpStatus.CREATED).body(apiResponse);
    }

    @GetMapping("/complaints")
    @Operation(summary = "List all grievances in the system", description = "Retrieves all filed citizen complaints in descending chronological order")
    @ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "List of all complaints retrieved successfully",
                    content = @Content(schema = @Schema(implementation = ApiResponse.class))),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "401", description = "Not authenticated",
                    content = @Content(schema = @Schema(implementation = ApiResponse.class))),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "403", description = "Access denied: Admin role required",
                    content = @Content(schema = @Schema(implementation = ApiResponse.class)))
    })
    public ResponseEntity<ApiResponse<List<ComplaintResponse>>> getAllComplaints(HttpServletRequest servletRequest) {
        UUID adminId = getAuthenticatedUserId(servletRequest);
        List<ComplaintResponse> response = adminService.getAllComplaints(adminId);

        ApiResponse<List<ComplaintResponse>> apiResponse = ApiResponse.<List<ComplaintResponse>>builder()
                .success(true)
                .message("All complaints retrieved successfully")
                .data(response)
                .build();
        return ResponseEntity.ok(apiResponse);
    }

    @GetMapping("/officers")
    @Operation(summary = "List all registered officers", description = "Retrieves all registered officer accounts for assignment reference")
    @ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "List of officers retrieved successfully",
                    content = @Content(schema = @Schema(implementation = ApiResponse.class))),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "401", description = "Not authenticated",
                    content = @Content(schema = @Schema(implementation = ApiResponse.class))),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "403", description = "Access denied: Admin role required",
                    content = @Content(schema = @Schema(implementation = ApiResponse.class)))
    })
    public ResponseEntity<ApiResponse<List<UserResponse>>> getAllOfficers(HttpServletRequest servletRequest) {
        UUID adminId = getAuthenticatedUserId(servletRequest);
        List<UserResponse> response = adminService.getAllOfficers(adminId);

        ApiResponse<List<UserResponse>> apiResponse = ApiResponse.<List<UserResponse>>builder()
                .success(true)
                .message("Officers list retrieved successfully")
                .data(response)
                .build();
        return ResponseEntity.ok(apiResponse);
    }

    @PutMapping("/complaints/{id}/assign")
    @Operation(summary = "Assign a complaint to an officer", description = "Links a complaint to a specific municipal officer and updates its status to ASSIGNED")
    @ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Complaint assigned successfully",
                    content = @Content(schema = @Schema(implementation = ApiResponse.class))),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "400", description = "Assigned user is not an officer",
                    content = @Content(schema = @Schema(implementation = ApiResponse.class))),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "401", description = "Not authenticated",
                    content = @Content(schema = @Schema(implementation = ApiResponse.class))),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "403", description = "Access denied: Admin role required",
                    content = @Content(schema = @Schema(implementation = ApiResponse.class))),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "Complaint or officer not found",
                    content = @Content(schema = @Schema(implementation = ApiResponse.class)))
    })
    public ResponseEntity<ApiResponse<ComplaintResponse>> assignComplaint(
            @PathVariable UUID id,
            @Valid @RequestBody AssignOfficerRequest request,
            HttpServletRequest servletRequest) {

        UUID adminId = getAuthenticatedUserId(servletRequest);
        ComplaintResponse response = adminService.assignComplaint(id, request.getOfficerId(), adminId);

        ApiResponse<ComplaintResponse> apiResponse = ApiResponse.<ComplaintResponse>builder()
                .success(true)
                .message("Complaint assigned successfully")
                .data(response)
                .build();
        return ResponseEntity.ok(apiResponse);
    }
}
