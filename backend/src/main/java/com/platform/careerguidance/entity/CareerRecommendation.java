package com.platform.careerguidance.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "career_recommendations")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class CareerRecommendation {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "career_id", nullable = false)
    private Career career;

    // Match score 0-100
    private Integer matchScore;

    // Analysis why this career is recommended
    @Column(columnDefinition = "TEXT")
    private String analysis;

    // Skills user already has at required level
    @Column(columnDefinition = "TEXT")
    private String matchedSkills;

    // Skills user needs to develop
    @Column(columnDefinition = "TEXT")
    private String skillsToImprove;

    // Recommendation strength: HIGH, MEDIUM, LOW
    private String strength;

    // Status: ACTIVE, ARCHIVED
    private String status;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
        if (status == null) {
            status = "ACTIVE";
        }
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
