package com.example.stockLog.community.service;

import com.example.stockLog.community.config.JwtTokenProvider;
import com.example.stockLog.community.dto.LoginRequestDto;
import com.example.stockLog.community.dto.LoginResponseDto;
import com.example.stockLog.community.dto.SignupRequestDto;
import com.example.stockLog.community.entity.User;
import com.example.stockLog.community.repository.UserRepository;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.hibernate.validator.internal.util.Contracts.assertNotNull;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class UserServiceTest {
    @Mock
    private UserRepository userRepository;
    @Mock
    private JwtTokenProvider jwtTokenProvider;
    @InjectMocks
    private UserService userService;

    //로그인
    @Test
    @DisplayName("로그인 테스트")
    public void loginTest(){
        //given
        String rawPassword="password";
        String encodedPassword=userService.dummyEncoder(rawPassword);
        LoginRequestDto dto=new LoginRequestDto("email", rawPassword);

        User existUser=User.builder().email("email").password(encodedPassword).build();
        when(userRepository.findByEmail("email")).thenReturn(Optional.of(existUser));
        //when
        userService.login(dto);
        //then
         }
    //회원가입
    @Test
    @DisplayName("회원가입 테스트")
    public void signupTest(){
        //given
        SignupRequestDto dto=new SignupRequestDto("email", "password", "nickname");
        //when
        userService.join(dto);
        //then: save가 호출되었는지 확인해야 함
        //userRepository.findBy
        verify(userRepository, times(1)).save(any(User.class));
    }
}
