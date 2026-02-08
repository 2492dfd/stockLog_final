package com.example.stockLog.community.entity;

import jakarta.persistence.*;
import lombok.*;

import java.util.ArrayList;
import java.util.List;

@Entity
@Getter
@Builder
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
public class Comment extends BaseTimeEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @Column(nullable = false)
    private String text;
    @OneToMany(mappedBy = "comment", cascade = CascadeType.ALL)
    @Builder.Default
    //댓글에 누르는 좋아요. 내가 좋아요한 글/댓글 모아보기 위해
    private List<Heart> hearts = new ArrayList<>();
    //추가
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private User user; // 1. 댓글 작성자 (ManyToOne으로 가져오는 게 맞습니다!)

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "post_id")
    private Post post; // 2. 댓글이 달린 게시글

    public void updateComment(String newText){
        this.text = newText;
    }
}
