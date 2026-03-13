package com.example.stockLog.community.dto;

import lombok.*;

@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LoginResponseDto {
    private Long userId;
    private String token; // 서버에서 생성한 JWT 토큰이 담길 곳
}
