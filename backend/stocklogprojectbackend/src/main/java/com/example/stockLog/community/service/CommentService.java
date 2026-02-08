package com.example.stockLog.community.service;

import com.example.stockLog.community.entity.Comment;
import com.example.stockLog.community.entity.Post;
import com.example.stockLog.community.entity.User;
import com.example.stockLog.community.repository.CommentRepository;
import com.example.stockLog.community.repository.PostRepository;
import com.example.stockLog.community.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional
public class CommentService {
    private final UserRepository userRepository;
    private final CommentRepository commentRepository;
    private final PostRepository postRepository;

    //write, update, delete
    @Transactional
    public Long write(String email,Long postId,String text){
        User user=userRepository.findByEmail(email)
                .orElseThrow(()->new IllegalArgumentException("존재하지 않는 유저입니다."));
        Post post=postRepository.findById(postId)
                .orElseThrow(()->new IllegalArgumentException("존재하지 않는 게시글입니다."));
        Comment comment=Comment.builder()
                .user(user)
                .post(post)
                .text(text)
                .build();
        commentRepository.save(comment);
        return comment.getId();
    }
    @Transactional
    public void update(Long commentId, Long userId,String text){
        Comment comment=commentRepository.findById(commentId)
                .orElseThrow(()->new IllegalArgumentException("댓글이 없습니다."));

        // 댓글 작성자와 현재 요청한 유저가 같은지 확인
        if (!comment.getUser().getId().equals(userId)) {
            throw new IllegalStateException("본인의 댓글만 수정할 수 있습니다.");
        }

        comment.updateComment(text);
    }
    @Transactional
    public void delete(Long commentId, Long userId){
        Comment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new IllegalArgumentException("댓글이 없습니다."));

        if (!comment.getUser().getId().equals(userId)) {
            throw new IllegalStateException("본인의 댓글만 삭제할 수 있습니다.");
        }

        commentRepository.delete(comment);
    }

}
