package com.example.stockLog.tradelog.entity;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonValue;
import lombok.Getter;

@Getter
public enum Tag {
    ImpulsiveTrading("뇌동매매"),
    StopLossViolation("손절 미준수"),
    PanicBuying("추격 매수"),
    PanicSelling("공포 매도"),
    PositionSizingError("비중 조절 실패");

    private final String description;

    // 생성자
    Tag(String description) {
        this.description = description;
    }

    @JsonValue // 🚀 나갈 때(JSON 변환 시) description 값을 사용
    public String getDescription() {
        return description;
    }

    @JsonCreator // 🚀 들어올 때(JSON 파싱 시) description 값으로 매칭
    public static Tag from(String value) {
        for (Tag tag : Tag.values()) {
            if (tag.getDescription().equals(value)) {
                return tag;
            }
        }
        return null; // 혹은 예외 처리
    }
}
