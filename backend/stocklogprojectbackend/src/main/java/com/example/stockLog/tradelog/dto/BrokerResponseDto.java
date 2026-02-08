package com.example.stockLog.tradelog.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
@AllArgsConstructor
public class BrokerResponseDto {//api 관련. 종목 api
    private String code; // 서버 저장용 (예: KIWOOM)
    private String name; // 화면 표시용 (예: 키움증권)
}
