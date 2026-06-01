package com.platform.careerguidance.controller;

import com.platform.careerguidance.entity.User;
import com.platform.careerguidance.repository.UserRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public UserController(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    // 1. Lấy thông tin profile cá nhân (Bắt buộc Token)
    @GetMapping("/profile")
    public ResponseEntity<?> getUserProfile() {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy thông tin thành viên"));
        user.setPassword(null);
        return ResponseEntity.ok(user);
    }

    // 2. Cập nhật thông tin profile (Bắt buộc Token)
    @PutMapping("/profile")
    public ResponseEntity<?> updateUserProfile(@RequestBody Map<String, String> updates) {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy thông tin thành viên"));

        // Cập nhật fullName nếu có
        if (updates.containsKey("fullName") && updates.get("fullName") != null) {
            user.setFullName(updates.get("fullName"));
        }

        // Cập nhật email nếu có
        if (updates.containsKey("email") && updates.get("email") != null) {
            String newEmail = updates.get("email");
            // Kiểm tra email không trùng lặp với user khác
            if (userRepository.findByEmail(newEmail).isPresent()) {
                return ResponseEntity.badRequest().body(Map.of("error", "Email này đã được sử dụng!"));
            }
            user.setEmail(newEmail);
        }

        userRepository.save(user);
        user.setPassword(null);
        return ResponseEntity.ok(Map.of("message", "Cập nhật profile thành công!", "user", user));
    }

    // 3. Đổi mật khẩu (Bắt buộc Token)
    @PutMapping("/change-password")
    public ResponseEntity<?> changePassword(@RequestBody Map<String, String> request) {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        String oldPassword = request.get("oldPassword");
        String newPassword = request.get("newPassword");
        String confirmPassword = request.get("confirmPassword");

        if (oldPassword == null || newPassword == null || confirmPassword == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "Các trường không được để trống!"));
        }

        if (!newPassword.equals(confirmPassword)) {
            return ResponseEntity.badRequest().body(Map.of("error", "Mật khẩu xác nhận không khớp!"));
        }

        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy thông tin thành viên"));

        // Kiểm tra mật khẩu cũ
        if (!passwordEncoder.matches(oldPassword, user.getPassword())) {
            return ResponseEntity.status(401).body(Map.of("error", "Mật khẩu hiện tại không chính xác!"));
        }

        // Cập nhật mật khẩu mới
        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);

        return ResponseEntity.ok(Map.of("message", "Đổi mật khẩu thành công!"));
    }

    // 4. Lấy danh sách tất cả users (Public API, không cần Token nhưng tùy chọn)
    @GetMapping("/list")
    public ResponseEntity<?> listAllUsers() {
        List<Map<String, Object>> users = userRepository.findAll().stream()
                .map(user -> Map.of(
                        "id", user.getId(),
                        "username", user.getUsername(),
                        "fullName", user.getFullName() != null ? user.getFullName() : "",
                        "email", user.getEmail(),
                        "role", user.getRole()
                ))
                .collect(Collectors.toList());

        return ResponseEntity.ok(Map.of("total", users.size(), "users", users));
    }

    // 5. Lấy thông tin user theo ID (Public, không cần Token)
    @GetMapping("/{id}")
    public ResponseEntity<?> getUserById(@PathVariable Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy user với ID: " + id));

        user.setPassword(null);
        return ResponseEntity.ok(user);
    }

    // 6. Xóa user (Bắt buộc Token + có thể cần admin)
    @DeleteMapping("/profile")
    public ResponseEntity<?> deleteUserProfile() {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy thông tin thành viên"));

        userRepository.delete(user);
        return ResponseEntity.ok(Map.of("message", "Tài khoản đã bị xóa vĩnh viễn!"));
    }
}