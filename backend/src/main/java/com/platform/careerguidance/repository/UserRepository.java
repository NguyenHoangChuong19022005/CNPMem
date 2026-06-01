package com.platform.careerguidance.repository;

import com.platform.careerguidance.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {
    // Hàm tìm kiếm Sinh viên bằng Username (phục vụ cho việc Đăng nhập)
    Optional<User> findByUsername(String username);
}