package com.example.stockLog.community.repository;

import com.example.stockLog.community.entity.Follow;
import com.example.stockLog.community.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import javax.swing.text.html.Option;
import java.util.List;
import java.util.Optional;

public interface FollowRepository extends JpaRepository<Follow,Long> {
        boolean existsByFollowerAndFollowing(User follower, User following);
        Optional<Follow> findByFollowerAndFollowing(User follower, User following);
        //특정 사용자를 팔로우하는 모든 관계 찾기
        List<Follow> findAllByFollowing(User user);
        List<Follow> findAllByFollower(User user);
        Long countByFollowing(User user);
        Long countByFollower(User user);
}
