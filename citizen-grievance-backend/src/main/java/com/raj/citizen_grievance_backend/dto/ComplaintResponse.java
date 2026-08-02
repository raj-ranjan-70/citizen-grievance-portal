package com.raj.citizen_grievance_backend.dto;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class ComplaintResponse {
    private Long id;
    private String title;
    private String description;
    private String status;
    private String categoryName;
    private Long categoryId;
    private Long userId;
    private String userName;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
