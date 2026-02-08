package com.example.stockLog.tradelog.dto;

import com.example.stockLog.tradelog.entity.StockMaster;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
@AllArgsConstructor
public class StockMasterResponseDto {
    private String ticker; // 종목 코드 (예: AAPL, 005930)
    private String stockName; // 종목 명 (예: 애플, 삼성전자)

    public StockMasterResponseDto(StockMaster stockMaster) {
        this.ticker = stockMaster.getTicker();
        this.stockName = stockMaster.getStockName();
    }
}
