package com.raj.citizen_grievance_backend.dto;

import com.raj.citizen_grievance_backend.entity.ComplaintStatus;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Schema(description = "Request body to update a complaint status")
public class UpdateComplaintStatusRequest {

    @NotNull(message = "Status is required")
    @Schema(description = "New status for the complaint", example = "RESOLVED", allowableValues = {"RESOLVED", "REJECTED"})
    private ComplaintStatus status;
}
