package com.example.stockLog.community.config;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.nio.charset.StandardCharsets;
import java.security.Key;
import java.util.Date;

@Component
public class JwtTokenProvider {
    //토큰 만들고 해석하고 검사
    // 테스트용 시크릿 키 (실제 서비스에서는 아주 길고 복잡하게 관리해야 함)
    private final Key key ;
    //유통 기한
    private final long tokenValidityInMilliseconds = 1000L * 60 * 60 * 24; // 24시간 유효

    // 1. 토큰 생성 함수
    public String createToken(Long userId) {
        Date now = new Date();
        Date validity = new Date(now.getTime() + tokenValidityInMilliseconds);
        //암호화된 신분증 문자열 밖으로 내보내는 역할. 완성된 토큰을 return
        return Jwts.builder()
                .setSubject(String.valueOf(userId)) // 토큰 안에 유저 ID를 숨김. PK
                .setIssuedAt(now) //발행 시간은 지금이야
                .setExpiration(validity) //언제까지 유효한지
                .signWith(key) //서버만 아는 비밀 키로 도장 찍기. 이게 없으면 누구나 위조 가능
                .compact(); //위의 모든 정보를 하나의 짧은 문자열로
    }

    // 2. 토큰에서 유저 ID 추출 함수
    //사용자가 토큰 들고 오면 그거 다시 해석하는 과정
    public Long getUserIdFromToken(String token) {
        Claims claims = Jwts.parserBuilder()
                .setSigningKey(key)//이 열쇠로 토큰 풀기
                .build()
                .parseClaimsJws(token) //실제로 토큰 상자 열어봄
                .getBody(); //상자 안의 데이터. 내용물 꺼냄
        //보따리 칸 중에서 Subject 칸에 적힌 글자를 숫자로 바꿔서 리턴
        return Long.parseLong(claims.getSubject());
    }

    // 3. 토큰 유효성 검사 함수
    public boolean validateToken(String token) {
        try {
            Jwts.parserBuilder().setSigningKey(key).build().parseClaimsJws(token);
            //내용물을 꺼내서 서명, 만료, 형식을 확인.
            return true;
            //|는 OR 의미
        } catch (JwtException | IllegalArgumentException e) {
            return false;

        }}
    public JwtTokenProvider(@Value("${jwt.secret}") String secretKey) {
        // 문자열을 byte 배열로 변환하여 고정된 Key 객체를 생성합니다.
        byte[] keyBytes = secretKey.getBytes(StandardCharsets.UTF_8);
        this.key = Keys.hmacShaKeyFor(keyBytes);
    }
}
