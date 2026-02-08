package com.example.stockLog.community.config;

import com.example.stockLog.community.entity.User;
import lombok.Getter;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.ArrayList;
import java.util.Collection;

@Getter
public class CustomUserDetails implements UserDetails {
    private final User user; // 우리 프로젝트의 실제 User 엔티티

    public CustomUserDetails(User user) {
        this.user = user;
    }

    // [핵심] 컨트롤러에서 userDetails.getId()로 바로 꺼내 쓸 수 있게 추가
    public Long getId() {
        return user.getId();
    }

    // 권한 설정 (현재는 기본 ROLE_USER로 설정)
    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        Collection<GrantedAuthority> authorities = new ArrayList<>();
        authorities.add(() -> "ROLE_USER");
        return authorities;
    }

    @Override
    public String getPassword() {
        return user.getPassword();
    }

    @Override
    public String getUsername() {
        return user.getEmail(); // 또는 user.getNickname() 등 로그인 아이디로 쓰는 필드
    }

    // 계정 만료 여부 등 (기본 true 설정)
    @Override
    public boolean isAccountNonExpired() { return true; }

    @Override
    public boolean isAccountNonLocked() { return true; }

    @Override
    public boolean isCredentialsNonExpired() { return true; }

    @Override
    public boolean isEnabled() { return true; }
}
