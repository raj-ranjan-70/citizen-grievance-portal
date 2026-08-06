package com.raj.citizen_grievance_backend.dto;

import com.raj.citizen_grievance_backend.entity.Department;
import com.raj.citizen_grievance_backend.entity.Role;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.*;

import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Schema(description = "Response payload representing user information")
public class UserResponse {

    @Schema(description = "Unique identifier of the user", example = "d3b07384-d113-49c7-a5c6-cf0d8324e930")
    private UUID id;

    @Schema(description = "Full name of the user", example = "John Doe")
    private String name;

    @Schema(description = "Email address of the user", example = "john.doe@example.com")
    private String email;

    @Schema(description = "Role of the user", example = "CITIZEN")
    private Role role;

    @Schema(description = "Department assigned to the user", example = "WATER")
    private Department department;
}
