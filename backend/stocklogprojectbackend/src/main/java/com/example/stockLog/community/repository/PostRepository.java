package com.example.stockLog.community.repository;

import com.example.stockLog.community.entity.Post;
import com.example.stockLog.community.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface PostRepository extends JpaRepository<Post, Long> {
    //이부분 공부하기. fetch join을 사용하여 User정보를 한번에 처리(N+1)방지
    @Query("select p from Post p join fetch p.user")
    List<Post> findAllWithUser();
    // 상세 조회 시 유저 정보를 한 번에 가져옴
    @Query("select p from Post p join fetch p.user where p.id = :postId")
    Optional<Post> findByIdWithUser(@Param("postId") Long postId);
    Long countByUser(User user);
    // (선택 사항) 특정 유저의 게시글 목록을 최신순으로 조회
    List<Post> findAllByUserOrderByCreatedAtDesc(User user);
}
