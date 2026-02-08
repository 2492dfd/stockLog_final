package com.example.stockLog.tradelog.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AiAnalysisResponseDto {
    private String content; // AI가 분석한 최종 텍스트만 깔끔하게!
}
