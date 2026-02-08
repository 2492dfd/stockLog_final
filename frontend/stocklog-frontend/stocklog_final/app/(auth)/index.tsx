import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { BarChart3 } from 'lucide-react-native'; // 로고 아이콘

const PRIMARY_COLOR = '#0048FF';
const WHITE = '#FFFFFF';
const LIGHT_GRAY_TEXT = '#8A94A0';
const DARK_TEXT = '#191F28';

export default function LandingScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.logoContainer}>
        <BarChart3 color={PRIMARY_COLOR} size={48} strokeWidth={2.5} />
        <Text style={styles.appName}>StockLog</Text>
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.loginButton} onPress={() => router.push('/login')}>
          <Text style={styles.loginButtonText}>로그인</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.signupButton} onPress={() => router.push('/signup')}>
          <Text style={styles.signupButtonText}>시작하기</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: WHITE,
    justifyContent: 'center',
  },
  logoContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: 80, // 로고를 살짝 위로
  },
  appName: {
    fontSize: 42,
    fontWeight: 'bold',
    color: DARK_TEXT,
    marginTop: 16,
  },
  buttonContainer: {
    position: 'absolute',
    bottom: 40,
    left: 0,
    right: 0,
    alignItems: 'center',
    paddingHorizontal: '5%', // 양 옆 여백 (width: 90% 효과)
  },
  loginButton: {
    marginBottom: 16,
    width: '100%', // '시작하기' 버튼과 동일한 너비
    paddingVertical: 18, // '시작하기' 버튼과 동일한 세로 패딩
    borderWidth: 1,
    borderColor: LIGHT_GRAY_TEXT,
    borderRadius: 16, // '시작하기' 버튼과 동일한 둥근 모서리
    alignItems: 'center', // 텍스트 중앙 정렬
    justifyContent: 'center', // 텍스트 중앙 정렬
  },
  loginButtonText: {
    fontSize: 16,
    color: LIGHT_GRAY_TEXT,
    fontWeight: '500',
  },
  signupButton: {
    width: '100%', // 부모의 paddingHorizontal에 의해 90% 너비가 됨
    backgroundColor: PRIMARY_COLOR,
    paddingVertical: 18,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  signupButtonText: {
    color: WHITE,
    fontSize: 18,
    fontWeight: 'bold',
  },
});
