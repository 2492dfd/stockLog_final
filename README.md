📈 stockLog
주식 매매 기록 · 분석 · 전략 관리 · 커뮤니티 기능을 하나로 통합한 올인원 트레이딩 로그 앱입니다.

🧾 프로젝트 소개
stockLog는 개인 투자자가 매매 기록을 체계적으로 관리하고, 손익을 시각적으로 분석하며, 투자 전략을 점검하고, 다른 투자자와 인사이트를 공유할 수 있도록 제작되었습니다.

기존 노션 · 엑셀 기반 매매일지의 **'수동 입력'**과 **'데이터 단절'**이라는 한계를 기술적으로 해결하여, 자동화된 투자 관리 환경과 AI 기반 인사이트를 제공하는 것을 목표로 합니다.

🚀 핵심 차별화 기능 (Core Values)
1️⃣ 데이터 수집의 자동화 (Kiwoom API)
키움증권 Open API를 연동하여 보유 종목 정보를 자동으로 동기화합니다.

수동 입력 시 발생하는 데이터 누락을 제거하여 데이터의 정확성을 확보했습니다.

2️⃣ 데이터 이식성 확보 (CSV Migration)
기존 엑셀/노션 사용자의 이탈을 막기 위해 .csv 파일 마이그레이션 기술을 구현했습니다.

과거 데이터를 손실 없이 앱으로 일괄 이전할 수 있어 사용자 전환 비용을 최소화했습니다.

3️⃣ 지능형 투자 피드백 (Gemini AI)
단순 기록을 넘어 Gemini API를 도입해 사용자의 매매 패턴을 분석합니다.

AI가 투자 전략에 대한 피드백을 제공하여 더 나은 투자 결정을 돕는 '지능형 파트너' 역할을 수행합니다.

4️⃣ 실시간 대시보드 연동 (Google Sheets API)
앱 내부 데이터와 Google Spreadsheet를 상호 연동하여, 익숙한 시트 환경에서도 실시간 수익률과 포트폴리오 비중을 확인할 수 있습니다.

🛠 기술 스택 (Tech Stack)
Backend
Language/Framework: Java 17, Spring Boot 3.x

Data Access: Spring Data JPA (Hibernate)

Build Tool: Gradle

Database: MySQL

Frontend
Framework: React Native (Expo)

Environment: Expo Go (빠른 프로토타이핑 및 실시간 모바일 테스트 환경 구축)

Language: JavaScript / TypeScript

External Integration
APIs: Kiwoom Open API, Yahoo Finance API, Google Sheets API, Gemini AI API

🏗 시스템 아키텍처 (System Architecture)
사용자의 편의성과 데이터 확장성을 고려하여 Layered Architecture를 기반으로 설계되었습니다.

Client Side: React Native(Expo) 기반의 직관적인 UI/UX 및 실시간 데이터 시각화.

Server Side: * Controller: 사용자 요청 처리 및 CSV 파일 마이그레이션 엔드포인트 관리.

Service: 외부 API 연동 및 수익률 계산 로직(Business Logic) 수행.

Repository: JPA를 통한 데이터 영속성 관리 및 무결성 보장.

External Integration: 실시간 금융 데이터 수집, AI 분석, 클라우드 저장소 연동.

📂 프로젝트 구조 (Directory Structure)
Plaintext
src/main/java/com/example/stockLog
├── 📁 community           # 커뮤니티 게시판 도메인
├── 📁 graph               # 주식 데이터 시각화 및 차트 도메인
├── 📁 portfolio           # 사용자 자산 및 포트폴리오 관리 도메인
├── 📁 tradelog            # 핵심 기능: 매매 내역 기록 및 관리 도메인
│   ├── 📁 controller      # API 엔드포인트
│   ├── 📁 dto             # Request/Response 객체 (Decoupling)
│   ├── 📁 entity          # JPA Entity (DB Mapping)
│   ├── 📁 repository      # JPA Repository
│   └── 📁 service         # 핵심 비즈니스 로직
├── 📁 config              # 프로젝트 전역 공통 설정 (Security, API 등)
└── 📁 exception           # Global Exception Handler (전역 예외 처리)
🛠️ 트러블슈팅 (Troubleshooting)
① CSV 데이터 마이그레이션 시 인코딩 및 파싱 에러
문제: 노션/엑셀에서 내보낸 CSV 로드 시 한글 깨짐 및 구분자(,) 파싱 오류 발생.

해결: InputStreamReader 캐릭터셋 유연화 및 정규식을 활용한 파싱 로직 정교화로 예외 케이스 처리.

결과: 데이터 이식성 향상 및 기존 사용자 데이터 전환 성공률 100% 달성.

② 외부 API 응답 지연 및 데이터 매핑 에러
문제: 외부 금융 API와 내부 엔티티 간 구조 불일치 및 네트워크 지연으로 인한 시스템 불안정.

해결: **DTO(Data Transfer Object)**를 활용해 외부 스펙과 내부 구조를 분리(Decoupling)하고, 예외 발생 시 캐시 데이터를 활용하는 Fault Tolerance 로직 적용.

결과: 시스템 결합도를 낮추고 안정적인 데이터 제공 가능.

③ JPA 순환 참조 및 연관관계 에러
문제: 양방향 연관관계 설정 중 JSON 직렬화 과정에서의 무한 루프(Infinite Recursion) 발생.

해결: @JsonIgnore와 별도의 Response DTO 활용으로 순환 참조를 차단하고, 연관관계 편의 메서드로 데이터 일관성 유지.

결과: 객체 지향 프로그래밍과 RDB 간의 패러다임 불일치 해결.

📸 주요 기능 상세
📝 매매일지 및 캘린더
캘린더 기반 매매 기록 관리 및 거래 종류별 색상 시각화.

체결가, 수량 입력 시 예상 총 매수 금액 자동 계산 로직 적용.
📷 [images/tradelog.png]

📊 결산 및 전략 관리
월별/연도별 실현 손익 자동 통계 및 그래프 제공.

Google Sheets 연동을 통한 실시간 종목 비중 및 수익률 대시보드.
📷 [images/strategy.png]

🏁 실행 방법 (How to Run)
Backend
src/main/resources/application.yml에 API Key를 설정합니다.

./gradlew bootRun으로 서버를 실행합니다.

Frontend
cd frontend && npm install

npx expo start 후 Expo Go 앱으로 QR 코드를 스캔합니다.
