package com.raj.citizen_grievance_backend.dto;

import com.raj.citizen_grievance_backend.entity.ComplaintStatus;
import com.raj.citizen_grievance_backend.entity.Priority;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Schema(description = "Response payload representing complaint details")
public class ComplaintResponse {

    @Schema(description = "Unique identifier of the complaint", example = "a25e6f3d-5192-4911-b0ad-bb7e94cc0100")
    private UUID id;

    @Schema(description = "Brief title summarizing the grievance", example = "Water supply leakage on MG Road")
    private String title;

    @Schema(description = "Detailed explanation of the grievance", example = "There has been a major underground pipeline burst...")
    private String description;

    @Schema(description = "The department or category of the complaint", example = "Water Supply")
    private String category;

    @Schema(description = "Severity priority of the complaint", example = "MEDIUM")
    private Priority priority;

    @Schema(description = "Current status of the complaint", example = "PENDING")
    private ComplaintStatus status;

    @Schema(description = "Full name of the citizen who filed the complaint", example = "John Doe")
    private String citizenName;

    @Schema(description = "Email of the citizen who filed the complaint", example = "john.doe@example.com")
    private String citizenEmail;

    @Schema(description = "Full name of the assigned officer, if any", example = "Officer Kumar")
    private String assignedOfficerName;

    @Schema(description = "Timestamp of creation", example = "2026-08-06T10:00:00")
    private LocalDateTime createdAt;

    @Schema(description = "Timestamp of last update", example = "2026-08-06T11:00:00")
    private LocalDateTime updatedAt;

    @Schema(description = "List of associated comments on this complaint")
    private List<CommentResponse> comments;

    @Schema(description = "List of associated image UUIDs submitted by the citizen", example = "[\"e1b12345-1234-1234-1234-123412341234\"]")
    private List<String> imageUuids;

    @Schema(description = "UUID of the proof image uploaded by the officer upon resolution", example = "f9c98765-4321-4321-4321-432143214321")
    private String resolutionImageUuid;
}
