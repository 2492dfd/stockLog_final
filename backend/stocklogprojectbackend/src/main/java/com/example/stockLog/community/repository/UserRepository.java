package com.example.stockLog.community.repository;

import com.example.stockLog.community.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {
    //find는 ID로만 가능하기 때문에 이메일이나 닉네임처럼 특정 조건으로 데이터 찾으려면 메서드 이름 등록해야함
    Optional<User> findByEmail(String email);
    boolean existsByEmail(String email);

    Optional<User> findByNickname(String nickname);
    boolean existsByNickname(String nickname);
}
