package com.example.stockLog.community.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Getter
@AllArgsConstructor
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Builder
//하트 2번 누르면 사라짐 기능. 유튜브 좋아요..
@Table(
        uniqueConstraints = {
                @UniqueConstraint(
                        name = "unique_heart_user_post",
                        columnNames = {"user_id", "post_id"} // 유저ID와 포스트ID의 조합은 유일해야 함
                )
        }
)
public class Heart extends BaseTimeEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private User user;

    @ManyToOne(fetch=FetchType.LAZY)
    @JoinColumn(name="post_id")
    private Post post;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "comment_id")
    private Comment comment; // 이 변수명이 Comment 엔티티의 mappedBy와 일치해야 함
}
