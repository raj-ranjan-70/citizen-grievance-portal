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
@Schema(description = "Request body to add a comment to a complaint")
public class CommentRequest {

    @NotBlank(message = "Comment content cannot be blank")
    @Schema(description = "Content of the comment", example = "I would like to add that this has been happening for 3 days.")
    private String content;
}
