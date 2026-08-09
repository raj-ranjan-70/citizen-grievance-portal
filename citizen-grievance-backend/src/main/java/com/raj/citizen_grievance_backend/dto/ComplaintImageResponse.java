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

    @Schema(description = "Unique identifier / UUID of the image stored in R2", example = "e1b12345-1234-1234-1234-123412341234")
    private String imageUuid;

    @Schema(description = "Timestamp of when the image was uploaded", example = "2026-08-06T10:00:00")
    private LocalDateTime uploadedAt;
}
