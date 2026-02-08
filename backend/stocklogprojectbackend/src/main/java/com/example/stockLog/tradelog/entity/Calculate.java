package com.example.stockLog.tradelog.entity;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Entity
@Getter
@NoArgsConstructor
@Builder
@AllArgsConstructor
public class Calculate {
    //관련해서 만들것: 배당금 계산기
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String stockName;
    private String ticker; //이 종목 코드는 API 연동 대비해서..
    private double quantity; //가진 주수

    private double dividendPerShare; //1주당 배당금

    //지급일!!!
    private LocalDate paymentDate; //배당 지급일


    public void updateDividend(String stockName, double quantity) {
        this.stockName = stockName;
        this.quantity = quantity;
        //지급될 배당금은 위에 2개 입력하면 알아서 계산되지 않나..?
    }

}
