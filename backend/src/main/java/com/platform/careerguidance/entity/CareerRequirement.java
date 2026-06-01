package com.platform.careerguidance.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "career_requirements")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class CareerRequirement {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "career_id", nullable = false)
    private Career career;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "skill_id", nullable = false)
    private Skill skill;

    // Minimum proficiency level required for this career
    // 1-5 scale
    private Integer minProficiencyLevel;

    // Is this skill mandatory or optional?
    private Boolean mandatory; // true = required, false = preferred
}
