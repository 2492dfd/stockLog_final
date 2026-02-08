package com.example.stockLog.portfolio.service;

import com.google.api.client.googleapis.javanet.GoogleNetHttpTransport;
import com.google.api.client.json.gson.GsonFactory;
import com.google.api.services.sheets.v4.Sheets;
import com.google.api.services.sheets.v4.SheetsScopes;
import com.google.api.services.sheets.v4.model.ValueRange;
import com.google.auth.http.HttpCredentialsAdapter;
import com.google.auth.oauth2.GoogleCredentials;
import jakarta.annotation.PostConstruct;
import lombok.extern.slf4j.Slf4j; // 롬복 로그 사용 권장
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.io.InputStream;
import java.security.GeneralSecurityException;
import java.util.Collections;
import java.util.List;
@Service
@Slf4j
public class GoogleSheetsService {
    private final String SPREADSHEET_ID = "1PdAW-rtIi26ngqVVc8okuZ4A0h5wC0Jm8T7gAurewsE";
    private Sheets sheetsService;

    @PostConstruct
    public void init() throws IOException, GeneralSecurityException {
        InputStream in = getClass().getResourceAsStream("/google-key.json");
        if (in == null) {
            throw new IOException("google-key.json 파일을 찾을 수 없습니다. src/main/resources 위치를 확인하세요.");
        }

        GoogleCredentials credentials = GoogleCredentials.fromStream(in)
                .createScoped(Collections.singleton(SheetsScopes.SPREADSHEETS));

        sheetsService = new Sheets.Builder(
                GoogleNetHttpTransport.newTrustedTransport(),
                GsonFactory.getDefaultInstance(),
                new HttpCredentialsAdapter(credentials))
                .setApplicationName("StockLog")
                .build();
    }

    /**
     * [추가] 종목명으로 TickerMap 시트에서 티커와 시장 정보를 찾아옴
     */
    public String[] findTickerAndMarket(String stockName) {
        // TickerMap 탭의 A(종목명), B(티커), C(시장) 열을 읽어옴
        List<List<Object>> data = getSheetData("TickerMap!A2:C5000");

        if (data != null) {
            for (List<Object> row : data) {
                if (row.size() >= 2) {
                    String sheetStockName = row.get(0).toString().trim();
                    // 사용자가 보낸 이름이 시트의 종목명을 포함하거나 같을 때
                    if (sheetStockName.equals(stockName) || stockName.contains(sheetStockName)) {
                        String ticker = row.get(1).toString().trim();
                        String market = (row.size() >= 3) ? row.get(2).toString().trim() : "KRX";
                        return new String[]{ticker, market};
                    }
                }
            }
        }
        log.warn("TickerMap에서 종목을 찾을 수 없음: {}", stockName);
        return null;
    }

    // 시트의 데이터를 읽어옴
    public List<List<Object>> getSheetData(String range) {
        try {
            ValueRange response = sheetsService.spreadsheets().values()
                    .get(SPREADSHEET_ID, range)
                    .execute();
            return response.getValues();
        } catch (IOException e) {
            log.error("구글 시트 데이터 읽기 실패: {}", e.getMessage());
            return null;
        }
    }

    /**
     * [수정] 티커를 시트1에 기록할 때 시장 정보를 조합해서 기록 (예: KRX:005930)
     */
    public void appendTicker(String ticker, String market) {
        try {
            // 국장이면 KRX: 를 붙이고, 아니면 그냥 티커만 (또는 NASDAQ: 등) 기록
            String finalTicker = "KRX".equalsIgnoreCase(market) ? "KRX:" + ticker : ticker;

            ValueRange appendBody = new ValueRange()
                    .setValues(Collections.singletonList(Collections.singletonList(finalTicker)));

            sheetsService.spreadsheets().values()
                    .append(SPREADSHEET_ID, "시트1!B3", appendBody)
                    .setValueInputOption("USER_ENTERED")
                    .execute();

            log.info("시트1에 티커 추가 성공: {}", finalTicker);
        } catch (IOException e) {
            log.error("시트 티커 추가 실패: {}", e.getMessage());
        }
    }
}
