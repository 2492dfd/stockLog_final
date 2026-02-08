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

    @Transactional
    public Post write(Long userIdFromToken, PostCreateRequestDto postCreateRequestDto) {
        //postRepository.save(post);
        //글 쓴 유저를 알아야 함
        User user=userRepository.findById(userIdFromToken)
                .orElseThrow(()->new IllegalArgumentException("존재하지 않는 유저입니다."));
        //유저와 게시글 연결
        Post post=Post.builder()
                .user(user)
                .title(postCreateRequestDto.getTitle())
                .content(postCreateRequestDto.getContent())
                .imageUrl(postCreateRequestDto.getImageUrl())
                .view(0L)
                .build();
        return postRepository.save(post);
    }
    @Transactional
    public void delete(Long postId) {
        postRepository.deleteById(postId);
    }
    @Transactional
    public void update(Long postId, PostUpdateRequestDto postUpdateRequestDto) {
        //postRepository.save(post);
        //save를 명시적으로 부르지 않음. 변경 감지
        Post post=postRepository.findById(postId)
                .orElseThrow(()-> new IllegalArgumentException("게시글이 없습니다."));
        post.updatePost(postUpdateRequestDto.getTitle(), postUpdateRequestDto.getContent(), postUpdateRequestDto.getImageUrl());
    }
    //뷰 증가
    @Transactional
    public PostResponseDto getPostDetail(Long postId, Long userId) {
        Post post = postRepository.findByIdWithUser(postId)
                .orElseThrow(() -> new IllegalArgumentException("게시글이 없습니다."));

        post.addView(); // 조회수 증가

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
    }
    @Transactional
    public List<PostResponseDto> getPostAll(Long userId){
        List<Post> posts = postRepository.findAllWithUser(); // DB에 있는 모든 게시글 가져옴

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
