package com.platform.careerguidance.repository;

import com.platform.careerguidance.entity.ProgressTracking;
import com.platform.careerguidance.entity.RoadmapStep;
import com.platform.careerguidance.entity.UserRoadmap;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface ProgressTrackingRepository extends JpaRepository<ProgressTracking, Long> {
    List<ProgressTracking> findByUserRoadmap(UserRoadmap userRoadmap);
    Optional<ProgressTracking> findByUserRoadmapAndStep(UserRoadmap userRoadmap, RoadmapStep step);
    long countByUserRoadmapAndIsCompleted(UserRoadmap userRoadmap, Boolean isCompleted);
}
