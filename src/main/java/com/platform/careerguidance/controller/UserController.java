package com.platform.careerguidance.controller;

import com.platform.careerguidance.entity.User;
import com.platform.careerguidance.repository.UserRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import java.util.Map;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserRepository userRepository;

    public UserController(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    // API lấy thông tin Profile cá nhân (Bắt buộc phải đính kèm Token hợp lệ)
    @GetMapping("/profile")
    public ResponseEntity<?> getUserProfile() {
        // Lấy tên Username từ bộ lọc JWT Authentication đã lưu ngầm trước đó
        String username = SecurityContextHolder.getContext().getAuthentication().getName();

        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy thông tin thành viên"));

        // Loại bỏ hiển thị chuỗi băm mật khẩu ra ngoài JSON để đảm bảo an toàn tối đa
        user.setPassword(null);
        return ResponseEntity.ok(user);
    }
}