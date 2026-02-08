package com.example.stockLog.tradelog.dto;

import com.example.stockLog.tradelog.entity.TradeLog;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
public class SimpleTradeLogResponseDto {//결산 및 통계 보기
    private Long logId;
    private String stockName;
    private Double realizedPL; //실현손익
    private Double rateOfReturn; //수익률
    // ★ 이 생성자가 있어야 서비스의 .map(SimpleTradeLogResponseDto::new)이 작동합니다.
    public SimpleTradeLogResponseDto(TradeLog tradeLog) {
        this.logId=tradeLog.getId();
        this.stockName = tradeLog.getStockName();
        this.realizedPL = tradeLog.getRealizedPL();     // 엔티티 필드 사용
        this.rateOfReturn = tradeLog.getRateOfReturn(); // 엔티티 필드 사용
    }
}
