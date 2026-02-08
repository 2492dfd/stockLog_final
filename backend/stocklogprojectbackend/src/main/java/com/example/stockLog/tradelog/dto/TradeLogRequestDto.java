package com.example.stockLog.tradelog.dto;

import com.example.stockLog.tradelog.entity.*;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.Date;
import java.util.List;

@NoArgsConstructor
@Getter
public class TradeLogRequestDto {
    //작성용
    private MarketType marketType;
    private String stockName;
    private String ticker;
    private Broker broker;
    private TradeType tradeType; // BUY, SELL
    private Date buyDate;
    private Date sellDate;
    private Integer holdingPeriod;
    private Double realizedPL; //실현손익
    private Double rateOfReturn; //수익률
    private Double purchasePrice; //매도하기 기록할때 얼마에 샀는지
    private Double executionPrice; //체결 단가. 1주당 얼마 이런거
    private Double executedQuantity; //체결 수량
    private Double tradingCost; //매매 비용(수수료+세금)
    private Double totalCost;
    private String reasonForSale; //매도한 이유
    private String reasonForBuy; //매수한 이유
    private LocalDate tradeDate;
    private List<Tag> tags;
    private String chartImageUrl;

    private String dividendStockName;
    private Integer dividendPerMonth; //월별 배당수익


}
