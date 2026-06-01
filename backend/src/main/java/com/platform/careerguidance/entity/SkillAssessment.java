package com.platform.careerguidance.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "skill_assessments")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class SkillAssessment {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "skill_id", nullable = false)
    private Skill skill;

    // Score from 0-100
    private Integer score;

    // Proficiency level assessed: 1-5
    private Integer proficiencyLevel;

    // Assessment feedback/notes
    @Column(columnDefinition = "TEXT")
    private String feedback;

    // Status: PENDING, COMPLETED, IN_PROGRESS
    private String status; // default: PENDING

    private LocalDateTime assessedAt;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
        if (status == null) {
            status = "PENDING";
        }
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
