package com.example.stockLog.community.controller;

import com.example.stockLog.community.config.CustomUserDetails;
import com.example.stockLog.community.dto.PostCreateRequestDto;
import com.example.stockLog.community.dto.PostResponseDto;
import com.example.stockLog.community.dto.PostUpdateRequestDto;
import com.example.stockLog.community.entity.Post;
import com.example.stockLog.community.service.PostService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
@CrossOrigin(origins = "*")
@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class PostController {
    private final PostService postService;
    @PostMapping("/posts")
    public ResponseEntity<PostResponseDto> write(@AuthenticationPrincipal CustomUserDetails userDetails, @RequestBody PostCreateRequestDto postCreateRequestDto) {
        //id, title, content, imageUrl
        Post savedPost=postService.write(
               userDetails.getId(),
                postCreateRequestDto
        );
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(new PostResponseDto(savedPost));
    }
    @PutMapping("/posts/{postId}")
    public ResponseEntity<Void> update(@PathVariable Long postId, @RequestBody PostUpdateRequestDto postUpdateRequestDto) {
        postService.update(
                postId, postUpdateRequestDto
        );
        return ResponseEntity.ok().build();
    }
    @DeleteMapping("/posts/{postId}")
    public ResponseEntity<Void> delete(@PathVariable Long postId) {
        postService.delete(postId);
        return ResponseEntity.noContent().build();
    }
    @GetMapping("/posts")
    public ResponseEntity<List<PostResponseDto>> getAll(@RequestParam(required = false) Long userId) {
        // 1. 서비스에게 "모든 게시글을 DTO 리스트로 가져와줘"라고 시킵니다.
        List<PostResponseDto> responseList = postService.getPostAll(userId);
        // 2. 받은 리스트를 200 OK 상태 코드와 함께 상자에 담아 보냅니다.
        return ResponseEntity.ok(responseList);
    }
    @GetMapping("/posts/{postId}")
    public ResponseEntity<PostResponseDto> get(@PathVariable Long postId, @RequestParam(required = false)Long userId) {
        PostResponseDto postResponseDto=postService.getPostDetail(postId, userId);
        return ResponseEntity.ok(postResponseDto);
    }

}
