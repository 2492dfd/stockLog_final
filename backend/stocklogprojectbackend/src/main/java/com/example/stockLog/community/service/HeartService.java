package com.example.stockLog.community.service;

import com.example.stockLog.community.entity.Comment;
import com.example.stockLog.community.entity.Heart;
import com.example.stockLog.community.entity.Post;
import com.example.stockLog.community.entity.User;
import com.example.stockLog.community.repository.CommentRepository;
import com.example.stockLog.community.repository.HeartRepository;
import com.example.stockLog.community.repository.PostRepository;
import com.example.stockLog.community.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
@RequiredArgsConstructor
public class HeartService {
    //post, comment에 heart
    private final HeartRepository heartRepository;
    private final PostRepository postRepository;
    private final CommentRepository commentRepository;
    private final UserRepository userRepository;

    public void postHeart(Long userId,Long postId){
        User user=userRepository.findById(userId).orElseThrow();
        Post post=postRepository.findById(postId).orElseThrow();

        // 이미 좋아요를 눌렀는지 확인 (HeartRepository에 메서드 추가 필요)
        heartRepository.findByUserAndPost(user, post)
                .ifPresentOrElse(
                        heart -> heartRepository.delete(heart), // 있으면 삭제 (취소)
                        () -> heartRepository.save(Heart.builder().user(user).post(post).build()) // 없으면 저장
                );
    }
    public void commentHeart(Long userId, Long commentId){
        User user = userRepository.findById(userId).orElseThrow();
        Comment comment = commentRepository.findById(commentId).orElseThrow();

        heartRepository.findByUserAndComment(user, comment)
                .ifPresentOrElse(
                        heart -> heartRepository.delete(heart), // 있으면 삭제
                        () -> heartRepository.save(Heart.builder().user(user).comment(comment).build()) // 없으면 저장
                );
    }
    public Long getPostCount(Long postId){
        Post post=postRepository.findById(postId).orElseThrow(()->new IllegalArgumentException("게시글이 없습니다."));
        return heartRepository.countByPost(post);
    }
    public Long getCommentCount(Long commentId){
        Comment comment=commentRepository.findById(commentId).orElseThrow(()->new IllegalArgumentException("댓글이 없습니다."));
        return heartRepository.countByComment(comment);
    }

}
