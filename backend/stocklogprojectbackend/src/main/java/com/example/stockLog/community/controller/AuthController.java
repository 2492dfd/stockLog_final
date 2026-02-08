package com.example.stockLog.community.controller;

import com.example.stockLog.community.config.JwtTokenProvider;
import com.example.stockLog.community.dto.LoginRequestDto;
import com.example.stockLog.community.dto.LoginResponseDto;
import com.example.stockLog.community.dto.SignupRequestDto;
import com.example.stockLog.community.dto.UserProfileResponseDto;
import com.example.stockLog.community.entity.User;
import com.example.stockLog.community.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@CrossOrigin(origins="*", allowedHeaders = "*") //모든 도메인에서의 접속을 허용
@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class AuthController {
    private final UserService userService;
    private final JwtTokenProvider jwtTokenProvider;

    @PostMapping("/auth/signup")
    public ResponseEntity<Long> signup(@RequestBody SignupRequestDto signupRequestDto) {
        Long userId=userService.join(signupRequestDto);
        return ResponseEntity.status(HttpStatus.CREATED).body(userId);
    }
    @PostMapping("/auth/login")
    public ResponseEntity<LoginResponseDto> login(@RequestBody LoginRequestDto loginRequestDto) {
        // 1. 실제 DB에서 유저 확인 (이 로직은 서비스에 있겠죠?)
        Long userId=userService.login(loginRequestDto);
        String token= jwtTokenProvider.createToken(userId);
        return ResponseEntity.ok(new LoginResponseDto(token));
    }
    @GetMapping("/users/{userId}")
       public ResponseEntity<UserProfileResponseDto> getUserProfile(@PathVariable
                                                                       Long userId) {
                UserProfileResponseDto userProfile = userService.getUserProfile(userId);
                       return ResponseEntity.ok(userProfile);
    }
}
