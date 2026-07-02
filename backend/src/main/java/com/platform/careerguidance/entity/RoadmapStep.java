package com.platform.careerguidance.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "roadmap_steps")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class RoadmapStep {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "roadmap_id", nullable = false)
    private Roadmap roadmap;

    @Column(name = "step_order", nullable = false)
    private Integer stepOrder;

    @Column(name = "topic_name", nullable = false, length = 100)
    private String topicName;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(name = "content_url", length = 255)
    private String contentUrl;

    // Phase: Foundation, Core Skills, Advanced, Project
    @Column(length = 50)
    private String phase;
}
