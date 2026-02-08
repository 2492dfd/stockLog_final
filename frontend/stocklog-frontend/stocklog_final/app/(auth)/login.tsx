import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { ChevronLeft } from 'lucide-react-native';
import { authApi } from '../../src/api'; // authApi 임포트
import AppStorage from '../../src/utils/storage'; // Use cross-platform storage

// --- Color Constants ---
const PRIMARY_COLOR = '#0048FF';
const WHITE = '#FFFFFF';
const DARK_TEXT = '#191F28';
const INPUT_BACKGROUND = '#F2F4F6';
const LIGHT_BORDER = '#E0E0E0'; // 아주 연한 회색 테두리
const ERROR_RED = '#F04452';

export default function LoginScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const isFormValid = useMemo(() => {
    return email.trim() !== '' && password.trim() !== '';
  }, [email, password]);

  const handleLogin = async () => {
    if (!isFormValid) {
      setError('이메일과 비밀번호를 모두 입력해주세요.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await authApi.login({ email, password });

      if (response.data && response.data.token) {
        await AppStorage.setItem('userToken', response.data.token);
        Alert.alert('로그인 성공', '환영합니다!');
        router.replace('/(tabs)');
      } else {
        // 백엔드에서 token을 보내주지 않은 경우
        setError('로그인에 실패했습니다. 토큰 정보가 없습니다.');
      }
    } catch (err: any) {
      if (err.response && err.response.data && err.response.data.message) {
        // Axios 에러 응답 처리
        setError(err.response.data.message);
      } else {
        // 네트워크 오류 또는 기타 에러
        setError('네트워크 오류가 발생했습니다. 다시 시도해주세요.');
      }
      console.error('로그인 에러:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoidingContainer}
      >
        <View style={styles.header}>
          <TouchableOpacity 
            onPress={() => {
              if (router.canGoBack()) {
                router.back();
              } else {
                router.replace('/');
              }
            }} 
            style={styles.backButton}
          >
            <ChevronLeft size={28} color={DARK_TEXT} />
          </TouchableOpacity>
        </View>

        <View style={styles.formContainer}>
          <Text style={styles.title}>로그인</Text>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>이메일</Text>
            <TextInput
              style={styles.input}
              placeholder="이메일을 입력해주세요"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              placeholderTextColor={LIGHT_BORDER}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>비밀번호</Text>
            <TextInput
              style={styles.input}
              placeholder="비밀번호를 입력해주세요"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              placeholderTextColor={LIGHT_BORDER}
            />
          </View>

          {error ? <Text style={styles.errorText}>{error}</Text> : null}
        </View>

        <View style={styles.footer}>
          <TouchableOpacity
            style={[styles.loginButton, !isFormValid && styles.disabledButton]}
            onPress={handleLogin}
            disabled={!isFormValid || loading}
          >
            {loading ? (
              <ActivityIndicator color={WHITE} />
            ) : (
              <Text style={styles.loginButtonText}>로그인</Text>
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: WHITE,
  },
  keyboardAvoidingContainer: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 10,
    paddingVertical: 10,
  },
  backButton: {
    padding: 10,
  },
  formContainer: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: 'center', // 폼을 수직 중앙으로 정렬
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: DARK_TEXT,
    marginBottom: 40,
    textAlign: 'center', // 제목 중앙 정렬
  },
  inputGroup: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: DARK_TEXT,
    marginBottom: 8,
  },
  input: {
    backgroundColor: INPUT_BACKGROUND,
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderRadius: 12,
    fontSize: 16,
    color: DARK_TEXT,
    borderWidth: 1, // 연한 테두리
    borderColor: LIGHT_BORDER, // 연한 테두리 색상
  },
  errorText: {
    color: ERROR_RED,
    fontSize: 14,
    marginTop: 10,
    textAlign: 'center',
  },
  footer: {
    padding: 24,
    paddingBottom: 40, // 하단 여백
  },
  loginButton: {
    backgroundColor: PRIMARY_COLOR,
    paddingVertical: 18,
    borderRadius: 16,
    alignItems: 'center',
    width: '100%', // 화면 너비에 맞게
  },
  disabledButton: {
    backgroundColor: '#A9C5FF', // 비활성화 시 색상
  },
  loginButtonText: {
    color: WHITE,
    fontSize: 18,
    fontWeight: 'bold',
  },
});