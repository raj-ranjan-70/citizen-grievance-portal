package com.raj.citizen_grievance_backend.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Schema(description = "Response payload representing details of an uploaded complaint image")
public class ComplaintImageResponse {

    @Schema(description = "Unique identifier / UUID of the image record", example = "a2f96115-c224-42b7-84fe-19a3b6118f92")
    private java.util.UUID id;

    @Schema(description = "Unique identifier / UUID of the image stored in R2", example = "e1b12345-1234-1234-1234-123412341234")
    private String imageUuid;

    @Schema(description = "Timestamp of when the image was uploaded", example = "2026-08-06T10:00:00")
    private LocalDateTime uploadedAt;

    @Schema(description = "Unique identifier / UUID of the citizen who uploaded the image", example = "6939a4ce-1f5b-41bc-906a-83384a790881")
    private java.util.UUID authorId;
}
