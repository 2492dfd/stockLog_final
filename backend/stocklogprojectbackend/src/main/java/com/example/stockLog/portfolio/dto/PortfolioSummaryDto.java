package com.example.stockLog.portfolio.dto;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PortfolioSummaryDto {
    private Double totalRealizedPL; //+얼마 아니면 - 얼마인지
    private Double averageRateOfReturn;
    private Double totalCost; //1주당가격x수량
    private Double totalValue;
}
