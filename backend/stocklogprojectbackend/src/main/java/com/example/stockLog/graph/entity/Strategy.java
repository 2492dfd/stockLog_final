package com.example.stockLog.graph.entity;

import com.example.stockLog.community.entity.User;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;

@Entity
@Getter
@NoArgsConstructor(access= AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder
public class Strategy {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    //LocalDate는 연, 월, 일 정보 모두 담음
    private LocalDate date; //x축
    private double realizedPL;
    //누구의 그래프인지 알아야 함
    //한명의 사용자는 여러 달의 통계 데이터를 가져야 함. @OneToOne으로 하면 한달치 사용지밖에 조회 못함
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name="user_id")
    private User user;
    //전체 보기는 나중에 구현. 누적 수익

}
