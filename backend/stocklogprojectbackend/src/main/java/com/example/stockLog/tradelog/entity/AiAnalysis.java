package com.example.stockLog.tradelog.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@AllArgsConstructor
@NoArgsConstructor(access= AccessLevel.PROTECTED)
@Builder
@Getter
public class AiAnalysis {
    @Id
    @GeneratedValue(strategy= GenerationType.IDENTITY)
    private Long id;
    @MapsId
    @OneToOne
    @JoinColumn(name="tradelog_id")
    private TradeLog tradeLog;
    @Column(columnDefinition = "TEXT")
    private String content; //AI 분석 결과. 피드백
    public void updateContent(String newContent) {
        this.content=content;
    }
}
