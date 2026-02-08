package com.example.stockLog.community.dto;

import com.example.stockLog.community.entity.Comment;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
public class CommentResponseDto {
    //댓글 조회용
    private Long id;
    private String nickname;
    private String text;
    public CommentResponseDto(Comment comment) {
        this.id = comment.getId();
        this.text = comment.getText();
        this.nickname = comment.getUser().getNickname();
    }
}
