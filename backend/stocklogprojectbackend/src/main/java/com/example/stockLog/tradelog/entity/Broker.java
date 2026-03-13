package com.example.stockLog.tradelog.entity;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonValue;
import lombok.Getter;
import lombok.RequiredArgsConstructor;

@Getter
@RequiredArgsConstructor
public enum Broker {
    // 주요 대형사
    //코드용 이름과 한글용 이름 분리.
    KIWOOM("키움증권", 0.00015, 0.001),            // 국내 0.015%, 해외 0.1%
    TOSS("토스증권", 0.0001, 0.001),               // 국내 0.01%, 해외 0.1%
    MIRAE_ASSET("미래에셋증권", 0.00014, 0.0025),    // 국내 0.014%, 해외 0.25%
    SAMSUNG("삼성증권", 0.00147, 0.0025),          // 국내 0.147%, 해외 0.25%
    KOREA_INVESTMENT("한국투자증권", 0.0014, 0.0025),
    NH_INVESTMENT("NH투자증권(나무)", 0.0001, 0.0025),
    KB_INVESTMENT("KB증권", 0.0012, 0.0025),
    SHINHAN_INVESTMENT("신한투자증권", 0.0013, 0.0025),
    HANA_INVESTMENT("하나증권", 0.0014, 0.0025),

    MERITZ("메리츠증권", 0.0015, 0.0025),
    DAISHIN("대신증권", 0.0015, 0.0025),
    YUANTA("유안타증권", 0.0015, 0.0025),
    EBEST("이베스트투자증권", 0.00015, 0.0025),
    KAKAO_PAY("카카오페이증권", 0.00015, 0.0025),
    ETC("기타/직접입력", 0.0, 0.0);

    private final String name;      // 증권사 한글명
    private final double domesticRate;   // 기본 수수료율 (소수점)
    private final double foreignRate;

    // 1. 프론트엔드에서 "키움증권"이라고 보내면 KIWOOM 상수를 찾아주는 마법
    @JsonCreator//프론트->서버
    public static Broker fromName(String value) {
        for (Broker broker : Broker.values()) {
            if (broker.getName().equals(value)) {
                return broker;
            }
        }
        // 만약 매칭되는 한글 이름이 없으면 영어 상수 이름으로도 한 번 더 찾아봄
        try {
            return Broker.valueOf(value);
        } catch (IllegalArgumentException e) {
            return ETC; // 정 없으면 기타로 반환 (혹은 에러 처리)
        }
    }

    @JsonValue //서버->프론트 , 이름으로 name으로 나가게됨
    //프론트에서 영문 받아서 한글로 바꿀 필요 없음. 직렬화
    public String getName() {
        return name;
    }

}
