package com.platform.careerguidance.controller;

import com.platform.careerguidance.entity.*;
import com.platform.careerguidance.repository.*;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/roadmaps")
public class RoadmapController {

    private final RoadmapRepository roadmapRepository;
    private final RoadmapStepRepository roadmapStepRepository;
    private final UserRoadmapRepository userRoadmapRepository;
    private final ProgressTrackingRepository progressTrackingRepository;
    private final UserRepository userRepository;
    private final CareerRepository careerRepository;

    public RoadmapController(
            RoadmapRepository roadmapRepository,
            RoadmapStepRepository roadmapStepRepository,
            UserRoadmapRepository userRoadmapRepository,
            ProgressTrackingRepository progressTrackingRepository,
            UserRepository userRepository,
            CareerRepository careerRepository) {
        this.roadmapRepository = roadmapRepository;
        this.roadmapStepRepository = roadmapStepRepository;
        this.userRoadmapRepository = userRoadmapRepository;
        this.progressTrackingRepository = progressTrackingRepository;
        this.userRepository = userRepository;
        this.careerRepository = careerRepository;
    }

    private User getCurrentUser() {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy thông tin thành viên"));
    }

    // ==================== ROADMAP CRUD ====================

    // 1. Get all roadmaps (public)
    @GetMapping
    public ResponseEntity<?> getAllRoadmaps() {
        List<Roadmap> roadmaps = roadmapRepository.findAll();
        List<Map<String, Object>> result = roadmaps.stream()
                .map(this::mapRoadmap)
                .collect(Collectors.toList());
        return ResponseEntity.ok(Map.of("total", result.size(), "roadmaps", result));
    }

    // 2. Get roadmap by ID with steps
    @GetMapping("/{id}")
    public ResponseEntity<?> getRoadmapById(@PathVariable Long id) {
        Roadmap roadmap = roadmapRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy roadmap với ID: " + id));
        return ResponseEntity.ok(mapRoadmapWithSteps(roadmap));
    }

    // 3. Get roadmap by career ID
    @GetMapping("/career/{careerId}")
    public ResponseEntity<?> getRoadmapByCareer(@PathVariable Long careerId) {
        Career career = careerRepository.findById(careerId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy career với ID: " + careerId));
        List<Roadmap> roadmaps = roadmapRepository.findByCareer(career);
        if (roadmaps.isEmpty()) {
            return ResponseEntity.ok(Map.of("message", "Chưa có roadmap cho career này.", "roadmap", null));
        }
        Roadmap roadmap = roadmaps.get(0);
        return ResponseEntity.ok(mapRoadmapWithSteps(roadmap));
    }

    // 4. Create new roadmap (Admin)
    @PostMapping
    public ResponseEntity<?> createRoadmap(@RequestBody Map<String, Object> request) {
        User user = getCurrentUser();
        Long careerId = ((Number) request.get("careerId")).longValue();
        Career career = careerRepository.findById(careerId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy career với ID: " + careerId));

        Roadmap roadmap = new Roadmap();
        roadmap.setCareer(career);
        roadmap.setTitle((String) request.get("title"));
        roadmap.setDescription((String) request.get("description"));
        roadmap.setCreatedBy(user);
        roadmap = roadmapRepository.save(roadmap);

        // Save steps if provided
        if (request.containsKey("steps")) {
            @SuppressWarnings("unchecked")
            List<Map<String, Object>> stepsData = (List<Map<String, Object>>) request.get("steps");
            final Roadmap savedRoadmap = roadmap;
            List<RoadmapStep> steps = new ArrayList<>();
            for (int i = 0; i < stepsData.size(); i++) {
                Map<String, Object> stepData = stepsData.get(i);
                RoadmapStep step = new RoadmapStep();
                step.setRoadmap(savedRoadmap);
                step.setStepOrder(i + 1);
                step.setTopicName((String) stepData.get("topicName"));
                step.setDescription((String) stepData.getOrDefault("description", ""));
                step.setContentUrl((String) stepData.getOrDefault("contentUrl", ""));
                step.setPhase((String) stepData.getOrDefault("phase", "Foundation"));
                steps.add(step);
            }
            roadmapStepRepository.saveAll(steps);
        }

        return ResponseEntity.ok(Map.of("message", "Tạo roadmap thành công!", "roadmapId", roadmap.getId()));
    }

    // ==================== USER ROADMAP (ENROLLMENT) ====================

    // 5. Enroll into a roadmap
    @PostMapping("/{roadmapId}/enroll")
    public ResponseEntity<?> enrollRoadmap(@PathVariable Long roadmapId) {
        User user = getCurrentUser();
        Roadmap roadmap = roadmapRepository.findById(roadmapId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy roadmap với ID: " + roadmapId));

        if (userRoadmapRepository.existsByUserAndRoadmap(user, roadmap)) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", "Bạn đã đăng ký roadmap này rồi!"));
        }

        UserRoadmap userRoadmap = new UserRoadmap();
        userRoadmap.setUser(user);
        userRoadmap.setRoadmap(roadmap);
        userRoadmap = userRoadmapRepository.save(userRoadmap);

        // Initialize progress tracking entries for all steps
        List<RoadmapStep> steps = roadmapStepRepository.findByRoadmapOrderByStepOrderAsc(roadmap);
        List<ProgressTracking> progressList = new ArrayList<>();
        for (RoadmapStep step : steps) {
            ProgressTracking pt = new ProgressTracking();
            pt.setUserRoadmap(userRoadmap);
            pt.setStep(step);
            pt.setIsCompleted(false);
            progressList.add(pt);
        }
        progressTrackingRepository.saveAll(progressList);

        return ResponseEntity.ok(Map.of(
                "message", "Đã đăng ký roadmap thành công!",
                "userRoadmapId", userRoadmap.getId()
        ));
    }

    // 6. Get my enrolled roadmaps
    @GetMapping("/my-roadmaps")
    public ResponseEntity<?> getMyRoadmaps() {
        User user = getCurrentUser();
        List<UserRoadmap> userRoadmaps = userRoadmapRepository.findByUser(user);

        List<Map<String, Object>> result = userRoadmaps.stream().map(ur -> {
            Map<String, Object> item = new HashMap<>();
            item.put("userRoadmapId", ur.getId());
            item.put("roadmapId", ur.getRoadmap().getId());
            item.put("title", ur.getRoadmap().getTitle());
            item.put("description", ur.getRoadmap().getDescription());
            item.put("careerId", ur.getRoadmap().getCareer().getId());
            item.put("careerTitle", ur.getRoadmap().getCareer().getTitle());
            item.put("status", ur.getStatus());
            item.put("startedAt", ur.getStartedAt());

            // Calculate progress
            List<RoadmapStep> steps = roadmapStepRepository.findByRoadmapOrderByStepOrderAsc(ur.getRoadmap());
            long completedCount = progressTrackingRepository.countByUserRoadmapAndIsCompleted(ur, true);
            int totalSteps = steps.size();
            int progressPercent = totalSteps > 0 ? (int) ((completedCount * 100) / totalSteps) : 0;

            item.put("totalSteps", totalSteps);
            item.put("completedSteps", completedCount);
            item.put("progressPercent", progressPercent);
            return item;
        }).collect(Collectors.toList());

        return ResponseEntity.ok(Map.of("total", result.size(), "roadmaps", result));
    }

    // 7. Get my roadmap detail with progress
    @GetMapping("/my-roadmaps/{userRoadmapId}")
    public ResponseEntity<?> getMyRoadmapDetail(@PathVariable Long userRoadmapId) {
        User user = getCurrentUser();
        UserRoadmap userRoadmap = userRoadmapRepository.findById(userRoadmapId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy roadmap đã đăng ký"));

        if (!userRoadmap.getUser().getUsername().equals(user.getUsername())) {
            return ResponseEntity.status(403).body(Map.of("error", "Bạn không có quyền xem roadmap này!"));
        }

        List<RoadmapStep> steps = roadmapStepRepository.findByRoadmapOrderByStepOrderAsc(userRoadmap.getRoadmap());
        List<ProgressTracking> progressList = progressTrackingRepository.findByUserRoadmap(userRoadmap);
        Map<Long, Boolean> completedMap = progressList.stream()
                .collect(Collectors.toMap(pt -> pt.getStep().getId(), ProgressTracking::getIsCompleted));

        List<Map<String, Object>> stepsWithProgress = steps.stream().map(step -> {
            Map<String, Object> s = new HashMap<>();
            s.put("id", step.getId());
            s.put("stepOrder", step.getStepOrder());
            s.put("topicName", step.getTopicName());
            s.put("description", step.getDescription());
            s.put("contentUrl", step.getContentUrl());
            s.put("phase", step.getPhase());
            s.put("isCompleted", completedMap.getOrDefault(step.getId(), false));
            return s;
        }).collect(Collectors.toList());

        long completedCount = stepsWithProgress.stream().filter(s -> Boolean.TRUE.equals(s.get("isCompleted"))).count();
        int totalSteps = stepsWithProgress.size();
        int progressPercent = totalSteps > 0 ? (int) ((completedCount * 100) / totalSteps) : 0;

        Map<String, Object> response = new HashMap<>();
        response.put("userRoadmapId", userRoadmap.getId());
        response.put("roadmapId", userRoadmap.getRoadmap().getId());
        response.put("title", userRoadmap.getRoadmap().getTitle());
        response.put("description", userRoadmap.getRoadmap().getDescription());
        response.put("careerId", userRoadmap.getRoadmap().getCareer().getId());
        response.put("careerTitle", userRoadmap.getRoadmap().getCareer().getTitle());
        response.put("status", userRoadmap.getStatus());
        response.put("startedAt", userRoadmap.getStartedAt());
        response.put("steps", stepsWithProgress);
        response.put("totalSteps", totalSteps);
        response.put("completedSteps", completedCount);
        response.put("progressPercent", progressPercent);

        return ResponseEntity.ok(response);
    }

    // ==================== PROGRESS TRACKING ====================

    // 8. Toggle step completion
    @PutMapping("/progress/{stepId}")
    public ResponseEntity<?> toggleStepProgress(
            @PathVariable Long stepId,
            @RequestBody Map<String, Object> request) {
        User user = getCurrentUser();
        RoadmapStep step = roadmapStepRepository.findById(stepId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy step với ID: " + stepId));

        Long userRoadmapId = ((Number) request.get("userRoadmapId")).longValue();
        UserRoadmap userRoadmap = userRoadmapRepository.findById(userRoadmapId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy user roadmap"));

        if (!userRoadmap.getUser().getUsername().equals(user.getUsername())) {
            return ResponseEntity.status(403).body(Map.of("error", "Bạn không có quyền cập nhật tiến độ này!"));
        }

        Boolean isCompleted = (Boolean) request.get("isCompleted");

        Optional<ProgressTracking> existing = progressTrackingRepository.findByUserRoadmapAndStep(userRoadmap, step);
        ProgressTracking pt;
        if (existing.isPresent()) {
            pt = existing.get();
            pt.setIsCompleted(isCompleted);
        } else {
            pt = new ProgressTracking();
            pt.setUserRoadmap(userRoadmap);
            pt.setStep(step);
            pt.setIsCompleted(isCompleted);
        }
        progressTrackingRepository.save(pt);

        // Check if all steps completed → update userRoadmap status
        List<RoadmapStep> allSteps = roadmapStepRepository.findByRoadmapOrderByStepOrderAsc(userRoadmap.getRoadmap());
        long completedCount = progressTrackingRepository.countByUserRoadmapAndIsCompleted(userRoadmap, true);
        if (completedCount >= allSteps.size() && !allSteps.isEmpty()) {
            userRoadmap.setStatus("COMPLETED");
            userRoadmapRepository.save(userRoadmap);
        } else if ("COMPLETED".equals(userRoadmap.getStatus())) {
            userRoadmap.setStatus("IN_PROGRESS");
            userRoadmapRepository.save(userRoadmap);
        }

        int progressPercent = allSteps.size() > 0 ? (int) ((completedCount * 100) / allSteps.size()) : 0;

        return ResponseEntity.ok(Map.of(
                "message", isCompleted ? "Đã hoàn thành bước học!" : "Đã bỏ hoàn thành bước học.",
                "isCompleted", isCompleted,
                "progressPercent", progressPercent,
                "completedSteps", completedCount,
                "totalSteps", allSteps.size()
        ));
    }

    // ==================== HELPERS ====================

    private Map<String, Object> mapRoadmap(Roadmap r) {
        Map<String, Object> map = new HashMap<>();
        map.put("id", r.getId());
        map.put("title", r.getTitle());
        map.put("description", r.getDescription());
        map.put("careerId", r.getCareer().getId());
        map.put("careerTitle", r.getCareer().getTitle());
        map.put("createdAt", r.getCreatedAt());
        return map;
    }

    private Map<String, Object> mapRoadmapWithSteps(Roadmap r) {
        Map<String, Object> map = mapRoadmap(r);
        List<RoadmapStep> steps = roadmapStepRepository.findByRoadmapOrderByStepOrderAsc(r);
        List<Map<String, Object>> stepsData = steps.stream().map(step -> {
            Map<String, Object> s = new HashMap<>();
            s.put("id", step.getId());
            s.put("stepOrder", step.getStepOrder());
            s.put("topicName", step.getTopicName());
            s.put("description", step.getDescription());
            s.put("contentUrl", step.getContentUrl());
            s.put("phase", step.getPhase());
            return s;
        }).collect(Collectors.toList());
        map.put("steps", stepsData);
        map.put("totalSteps", stepsData.size());
        return map;
    }
}
