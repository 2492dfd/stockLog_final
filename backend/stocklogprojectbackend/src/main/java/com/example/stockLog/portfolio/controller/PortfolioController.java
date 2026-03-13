package com.example.stockLog.portfolio.controller;

import com.example.stockLog.community.config.CustomUserDetails;
import com.example.stockLog.portfolio.dto.PortfolioRequestDto;
import com.example.stockLog.portfolio.dto.PortfolioResponseDto;
import com.example.stockLog.portfolio.dto.PortfolioSummaryDto;
import com.example.stockLog.portfolio.service.PortfolioService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/portfolio")
@RequiredArgsConstructor
@Slf4j // 로그 사용
public class PortfolioController {
    private final PortfolioService portfolioService;

    // 1. 보유 종목 추가
    @PostMapping("/write")
    public ResponseEntity<String> write(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @RequestBody PortfolioRequestDto dto) {
        log.info("포트폴리오 추가 요청 - 유저: {}, 종목: {}", userDetails.getUsername(), dto.getStockName());
        portfolioService.write(userDetails.getUser().getId(), dto);
        return ResponseEntity.ok("포트폴리오에 추가되었습니다.");
    }

    // 2. 보유 종목 수정
    @PatchMapping("/update/{portfolioId}")
    public ResponseEntity<String> update(
            @PathVariable Long portfolioId,
            @RequestBody PortfolioRequestDto dto) {
        portfolioService.update(portfolioId, dto);
        return ResponseEntity.ok("수정 완료되었습니다.");
    }
    @DeleteMapping("/delete/{portfolioId}")
    public ResponseEntity<String> delete(@PathVariable Long portfolioId) {
        portfolioService.delete(portfolioId);
        return ResponseEntity.ok("삭제되었습니다.");
    }

    // 3. 보유 종목 리스트 조회 (로그인 유저 ID 사용)
    @GetMapping("/list")
    public ResponseEntity<List<PortfolioResponseDto>> getPortfolioList(
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        Long userId = userDetails.getUser().getId();
        return ResponseEntity.ok(portfolioService.getPortfolioList(userId));
    }

    // 4. 전체 요약 정보 조회 (로그인 유저 ID 사용)
    @GetMapping("/summary")
    public ResponseEntity<PortfolioSummaryDto> getSummary(
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        Long userId = userDetails.getUser().getId();
        PortfolioSummaryDto summary = portfolioService.getPortfolioSummary(userId);
        return ResponseEntity.ok(summary);
    }
    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteStock(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @PathVariable Long id
    ) {
        portfolioService.deletePortfolioItem(userDetails.getUser().getId(), id);
        return ResponseEntity.ok("종목이 성공적으로 삭제되었습니다.");
    }
}
