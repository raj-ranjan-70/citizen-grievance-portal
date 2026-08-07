package com.raj.citizen_grievance_backend.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Schema(description = "Request body to assign a complaint to an officer")
public class AssignOfficerRequest {

    @NotNull(message = "Officer ID is required")
    @Schema(description = "Unique identifier of the assigned officer", example = "d3b07384-d113-49c7-a5c6-cf0d8324e930")
    private UUID officerId;
}
