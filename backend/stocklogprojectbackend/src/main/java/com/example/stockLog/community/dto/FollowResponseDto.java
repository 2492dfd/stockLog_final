package com.example.stockLog.community.dto;

import com.example.stockLog.community.entity.Follow;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.util.List;

@Getter
@NoArgsConstructor
@AllArgsConstructor
public class FollowResponseDto {
    /*private List<Follow> follower;
    private List<Follow> following;*/
    //Follow를 그대로 반환하면 순환참조 에러, 불필요한 정보 많음
    private Long userId;
    private String nickname;
    private String profileImage;
    private String bio;

    //앱에서 보여줄것!
}
