package com.platform.careerguidance.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Entity
@Table(name = "courses")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Course {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    private String provider;
    private String level;
    private String duration;
    private String url;

    @Column(columnDefinition = "TEXT")
    private String skillTags;

    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }

    public List<String> getSkillList() {
        return Optional.ofNullable(skillTags)
                .map(tags -> Arrays.stream(tags.split(","))
                        .map(String::trim)
                        .filter(tag -> !tag.isEmpty())
                        .collect(Collectors.toList()))
                .orElse(Collections.emptyList());
    }
}
