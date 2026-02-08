package com.example.stockLog.community.dto;

import com.example.stockLog.community.entity.User;
import lombok.Getter;

import java.util.List;
import java.util.stream.Collectors;

@Getter
public class UserProfileResponseDto {
    private final Long userId;
    private final String nickname;
    private final String profileImageUrl;
    private final String bio; // 자기소개 (트위터 스타일)

    // 통계 정보
    private final Long postCount;
    private final Long followerCount;
    private final Long followingCount;

    // 이 유저가 작성한 최근 게시글 목록 (선택 사항)
    private final List<PostResponseDto> posts;

    public UserProfileResponseDto(User user, Long postCount, Long followerCount, Long followingCount) {
        this.userId = user.getId();
        this.nickname = user.getNickname();
        this.profileImageUrl = user.getProfileImageUrl();
        this.bio = user.getBio();
        this.postCount = postCount;
        this.followerCount = followerCount;
        this.followingCount = followingCount;

        // 유저 엔티티에 posts 리스트가 있다면 DTO로 변환
        this.posts = user.getPosts().stream()
                .map(post -> new PostResponseDto(post)) // 아까 만든 1개 인자 생성자 활용
                .collect(Collectors.toList());
    }
}
