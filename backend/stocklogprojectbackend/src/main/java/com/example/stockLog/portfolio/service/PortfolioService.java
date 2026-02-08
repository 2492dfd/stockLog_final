package com.example.stockLog.portfolio.service;

import com.example.stockLog.community.entity.User;
import com.example.stockLog.community.repository.UserRepository;
import com.example.stockLog.portfolio.dto.PortfolioRequestDto;
import com.example.stockLog.portfolio.dto.PortfolioResponseDto;
import com.example.stockLog.portfolio.dto.PortfolioSummaryDto;
import com.example.stockLog.portfolio.entity.PortfolioEntity;
import com.example.stockLog.portfolio.repostiory.PortfolioRepository;
import com.example.stockLog.tradelog.dto.StockInfoDto;
import com.example.stockLog.tradelog.service.StockDataService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
@RequiredArgsConstructor
@Slf4j
public class PortfolioService {
    private final PortfolioRepository portfolioRepository;
    private final UserRepository userRepository;
    private final StockDataService stockDataService;
    private final GoogleSheetsService googleSheetsService; // 🚀 시트 서비스 주입

    /**
     * 포트폴리오 저장
     */
    public void write(Long userId, PortfolioRequestDto dto) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("사용자가 존재하지 않습니다."));

        // 1. 시트 사전(TickerMap)에서 종목명 혹은 별칭으로 검색
        String[] stockData = googleSheetsService.findTickerAndMarket(dto.getStockName());

        String finalTicker;
        String market;

        if (stockData != null) {
            // 사전에 등록된 경우 (예: "나이키" 입력 -> "NKE" 반환)
            finalTicker = stockData[0];
            market = stockData[1];
        } else {
            // 🚀 사전에 없는 경우: 입력값 자체가 티커라고 가정 (예: "AAPL" 직접 입력)
            finalTicker = dto.getStockName().toUpperCase().replace(" ", "");

            // 간단한 판별: 숫자로만 된 6자리면 국장(KRX), 영문이면 미장(USA)
            if (finalTicker.matches("\\d{6}")) {
                market = "KRX";
            } else {
                market = "USA";
            }
        }

        // 2. 구글 시트 메인(시트1)에 기록 (현재가 호출용)
        googleSheetsService.appendTicker(finalTicker, market);

        // 3. 현재가 조회 및 저장 (나머지 로직 동일)
        double currentPrice = fetchCurrentPriceFromSheet(finalTicker);
        double price = (dto.getExecutionPrice() != null) ? dto.getExecutionPrice() : 0.0;
        double quantity = (dto.getExecutedQuantity() != null) ? dto.getExecutedQuantity() : 0.0;

        // 4. 초기 손익 계산
        double unrealizedPL = (currentPrice > 0) ? (currentPrice - price) * quantity : 0.0;
        double rateOfReturn = (price > 0 && currentPrice > 0) ? ((currentPrice - price) / price) * 100 : 0.0;

        PortfolioEntity portfolioEntity = PortfolioEntity.builder()
                .user(user)
                .stockName(dto.getStockName())
                .ticker(finalTicker)
                .buyDate(dto.getBuyDate())
                .executedQuantity(quantity)
                .executionPrice(price)
                .totalCost(price * quantity)
                .realizedPL(unrealizedPL)
                .rateOfReturn(rateOfReturn)
                .build();

        portfolioRepository.save(portfolioEntity);
        log.info("포트폴리오 저장 완료: {} ({})", dto.getStockName(), finalTicker);
    }
    public void update(Long portfolioId, PortfolioRequestDto dto) {
        // 1. 기존 기록 찾기
        PortfolioEntity portfolio = portfolioRepository.findById(portfolioId)
                .orElseThrow(() -> new IllegalArgumentException("해당 기록을 찾을 수 없습니다."));

        // 2. 현재가 다시 가져오기 (수정 시점의 수익률 갱신용)
        double currentPrice = fetchCurrentPriceFromSheet(portfolio.getTicker());

        double newPrice = (dto.getExecutionPrice() != null) ? dto.getExecutionPrice() : portfolio.getExecutionPrice();
        double newQuantity = (dto.getExecutedQuantity() != null) ? dto.getExecutedQuantity() : portfolio.getExecutedQuantity();
        double newTotalCost = newPrice * newQuantity;

        // 3. 갱신된 정보로 수익률 및 손익 재계산
        double unrealizedPL = (currentPrice > 0) ? (currentPrice - newPrice) * newQuantity : 0.0;
        double rateOfReturn = (newPrice > 0 && currentPrice > 0) ? ((currentPrice - newPrice) / newPrice) * 100 : 0.0;

        // 4. 엔티티 업데이트 (Dirty Checking에 의해 자동 저장됨)
        portfolio.setExecutionPrice(newPrice);
        portfolio.setExecutedQuantity(newQuantity);
        portfolio.setTotalCost(newTotalCost);
        portfolio.setRealizedPL(unrealizedPL);
        portfolio.setRateOfReturn(rateOfReturn);

        // 만약 매수일도 수정 가능하다면 추가
        if (dto.getBuyDate() != null) {
            portfolio.setBuyDate(dto.getBuyDate());
        }

        log.info("포트폴리오 수정 완료: ID {}, 종목 {}", portfolioId, portfolio.getStockName());
    }

    public void deletePortfolioItem(Long userId, Long portfolioId) {
        // 1. 해당 사용자의 포트폴리오 아이템이 맞는지 먼저 확인 (보안 강화)
        PortfolioEntity portfolio = portfolioRepository.findById(portfolioId)
                .orElseThrow(() -> new IllegalArgumentException("해당 내역을 찾을 수 없습니다. id=" + portfolioId));

        if (!portfolio.getUser().getId().equals(userId)) {
            throw new IllegalStateException("삭제 권한이 없습니다.");
        }

        // 2. DB에서 삭제
        portfolioRepository.delete(portfolio);

        // 3. (선택사항) 만약 구글 시트에서도 실시간으로 해당 티커를 빼고 싶다면
        // googleSheetsService.removeTicker(portfolio.getTicker());

        log.info("🎯 포트폴리오 삭제 완료: 유저ID={}, 종목={}, 티커={}", userId, portfolio.getStockName(), portfolio.getTicker());
    }

    /**
     * 포트폴리오 리스트 조회 (실시간 가격 반영)
     */
    @Transactional(readOnly = true)
    public List<PortfolioResponseDto> getPortfolioList(Long userId) {
        List<PortfolioEntity> portfolios = portfolioRepository.findByUserId(userId);

        return portfolios.stream()
                .map(entity -> {
                    // 시트에서 실시간 가격 읽어오기
                    double currentPrice = fetchCurrentPriceFromSheet(entity.getTicker());

                    double avgPrice = entity.getExecutionPrice();
                    double quantity = entity.getExecutedQuantity();
                    double totalCost = avgPrice * quantity;

                    double realizedPL = (currentPrice > 0) ? (currentPrice - avgPrice) * quantity : 0.0;
                    double rateOfReturn = (totalCost > 0 && currentPrice > 0) ? (realizedPL / totalCost) * 100 : 0.0;

                    PortfolioResponseDto dto = new PortfolioResponseDto();
                    dto.setPortfolioId(entity.getId());
                    dto.setStockName(entity.getStockName());
                    dto.setTicker(entity.getTicker());
                    dto.setBuyDate(entity.getBuyDate());
                    dto.setExecutionPrice(avgPrice);
                    dto.setExecutedQuantity(quantity);
                    dto.setTotalCost(totalCost);
                    dto.setCurrentPrice(currentPrice);
                    dto.setRateOfReturn(rateOfReturn);
                    dto.setRealizedPL(realizedPL);

                    return dto;
                })
                .collect(Collectors.toList());
    }

    /**
     * 시트에서 현재가 추출
     */
    public void delete(Long portfolioId) {
        PortfolioEntity portfolio = portfolioRepository.findById(portfolioId)
                .orElseThrow(() -> new IllegalArgumentException("삭제할 기록을 찾을 수 없습니다."));

        portfolioRepository.delete(portfolio);
        log.info("포트폴리오 삭제 완료: ID {}", portfolioId);
    }
    private double fetchCurrentPriceFromSheet(String ticker) {
        if (ticker == null || ticker.isEmpty()) return 0.0;

        try {
            // StockDataService가 시트1의 CSV 데이터를 파싱해서 알려줌
            StockInfoDto info = stockDataService.getStockInfo(ticker);
            if (info != null && info.getCurrentPrice() != null) {
                return info.getCurrentPrice();
            }
        } catch (Exception e) {
            log.error("현재가 조회 에러 (티커: {}): {}", ticker, e.getMessage());
        }
        return 0.0;
    }

    // 요약 및 업데이트 로직은 기존과 동일...
    @Transactional(readOnly = true)
    public PortfolioSummaryDto getPortfolioSummary(Long userId) {
        List<PortfolioResponseDto> list = getPortfolioList(userId);
        double totalInvestment = list.stream().mapToDouble(PortfolioResponseDto::getTotalCost).sum();
        double totalRealizedPL = list.stream().mapToDouble(PortfolioResponseDto::getRealizedPL).sum();
        double averageRateOfReturn = (totalInvestment == 0) ? 0.0 : (totalRealizedPL / totalInvestment) * 100;

        PortfolioSummaryDto summaryDto = new PortfolioSummaryDto();
        summaryDto.setTotalCost(totalInvestment);
        summaryDto.setTotalRealizedPL(totalRealizedPL);
        summaryDto.setAverageRateOfReturn(averageRateOfReturn);
        return summaryDto;
    }
}
