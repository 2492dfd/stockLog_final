package com.example.stockLog.community.service;

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
    //final없으면 @RequiredArgsConstructor에서 객체 주입 안함
    private final UserRepository userRepository;
    private final PostRepository postRepository;
    private final FollowRepository followRepository;
    //이메일 중복검사 로직 추가

    public Long login(LoginRequestDto loginRequestDto) {
        //이메일로 유저 찾기
        User user=userRepository.findByEmail(loginRequestDto.getEmail())
                .orElseThrow(()->new IllegalArgumentException("가입되지 않은 이메일입니다."));
        //비교시에도 비밀번호를 dummyEncoder로 똑같이 변환한 뒤에 비교해야 함
        String encodedInputPassword = dummyEncoder(loginRequestDto.getPassword());
        if(!user.getPassword().equals(encodedInputPassword)){
            throw new IllegalArgumentException("비밀번호가 일치하지 않습니다.");
        }
        //여기서 원래는 토큰 반환
        return user.getId();
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
        //리포지토리에 기능 필요 없음. JPA는 변경 감지 기능. 유저 객체의 값 바꾸면 JPA가 자동으로 알아채고 DB에 UPDATE 쿼리 넣어줌
        //사용자가 값을 변경하는 순간(앱에서) 서버의 dto는 변경된 값 저장
        // 1. 수정할 유저를 먼저 DB에서 가져옴 (영속화)
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("유저를 찾을 수 없습니다."));

        // 2. 객체의 값만 바꿈 (변경 감지 작동!)
        user.updateProfile(updateProfileDto.getImageUrl(), updateProfileDto.getNickname(), updateProfileDto.getBio());
        // repository.save()를 안 써도 메서드가 끝나면 자동으로 UPDATE 쿼리가 날아갑니다!
    }
    @Transactional
    public void resetPassword(ResetPasswordDto resetPasswordDto){
        //비밀번호는 암호화되어 알려줄 수 없음. 새로 만들기
        //누구의 비밀번호를 새로 만들것인지
        User user=userRepository.findByEmail(resetPasswordDto.getEmail())
                .orElseThrow(()-> new IllegalArgumentException("해당 이메일로 가입된 유저가 없습니다"));
        //비밀번호 규칙 검사
        checkPasswordPolicy(resetPasswordDto.getNewPassword());
        //비밀번호 암호화
        String encodedPassword=dummyEncoder(resetPasswordDto.getNewPassword());
        //엔티티의 메서드를 호출해서 비번 변경
        user.changePassword(encodedPassword);
    }
    // 비밀번호 암호화를 가정한 임시 메서드 (나중에 Spring Security 적용 시 교체)
    private String dummyEncoder(String password) {
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

    public UserProfileResponseDto getUserProfile(Long userId) {
        // 1. 유저 엔티티 조회
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("해당 유저를 찾을 수 없습니다."));

        // 2. 통계 데이터 조회 (Repository에서 count 쿼리 실행)
        Long postCount = postRepository.countByUser(user);
        Long followerCount = followRepository.countByFollowing(user);
        Long followingCount = followRepository.countByFollower(user);

        // 3. DTO로 조립하여 반환
        return new UserProfileResponseDto(user, postCount, followerCount, followingCount);
    }

}
