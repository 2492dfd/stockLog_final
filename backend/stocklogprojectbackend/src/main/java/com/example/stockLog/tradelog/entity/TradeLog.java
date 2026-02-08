package com.example.stockLog.tradelog.entity;

import com.example.stockLog.community.entity.*;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;
import java.util.stream.Collectors;

@Entity
@NoArgsConstructor(access= AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder
@Getter
public class TradeLog extends BaseTimeEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private User user;

    @Enumerated(EnumType.STRING)
    private MarketType marketType;

    @Column(nullable = false)
    private String stockName;

    private String ticker;

    @Enumerated(EnumType.STRING)
    private Broker broker;

    @Enumerated(EnumType.STRING)
    private TradeType tradeType;

    private Date buyDate;
    private Date sellDate;
    private String chartImageUrl;
    @Builder.Default
    private Integer holdingPeriod = 0; // null 방지 기본값

    @Builder.Default
    @Column(nullable = true, name="realizedpl") // DB 에러 방지를 위해 일단 true로 완화
    private Double realizedPL = 0.0;

    @Column(name="rate_of_return")
    private Double rateOfReturn;

    @Builder.Default
    @Column(nullable = true)
    private Double executionPrice = 0.0;

    @Builder.Default
    @Column(nullable = true)
    private Double executedQuantity = 0.0;

    // 🚨 이번 에러의 주범: purchasePrice에 기본값과 null 허용 추가
    @Builder.Default
    @Column(nullable = true)
    private Double purchasePrice = 0.0;

    @Builder.Default
    @Column(nullable = true)
    private Double tradingCost = 0.0;

    @Builder.Default
    @Column(nullable = true)
    private Double totalCost = 0.0;

    @Column(columnDefinition = "TEXT")
    private String reasonForSale;
    @Column(columnDefinition = "TEXT")
    private String reasonForBuy; //매수한 이유


    private LocalDate tradeDate;

    private Integer marketFearIndex;

    @Column(columnDefinition = "TEXT")
    private String aiPersonalEvaluation;

    @Enumerated(EnumType.STRING)
    private EvaluationStatus evaluationStatus;

    @ElementCollection(targetClass = Tag.class)
    @CollectionTable(name = "trade_log_tags", joinColumns = @JoinColumn(name = "trade_log_id"))
    @Enumerated(EnumType.STRING)
    @Column(name = "tag_name")
    @Builder.Default
    private List<Tag> tags = new ArrayList<>();

    @Builder.Default
    @Column(name = "base_amount", nullable = true)
    private Double baseAmount = 0.0;

    @Builder.Default
    private Double fee = 0.0;

    @Builder.Default
    @Column(name = "tax", nullable = true)
    private Double tax = 0.0;

    private String dividendStockName;
    private Integer dividendPerMonth;
    public String getTagsAsString() {
        if (this.tags == null || this.tags.isEmpty()) {
            return "없음";
        }
        return this.tags.stream()
                .map(tag -> tag.getDescription()) // Tag enum에 getDescription()이 있어야 합니다.
                .collect(Collectors.joining(", "));
    }

    // --- 메서드 영역 ---
    public void initStatus() {
        this.evaluationStatus = EvaluationStatus.PENDING;
    }

    public void markAsAnalyzing() {
        this.evaluationStatus = EvaluationStatus.IN_PROGRESS;
    }

    public void competeAnalysis(String feedback) {
        this.evaluationStatus = EvaluationStatus.COMPLETED;
        this.aiPersonalEvaluation = feedback;
    }

    public void updateTradeLog(MarketType marketType, String stockName, String ticker, // ticker 추가
                               Broker broker, TradeType tradeType, Date buyDate, Date sellDate,
                               Integer holdingPeriod, Double realizedPL, Double rateOfReturn,
                               Double executionPrice, Double executedQuantity, Double tradingCost,
                               Double totalCost, String reasonForSale, String reasonForBuy, List<Tag> tags, String chartImageUrl) {

        // 🚀 null 체크를 꼼꼼히 해서 값이 있을 때만 교체
        if (marketType != null) this.marketType = marketType;
        if (stockName != null) this.stockName = stockName;
        if (ticker != null) this.ticker = ticker; // 누락되었던 티커 추가
        if (broker != null) this.broker = broker;
        if (tradeType != null) this.tradeType = tradeType; // 👈 매수/매도 타입 업데이트
        if (buyDate != null) this.buyDate = buyDate;
        if (sellDate != null) this.sellDate = sellDate;
        if (holdingPeriod != null) this.holdingPeriod = holdingPeriod;
        if (realizedPL != null) this.realizedPL = realizedPL;
        if (rateOfReturn != null) this.rateOfReturn = rateOfReturn;
        if (executionPrice != null) this.executionPrice = executionPrice;
        if (executedQuantity != null) this.executedQuantity = executedQuantity;
        if (tradingCost != null) this.tradingCost = tradingCost;
        if (totalCost != null) this.totalCost = totalCost;
        if (reasonForSale != null) this.reasonForSale = reasonForSale;
        if(reasonForBuy != null) this.reasonForBuy = reasonForBuy;
        if (tags != null) this.tags = tags;
        if(this.chartImageUrl !=null)this.chartImageUrl = this.chartImageUrl;

        this.initStatus(); // 수정 시 AI 분석 상태 초기화
    }

    public void setStockName(String correctName) {
        if (correctName != null && !correctName.isEmpty()) {
            this.stockName = correctName;
        }
    }
}