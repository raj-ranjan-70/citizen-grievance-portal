package com.raj.citizen_grievance_backend.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Schema(description = "Request body to reject a complaint with remarks")
public class RejectComplaintRequest {

    @NotBlank(message = "Remarks are mandatory for rejection")
    @Schema(description = "Reason or remarks for rejecting the complaint", example = "The reported issue is not under our department's jurisdiction.")
    private String remarks;
}
