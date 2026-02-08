import sys
import os
import requests
import json

# 인자값 받기
if len(sys.argv) > 2:
    app_key = sys.argv[1].strip()
    secret_key = sys.argv[2].strip()
else:
    # 테스트용 기본값 (실제 키 입력 권장)
    app_key = "I7qmf7QrgH22KfAJq1vrZgfuZl71XdKHQM38P1BcRao" 
    secret_key = "FMiva9QsSPJB_lZkPVilz-7Sf2ZDxSIkBhgbbX_ro7s"

def get_kiwoom_accounts(app_key, secret_key):
    host = 'https://api.kiwoom.com' #
    
    # 1. 토큰 발급 (사진 1: /oauth2/token)
    auth_url = host + '/oauth2/token' #
    auth_params = {
        'grant_type': 'client_credentials',
        'appkey': app_key,
        'secretkey': secret_key
    }
    
    auth_res = requests.post(auth_url, json=auth_params)
    token = auth_res.json().get('token')

    if not token:
        print(json.dumps({"success": False, "message": "토큰 발급 실패"}, ensure_ascii=False))
        return

    # 2. 계좌평가잔고내역조회 (사진 2: /api/dostk/acnt)
    acc_url = host + '/api/dostk/acnt' #
    
    acc_headers = {
        'Content-Type': 'application/json;charset=UTF-8', #
        'authorization': f'Bearer {token}', #
        'api-id': 'kt00018',  # 🚩 사진에 적힌 필수 TR명
        'appkey': app_key,
        'secretkey': secret_key
    }

    # 🚩 사진 Body 항목의 필수값(Y) 설정
    acc_body = {
        "qry_tp": "1",          # 1: 합산 조회
        "dmst_stex_tp": "KRX"   # KRX: 한국거래소
    }

    try:
        # 사진에 Method가 POST로 명시되어 있습니다.
        acc_res = requests.post(acc_url, headers=acc_headers, json=acc_body) #
        
        if acc_res.status_code == 200:
            # 성공 시 사진 3에 있는 총매입금액, 총평가금액 등이 담긴 JSON이 출력됩니다.
            print(json.dumps({
                "success": True,
                "data": acc_res.json()
            }, ensure_ascii=False))
        else:
            print(json.dumps({
                "success": False,
                "message": f"계좌 조회 실패 (코드: {acc_res.status_code})",
                "detail": acc_res.text
            }, ensure_ascii=False))

    except Exception as e:
        print(json.dumps({"success": False, "message": str(e)}, ensure_ascii=False))

if __name__ == '__main__':
    if len(sys.argv) > 2:    
        get_kiwoom_accounts(sys.argv[1].strip(), sys.argv[2].strip())