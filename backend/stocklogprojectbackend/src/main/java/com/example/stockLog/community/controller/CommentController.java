package com.example.stockLog.community.controller;

import com.example.stockLog.community.dto.CommentRequestDto;
import com.example.stockLog.community.service.CommentService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/posts")
@RequiredArgsConstructor
public class CommentController {
    private final CommentService commentService;

    @PostMapping("/{postId}/comments")
    public ResponseEntity<Long> write(@PathVariable("postId") Long postId,@RequestBody CommentRequestDto commentRequestDto,
                                      @AuthenticationPrincipal UserDetails userDetails) {
        System.out.println("👉 주소에서 받은 postId: " + postId);
        System.out.println("👉 DTO에서 받은 text: " + commentRequestDto.getText());
        Long commentId=commentService.write(
                userDetails.getUsername(),
                postId,
                commentRequestDto.getText());
        return ResponseEntity.status(HttpStatus.CREATED).body(commentId);
    }
    @PatchMapping("/{commentId}")
    public ResponseEntity<Void> update(@RequestBody CommentRequestDto commentRequestDto, @PathVariable Long commentId) {
//commentId, usrId, text
        commentService.update(commentId,commentRequestDto.getUserId(),commentRequestDto.getText());
        return ResponseEntity.ok().build();
    }
    @DeleteMapping("/{commentId}")
    public ResponseEntity<Void> delete(@PathVariable Long commentId ,CommentRequestDto commentRequestDto) {
        commentService.delete(commentId, commentRequestDto.getUserId());
        return ResponseEntity.ok().build();
    }
}
