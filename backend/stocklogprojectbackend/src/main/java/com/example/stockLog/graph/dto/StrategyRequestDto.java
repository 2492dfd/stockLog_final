package com.example.stockLog.graph.dto;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Setter
@Getter
@NoArgsConstructor
public class StrategyRequestDto {
    //연도 선택하면 그래프 나타남
    //LocalDate는 연/월/일 다 선택하기 때문에 간단하게 연도만 선택할떄는 int
    private int year;
}
