package com.example.stockLog.community.service;

import com.example.stockLog.community.config.JwtTokenProvider;
import com.example.stockLog.community.dto.*;
import com.example.stockLog.community.entity.User;
import com.example.stockLog.community.repository.FollowRepository;
import com.example.stockLog.community.repository.PostRepository;
import com.example.stockLog.community.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
@RequiredArgsConstructor
public class UserService  {
    private final UserRepository userRepository;
    private final PostRepository postRepository;
    private final FollowRepository followRepository;
    private final JwtTokenProvider jwtTokenProvider;
    //이메일 중복검사 로직 추가

    public LoginResponseDto login(LoginRequestDto loginRequestDto) {
        User user=userRepository.findByEmail(loginRequestDto.getEmail())
                .orElseThrow(()->new IllegalArgumentException("가입되지 않은 이메일입니다."));
        //비교시에도 비밀번호를 dummyEncoder로 똑같이 변환한 뒤에 비교해야 함
        String encodedInputPassword = dummyEncoder(loginRequestDto.getPassword());
        if(!user.getPassword().equals(encodedInputPassword)){
            throw new IllegalArgumentException("비밀번호가 일치하지 않습니다.");
        }
        //accessToken 생성
        String accessToken=jwtTokenProvider.createToken(user.getId());
        //토큰 반환하기. userId를 같이 보내야 함. 사용자 관리
        return new LoginResponseDto(user.getId(), accessToken);
    }

    public Long join(SignupRequestDto dto) {//회원가입
        /*if (validateDuplicateUser()&&checkPasswordPolicy()) { //다 통과시 save
            repository.save(user);
        }*/
        //저런식으로 하는 대신에 하나씩 메서드 호출. 어차피 예외 터지면 저장코드 실행못함
        validateDuplicateUser(dto.getEmail(), dto.getNickname());
        checkPasswordPolicy(dto.getPassword());
        //검증한 다음에 변환 encode
        String encodedPassword = dummyEncoder(dto.getPassword());
        User user=User.builder()
                        .email(dto.getEmail())
                                .password(encodedPassword)
                                        .nickname(dto.getNickname())
                                                .build();
        userRepository.save(user);
        return user.getId();
    }
    public String findEmail(String nickname){//닉네임을 통해서이메일 찾기. 비번은 사실상 암호화되기 때문에 찾을 수 없음
        User user = userRepository.findByNickname(nickname)
                .orElseThrow(() -> new IllegalArgumentException("해당 닉네임을 가진 유저가 없습니다."));
        return user.getEmail();
    }
    @Transactional(readOnly = true)
    public User findMember(Long userId){//ID로 유저 찾기
        return userRepository.findById(userId)
                 .orElseThrow(()->new IllegalArgumentException("해당 아이디를 가진 유저가 없습니다"));
    }
    public void update(Long userId, UpdateProfileDto updateProfileDto){

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("유저를 찾을 수 없습니다."));
        user.updateProfile(updateProfileDto.getImageUrl(), updateProfileDto.getNickname(), updateProfileDto.getBio());
    }

    public void resetPassword(ResetPasswordDto resetPasswordDto){
        //비밀번호는 암호화되어 알려줄 수 없음. 새로 만들기
        //누구의 비밀번호를 새로 만들것인지
        User user=userRepository.findByEmail(resetPasswordDto.getEmail())
                .orElseThrow(()-> new IllegalArgumentException("해당 이메일로 가입된 유저가 없습니다"));
        //비밀번호 규칙 검사
        checkPasswordPolicy(resetPasswordDto.getNewPassword());
        //비밀번호 암호화
        String encodedPassword=dummyEncoder(resetPasswordDto.getNewPassword());
        user.changePassword(encodedPassword);
    }
    // 비밀번호 암호화를 가정한 임시 메서드 (나중에 Spring Security 적용 시 교체)
    //원래 private여야 하지만 dummy이기도 하고 테스트 코드 작성시 살짝 public으로 바꿈
    public String dummyEncoder(String password) {
        return "ENC_" + password;
    }
    public void withdraw(Long userId){//탈퇴
        userRepository.deleteById(userId);
    }
    private void validateDuplicateUser(String email, String nickname){
        if (userRepository.existsByEmail(email)) {
            throw new IllegalStateException("이미 존재하는 이메일입니다.");
        }
        if (userRepository.existsByNickname(nickname)) {
            throw new IllegalStateException("이미 존재하는 닉네임입니다.");
        }
    }
    private void checkPasswordPolicy(String password){
        if (password.length() < 8) {
            throw new IllegalArgumentException("비밀번호는 8자 이상이어야 합니다.");
        }
    }

    //정보 종합해서 dto에 전달. 화면에 보여줄 정보
    public UserProfileResponseDto getUserProfile(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("해당 유저를 찾을 수 없습니다."));

        Long postCount = postRepository.countByUser(user);
        Long followerCount = followRepository.countByFollowing(user);
        Long followingCount = followRepository.countByFollower(user);

        // 3. DTO로 조립하여 반환
        return new UserProfileResponseDto(user, postCount, followerCount, followingCount);
    }

}
