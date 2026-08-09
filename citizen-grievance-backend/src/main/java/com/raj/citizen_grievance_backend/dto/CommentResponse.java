package com.raj.citizen_grievance_backend.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Schema(description = "Response payload representing a comment")
public class CommentResponse {

    @Schema(description = "Unique identifier of the comment", example = "d3b07384-d113-49c7-a5c6-cf0d8324e930")
    private UUID id;

    @Schema(description = "Text content of the comment", example = "Looking into this. Assigned technician has been notified.")
    private String content;

    @Schema(description = "Name of the comment author", example = "Officer Kumar")
    private String authorName;

    @Schema(description = "Role of the author", example = "OFFICER")
    private String authorRole;

    @Schema(description = "UUID of the author of the comment", example = "a2f96115-c224-42b7-84fe-19a3b6118f92")
    private UUID authorId;

    @Schema(description = "Time when the comment was posted", example = "2026-08-07T11:47:00")
    private LocalDateTime createdAt;
}
