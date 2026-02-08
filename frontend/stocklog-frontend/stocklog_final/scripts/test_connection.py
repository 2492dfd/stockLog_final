import os
import requests
import json
from dotenv import load_dotenv

# 1. .env 파일 로드 (부모 폴더에 있는 .env를 찾습니다)
current_dir = os.path.dirname(__file__)
env_path = os.path.join(current_dir, '..', '.env')
load_dotenv(env_path)

# 2. 접근토큰 발급 함수 (가이드 기반)
def fn_au10001(data):
    # 실전투자 주소
    host = 'https://api.kiwoom.com'
    endpoint = '/oauth2/token'
    url = host + endpoint

    # header 데이터
    headers = {
        'Content-Type': 'application/json;charset=UTF-8',
    }

    # http POST 요청
    print(f"🚀 키움 서버({host})에 접속 시도 중...")
    response = requests.post(url, headers=headers, json=data)

    # 응답 상태 코드와 데이터 출력
    print('--- [응답 결과] ---')
    print('Code:', response.status_code)
    
    # JSON 응답 출력
    result = response.json()
    print('Body:', json.dumps(result, indent=4, ensure_ascii=False))

    if response.status_code == 200 and 'access_token' in result:
        print("\n🎉 [대성공] 드디어 통행증 발급에 성공했습니다!")
        return result['access_token']
    else:
        print("\n❌ 실패: 가이드 코드로도 안 된다면 키(Key) 자체를 다시 확인해야 합니다.")
        return None

# 실행 구간
if __name__ == '__main__':
    # .env에서 가져온 키 값을 변수에 담기
    # 🚨 주의: 가이드에 따라 'secretkey'라는 이름을 사용합니다!
    params = {
        'grant_type': 'client_credentials',
        'appkey': os.getenv("KIWOOM_APP_KEY").strip(),
        'secretkey': os.getenv("KIWOOM_APP_SECRET").strip(), # 여기서 이름을 바꿨습니다!
    }

    # API 실행
    fn_au10001(data=params)