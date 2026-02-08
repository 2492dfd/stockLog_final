package com.example.stockLog.graph.dto;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Setter
@Getter
@NoArgsConstructor
public class StrategyResponseDto {
    private double realizedPL;
    private int month;
    //service에서 new로 객체 만들기때문에 덮어씌워지지 않음
    public StrategyResponseDto(int currentMonth, double monthlySum) {
        this.month = currentMonth;
        this.realizedPL = monthlySum;
    }
}
