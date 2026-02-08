package com.example.stockLog.tradelog.dto;

import com.example.stockLog.tradelog.entity.*;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.util.Date;
import java.util.List;

@Getter
@NoArgsConstructor
public class DetailTradeLogResponseDto {//결산 및 통계 보기
    //작성용
    private Long logId; // 필드 추가
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
    private Double executionPrice; //체결 단가. 1주당 얼마 이런거
    private Double executedQuantity; //체결 수량
    private Double tradingCost; //매매 비용(수수료+세금)
    private Double totalCost;
    private String reasonForSale;
    private String reasonForBuy;
    private List<Tag> tag;

    private String dividendStockName;
    private Integer dividendPerMonth; //월별 배당수익
    // 엔티티를 DTO로 변환하는 생성자
    public DetailTradeLogResponseDto(TradeLog tradeLog) {
        this.logId = tradeLog.getId(); 
        this.marketType = tradeLog.getMarketType();
        this.stockName = tradeLog.getStockName();
        this.ticker = tradeLog.getTicker();
        this.broker = tradeLog.getBroker();
        this.tradeType = tradeLog.getTradeType();
        this.buyDate = tradeLog.getBuyDate();
        this.sellDate = tradeLog.getSellDate();
        this.holdingPeriod = tradeLog.getHoldingPeriod();
        this.realizedPL = tradeLog.getRealizedPL();
        this.rateOfReturn = tradeLog.getRateOfReturn();
        this.executionPrice = tradeLog.getExecutionPrice();
        this.executedQuantity = tradeLog.getExecutedQuantity();
        this.tradingCost = tradeLog.getTradingCost();
        this.totalCost = tradeLog.getTotalCost();
        this.reasonForSale = tradeLog.getReasonForSale();
        this.reasonForBuy = tradeLog.getReasonForBuy();
        this.tag=tradeLog.getTags();
    }
}
