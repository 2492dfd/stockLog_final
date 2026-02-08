package com.example.stockLog.tradelog.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@NoArgsConstructor
@AllArgsConstructor
@Setter
public class StockInfoDto {//api 관련
    private String stockName;
    private String ticker;
    private Double currentPrice;
}
