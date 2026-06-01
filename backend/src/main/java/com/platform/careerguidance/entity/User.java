package com.platform.careerguidance.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "users")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String username;

    @Column(nullable = false)
    private String password; // Chuỗi đã băm bảo mật, không lưu mật khẩu gốc

    @Column(unique = true, nullable = false)
    private String email;

    private String fullName;
    private String role; // Mặc định: ROLE_STUDENT
}