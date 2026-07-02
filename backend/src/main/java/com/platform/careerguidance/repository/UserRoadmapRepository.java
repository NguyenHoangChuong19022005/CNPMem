package com.platform.careerguidance.repository;

import com.platform.careerguidance.entity.Roadmap;
import com.platform.careerguidance.entity.User;
import com.platform.careerguidance.entity.UserRoadmap;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface UserRoadmapRepository extends JpaRepository<UserRoadmap, Long> {
    List<UserRoadmap> findByUser(User user);
    Optional<UserRoadmap> findByUserAndRoadmap(User user, Roadmap roadmap);
    boolean existsByUserAndRoadmap(User user, Roadmap roadmap);
}
