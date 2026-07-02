package com.platform.careerguidance.config;

import com.platform.careerguidance.entity.Career;
import com.platform.careerguidance.entity.CareerRequirement;
import com.platform.careerguidance.entity.Course;
import com.platform.careerguidance.entity.Roadmap;
import com.platform.careerguidance.entity.RoadmapStep;
import com.platform.careerguidance.entity.Skill;
import com.platform.careerguidance.entity.User;
import com.platform.careerguidance.repository.CareerRepository;
import com.platform.careerguidance.repository.CareerRequirementRepository;
import com.platform.careerguidance.repository.CourseRepository;
import com.platform.careerguidance.repository.RoadmapRepository;
import com.platform.careerguidance.repository.RoadmapStepRepository;
import com.platform.careerguidance.repository.SkillRepository;
import com.platform.careerguidance.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;

@Component
public class DatabaseSeeder implements CommandLineRunner {

    private final SkillRepository skillRepository;
    private final CareerRepository careerRepository;
    private final CareerRequirementRepository careerRequirementRepository;
    private final CourseRepository courseRepository;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final RoadmapRepository roadmapRepository;
    private final RoadmapStepRepository roadmapStepRepository;

    public DatabaseSeeder(SkillRepository skillRepository,
                          CareerRepository careerRepository,
                          CareerRequirementRepository careerRequirementRepository,
                          CourseRepository courseRepository,
                          UserRepository userRepository,
                          PasswordEncoder passwordEncoder,
                          RoadmapRepository roadmapRepository,
                          RoadmapStepRepository roadmapStepRepository) {
        this.skillRepository = skillRepository;
        this.careerRepository = careerRepository;
        this.careerRequirementRepository = careerRequirementRepository;
        this.courseRepository = courseRepository;
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.roadmapRepository = roadmapRepository;
        this.roadmapStepRepository = roadmapStepRepository;
    }

    @Override
    public void run(String... args) throws Exception {
        System.out.println("Checking database status...");

        // 0. Seed Admin User if not exist
        if (userRepository.findByUsername("admin").isEmpty()) {
            System.out.println("Seeding default admin user...");
            User admin = new User();
            admin.setUsername("admin");
            admin.setPassword(passwordEncoder.encode("admin123"));
            admin.setEmail("admin@careerpathse.com");
            admin.setFullName("System Administrator");
            admin.setRole("ROLE_ADMIN");
            userRepository.save(admin);
            System.out.println("Default admin user seeded successfully! (Username: admin, Password: admin123)");
        }

        // 1. Seed Skills if empty
        if (skillRepository.count() == 0) {
            System.out.println("Seeding skills...");
            List<Skill> skills = new ArrayList<>();
            skills.add(createSkill("Java", "Ngôn ngữ lập trình hướng đối tượng mạnh mẽ cho các dự án enterprise.", "Backend", 3));
            skills.add(createSkill("Spring Boot", "Framework phổ biến của Java giúp xây dựng RESTful API và microservices.", "Backend", 2));
            skills.add(createSkill("JavaScript", "Ngôn ngữ lập trình cốt lõi của Web để tạo tương tác động.", "Frontend", 3));
            skills.add(createSkill("React", "Thư viện JavaScript phổ biến nhất để xây dựng giao diện người dùng SPA.", "Frontend", 2));
            skills.add(createSkill("SQL", "Ngôn ngữ truy vấn cơ sở dữ liệu quan hệ (MySQL, PostgreSQL, SQLite).", "Database", 2));
            skills.add(createSkill("Docker", "Công cụ container hóa để đóng gói và vận hành ứng dụng nhất quán.", "DevOps", 2));
            skills.add(createSkill("Git", "Hệ thống quản lý phiên bản mã nguồn phân tán phổ biến nhất thế giới.", "DevOps", 2));
            skillRepository.saveAll(skills);
            System.out.println("Skills seeded successfully!");
        }

        // 2. Seed Careers if empty
        if (careerRepository.count() == 0) {
            System.out.println("Seeding careers and requirements...");
            
            // Re-fetch or fetch existing skills for linking
            Skill java = skillRepository.findByName("Java").orElse(null);
            Skill springBoot = skillRepository.findByName("Spring Boot").orElse(null);
            Skill javascript = skillRepository.findByName("JavaScript").orElse(null);
            Skill react = skillRepository.findByName("React").orElse(null);
            Skill sql = skillRepository.findByName("SQL").orElse(null);
            Skill docker = skillRepository.findByName("Docker").orElse(null);
            Skill git = skillRepository.findByName("Git").orElse(null);

            // If skills were not created in step 1 and not found, let's create them temporarily or handle
            if (java == null) {
                System.out.println("Skills missing for career requirement mapping! Creating default mapping skills.");
                java = skillRepository.save(createSkill("Java", "Java", "Backend", 3));
                springBoot = skillRepository.save(createSkill("Spring Boot", "Spring Boot", "Backend", 2));
                javascript = skillRepository.save(createSkill("JavaScript", "JavaScript", "Frontend", 3));
                react = skillRepository.save(createSkill("React", "React", "Frontend", 2));
                sql = skillRepository.save(createSkill("SQL", "SQL", "Database", 2));
                docker = skillRepository.save(createSkill("Docker", "Docker", "DevOps", 2));
                git = skillRepository.save(createSkill("Git", "Git", "DevOps", 2));
            }

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

            backendDev = careerRepository.save(backendDev);
            frontendDev = careerRepository.save(frontendDev);
            fullstackDev = careerRepository.save(fullstackDev);

            // Seed requirements
            createRequirement(backendDev, java, 3, true);
            createRequirement(backendDev, springBoot, 2, true);
            createRequirement(backendDev, sql, 2, true);
            createRequirement(backendDev, git, 2, false);

            createRequirement(frontendDev, javascript, 3, true);
            createRequirement(frontendDev, react, 2, true);
            createRequirement(frontendDev, git, 2, false);

            createRequirement(fullstackDev, java, 3, true);
            createRequirement(fullstackDev, springBoot, 2, true);
            createRequirement(fullstackDev, javascript, 3, true);
            createRequirement(fullstackDev, react, 2, true);
            createRequirement(fullstackDev, sql, 2, true);
            createRequirement(fullstackDev, git, 2, false);
            createRequirement(fullstackDev, docker, 2, false);

            System.out.println("Careers and requirements seeded successfully!");
        }

        // 3. Seed Courses if empty
        if (courseRepository.count() == 0) {
            System.out.println("Seeding courses...");
            courseRepository.save(createCourse("Java Core & OOP Masterclass", "Khóa học đầy đủ từ cơ bản đến nâng cao về lập trình hướng đối tượng Java.", "Udemy", "Beginner", "30 hours", "https://www.udemy.com", "Java"));
            courseRepository.save(createCourse("Spring Boot APIs & Microservices", "Hướng dẫn chi tiết xây dựng API RESTful và cấu trúc Microservices thực tế.", "Coursera", "Intermediate", "20 hours", "https://www.coursera.org", "Spring Boot"));
            courseRepository.save(createCourse("Modern JavaScript from Beginning", "Làm chủ JavaScript hiện đại (ES6+), xử lý bất đồng bộ và DOM.", "YouTube", "Beginner", "12 hours", "https://www.youtube.com", "JavaScript"));
            courseRepository.save(createCourse("React - The Complete Guide (Hooks, Router, Redux)", "Học toàn diện về React, xây dựng dự án Single Page Application.", "Udemy", "Intermediate", "45 hours", "https://www.udemy.com", "React"));
            courseRepository.save(createCourse("SQL Bootcamp for Software Engineers", "Thiết kế cơ sở dữ liệu tối ưu, truy vấn dữ liệu phức tạp SQL.", "Udemy", "Beginner", "15 hours", "https://www.udemy.com", "SQL"));
            courseRepository.save(createCourse("Docker & Kubernetes trong 3 giờ", "Học nhanh công nghệ Container để triển khai ứng dụng.", "YouTube", "Beginner", "3 hours", "https://www.youtube.com", "Docker"));
            System.out.println("Courses seeded successfully!");
        }

        // 4. Seed Roadmaps if empty
        if (roadmapRepository.count() == 0) {
            System.out.println("Seeding roadmaps...");
            User admin = userRepository.findByUsername("admin").orElse(null);

            careerRepository.findAll().forEach(career -> {
                Roadmap roadmap = new Roadmap();
                roadmap.setCareer(career);
                roadmap.setCreatedBy(admin);

                List<RoadmapStep> steps = new ArrayList<>();

                if (career.getTitle().contains("Backend")) {
                    roadmap.setTitle("Lộ trình Backend Developer");
                    roadmap.setDescription("Hành trình từ zero đến Backend Developer với Java & Spring Boot.");
                    roadmap = roadmapRepository.save(roadmap);
                    steps.add(createStep(roadmap, 1, "Java Core & OOP", "Nắm vững lập trình hướng đối tượng với Java: class, interface, inheritance, polymorphism.", "https://www.w3schools.com/java/", "Foundation"));
                    steps.add(createStep(roadmap, 2, "Cấu trúc dữ liệu & Thuật toán", "Array, LinkedList, Stack, Queue, HashMap, Sorting & Searching.", "https://visualgo.net/", "Foundation"));
                    steps.add(createStep(roadmap, 3, "Spring Boot & REST API", "Xây dựng API RESTful với Spring Boot, Controller, Service, Repository.", "https://spring.io/quickstart", "Core Skills"));
                    steps.add(createStep(roadmap, 4, "SQL & MySQL", "Thiết kế CSDL, viết query JOIN, Index, Transaction.", "https://www.w3schools.com/sql/", "Core Skills"));
                    steps.add(createStep(roadmap, 5, "Spring Security & JWT", "Bảo mật API với JWT Authentication và Spring Security.", "https://spring.io/guides/topicals/spring-security-architecture", "Advanced"));
                    steps.add(createStep(roadmap, 6, "Docker & Deployment", "Đóng gói ứng dụng với Docker, deploy lên server.", "https://docs.docker.com/get-started/", "Advanced"));
                    steps.add(createStep(roadmap, 7, "Dự án thực tế: REST API App", "Xây dựng ứng dụng quản lý hoàn chỉnh với Spring Boot + MySQL.", "https://github.com/", "Project"));

                } else if (career.getTitle().contains("Frontend")) {
                    roadmap.setTitle("Lộ trình Frontend Developer");
                    roadmap.setDescription("Trở thành Frontend Developer chuyên nghiệp với React và JavaScript hiện đại.");
                    roadmap = roadmapRepository.save(roadmap);
                    steps.add(createStep(roadmap, 1, "HTML & CSS cơ bản", "Cấu trúc trang web với HTML5, tạo kiểu dáng với CSS3, Flexbox, Grid.", "https://www.w3schools.com/html/", "Foundation"));
                    steps.add(createStep(roadmap, 2, "JavaScript ES6+", "Biến, hàm, vòng lặp, Promise, async/await, DOM manipulation.", "https://javascript.info/", "Foundation"));
                    steps.add(createStep(roadmap, 3, "React cơ bản", "Component, Props, State, Hooks (useState, useEffect), JSX.", "https://react.dev/learn", "Core Skills"));
                    steps.add(createStep(roadmap, 4, "React Router & State Management", "Điều hướng trang với React Router, quản lý state với Context/Redux.", "https://reactrouter.com/", "Core Skills"));
                    steps.add(createStep(roadmap, 5, "Giao tiếp API (Axios/Fetch)", "Kết nối frontend với backend API, xử lý response, error handling.", "https://axios-http.com/docs/intro", "Advanced"));
                    steps.add(createStep(roadmap, 6, "CSS Framework & UI Design", "TailwindCSS, responsive design, animation, component library.", "https://tailwindcss.com/docs", "Advanced"));
                    steps.add(createStep(roadmap, 7, "Dự án thực tế: SPA App", "Xây dựng ứng dụng Single Page Application hoàn chỉnh với React.", "https://github.com/", "Project"));

                } else if (career.getTitle().contains("Full-Stack") || career.getTitle().contains("Fullstack")) {
                    roadmap.setTitle("Lộ trình Full-Stack Developer");
                    roadmap.setDescription("Làm chủ cả Frontend lẫn Backend để trở thành Full-Stack Developer.");
                    roadmap = roadmapRepository.save(roadmap);
                    steps.add(createStep(roadmap, 1, "HTML, CSS & JavaScript", "Nền tảng web: HTML5, CSS3, JavaScript ES6+.", "https://www.w3schools.com/", "Foundation"));
                    steps.add(createStep(roadmap, 2, "Java Core & OOP", "Lập trình hướng đối tượng với Java, nền tảng cho Backend.", "https://www.w3schools.com/java/", "Foundation"));
                    steps.add(createStep(roadmap, 3, "React Frontend", "Xây dựng giao diện với React: component, state, hooks.", "https://react.dev/learn", "Core Skills"));
                    steps.add(createStep(roadmap, 4, "Spring Boot Backend", "Xây dựng REST API với Spring Boot, kết nối MySQL.", "https://spring.io/quickstart", "Core Skills"));
                    steps.add(createStep(roadmap, 5, "Tích hợp Frontend - Backend", "Kết nối React với Spring Boot API, JWT auth, CORS.", "https://axios-http.com/", "Advanced"));
                    steps.add(createStep(roadmap, 6, "Docker & CI/CD", "Container hóa ứng dụng, tự động hóa deploy.", "https://docs.docker.com/", "Advanced"));
                    steps.add(createStep(roadmap, 7, "Dự án thực tế: Full-Stack App", "Xây dựng ứng dụng web hoàn chỉnh từ Frontend đến Backend và deploy.", "https://github.com/", "Project"));
                } else {
                    roadmap.setTitle("Lộ trình " + career.getTitle());
                    roadmap.setDescription("Lộ trình học tập dành cho " + career.getTitle() + ".");
                    roadmap = roadmapRepository.save(roadmap);
                    steps.add(createStep(roadmap, 1, "Kiến thức nền tảng", "Học các kiến thức cơ bản cần thiết cho vị trí này.", "", "Foundation"));
                    steps.add(createStep(roadmap, 2, "Kỹ năng cốt lõi", "Thực hành và phát triển kỹ năng chuyên môn.", "", "Core Skills"));
                    steps.add(createStep(roadmap, 3, "Dự án thực tế", "Áp dụng kiến thức vào dự án thực tế để tích lũy kinh nghiệm.", "", "Project"));
                }

                roadmapStepRepository.saveAll(steps);
            });
            System.out.println("Roadmaps seeded successfully!");
        }

        System.out.println("Database check complete. Skills: " + skillRepository.count() + ", Careers: " + careerRepository.count() + ", Courses: " + courseRepository.count() + ", Roadmaps: " + roadmapRepository.count());
    }

    private RoadmapStep createStep(Roadmap roadmap, int order, String topic, String desc, String url, String phase) {
        RoadmapStep step = new RoadmapStep();
        step.setRoadmap(roadmap);
        step.setStepOrder(order);
        step.setTopicName(topic);
        step.setDescription(desc);
        step.setContentUrl(url);
        step.setPhase(phase);
        return step;
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
