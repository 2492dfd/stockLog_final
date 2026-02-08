package com.example.stockLog.tradelog.service;

import com.example.stockLog.tradelog.dto.StockInfoDto;
import org.springframework.stereotype.Component;

@Component
public class StockApiClient {
    public StockInfoDto searchByStockName(String name){
        // 지금은 연습용으로, "삼성전자"라고 치면 코드를 돌려주는 가짜 로직을 짭니다.
        if(name.contains("삼성")) {
            return new StockInfoDto("삼성전자", "005930", 75000.0);
        } else if(name.contains("애플")) {
            return new StockInfoDto("애플", "AAPL", 250000.0);
        }
        return new StockInfoDto("미등록 종목", "000000", 0.0);
    }
    }
