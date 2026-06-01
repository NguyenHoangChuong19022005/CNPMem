package com.platform.careerguidance.controller;

import com.platform.careerguidance.entity.Skill;
import com.platform.careerguidance.entity.SkillAssessment;
import com.platform.careerguidance.entity.User;
import com.platform.careerguidance.repository.SkillRepository;
import com.platform.careerguidance.repository.SkillAssessmentRepository;
import com.platform.careerguidance.repository.UserRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/skills")
public class SkillAssessmentController {

    private final SkillRepository skillRepository;
    private final SkillAssessmentRepository assessmentRepository;
    private final UserRepository userRepository;

    public SkillAssessmentController(SkillRepository skillRepository,
            SkillAssessmentRepository assessmentRepository,
            UserRepository userRepository) {
        this.skillRepository = skillRepository;
        this.assessmentRepository = assessmentRepository;
        this.userRepository = userRepository;
    }

    // ==================== SKILL MANAGEMENT ====================

    // 1. Create new skill (Admin)
    @PostMapping
    public ResponseEntity<?> createSkill(@RequestBody Map<String, Object> request) {
        Skill skill = new Skill();
        skill.setName((String) request.get("name"));
        skill.setDescription((String) request.get("description"));
        skill.setCategory((String) request.get("category"));

        if (request.containsKey("proficiencyLevel")) {
            skill.setProficiencyLevel((Integer) request.get("proficiencyLevel"));
        }

        try {
            Skill savedSkill = skillRepository.save(skill);
            return ResponseEntity.ok(Map.of("message", "Kỹ năng được tạo thành công!", "skill", savedSkill));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", "Lỗi khi tạo kỹ năng: " + e.getMessage()));
        }
    }

    // 2. Get all skills
    @GetMapping
    public ResponseEntity<?> getAllSkills() {
        List<Skill> skills = skillRepository.findAll();
        return ResponseEntity.ok(Map.of("total", skills.size(), "skills", skills));
    }

    // 3. Get skills by category
    @GetMapping("/category/{category}")
    public ResponseEntity<?> getSkillsByCategory(@PathVariable String category) {
        List<Skill> skills = skillRepository.findByCategory(category);
        return ResponseEntity.ok(Map.of("category", category, "total", skills.size(), "skills", skills));
    }

    // 4. Get skill by ID
    @GetMapping("/{id}")
    public ResponseEntity<?> getSkillById(@PathVariable Long id) {
        Skill skill = skillRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy kỹ năng với ID: " + id));
        return ResponseEntity.ok(skill);
    }

    // 5. Update skill
    @PutMapping("/{id}")
    public ResponseEntity<?> updateSkill(@PathVariable Long id, @RequestBody Map<String, Object> updates) {
        Skill skill = skillRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy kỹ năng với ID: " + id));

        if (updates.containsKey("name")) {
            skill.setName((String) updates.get("name"));
        }
        if (updates.containsKey("description")) {
            skill.setDescription((String) updates.get("description"));
        }
        if (updates.containsKey("category")) {
            skill.setCategory((String) updates.get("category"));
        }
        if (updates.containsKey("proficiencyLevel")) {
            skill.setProficiencyLevel((Integer) updates.get("proficiencyLevel"));
        }

        Skill updatedSkill = skillRepository.save(skill);
        return ResponseEntity.ok(Map.of("message", "Cập nhật kỹ năng thành công!", "skill", updatedSkill));
    }

    // 6. Delete skill
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteSkill(@PathVariable Long id) {
        Skill skill = skillRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy kỹ năng với ID: " + id));
        skillRepository.delete(skill);
        return ResponseEntity.ok(Map.of("message", "Xóa kỹ năng thành công!"));
    }

    // ==================== SKILL ASSESSMENT ====================

    // 7. Get all assessments of current user (Requires Token)
    @GetMapping("/assessments/my-assessments")
    public ResponseEntity<?> getMyAssessments() {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy thông tin thành viên"));

        List<SkillAssessment> assessments = assessmentRepository.findByUser(user);
        List<Map<String, Object>> result = assessments.stream().map(a -> Map.of(
                "id", a.getId(),
                "skill", a.getSkill().getName(),
                "score", a.getScore(),
                "proficiencyLevel", a.getProficiencyLevel(),
                "status", a.getStatus(),
                "feedback", a.getFeedback() != null ? a.getFeedback() : "",
                "assessedAt", a.getAssessedAt() != null ? a.getAssessedAt() : "",
                "updatedAt", a.getUpdatedAt()
        )).collect(Collectors.toList());

        return ResponseEntity.ok(Map.of("total", assessments.size(), "assessments", result));
    }

    // 8. Submit new assessment (Requires Token)
    @PostMapping("/assessments")
    public ResponseEntity<?> submitAssessment(@RequestBody Map<String, Object> request) {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy thông tin thành viên"));

        Long skillId = ((Number) request.get("skillId")).longValue();
        Skill skill = skillRepository.findById(skillId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy kỹ năng với ID: " + skillId));

        // Check if assessment already exists
        var existingAssessment = assessmentRepository.findByUserAndSkill(user, skill);
        if (existingAssessment.isPresent()) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", "Bạn đã đánh giá kỹ năng này rồi. Vui lòng cập nhật thay vì tạo mới."));
        }

        SkillAssessment assessment = new SkillAssessment();
        assessment.setUser(user);
        assessment.setSkill(skill);
        assessment.setScore(((Number) request.get("score")).intValue());
        assessment.setProficiencyLevel(((Number) request.get("proficiencyLevel")).intValue());
        assessment.setFeedback((String) request.get("feedback"));
        assessment.setStatus("COMPLETED");
        assessment.setAssessedAt(LocalDateTime.now());

        SkillAssessment savedAssessment = assessmentRepository.save(assessment);
        return ResponseEntity.ok(Map.of("message", "Gửi đánh giá thành công!", "assessment", savedAssessment));
    }

    // 9. Update assessment (Requires Token)
    @PutMapping("/assessments/{id}")
    public ResponseEntity<?> updateAssessment(@PathVariable Long id, @RequestBody Map<String, Object> updates) {
        SkillAssessment assessment = assessmentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy đánh giá với ID: " + id));

        // Verify user owns this assessment
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        if (!assessment.getUser().getUsername().equals(username)) {
            return ResponseEntity.status(403)
                    .body(Map.of("error", "Bạn không có quyền cập nhật đánh giá này!"));
        }

        if (updates.containsKey("score")) {
            assessment.setScore(((Number) updates.get("score")).intValue());
        }
        if (updates.containsKey("proficiencyLevel")) {
            assessment.setProficiencyLevel(((Number) updates.get("proficiencyLevel")).intValue());
        }
        if (updates.containsKey("feedback")) {
            assessment.setFeedback((String) updates.get("feedback"));
        }
        if (updates.containsKey("status")) {
            assessment.setStatus((String) updates.get("status"));
        }

        if (updates.containsKey("score") || updates.containsKey("proficiencyLevel")) {
            assessment.setAssessedAt(LocalDateTime.now());
        }

        SkillAssessment updatedAssessment = assessmentRepository.save(assessment);
        return ResponseEntity.ok(Map.of("message", "Cập nhật đánh giá thành công!", "assessment", updatedAssessment));
    }

    // 10. Get assessment by ID
    @GetMapping("/assessments/{id}")
    public ResponseEntity<?> getAssessmentById(@PathVariable Long id) {
        SkillAssessment assessment = assessmentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy đánh giá với ID: " + id));

        // Check authorization
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        if (!assessment.getUser().getUsername().equals(username)) {
            return ResponseEntity.status(403)
                    .body(Map.of("error", "Bạn không có quyền xem đánh giá này!"));
        }

        return ResponseEntity.ok(assessment);
    }

    // 11. Delete assessment (Requires Token)
    @DeleteMapping("/assessments/{id}")
    public ResponseEntity<?> deleteAssessment(@PathVariable Long id) {
        SkillAssessment assessment = assessmentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy đánh giá với ID: " + id));

        // Verify user owns this assessment
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        if (!assessment.getUser().getUsername().equals(username)) {
            return ResponseEntity.status(403)
                    .body(Map.of("error", "Bạn không có quyền xóa đánh giá này!"));
        }

        assessmentRepository.delete(assessment);
        return ResponseEntity.ok(Map.of("message", "Xóa đánh giá thành công!"));
    }

    // 12. Get user skill summary (Requires Token)
    @GetMapping("/assessments/summary")
    public ResponseEntity<?> getSkillSummary() {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy thông tin thành viên"));

        List<SkillAssessment> assessments = assessmentRepository.findByUser(user);
        double averageScore = assessments.isEmpty() ? 0
                : assessments.stream().mapToInt(SkillAssessment::getScore).average().orElse(0);

        Map<String, Long> categoryBreakdown = assessments.stream()
                .collect(Collectors.groupingBy(a -> a.getSkill().getCategory(), Collectors.counting()));

        return ResponseEntity.ok(Map.of(
                "totalAssessments", assessments.size(),
                "averageScore", Math.round(averageScore * 100.0) / 100.0,
                "categoryBreakdown", categoryBreakdown,
                "assessments", assessments.stream().map(a -> Map.of(
                        "skill", a.getSkill().getName(),
                        "score", a.getScore(),
                        "proficiency", a.getProficiencyLevel()
                )).collect(Collectors.toList())
        ));
    }

    // 13. Get assessments by status (Requires Token)
    @GetMapping("/assessments/status/{status}")
    public ResponseEntity<?> getAssessmentsByStatus(@PathVariable String status) {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy thông tin thành viên"));

        List<SkillAssessment> assessments = assessmentRepository.findByUserAndStatus(user, status);
        return ResponseEntity.ok(Map.of("status", status, "total", assessments.size(), "assessments", assessments));
    }
}
