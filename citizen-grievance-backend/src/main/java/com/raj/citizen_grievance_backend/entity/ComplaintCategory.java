package com.raj.citizen_grievance_backend.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "complaint_categories")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ComplaintCategory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String name;

    private String description;
}
