package com.example.stockLog.community.entity;

import jakarta.persistence.*;
import lombok.*;

import java.util.ArrayList;
import java.util.List;

@Entity
@Getter
@AllArgsConstructor
@NoArgsConstructor(access = AccessLevel.PROTECTED) //기본 생성자 접근 제어
//추가
@Builder
public class User extends BaseTimeEntity{
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @Column(nullable = false, unique = true)
    private String nickname;
    @Column(nullable = false, unique = true)
    private String email;
    @Column(nullable = false)
    private String password;
    private String profileImageUrl;
    @Column(columnDefinition = "TEXT") //긴문장 처리
    private String bio;

    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true) //1명의 유저는 여러 게시글
    @Builder.Default
    private List<Post> posts = new ArrayList<>();
    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<Heart> hearts = new ArrayList<>();
    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<Comment> comments = new ArrayList<>();

    @OneToMany(mappedBy = "follower")
    @Builder.Default
    List<Follow>  followers = new ArrayList<>();
    @OneToMany(mappedBy = "following")
    @Builder.Default
    List<Follow> followings = new ArrayList<>();
    //Follow를 거쳐 User로 전달
    public void updateProfile(String profileImageUrl,String nickname, String bio){
        this.profileImageUrl = profileImageUrl;
        this.nickname = nickname;
        this.bio = bio;
    }
    public void changePassword(String newPassword){
        this.password = newPassword;
    }

}
