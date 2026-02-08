package com.example.stockLog.tradelog.dto;

import com.example.stockLog.tradelog.entity.TradeLog;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Getter;

import java.util.List;
@Getter
public class TradeSummaryDto {//총 실현수익, 수익률
    private final Double totalRealizedPL;
    @JsonProperty("averageRateOfReturn")
    private final Double averageRateOfReturn; //평균 수익률

    public TradeSummaryDto(List<TradeLog> logs, Double totalPL) {
        System.out.println("📊 조회된 로그 개수: " + logs.size());
        if (!logs.isEmpty()) {
            System.out.println("💰 첫 번째 로그의 수익: " + logs.get(0).getRealizedPL());
        }
        this.totalRealizedPL = totalPL;
        for (TradeLog log : logs) {
            System.out.println("📊 종목: " + log.getStockName() + " | 수익률(Rate): " + log.getRateOfReturn());
        }

        this.averageRateOfReturn = logs.stream()
                .map(TradeLog::getRateOfReturn)
                .filter(java.util.Objects::nonNull) // 🚀 0.0은 포함하고, 데이터가 없는 null만 제외!
                .mapToDouble(Double::doubleValue)
                .average()
                .orElse(0.0);
    }
}
