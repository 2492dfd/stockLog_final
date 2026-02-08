package com.example.stockLog.community.repository;

import com.example.stockLog.community.entity.Comment;
import com.example.stockLog.community.entity.Heart;
import com.example.stockLog.community.entity.Post;
import com.example.stockLog.community.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface HeartRepository extends JpaRepository<Heart, Long> {
    Optional<Heart> findByUserAndPost(User user, Post post);
    Optional<Heart> findByUserAndComment(User user, Comment comment);
   /* Long getHeartCountByUserAndPost(User user, Post post);
    Long gearHeartCountByUserAndComment(User user, Comment comment);*/
    //이런식으로 하면 특정 유저가 특정 게시글에 남긴 하트 개수 셈. 0또는 1의 값만 나옴
   Long countByPost(Post post);
   Long countByComment(Comment comment);

    boolean existsByUserAndPost(User user, Post post);
}
