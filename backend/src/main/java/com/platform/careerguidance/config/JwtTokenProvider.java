package com.platform.careerguidance.config;

import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import org.springframework.stereotype.Component;
import java.security.Key;
import java.util.Date;

@Component
public class JwtTokenProvider {
    // Chìa khóa bí mật dùng để đóng dấu mã hóa Token (Độ dài tối thiểu 256-bit)
    private final String JWT_SECRET = "ChuoiBiMatNghiemNgatDungDeMaHoaChuoiTokenJwtChoDoAnNenTangDinhHuong";
    private final long JWT_EXPIRATION = 86400000L; // Thời hạn của Token: 24 giờ
    private final Key key = Keys.hmacShaKeyFor(JWT_SECRET.getBytes());

    // 1. Hàm sinh chuỗi Token JWT khi người dùng đăng nhập đúng tài khoản
    public String generateToken(String username) {
        Date now = new Date();
        Date expiryDate = new Date(now.getTime() + JWT_EXPIRATION);

        return Jwts.builder()
                .setSubject(username)
                .setIssuedAt(now)
                .setExpiration(expiryDate)
                .signWith(key, SignatureAlgorithm.HS256)
                .compact();
    }

    // 2. Hàm giải mã Token lấy lại tên Username của sinh viên đang thao tác
    public String getUsernameFromJWT(String token) {
        Claims claims = Jwts.parserBuilder()
                .setSigningKey(key)
                .build()
                .parseClaimsJws(token)
                .getBody();
        return claims.getSubject();
    }

    // 3. Hàm kiểm tra xem Token gửi lên có hợp lệ hay đã bị chỉnh sửa/hết hạn không
    public boolean validateToken(String authToken) {
        try {
            Jwts.parserBuilder().setSigningKey(key).build().parseClaimsJws(authToken);
            return true;
        } catch (JwtException | IllegalArgumentException ex) {
            return false; // Token không hợp lệ hoặc hết hạn
        }
    }
}