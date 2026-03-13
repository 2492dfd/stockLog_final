package com.example.stockLog.community.config;

import com.example.stockLog.community.entity.User;
import com.example.stockLog.community.repository.UserRepository;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.util.StringUtils;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@RequiredArgsConstructor
//얘는 @Component 안붙여도 됨. 스프링이 자동으로 관리하는 것보다 SecurityConfig에서 지정해주는게 안전
public class JwtAuthenticationFilter extends OncePerRequestFilter {
    //모든 요청이 들어올때마다 가장 먼저 가로채서 토큰을 검사하는 필터
    private final JwtTokenProvider jwtTokenProvider;
    private final UserRepository userRepository; // UserRepository 주입

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain) throws ServletException, IOException {
        String token = resolveToken(request);

        try {
            if (StringUtils.hasText(token) && jwtTokenProvider.validateToken(token)) {
                Long userId = jwtTokenProvider.getUserIdFromToken(token);
                User user = userRepository.findById(userId).orElse(null);

                if (user != null) {
                    CustomUserDetails userDetails = new CustomUserDetails(user);
                    UsernamePasswordAuthenticationToken authentication =
                            new UsernamePasswordAuthenticationToken(userDetails, null, userDetails.getAuthorities());

                    // 세부 정보 세팅 (추가하는 것이 좋습니다)
                    authentication.setDetails(new org.springframework.security.web.authentication.WebAuthenticationDetailsSource().buildDetails(request));

                    SecurityContextHolder.getContext().setAuthentication(authentication);
                    System.out.println(" SecurityContext에 인증 정보 등록 완료: " + user.getEmail());
                } else {
                    System.out.println(" DB에 유저가 없습니다. ID: " + userId);
                }
            }
        } catch (Exception e) {
            System.err.println(" 인증 필터 에러: " + e.getMessage());
        }

        filterChain.doFilter(request, response);
    }
        //HTTP 헤더의 Authorization칸에 bearer형식으로 토큰 담아보냄
    //헤더에서 이 문자열을 가져와서 앞부분인 "Bearer " 7글자를 떼어내고 순수한 토큰만 추출
    private String resolveToken(HttpServletRequest request) {
        String bearerToken = request.getHeader("Authorization");
        if (StringUtils.hasText(bearerToken) && bearerToken.startsWith("Bearer ")) {
            return bearerToken.substring(7);
        }
        return null;
    }
}
