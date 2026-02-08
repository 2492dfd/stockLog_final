package com.example.stockLog.tradelog.dto;

import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
public class CalculateDto {//배당금 계산 관련..
    private String stockName;
    private Double quantity;

}
