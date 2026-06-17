package com.platform.careerguidance.repository;

import com.platform.careerguidance.entity.Career;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface CareerRepository extends JpaRepository<Career, Long> {
    // Tìm career theo title
    Optional<Career> findByTitle(String title);

    // Tìm tất cả careers theo seniority level
    List<Career> findBySeniority(String seniority);
}
