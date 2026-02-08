package com.example.stockLog.community.entity;

import jakarta.persistence.*;
import lombok.*;

import java.util.ArrayList;
import java.util.List;

@Entity
@Getter
@Builder
@AllArgsConstructor
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Post extends BaseTimeEntity{
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String imageUrl;
    @Column(nullable = false)
    private String title;
    @Column(columnDefinition = "TEXT")
    private String content;
    @Builder.Default
    private Long view=0L;
    @ManyToOne(fetch = FetchType.LAZY) // 4. 작성자 연결 (N:1)
    @JoinColumn(name = "user_id")
    private User user;

    @OneToMany(mappedBy = "post", cascade = CascadeType.ALL) // 5. 댓글 연결 (1:N)
    @Builder.Default
    private List<Comment> comments = new ArrayList<>();

    @OneToMany(mappedBy = "post", cascade = CascadeType.ALL)
    @Builder.Default
    private List<Heart> hearts = new ArrayList<>();

    public void updatePost(String newTitle, String newContent, String newImageUrl){
        //entity의 update 메서드에서는 보통 dto가 보낸 값만 받음.
        this.title=newTitle;
        this.content=newContent;
        this.imageUrl=newImageUrl;
    }
    public void addView(){
        this.view++;
    }


}
