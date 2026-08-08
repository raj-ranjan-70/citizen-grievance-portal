package com.raj.citizen_grievance_backend.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Schema(description = "Response payload representing a real-time notification")
public class NotificationResponse {

    @Schema(description = "Unique identifier of the notification", example = "d3b07384-d113-49c5-a5d6-841f3d6118d0")
    private UUID id;

    @Schema(description = "Recipient user ID", example = "a2f96115-c224-42b7-84fe-19a3b6118f92")
    private UUID recipientId;

    @Schema(description = "Descriptive notification message", example = "A new complaint has been assigned to you.")
    private String message;

    @Schema(description = "Optional related complaint UUID for deep-linking", example = "f8c85312-d9e2-411a-96e0-394856f7ef53")
    private UUID relatedComplaintId;

    @Schema(description = "Flag indicating if the notification has been read", example = "false")
    private Boolean isRead;

    @Schema(description = "Creation date and time of the notification")
    private LocalDateTime createdAt;
}
