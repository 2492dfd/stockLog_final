package com.example.stockLog.tradelog.entity;

import lombok.Setter;


public enum EvaluationStatus {
    //AI분석이 끝났는지 안끝났는지
    PENDING,    //분석 대기 중
    COMPLETED,  //분석 완료
    IN_PROGRESS  //AI가 분석하는 중
}
