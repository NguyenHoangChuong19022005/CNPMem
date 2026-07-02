package com.platform.careerguidance.repository;

import com.platform.careerguidance.entity.Career;
import com.platform.careerguidance.entity.Roadmap;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface RoadmapRepository extends JpaRepository<Roadmap, Long> {
    List<Roadmap> findByCareer(Career career);
    Optional<Roadmap> findByCareer_Id(Long careerId);
}
