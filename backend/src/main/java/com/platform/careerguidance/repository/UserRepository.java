package com.platform.careerguidance.repository;

import com.platform.careerguidance.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {
    // Tìm kiếm user bằng username
    Optional<User> findByUsername(String username);

    // Tìm kiếm user bằng email
    Optional<User> findByEmail(String email);
}