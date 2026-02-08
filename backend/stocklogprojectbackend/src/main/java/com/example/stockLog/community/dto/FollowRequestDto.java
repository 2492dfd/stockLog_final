package com.example.stockLog.community.dto;

import com.example.stockLog.community.entity.User;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
public class FollowRequestDto {
    //기능
   /* private User Follower;
    private User following;*/
    //dto안에 엔티티 넣지 않음.
    private Long followerId;
    private Long followingId;
}
