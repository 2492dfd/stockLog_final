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
        // 1. 키 값에 혹시 모를 공백이 섞여있을 수 있으니 trim()으로 확실히 제거합니다.
        String cleanKey = apiKey.trim();

        // 2. 모델명과 주소를 한 글자의 오타도 없이 조립합니다. (v1beta 사용)
        String url = "https://generativelanguage.googleapis.com/v1/models?key=" + cleanKey;

        // 3. (중요) 실제 호출 직전의 URL 주소를 인텔리제이 콘솔에 찍어서 눈으로 확인합니다.
        System.out.println("🚨 [호출 주소 확인]: " + url);

        Map<String, Object> part = Map.of("text", text);
        Map<String, Object> content = Map.of("parts", List.of(part));
        Map<String, Object> body = Map.of("contents", List.of(content));

        try {
            System.out.println("🚨 호출 주소: " + url);

            return webClient.post()
                    .uri(url)
                    .bodyValue(body) // 🚀 정제된 바디 전달
                    .retrieve()
                    .onStatus(status -> status.isError(), response ->
                            response.bodyToMono(String.class).flatMap(error -> {
                                System.err.println("🚨 구글 응답 에러: " + error); // 여기서 진짜 에러 이유가 찍힙니다!
                                return Mono.error(new RuntimeException(error));
                            })
                    )
                    .bodyToMono(String.class)
                    .block();
        } catch (Exception e) {
            System.err.println("❌ 최종 실패: " + e.getMessage());
            return null;
        }
    }
}
