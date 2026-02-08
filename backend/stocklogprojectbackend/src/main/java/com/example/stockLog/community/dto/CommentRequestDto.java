package com.example.stockLog.community.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
@Setter
@AllArgsConstructor
@Getter
@NoArgsConstructor
public class CommentRequestDto {
    private Long userId;
    private Long postId;
    private String text;
}
