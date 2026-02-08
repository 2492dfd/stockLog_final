package com.example.stockLog.community.service;

import com.example.stockLog.community.dto.FollowResponseDto;
import com.example.stockLog.community.entity.Follow;
import com.example.stockLog.community.entity.User;
import com.example.stockLog.community.repository.FollowRepository;
import com.example.stockLog.community.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.NoSuchElementException;
import java.util.stream.Collectors;

@Service
@Transactional
@RequiredArgsConstructor
public class FollowService {
    //heart처럼..
    //follow하면 +1, follow하기.(한번더누르면 unfollow) follow목록 조회, following목록 조회
    //follow하는 기능, 조회 2개
    private final FollowRepository followRepository;
    private final UserRepository userRepository;

    public void follow(Long followerId, Long followingId){
        if(followerId.equals(followingId)){
            throw new IllegalArgumentException("자기 자신을 팔로우 할 수 없습니다.");
        }
        //Follow객체 완성
       User follower=userRepository.findById(followerId)
               .orElseThrow(()->new IllegalArgumentException("팔로워를 찾을 수 없습니다. ")
       );
        User following=userRepository.findById(followingId)
                .orElseThrow(()->new IllegalArgumentException("팔로잉 대상을 찾을 수 없습니다."));
        //중복처럼 느껴지지만 체크 로직을 넣는 이유: 에러 메시지를 예쁘게 관리하기 위해서.
        if(followRepository.existsByFollowerAndFollowing(follower, following)){
            return; //이미 팔로우 중이면 안함
        }
        Follow follow=Follow.builder()
                .follower(follower)
                        .following(following)
                                .build();
        followRepository.save(follow);
    }
    public void unfollow(Long followerId, Long followingId){
        User follower=userRepository.findById(followerId)
                .orElseThrow();
        User following=userRepository.findById(followingId)
                .orElseThrow();
        //두 사람을 찾고 객체 관계인 Follow 객체 찾기
        Follow follow=followRepository.findByFollowerAndFollowing(follower, following)
                .orElseThrow(()->new IllegalArgumentException("팔로우 관계가 아닙니다."));
        followRepository.delete(follow);
        //deleteById로 하면 follow객체를 만들 이유가 뭐임? 아니 follow객체는 왜만듦?
    }
    @Transactional(readOnly = true)
    public boolean isFollowing(Long followerId, Long followingId){
        User follower=userRepository.findById(followerId).orElseThrow();
        User following=userRepository.findById(followingId).orElseThrow();
        return followRepository.existsByFollowerAndFollowing(follower, following);
    }
    public List<FollowResponseDto> getFollowers(Long userId) {
        //Followers 조회
        User user=userRepository.findById(userId)
                .orElseThrow(()->new IllegalArgumentException("사용자를 찾을 수 없습니다."));
       // List<Follow> users=followRepository.findAll(user);
        //dto로 변환하는 로직 추가
        List<Follow> followers=followRepository.findAllByFollowing(user);
        //엔티티를 dto로 변환하여 새로운 리스트에 담
        return followers.stream()
                .map(follow->{//Follow객체 하나를 follow라 부름
                    User f=follow.getFollower();
                    return new FollowResponseDto(f.getId(),f.getNickname(), f.getProfileImageUrl(), f.getBio());
                })
                .collect(Collectors.toList());
    }
    public List<FollowResponseDto> getFollowings(Long userId){
        User user=userRepository.findById(userId)
                .orElseThrow(()->new IllegalArgumentException("사용자를 찾을 수 없습니다."));
        List<Follow> following=followRepository.findAllByFollower(user);
        //엔티티를 dto로 변환하여 새로운 리스트에 담
        return following.stream()
                .map(follow->{
                    User f=follow.getFollowing();
                    return new FollowResponseDto(f.getId(),f.getNickname(), f.getProfileImageUrl(), f.getBio());
                })
                .collect(Collectors.toList());
    }
    public Long getFollowerCount(Long userId){
        User user=userRepository.findById(userId)
                .orElseThrow(()->new IllegalArgumentException("사용자를 찾을 수 없습니다."));
        return followRepository.countByFollowing(user);
    }

    public Long getFollowingCount(Long userId){
        User user=userRepository.findById(userId)
                .orElseThrow(()->new IllegalArgumentException("사용자를 찾을 수 없습니다."));
        return followRepository.countByFollower(user);
    }




}
