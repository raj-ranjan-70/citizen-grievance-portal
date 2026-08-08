package com.raj.citizen_grievance_backend.controller;

import com.raj.citizen_grievance_backend.dto.ApiResponse;
import com.raj.citizen_grievance_backend.dto.NotificationResponse;
import com.raj.citizen_grievance_backend.exception.UnauthorizedException;
import com.raj.citizen_grievance_backend.service.NotificationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/notifications")
@RequiredArgsConstructor
@Tag(name = "Real-Time Notifications", description = "Endpoints for managing real-time notifications via SSE streams and reading statuses")
public class NotificationController {

    private final NotificationService notificationService;

    private UUID getAuthenticatedUserId(HttpServletRequest request) {
        HttpSession session = request.getSession(false);
        if (session == null || session.getAttribute("userId") == null) {
            throw new UnauthorizedException("Access Denied: You must be logged in to access this resource");
        }
        return (UUID) session.getAttribute("userId");
    }

    @GetMapping(value = "/subscribe", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    @Operation(summary = "Subscribe to live notification stream (SSE)", description = "Establishes a long-running Server-Sent Events stream to push real-time notifications to the client")
    public SseEmitter subscribe(HttpServletRequest servletRequest) {
        UUID userId = getAuthenticatedUserId(servletRequest);
        return notificationService.subscribe(userId);
    }

    @GetMapping("/unread")
    @Operation(summary = "Get unread notifications", description = "Retrieves a list of all unread notifications stored in the database for the authenticated user")
    @ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Unread notifications list retrieved successfully",
                    content = @Content(schema = @Schema(implementation = ApiResponse.class))),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "401", description = "Not authenticated",
                    content = @Content(schema = @Schema(implementation = ApiResponse.class)))
    })
    public ResponseEntity<ApiResponse<List<NotificationResponse>>> getUnreadNotifications(HttpServletRequest servletRequest) {
        UUID userId = getAuthenticatedUserId(servletRequest);
        List<NotificationResponse> list = notificationService.getUnreadNotifications(userId);

        ApiResponse<List<NotificationResponse>> response = ApiResponse.<List<NotificationResponse>>builder()
                .success(true)
                .message("Unread notifications retrieved successfully")
                .data(list)
                .build();
        return ResponseEntity.ok(response);
    }

    @PutMapping("/{id}/read")
    @Operation(summary = "Mark notification as read", description = "Marks a specific unread notification as read after validating ownership")
    @ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Notification marked as read successfully",
                    content = @Content(schema = @Schema(implementation = ApiResponse.class))),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "401", description = "Not authenticated",
                    content = @Content(schema = @Schema(implementation = ApiResponse.class))),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "403", description = "Forbidden: Notification belongs to a different user",
                    content = @Content(schema = @Schema(implementation = ApiResponse.class))),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "Notification not found",
                    content = @Content(schema = @Schema(implementation = ApiResponse.class)))
    })
    public ResponseEntity<ApiResponse<Void>> markAsRead(@PathVariable("id") UUID id, HttpServletRequest servletRequest) {
        UUID userId = getAuthenticatedUserId(servletRequest);
        notificationService.markAsRead(id, userId);

        ApiResponse<Void> response = ApiResponse.<Void>builder()
                .success(true)
                .message("Notification marked as read")
                .build();
        return ResponseEntity.ok(response);
    }
}
