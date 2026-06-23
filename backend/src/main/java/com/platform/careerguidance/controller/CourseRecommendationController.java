package com.platform.careerguidance.controller;

import com.platform.careerguidance.entity.Course;
import com.platform.careerguidance.entity.SkillAssessment;
import com.platform.careerguidance.entity.User;
import com.platform.careerguidance.repository.CourseRepository;
import com.platform.careerguidance.repository.SkillAssessmentRepository;
import com.platform.careerguidance.repository.UserRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/courses")
public class CourseRecommendationController {

    private final CourseRepository courseRepository;
    private final SkillAssessmentRepository assessmentRepository;
    private final UserRepository userRepository;

    public CourseRecommendationController(CourseRepository courseRepository,
                                          SkillAssessmentRepository assessmentRepository,
                                          UserRepository userRepository) {
        this.courseRepository = courseRepository;
        this.assessmentRepository = assessmentRepository;
        this.userRepository = userRepository;
    }

    @GetMapping
    public ResponseEntity<?> getAllCourses() {
        seedDefaultCourses();
        List<Course> courses = courseRepository.findAll();
        return ResponseEntity.ok(Map.of("total", courses.size(), "courses", courses));
    }

    @GetMapping("/recommendations")
    public ResponseEntity<?> getCourseRecommendations() {
        User user = getCurrentUser();
        seedDefaultCourses();

        List<SkillAssessment> assessments = assessmentRepository.findByUser(user);
        Map<String, Integer> proficiencyLevels = assessments.stream()
                .collect(Collectors.toMap(
                        a -> a.getSkill().getName().toLowerCase(),
                        SkillAssessment::getProficiencyLevel,
                        Integer::max
                ));

        List<Map<String, Object>> recommendations = courseRepository.findAll().stream()
                .map(course -> buildCourseRecommendation(course, proficiencyLevels))
                .sorted(Comparator.comparingInt((Map<String, Object> item) -> (Integer) item.get("matchScore")).reversed())
                .collect(Collectors.toList());

        return ResponseEntity.ok(Map.of(
                "message", "Course recommendations generated successfully.",
                "total", recommendations.size(),
                "courses", recommendations
        ));
    }

    private User getCurrentUser() {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy thông tin thành viên"));
    }

    private Map<String, Object> buildCourseRecommendation(Course course, Map<String, Integer> proficiencyLevels) {
        List<String> skills = course.getSkillList();
        List<String> matchedSkills = new ArrayList<>();
        List<String> weakSkills = new ArrayList<>();

        int matchScore = 0;
        for (String skill : skills) {
            Integer level = proficiencyLevels.get(skill.toLowerCase());
            if (level != null && level > 0) {
                matchedSkills.add(skill);
                matchScore += Math.min(10, level * 2);
                if (level <= 3) {
                    weakSkills.add(skill);
                }
            }
        }

        String reason;
        if (!weakSkills.isEmpty()) {
            reason = "Strengthen your " + String.join(", ", weakSkills) + " skills.";
        } else if (!matchedSkills.isEmpty()) {
            reason = "You have good foundations for " + String.join(", ", matchedSkills) + ".";
        } else if (!skills.isEmpty()) {
            reason = "This course will help you build skills in " + String.join(", ", skills) + ".";
        } else {
            reason = "This course is a great option to expand your software skill set.";
        }

        return Map.of(
                "id", course.getId(),
                "title", course.getTitle(),
                "description", course.getDescription(),
                "provider", course.getProvider(),
                "level", course.getLevel(),
                "duration", course.getDuration(),
                "url", course.getUrl(),
                "skills", skills,
                "matchScore", matchScore,
                "reason", reason
        );
    }

    private void seedDefaultCourses() {
        if (courseRepository.count() > 0) {
            return;
        }

        List<Course> defaultCourses = List.of(
                new Course(null,
                        "Advanced Java & Spring Boot Development",
                        "Deepen your backend knowledge with Java, Spring Boot, REST API design, and microservice architecture.",
                        "CareerPath Academy",
                        "Advanced",
                        "8 weeks",
                        "https://spring.io/quickstart",
                        "Java, Spring Boot, Microservices",
                        null),
                new Course(null,
                        "React and Frontend Architecture",
                        "Master modern frontend development with React, component design, and performance optimization.",
                        "CareerPath Academy",
                        "Intermediate",
                        "6 weeks",
                        "https://react.dev",
                        "React, JavaScript, Frontend",
                        null),
                new Course(null,
                        "Database Design & SQL Performance",
                        "Improve database modeling, SQL queries, indexing, and data persistence for production apps.",
                        "CareerPath Academy",
                        "Intermediate",
                        "5 weeks",
                        "https://www.w3schools.com/sql/",
                        "SQL, Database, Data Modeling",
                        null),
                new Course(null,
                        "DevOps Fundamentals: Docker & Kubernetes",
                        "Learn containerization, CI/CD pipelines, and deployment practices for modern software teams.",
                        "CareerPath Academy",
                        "Intermediate",
                        "7 weeks",
                        "https://docs.docker.com/get-started/",
                        "Docker, Kubernetes, CI/CD",
                        null),
                new Course(null,
                        "Algorithms for Software Engineers",
                        "Strengthen your logic and problem solving with algorithms, data structures, and system design patterns.",
                        "CareerPath Academy",
                        "Beginner",
                        "4 weeks",
                        "https://www.geeksforgeeks.org/fundamentals-of-algorithms/",
                        "Algorithms, Data Structures, Problem Solving",
                        null),
                new Course(null,
                        "Full-Stack Project Roadmap",
                        "Build a complete web application from design to deployment with frontend, backend, and database integration.",
                        "CareerPath Academy",
                        "Intermediate",
                        "9 weeks",
                        "https://roadmap.sh/",
                        "Full-Stack, React, SQL",
                        null)
        );

        courseRepository.saveAll(defaultCourses);
    }
}
