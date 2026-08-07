package com.raj.citizen_grievance_backend.dto;

import com.raj.citizen_grievance_backend.entity.Department;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Schema(description = "Request body to create a new officer account")
public class CreateOfficerRequest {

    @NotBlank(message = "Name is required")
    @Size(min = 2, max = 100, message = "Name must be between 2 and 100 characters")
    @Schema(description = "Full name of the officer", example = "Officer Kumar")
    private String name;

    @NotBlank(message = "Email is required")
    @Email(message = "Please enter a valid email address")
    @Schema(description = "Email address of the officer", example = "officer.kumar@citizen.com")
    private String email;

    @NotBlank(message = "Password is required")
    @Size(min = 6, max = 100, message = "Password must be at least 6 characters")
    @Schema(description = "Plain text password for the officer", example = "password123")
    private String password;

    @NotNull(message = "Department is required")
    @Schema(description = "Department assigned to the officer", example = "WATER", allowableValues = {"WATER", "ELECTRICITY", "ROADS", "SANITATION", "NONE"})
    private Department department;
}
