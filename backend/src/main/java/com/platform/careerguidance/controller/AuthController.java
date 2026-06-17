package com.platform.careerguidance.controller;

import com.platform.careerguidance.entity.User;
import com.platform.careerguidance.config.JwtTokenProvider;
import com.platform.careerguidance.repository.UserRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider tokenProvider;

    public AuthController(UserRepository userRepository, PasswordEncoder passwordEncoder, JwtTokenProvider tokenProvider) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.tokenProvider = tokenProvider;
    }

    // 1. API Đăng ký tài khoản sinh viên mới
    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody User user) {
        if(userRepository.findByUsername(user.getUsername()).isPresent()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Tên tài khoản này đã tồn tại!"));
        }

        if(userRepository.findByEmail(user.getEmail()).isPresent()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Email này đã được đăng ký!"));
        }

        // Tiến hành băm bảo mật mật khẩu trước khi lưu vào file SQLite
        user.setPassword(passwordEncoder.encode(user.getPassword()));
        user.setRole("ROLE_STUDENT");
        userRepository.save(user);
        return ResponseEntity.ok(Map.of("message", "Đăng ký tài khoản thành công!"));
    }

    // 2. API Đăng nhập hệ thống để nhận chuỗi JWT Token hành khách
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> loginRequest) {
        User user = userRepository.findByUsername(loginRequest.get("username"))
                .orElseThrow(() -> new RuntimeException("Tài khoản không tồn tại trên hệ thống"));

        // So khớp mật khẩu thô gửi lên với chuỗi băm trong Database
        if (!passwordEncoder.matches(loginRequest.get("password"), user.getPassword())) {
            return ResponseEntity.status(401).body(Map.of("error", "Mật khẩu nhập vào không chính xác!"));
        }

        // Cấp chứng chỉ chuỗi Token
        String token = tokenProvider.generateToken(user.getUsername());
        return ResponseEntity.ok(Map.of("accessToken", token, "tokenType", "Bearer"));
    }
}