package com.example.stockLog.tradelog.service;

import com.example.stockLog.tradelog.dto.GeminiRequest;
import com.example.stockLog.tradelog.entity.TradeLog;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;

import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class AiAnalysisService {
    @Value("${gemini.api.key}")
    private String apiKey;

    private final WebClient webClient;

    public String sendPrompt(String text) {
        String cleanKey = apiKey.trim();
        //내가 어디로 보낼지.
        String url = "https://generativelanguage.googleapis.com/v1/models?key=" + cleanKey;
        //google이 정한 규칙대로 포장.
        Map<String, Object> part = Map.of("text", text);
        Map<String, Object> content = Map.of("parts", List.of(part));
        Map<String, Object> body = Map.of("contents", List.of(content));
        //실제로 전달하는 부분
        try {
            return webClient.post()
                    .uri(url)
                    .bodyValue(body)
                    .retrieve()
                    //에러 조치하기 위해 .onStatus()
                    .onStatus(status -> status.isError(), response ->
                            response.bodyToMono(String.class).flatMap(error -> {
                                System.err.println("구글 응답 에러: " + error); // 여기서 진짜 에러 이유가 찍힙니다!
                                return Mono.error(new RuntimeException(error));
                            })
                    )
                    .bodyToMono(String.class)
                    .block();
        } catch (Exception e) {
            System.err.println("최종 실패: " + e.getMessage());
            return null;
        }
    }
}
