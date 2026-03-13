package com.example.stockLog.community.dto;

import com.example.stockLog.community.entity.Post;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Getter
@NoArgsConstructor
public class PostResponseDto {
    //상세목록, 전체 목록 조회용
    private Long id;
    private String title;
    private String content;
    private String nickname;
    private String imageUrl;
    private Long view;
    private Long userId; // 작성자 ID 추가
    private List<CommentResponseDto> comments;
    private Long heartCount;    // 전체 하트 개수
    private boolean isHearted;  // 하트를 눌렀는지 여부

    //상세보기
    public PostResponseDto(Post post, Long heartCount, boolean isHearted) {
        this.id = post.getId();
        this.title = post.getTitle();
        this.content = post.getContent();
        this.imageUrl = post.getImageUrl();
        this.view = post.getView();
        this.heartCount = heartCount;
        this.isHearted = isHearted;
        this.userId = post.getUser().getId();
        this.comments = post.getComments().stream()
                .map(CommentResponseDto::new)
                .collect(Collectors.toList());
        if (post.getUser() != null) {
            this.nickname = post.getUser().getNickname();
        }
    }

    //그냥 피드에 보이는 방식
    public PostResponseDto(Post post) {
        this.id = post.getId();
        this.title = post.getTitle();
        this.content = post.getContent();
        this.imageUrl = post.getImageUrl();
        this.view = post.getView();
        //밑에 주석부분 어케하지
        // this.heartCount = 0L;
        this.isHearted = false;

        this.userId = post.getUser().getId();
        this.comments = new ArrayList<>();

        if (post.getUser() != null) {
            this.nickname = post.getUser().getNickname();
        }
    }
}
