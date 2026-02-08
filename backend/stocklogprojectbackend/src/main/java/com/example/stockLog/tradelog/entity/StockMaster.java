package com.example.stockLog.tradelog.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Getter
@Table(name="stock_master")
@NoArgsConstructor
@AllArgsConstructor // new StockMaster(...)를 위한 생성자
public class StockMaster {//api 위한것
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @Column(nullable = false, unique = true)
    private String ticker;    // 005930.KS (PK)
    @Column(nullable = false)
    private String stockName; // 삼성전자
    private String marketType; // KOSPI

    // ... 기타 정보 (업종 등)
    public StockMaster(String ticker, String stockName, String marketType) {
        this.ticker = ticker;
        this.stockName = stockName;
        this.marketType = marketType;
    }
}
