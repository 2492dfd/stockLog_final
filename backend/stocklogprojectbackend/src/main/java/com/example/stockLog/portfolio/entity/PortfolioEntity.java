package com.example.stockLog.portfolio.entity;

import com.example.stockLog.community.entity.User;
import jakarta.persistence.*;
import lombok.*;

import java.util.Date;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PortfolioEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @Column(nullable = false)
    private String stockName;
    private String ticker;
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private User user;

    @Column(nullable = true, name="realizedpl") // DB 에러 방지를 위해 일단 true로 완화
    private Double realizedPL ; //실현손익

    @Column(name="rate_of_return")
    private Double rateOfReturn; //수익률

    @Column(nullable = true)
    private Double executionPrice; //평단가
    private Date buyDate; //구매날짜


    @Column(nullable = true)
    private Double executedQuantity; //구매수량

    @Column(nullable = true)
    private Double totalCost;


    public void updatePortfolio(){

    }
}
