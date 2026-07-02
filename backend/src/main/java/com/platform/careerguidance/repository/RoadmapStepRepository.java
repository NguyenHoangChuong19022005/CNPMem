package com.platform.careerguidance.repository;

import com.platform.careerguidance.entity.Roadmap;
import com.platform.careerguidance.entity.RoadmapStep;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface RoadmapStepRepository extends JpaRepository<RoadmapStep, Long> {
    List<RoadmapStep> findByRoadmapOrderByStepOrderAsc(Roadmap roadmap);
}
