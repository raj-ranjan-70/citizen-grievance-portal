package com.raj.citizen_grievance_backend.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Schema(description = "Request body to create or update a citizen complaint")
public class ComplaintRequest {

    @NotBlank(message = "Title is required")
    @Size(min = 5, max = 100, message = "Title must be between 5 and 100 characters")
    @Schema(description = "Brief title summarizing the grievance", example = "Water supply leakage on MG Road")
    private String title;

    @NotBlank(message = "Description is required")
    @Size(min = 20, max = 5000, message = "Description must be between 20 and 5000 characters")
    @Schema(description = "Detailed explanation of the grievance", example = "There has been a major underground pipeline burst near Metro Pillar 140, wasting clean water.")
    private String description;

    @NotBlank(message = "Category is required")
    @Schema(description = "The department or area of the complaint", example = "Water Supply")
    private String category;

    @NotBlank(message = "Priority is required")
    @Schema(description = "Severity priority of the complaint", example = "MEDIUM", allowableValues = {"LOW", "MEDIUM", "HIGH"})
    private String priority;
}
