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
    //이부분 추가
    private List<CommentResponseDto> comments;
    // [추가 필드] 트위터 스타일 UI를 위해 필요한 데이터
    private Long heartCount;    // 전체 하트 개수
    private boolean isHearted;  // 내가 이 글에 하트를 눌렀는지 여부

    // 1. 기존 생성자 (전체 조회, 상세 조회용)
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

    // 2. [추가] 엔티티만 받는 생성자 (게시글 작성 시 컨트롤러에서 사용)
    public PostResponseDto(Post post) {
        this.id = post.getId();
        this.title = post.getTitle();
        this.content = post.getContent();
        this.imageUrl = post.getImageUrl();
        this.view = post.getView();

        // 신규 작성 글이므로 기본값 설정
        this.heartCount = 0L;
        this.isHearted = false;

        this.userId = post.getUser().getId();

        // 신규 작성 시에는 댓글이 없으므로 빈 리스트 생성
        this.comments = new ArrayList<>();

        if (post.getUser() != null) {
            this.nickname = post.getUser().getNickname();
        }
    }
}
