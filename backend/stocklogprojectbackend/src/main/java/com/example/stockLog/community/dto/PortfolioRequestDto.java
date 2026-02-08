package com.example.stockLog.community.dto;

import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
public class PortfolioRequestDto {
    private String stockName;
    private double stockPerPrice; //종목당 얼마
}
