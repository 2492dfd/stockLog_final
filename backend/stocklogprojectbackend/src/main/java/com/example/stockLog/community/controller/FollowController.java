package com.example.stockLog.community.controller;

import com.example.stockLog.community.config.CustomUserDetails;
import com.example.stockLog.community.dto.FollowRequestDto;
import com.example.stockLog.community.dto.FollowResponseDto;
import com.example.stockLog.community.entity.Follow;
import com.example.stockLog.community.service.FollowService;
import lombok.AllArgsConstructor;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/follow")
public class FollowController {
    private final FollowService followService;
    @PostMapping
    public ResponseEntity<Void> follow(@RequestBody FollowRequestDto followRequestDto, @AuthenticationPrincipal CustomUserDetails userDetails) {
        followService.follow(userDetails.getId(), followRequestDto.getFollowingId());
        return  ResponseEntity.ok().build();
    }
    @DeleteMapping
    public ResponseEntity<Void> unfollow(@RequestBody FollowRequestDto followRequestDto, @AuthenticationPrincipal CustomUserDetails userDetails){
        followService.unfollow(userDetails.getId(), followRequestDto.getFollowingId());
        return  ResponseEntity.ok().build();
    }
    @GetMapping("/{userId}/followers")
    public ResponseEntity<List<FollowResponseDto>> getFollower(@PathVariable Long userId){
        List<FollowResponseDto> followers=followService.getFollowers(userId);
        return ResponseEntity.ok(followers);
    }
    @GetMapping("/{userId}/following")
    public ResponseEntity<List<FollowResponseDto>>  getFollowing(@PathVariable Long userId){
        List<FollowResponseDto> following=followService.getFollowings(userId);
        return ResponseEntity.ok(following);
    }

}
