package com.example.stockLog.portfolio.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.*;

import java.util.Date;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PortfolioRequestDto {
    private Long portfolioId;
    private String brokerage;
    private String stockName; //종목명
    private String ticker;
    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd", timezone = "Asia/Seoul")
    private Date buyDate; //구매날짜
    //private Double realizedPL ; //실현손익(구매한 비용에서 +-)
    //private Double rateOfReturn; //수익률
    private Double executionPrice; //평단가
    private Double executedQuantity; //구매수량
    //private Double totalCost; //구매한 비용
}
