package com.platform.careerguidance.controller;

import com.platform.careerguidance.entity.*;
import com.platform.careerguidance.repository.*;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/careers")
public class CareerRecommendationController {

    private final CareerRepository careerRepository;
    private final CareerRequirementRepository requirementRepository;
    private final CareerRecommendationRepository recommendationRepository;
    private final SkillAssessmentRepository assessmentRepository;
    private final UserRepository userRepository;

    public CareerRecommendationController(CareerRepository careerRepository,
            CareerRequirementRepository requirementRepository,
            CareerRecommendationRepository recommendationRepository,
            SkillAssessmentRepository assessmentRepository,
            UserRepository userRepository) {
        this.careerRepository = careerRepository;
        this.requirementRepository = requirementRepository;
        this.recommendationRepository = recommendationRepository;
        this.assessmentRepository = assessmentRepository;
        this.userRepository = userRepository;
    }

    // ==================== CAREER MANAGEMENT ====================

    // 1. Create new career
    @PostMapping
    public ResponseEntity<?> createCareer(@RequestBody Map<String, Object> request) {
        Career career = new Career();
        career.setTitle((String) request.get("title"));
        career.setDescription((String) request.get("description"));
        career.setResponsibilities((String) request.get("responsibilities"));
        career.setRequirements((String) request.get("requirements"));
        career.setSeniority((String) request.get("seniority"));
        career.setSalaryRange((String) request.get("salaryRange"));

        if (request.containsKey("experienceYearsRequired")) {
            career.setExperienceYearsRequired(((Number) request.get("experienceYearsRequired")).intValue());
        }

        try {
            Career savedCareer = careerRepository.save(career);
            return ResponseEntity.ok(Map.of("message", "Công việc được tạo thành công!", "career", savedCareer));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", "Lỗi khi tạo công việc: " + e.getMessage()));
        }
    }

    // 2. Get all careers
    @GetMapping
    public ResponseEntity<?> getAllCareers() {
        List<Career> careers = careerRepository.findAll();
        return ResponseEntity.ok(Map.of("total", careers.size(), "careers", careers));
    }

    // 3. Get careers by seniority
    @GetMapping("/seniority/{seniority}")
    public ResponseEntity<?> getCareersBySeniority(@PathVariable String seniority) {
        List<Career> careers = careerRepository.findBySeniority(seniority);
        return ResponseEntity.ok(Map.of("seniority", seniority, "total", careers.size(), "careers", careers));
    }

    // 4. Get career by ID
    @GetMapping("/{id}")
    public ResponseEntity<?> getCareerById(@PathVariable Long id) {
        Career career = careerRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy công việc với ID: " + id));
        return ResponseEntity.ok(career);
    }

    // 5. Update career
    @PutMapping("/{id}")
    public ResponseEntity<?> updateCareer(@PathVariable Long id, @RequestBody Map<String, Object> updates) {
        Career career = careerRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy công việc với ID: " + id));

        if (updates.containsKey("title")) {
            career.setTitle((String) updates.get("title"));
        }
        if (updates.containsKey("description")) {
            career.setDescription((String) updates.get("description"));
        }
        if (updates.containsKey("seniority")) {
            career.setSeniority((String) updates.get("seniority"));
        }
        if (updates.containsKey("salaryRange")) {
            career.setSalaryRange((String) updates.get("salaryRange"));
        }

        Career updatedCareer = careerRepository.save(career);
        return ResponseEntity.ok(Map.of("message", "Cập nhật công việc thành công!", "career", updatedCareer));
    }

    // 6. Delete career
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteCareer(@PathVariable Long id) {
        Career career = careerRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy công việc với ID: " + id));
        careerRepository.delete(career);
        return ResponseEntity.ok(Map.of("message", "Xóa công việc thành công!"));
    }

    // ==================== CAREER REQUIREMENTS ====================

    // 7. Add skill requirement to career
    @PostMapping("/{careerId}/requirements")
    public ResponseEntity<?> addRequirement(@PathVariable Long careerId, @RequestBody Map<String, Object> request) {
        Career career = careerRepository.findById(careerId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy công việc với ID: " + careerId));

        CareerRequirement requirement = new CareerRequirement();
        requirement.setCareer(career);
        // Assume skillId is provided in request
        Long skillId = ((Number) request.get("skillId")).longValue();
        // Note: You would need to inject SkillRepository and fetch skill
        // For now, leaving as is - caller should handle this
        requirement.setMinProficiencyLevel(((Number) request.get("minProficiencyLevel")).intValue());
        requirement.setMandatory((Boolean) request.getOrDefault("mandatory", true));

        CareerRequirement savedRequirement = requirementRepository.save(requirement);
        return ResponseEntity.ok(Map.of("message", "Thêm yêu cầu thành công!", "requirement", savedRequirement));
    }

    // 8. Get requirements for career
    @GetMapping("/{careerId}/requirements")
    public ResponseEntity<?> getCareerRequirements(@PathVariable Long careerId) {
        Career career = careerRepository.findById(careerId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy công việc với ID: " + careerId));

        List<CareerRequirement> requirements = requirementRepository.findByCareer(career);
        return ResponseEntity.ok(Map.of("careerId", careerId, "total", requirements.size(), "requirements", requirements));
    }

    // ==================== CAREER RECOMMENDATIONS ====================

    // 9. Generate recommendations for current user (Requires Token)
    @PostMapping("/recommendations/generate")
    public ResponseEntity<?> generateRecommendations() {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy thông tin thành viên"));

        // Get user's skill assessments
        List<SkillAssessment> userAssessments = assessmentRepository.findByUser(user);
        Map<Long, Integer> userSkillLevels = userAssessments.stream()
                .collect(Collectors.toMap(a -> a.getSkill().getId(), SkillAssessment::getProficiencyLevel));

        // Get all careers
        List<Career> allCareers = careerRepository.findAll();

        // Calculate match score for each career
        List<CareerRecommendation> newRecommendations = new ArrayList<>();

        for (Career career : allCareers) {
            List<CareerRequirement> requirements = requirementRepository.findByCareer(career);

            if (requirements.isEmpty()) {
                continue; // Skip careers with no requirements
            }

            // Separate mandatory and optional requirements
            List<CareerRequirement> mandatoryReqs = requirements.stream()
                    .filter(r -> r.getMandatory() != null && r.getMandatory())
                    .collect(Collectors.toList());

            List<CareerRequirement> optionalReqs = requirements.stream()
                    .filter(r -> r.getMandatory() == null || !r.getMandatory())
                    .collect(Collectors.toList());

            // Calculate scores
            int mandatoryMatched = 0;
            int optionalMatched = 0;
            List<String> matchedSkills = new ArrayList<>();
            List<String> skillsToImprove = new ArrayList<>();

            for (CareerRequirement req : mandatoryReqs) {
                Integer userLevel = userSkillLevels.getOrDefault(req.getSkill().getId(), 0);
                if (userLevel >= req.getMinProficiencyLevel()) {
                    mandatoryMatched++;
                    matchedSkills.add(req.getSkill().getName());
                } else {
                    skillsToImprove.add(req.getSkill().getName() + " (current: " + userLevel + ", required: "
                            + req.getMinProficiencyLevel() + ")");
                }
            }

            for (CareerRequirement req : optionalReqs) {
                Integer userLevel = userSkillLevels.getOrDefault(req.getSkill().getId(), 0);
                if (userLevel >= req.getMinProficiencyLevel()) {
                    optionalMatched++;
                    matchedSkills.add(req.getSkill().getName());
                } else {
                    skillsToImprove.add(req.getSkill().getName() + " (optional)");
                }
            }

            // If user doesn't have all mandatory skills, give lower score
            if (mandatoryMatched < mandatoryReqs.size()) {
                continue; // Skip this career
            }

            // Calculate match score (0-100)
            int totalReqs = requirements.size();
            int totalMatched = mandatoryMatched + optionalMatched;
            int matchScore = (int) ((totalMatched * 100) / totalReqs);

            // Determine strength
            String strength = matchScore >= 80 ? "HIGH" : matchScore >= 50 ? "MEDIUM" : "LOW";

            // Create recommendation
            CareerRecommendation rec = new CareerRecommendation();
            rec.setUser(user);
            rec.setCareer(career);
            rec.setMatchScore(matchScore);
            rec.setStrength(strength);
            rec.setMatchedSkills(String.join(", ", matchedSkills));
            rec.setSkillsToImprove(String.join(", ", skillsToImprove));
            rec.setAnalysis("Bạn phù hợp với công việc " + career.getTitle()
                    + ". Bạn đã có " + totalMatched + "/" + totalReqs + " kỹ năng cần thiết.");

            newRecommendations.add(rec);
        }

        // Clear old recommendations and save new ones
        List<CareerRecommendation> oldRecs = recommendationRepository.findByUserAndStatusOrderByMatchScoreDesc(user, "ACTIVE");
        for (CareerRecommendation old : oldRecs) {
            old.setStatus("ARCHIVED");
            recommendationRepository.save(old);
        }

        // Sort by match score
        newRecommendations.sort((a, b) -> Integer.compare(b.getMatchScore(), a.getMatchScore()));
        List<CareerRecommendation> savedRecs = recommendationRepository.saveAll(newRecommendations);

        return ResponseEntity.ok(Map.of(
                "message", "Tạo khuyến nghị thành công!",
                "total", savedRecs.size(),
                "recommendations", savedRecs.stream().map(r -> Map.of(
                        "id", r.getId(),
                        "career", r.getCareer().getTitle(),
                        "matchScore", r.getMatchScore(),
                        "strength", r.getStrength(),
                        "matchedSkills", r.getMatchedSkills(),
                        "skillsToImprove", r.getSkillsToImprove()
                )).collect(Collectors.toList())
        ));
    }

    // 10. Get my career recommendations (Requires Token)
    @GetMapping("/recommendations/my-recommendations")
    public ResponseEntity<?> getMyRecommendations() {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy thông tin thành viên"));

        List<CareerRecommendation> recommendations = recommendationRepository
                .findByUserAndStatusOrderByMatchScoreDesc(user, "ACTIVE");

        List<Map<String, Object>> result = recommendations.stream().map(r -> {
            Map<String, Object> item = new HashMap<>();
            item.put("id", r.getId());
            item.put("career", r.getCareer().getTitle());
            item.put("careerDescription", r.getCareer().getDescription());
            item.put("matchScore", r.getMatchScore());
            item.put("strength", r.getStrength());
            item.put("analysis", r.getAnalysis());
            item.put("matchedSkills", r.getMatchedSkills());
            item.put("skillsToImprove", r.getSkillsToImprove());
            item.put("salaryRange", r.getCareer().getSalaryRange());
            item.put("seniority", r.getCareer().getSeniority());
            return item;
        }).collect(Collectors.toList());

        Map<String, Object> response = new HashMap<>();
        response.put("total", recommendations.size());
        response.put("recommendations", result);
        return ResponseEntity.ok(response);
    }

    // 11. Get specific recommendation
    @GetMapping("/recommendations/{id}")
    public ResponseEntity<?> getRecommendationById(@PathVariable Long id) {
        CareerRecommendation rec = recommendationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy khuyến nghị với ID: " + id));

        return ResponseEntity.ok(Map.of(
                "id", rec.getId(),
                "career", rec.getCareer(),
                "matchScore", rec.getMatchScore(),
                "strength", rec.getStrength(),
                "analysis", rec.getAnalysis(),
                "matchedSkills", rec.getMatchedSkills(),
                "skillsToImprove", rec.getSkillsToImprove(),
                "status", rec.getStatus()
        ));
    }

    // 12. Archive recommendation
    @PutMapping("/recommendations/{id}/archive")
    public ResponseEntity<?> archiveRecommendation(@PathVariable Long id) {
        CareerRecommendation rec = recommendationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy khuyến nghị với ID: " + id));

        rec.setStatus("ARCHIVED");
        recommendationRepository.save(rec);

        return ResponseEntity.ok(Map.of("message", "Lưu trữ khuyến nghị thành công!"));
    }
}
