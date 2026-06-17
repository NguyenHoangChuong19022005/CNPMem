package com.platform.careerguidance.repository;

import com.platform.careerguidance.entity.Skill;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface SkillRepository extends JpaRepository<Skill, Long> {
    // Tìm skill theo tên
    Optional<Skill> findByName(String name);

    // Tìm tất cả skills theo category
    List<Skill> findByCategory(String category);
}
