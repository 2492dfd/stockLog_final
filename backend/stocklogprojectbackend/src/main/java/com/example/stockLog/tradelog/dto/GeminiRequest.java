package com.example.stockLog.tradelog.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.util.List;

@Getter
@AllArgsConstructor
@NoArgsConstructor  // 1. 기본 생성자 추가
public class GeminiRequest {
    //내부 클래스에 static을 붙여야 외부에서 new GeminiRequest.Content(...) 와 같은
    //방식으로 자유롭게 객체 생성 가능
    private List<Content> contents;
    @Getter
    @AllArgsConstructor
    @NoArgsConstructor  // 1. 기본 생성자 추가
    public static class Content {
        private List<Part> parts;
    }
    @Getter
    @AllArgsConstructor
    @NoArgsConstructor  // 1. 기본 생성자 추가
    public static class Part {
        private String text;
    }
}
