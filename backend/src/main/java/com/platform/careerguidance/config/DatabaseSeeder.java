package com.platform.careerguidance.config;

import com.platform.careerguidance.entity.Career;
import com.platform.careerguidance.entity.CareerRequirement;
import com.platform.careerguidance.entity.Course;
import com.platform.careerguidance.entity.Skill;
import com.platform.careerguidance.repository.CareerRepository;
import com.platform.careerguidance.repository.CareerRequirementRepository;
import com.platform.careerguidance.repository.CourseRepository;
import com.platform.careerguidance.repository.SkillRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;

@Component
public class DatabaseSeeder implements CommandLineRunner {

    private final SkillRepository skillRepository;
    private final CareerRepository careerRepository;
    private final CareerRequirementRepository careerRequirementRepository;
    private final CourseRepository courseRepository;

    public DatabaseSeeder(SkillRepository skillRepository,
                          CareerRepository careerRepository,
                          CareerRequirementRepository careerRequirementRepository,
                          CourseRepository courseRepository) {
        this.skillRepository = skillRepository;
        this.careerRepository = careerRepository;
        this.careerRequirementRepository = careerRequirementRepository;
        this.courseRepository = courseRepository;
    }

    @Override
    public void run(String... args) throws Exception {
        if (skillRepository.count() == 0) {
            System.out.println("Seeding database with default skills, careers, requirements, and courses...");

            // 1. Create Skills
            List<Skill> skills = new ArrayList<>();
            skills.add(createSkill("Java", "Ngôn ngữ lập trình hướng đối tượng mạnh mẽ cho các dự án enterprise.", "Backend", 3));
            skills.add(createSkill("Spring Boot", "Framework phổ biến của Java giúp xây dựng RESTful API và microservices.", "Backend", 2));
            skills.add(createSkill("JavaScript", "Ngôn ngữ lập trình cốt lõi của Web để tạo tương tác động.", "Frontend", 3));
            skills.add(createSkill("React", "Thư viện JavaScript phổ biến nhất để xây dựng giao diện người dùng SPA.", "Frontend", 2));
            skills.add(createSkill("SQL", "Ngôn ngữ truy vấn cơ sở dữ liệu quan hệ (MySQL, PostgreSQL, SQLite).", "Database", 2));
            skills.add(createSkill("Docker", "Công cụ container hóa để đóng gói và vận hành ứng dụng nhất quán.", "DevOps", 2));
            skills.add(createSkill("Git", "Hệ thống quản lý phiên bản mã nguồn phân tán phổ biến nhất thế giới.", "DevOps", 2));
            
            skillRepository.saveAll(skills);

            // Fetch saved skills with IDs
            Skill java = skillRepository.findByName("Java").orElse(null);
            Skill springBoot = skillRepository.findByName("Spring Boot").orElse(null);
            Skill javascript = skillRepository.findByName("JavaScript").orElse(null);
            Skill react = skillRepository.findByName("React").orElse(null);
            Skill sql = skillRepository.findByName("SQL").orElse(null);
            Skill docker = skillRepository.findByName("Docker").orElse(null);
            Skill git = skillRepository.findByName("Git").orElse(null);

            // 2. Create Careers
            Career backendDev = createCareer("Backend Developer", 
                    "Phát triển logic phía máy chủ, cơ sở dữ liệu và API cho ứng dụng.",
                    "Thiết kế API, xây dựng schema cơ sở dữ liệu, tối ưu hóa hiệu năng máy chủ, viết unit test.",
                    "Hiểu biết tốt về cấu trúc dữ liệu, thuật toán, lập trình hướng đối tượng (Java), cơ sở dữ liệu và hệ thống Git.",
                    "ENTRY_LEVEL", "15M - 25M VND", 0);
            
            Career frontendDev = createCareer("Frontend Developer",
                    "Xây dựng giao diện người dùng tương tác trực tiếp của ứng dụng web.",
                    "Xây dựng UI components từ bản thiết kế Figma, kết nối API backend, quản lý state frontend.",
                    "Thành thạo HTML/CSS, Modern JavaScript, một UI framework (React) và quản lý phiên bản với Git.",
                    "ENTRY_LEVEL", "15M - 25M VND", 0);

            Career fullstackDev = createCareer("Full-Stack Developer",
                    "Làm việc trên cả Frontend lẫn Backend của ứng dụng.",
                    "Xây dựng tính năng hoàn chỉnh từ UI frontend đến logic backend và cơ sở dữ liệu.",
                    "Có kinh nghiệm làm việc với cả ngôn ngữ frontend (React) và backend (Java/Spring Boot), có kiến thức về CI/CD cơ bản.",
                    "MID_LEVEL", "25M - 45M VND", 2);

            careerRepository.save(backendDev);
            careerRepository.save(frontendDev);
            careerRepository.save(fullstackDev);

            // 3. Create Career Requirements
            if (backendDev != null && java != null && springBoot != null && sql != null && git != null) {
                createRequirement(backendDev, java, 3, true);
                createRequirement(backendDev, springBoot, 2, true);
                createRequirement(backendDev, sql, 2, true);
                createRequirement(backendDev, git, 2, false);
            }

            if (frontendDev != null && javascript != null && react != null && git != null) {
                createRequirement(frontendDev, javascript, 3, true);
                createRequirement(frontendDev, react, 2, true);
                createRequirement(frontendDev, git, 2, false);
            }

            if (fullstackDev != null && java != null && springBoot != null && javascript != null && react != null && sql != null && git != null && docker != null) {
                createRequirement(fullstackDev, java, 3, true);
                createRequirement(fullstackDev, springBoot, 2, true);
                createRequirement(fullstackDev, javascript, 3, true);
                createRequirement(fullstackDev, react, 2, true);
                createRequirement(fullstackDev, sql, 2, true);
                createRequirement(fullstackDev, git, 2, false);
                createRequirement(fullstackDev, docker, 2, false);
            }

            // 4. Create Courses
            courseRepository.save(createCourse("Java Core & OOP Masterclass", "Khóa học đầy đủ từ cơ bản đến nâng cao về lập trình hướng đối tượng Java.", "Udemy", "Beginner", "30 hours", "https://www.udemy.com", "Java"));
            courseRepository.save(createCourse("Spring Boot APIs & Microservices", "Hướng dẫn chi tiết xây dựng API RESTful và cấu trúc Microservices thực tế.", "Coursera", "Intermediate", "20 hours", "https://www.coursera.org", "Spring Boot"));
            courseRepository.save(createCourse("Modern JavaScript from Beginning", "Làm chủ JavaScript hiện đại (ES6+), xử lý bất đồng bộ và DOM.", "YouTube", "Beginner", "12 hours", "https://www.youtube.com", "JavaScript"));
            courseRepository.save(createCourse("React - The Complete Guide (Hooks, Router, Redux)", "Học toàn diện về React, xây dựng dự án Single Page Application.", "Udemy", "Intermediate", "45 hours", "https://www.udemy.com", "React"));
            courseRepository.save(createCourse("SQL Bootcamp for Software Engineers", "Thiết kế cơ sở dữ liệu tối ưu, truy vấn dữ liệu phức tạp SQL.", "Udemy", "Beginner", "15 hours", "https://www.udemy.com", "SQL"));
            courseRepository.save(createCourse("Docker & Kubernetes trong 3 giờ", "Học nhanh công nghệ Container để triển khai ứng dụng.", "YouTube", "Beginner", "3 hours", "https://www.youtube.com", "Docker"));

            System.out.println("Database seeding completed successfully!");
        } else {
            System.out.println("Database already has skills data. Skipping seed.");
        }
    }

    private Skill createSkill(String name, String description, String category, Integer proficiency) {
        Skill skill = new Skill();
        skill.setName(name);
        skill.setDescription(description);
        skill.setCategory(category);
        skill.setProficiencyLevel(proficiency);
        return skill;
    }

    private Career createCareer(String title, String description, String responsibilities, String requirements, String seniority, String salaryRange, Integer expYears) {
        Career career = new Career();
        career.setTitle(title);
        career.setDescription(description);
        career.setResponsibilities(responsibilities);
        career.setRequirements(requirements);
        career.setSeniority(seniority);
        career.setSalaryRange(salaryRange);
        career.setExperienceYearsRequired(expYears);
        return career;
    }

    private void createRequirement(Career career, Skill skill, Integer minLevel, Boolean mandatory) {
        CareerRequirement req = new CareerRequirement();
        req.setCareer(career);
        req.setSkill(skill);
        req.setMinProficiencyLevel(minLevel);
        req.setMandatory(mandatory);
        careerRequirementRepository.save(req);
    }

    private Course createCourse(String title, String description, String provider, String level, String duration, String url, String skillTags) {
        Course course = new Course();
        course.setTitle(title);
        course.setDescription(description);
        course.setProvider(provider);
        course.setLevel(level);
        course.setDuration(duration);
        course.setUrl(url);
        course.setSkillTags(skillTags);
        return course;
    }
}
