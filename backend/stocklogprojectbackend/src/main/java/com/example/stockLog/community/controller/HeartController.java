package com.example.stockLog.community.controller;

import com.example.stockLog.community.config.CustomUserDetails;
import com.example.stockLog.community.service.HeartService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/heart")
public class HeartController {
    //게시글에 , 댓글에 좋아요 취소 숫자 +, -
    private final HeartService heartService;
    @PostMapping("/post/{postId}")
    public ResponseEntity<Void> addPostHeart(@PathVariable Long postId, @AuthenticationPrincipal CustomUserDetails userDetails){
        heartService.postHeart(userDetails.getId(), postId);
        return  new ResponseEntity<>(HttpStatus.OK);
    }
    @PostMapping("/comment/{commentId}")
    public ResponseEntity<Void> addCommentHeart(@PathVariable Long commentId, @RequestParam Long userId){
        heartService.commentHeart(userId, commentId);
        return  new ResponseEntity<>(HttpStatus.OK);
    }
    @GetMapping("/post/{postId}/count")
    public ResponseEntity<Long> getPostHeartCount(@PathVariable Long postId){
        //개수 조회
        Long count=heartService.getPostCount(postId);
        return ResponseEntity.ok(count);
    }
    @GetMapping("/comment/{commentId}/count")
    public ResponseEntity<Long> getCommentHeartCount(@PathVariable Long commentId){
        Long count=heartService.getCommentCount(commentId);
        return ResponseEntity.ok(count);
    }
}
