package com.raj.citizen_grievance_backend.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Schema(description = "Standard envelope for API responses")
public class ApiResponse<T> {

    @Schema(description = "Indicates whether the API request was successful", example = "true")
    private boolean success;

    @Schema(description = "Descriptive feedback message", example = "Operation completed successfully")
    private String message;

    @Schema(description = "Response data payload")
    private T data;

    @Schema(description = "Validation or execution errors, if any")
    private Object errors;

    @Builder.Default
    @Schema(description = "ISO-8601 Timestamp of the response", example = "2026-08-06T10:00:00.123")
    private String timestamp = LocalDateTime.now().format(DateTimeFormatter.ISO_LOCAL_DATE_TIME);
}
