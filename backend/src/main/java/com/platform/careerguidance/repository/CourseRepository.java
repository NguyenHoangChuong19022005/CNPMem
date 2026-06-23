package com.platform.careerguidance.repository;

import com.platform.careerguidance.entity.Course;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CourseRepository extends JpaRepository<Course, Long> {
}
