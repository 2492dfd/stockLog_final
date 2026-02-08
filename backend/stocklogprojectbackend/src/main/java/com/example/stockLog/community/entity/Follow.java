package com.example.stockLog.community.entity;

import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;

import java.time.LocalDateTime;

@Entity
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder
@Table(
        name = "follow",
        uniqueConstraints = {
                @UniqueConstraint(
                        name = "uk_follow_follower_following",
                        columnNames = {"follower_id", "following_id"} // 이 두 조합은 유일해야 함!
                )
        }
)
public class Follow extends BaseTimeEntity{
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name="follower_id")
    private User follower;

    @ManyToOne
    @JoinColumn(name="following_id")
    private User following;

}
