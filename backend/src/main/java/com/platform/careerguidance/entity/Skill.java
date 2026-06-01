package com.platform.careerguidance.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "skills")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Skill {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String name; // e.g., "Java", "React", "Python"

    @Column(columnDefinition = "TEXT")
    private String description;

    private String category; // e.g., "Backend", "Frontend", "DevOps", "Database"

    private Integer proficiencyLevel; // 1-5, where 1=beginner, 5=expert

    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
}
