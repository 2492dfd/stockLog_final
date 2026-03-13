package com.example.stockLog.tradelog.service;

import com.example.stockLog.tradelog.dto.StockInfoDto;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import static reactor.netty.http.HttpConnectionLiveness.log;

@Service
public class StockDataService {//구글시트에서 현재가 가져오기
    private final String GOOGLE_SHEET_CSV_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vSKgs5id0jalahO1hAMaPfsNw_Nac-br24xtqr6Laas-2F1vBCljjzbf6gfgiQKmADZeQbddmHvImo_/pub?gid=0&single=true&output=csv";

    /**
     * 특정 티커의 정보를 가져오는 메서드 (PortfolioService에서 호출함)
     */
    public StockInfoDto getStockInfo(String ticker) {
        try {
            RestTemplate restTemplate = new RestTemplate();
            //  URL 뒤에 ?output=csv가 붙어있는지 꼭 확인
            String response = restTemplate.getForObject(GOOGLE_SHEET_CSV_URL, String.class);

            if (response != null) {
                String[] lines = response.split("\n");

                for (int i = 1; i < lines.length; i++) {
                    // CSV는 콤마(,)로 구분됩니다.
                    String[] columns = lines[i].split(",");

                    if (columns.length >= 2) {
                        String sheetTicker = columns[1].trim(); // 시트의 "005930"
                        String targetTicker = ticker.trim();    // 서버의 "005930.KS"

                        // 🚀 [핵심 수정] 글자가 완전히 같지 않아도 포함되어 있다면 매칭 성공!
                        if (targetTicker.contains(sheetTicker) || sheetTicker.contains(targetTicker)) {
                            StockInfoDto dto = new StockInfoDto();
                            dto.setTicker(sheetTicker);

                            // C열(인덱스 2)에 값이 있으면 국장가로 사용
                            if (columns.length > 2 && !columns[2].trim().isEmpty()) {
                                dto.setCurrentPrice(parseDouble(columns[2]));
                            }
                            // D열(인덱스 3)에 값이 있으면 미장가로 사용
                            else if (columns.length > 3 && !columns[3].trim().isEmpty()) {
                                dto.setCurrentPrice(parseDouble(columns[3]));
                            }

                            log.info(" 매칭 성공: 찾던 티커 {} -> 시트 티커 {} (가격: {})", targetTicker, sheetTicker, dto.getCurrentPrice());
                            return dto;
                        }
                    }
                }
            }
        } catch (Exception e) {
            log.error(" 구글 시트 파싱 에러: {}", e.getMessage());
        }
        return null;
    }

    // 숫자에 콤마(,)가 섞여 있어도 안전하게 파싱하는 함수
    private Double parseDouble(String value) {
        try {
            return Double.parseDouble(value.replace("\"", "").replace(",", "").trim());
        } catch (Exception e) {
            return 0.0;
        }
    }
}