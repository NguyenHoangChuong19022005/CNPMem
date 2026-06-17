package com.platform.careerguidance.repository;

import com.platform.careerguidance.entity.CareerRecommendation;
import com.platform.careerguidance.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface CareerRecommendationRepository extends JpaRepository<CareerRecommendation, Long> {
    // Tìm tất cả recommendations cho một user
    List<CareerRecommendation> findByUserOrderByMatchScoreDesc(User user);

    // Tìm recommendations theo user và status
    List<CareerRecommendation> findByUserAndStatusOrderByMatchScoreDesc(User user, String status);
}
