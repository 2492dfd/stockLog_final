package com.example.stockLog.community.service;

import com.example.stockLog.community.dto.PostCreateRequestDto;
import com.example.stockLog.community.dto.PostResponseDto;
import com.example.stockLog.community.dto.PostUpdateRequestDto;
import com.example.stockLog.community.entity.Post;
import com.example.stockLog.community.entity.User;
import com.example.stockLog.community.repository.HeartRepository;
import com.example.stockLog.community.repository.PostRepository;
import com.example.stockLog.community.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class PostService {
    private final PostRepository postRepository;
    private final HeartRepository heartRepository;
    private final UserRepository userRepository; //유저 정보 추가

    public Post write(Long userIdFromToken, PostCreateRequestDto postCreateRequestDto) {
        User user=userRepository.findById(userIdFromToken)
                .orElseThrow(()->new IllegalArgumentException("존재하지 않는 유저입니다."));
        Post post=Post.builder()
                .user(user)
                .title(postCreateRequestDto.getTitle())
                .content(postCreateRequestDto.getContent())
                .imageUrl(postCreateRequestDto.getImageUrl())
                .build();
        return postRepository.save(post);
    }
    public void delete(Long postId) {
        postRepository.deleteById(postId);
    }
    public void update(Long postId, PostUpdateRequestDto postUpdateRequestDto) {
        Post post=postRepository.findById(postId)
                .orElseThrow(()-> new IllegalArgumentException("게시글이 없습니다."));
        post.updatePost(postUpdateRequestDto.getTitle(), postUpdateRequestDto.getContent(), postUpdateRequestDto.getImageUrl());
    }
    //뷰 증가. 좋아요수 관리
    public PostResponseDto getPostDetail(Long postId, Long userId) {
        Post post = postRepository.findByIdWithUser(postId)
                .orElseThrow(() -> new IllegalArgumentException("게시글이 없습니다."));

        post.addView(); // 조회수 증가

        Long count = heartRepository.countByPost(post);
        boolean hearted = false;
        if (userId != null) {//해킹 방지용..? 프론트엔드 거치지 않고 해킹 가능. 이중 체킹
            // 로그인한 사용자의 경우에만 좋아요 여부 확인
            User user = userRepository.findById(userId)
                    .orElse(null); // 사용자가 없을 수도 있으므로 orElse(null) 처리
            if (user != null) {
                hearted = heartRepository.existsByUserAndPost(user, post);
            }
        }

        return new PostResponseDto(post, count, hearted);
    }

    public List<PostResponseDto> getPostAll(Long userId){
        List<Post> posts = postRepository.findAllWithUser(); // DB에 있는 모든 게시글 가져옴
        //fetch join해서 user까지 한꺼번에 가져옴

        return posts.stream()
                .map(post -> {
                    Long count = heartRepository.countByPost(post);
                    boolean hearted = false;
                    if (userId != null) {
                        // 로그인한 사용자의 경우에만 좋아요 여부 확인
                        User user = userRepository.findById(userId)
                                .orElse(null); // 사용자가 없을 수도 있으므로 orElse(null) 처리
                        if (user != null) {
                            hearted = heartRepository.existsByUserAndPost(user, post);
                        }
                    }
                    return new PostResponseDto(post, count, hearted);
                }).collect(Collectors.toList());
    }
}
