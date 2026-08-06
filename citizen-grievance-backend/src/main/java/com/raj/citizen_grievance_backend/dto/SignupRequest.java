package com.raj.citizen_grievance_backend.dto;

import com.raj.citizen_grievance_backend.entity.Department;
import com.raj.citizen_grievance_backend.entity.Role;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Schema(description = "Request payload for user registration")
public class SignupRequest {

    @NotBlank(message = "Name is required")
    @Schema(description = "Full name of the user", example = "John Doe")
    private String name;

    @NotBlank(message = "Email is required")
    @Email(message = "Invalid email format")
    @Schema(description = "Unique email address", example = "john.doe@example.com")
    private String email;

    @NotBlank(message = "Password is required")
    @Size(min = 6, message = "Password must be at least 6 characters")
    @Schema(description = "Password for the account (minimum 6 characters)", example = "password123")
    private String password;

    @NotNull(message = "Role is required")
    @Schema(description = "Role assigned to the user", example = "CITIZEN")
    private Role role;

    @Schema(description = "Department assigned to the user (only applicable for officers)", example = "WATER")
    private Department department;
}
