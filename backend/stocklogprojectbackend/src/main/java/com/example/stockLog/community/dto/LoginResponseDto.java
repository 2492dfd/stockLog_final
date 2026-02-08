package com.example.stockLog.community.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor // 기본 생성자
@AllArgsConstructor // 모든 필드를 인자로 받는 생성자 (토큰 주입용)
public class LoginResponseDto {
    private String token; // 서버에서 생성한 JWT 토큰이 담길 곳
}
