package com.platform.careerguidance.repository;

import com.platform.careerguidance.entity.SkillAssessment;
import com.platform.careerguidance.entity.User;
import com.platform.careerguidance.entity.Skill;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface SkillAssessmentRepository extends JpaRepository<SkillAssessment, Long> {
    // Tìm tất cả assessment của một user
    List<SkillAssessment> findByUser(User user);

    // Tìm assessment của user cho một skill cụ thể
    Optional<SkillAssessment> findByUserAndSkill(User user, Skill skill);

    // Tìm tất cả assessment của user theo status
    List<SkillAssessment> findByUserAndStatus(User user, String status);

    // Tìm tất cả assessment cho một skill
    List<SkillAssessment> findBySkill(Skill skill);
}
