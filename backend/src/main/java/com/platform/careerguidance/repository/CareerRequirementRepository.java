package com.platform.careerguidance.repository;

import com.platform.careerguidance.entity.CareerRequirement;
import com.platform.careerguidance.entity.Career;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface CareerRequirementRepository extends JpaRepository<CareerRequirement, Long> {
    // Tìm tất cả requirements cho một career
    List<CareerRequirement> findByCareer(Career career);

    // Tìm requirements theo career và mandatory status
    List<CareerRequirement> findByCareerAndMandatory(Career career, Boolean mandatory);
}
