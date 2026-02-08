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
import { authApi } from '../../src/api'; // API 함수 임포트

// --- Color Constants ---
const PRIMARY_COLOR = '#0048FF';
const WHITE = '#FFFFFF';
const LIGHT_GRAY_TEXT = '#8A94A0';
const DARK_TEXT = '#191F28';
const INPUT_BACKGROUND = '#F2F4F6';
const ERROR_RED = '#F04452';

export default function SignupScreen() {
  const router = useRouter();
  const [nickname, setNickname] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // 모든 필드가 채워졌는지, 비밀번호가 8자 이상인지 확인
  const isFormValid = useMemo(() => {
    return nickname.trim() !== '' && email.trim() !== '' && password.length >= 8;
  }, [nickname, email, password]);

  const handleSignup = async () => {
    if (!isFormValid) {
      setError('모든 정보를 올바르게 입력해주세요.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await authApi.signUp({ nickname, email, password });
      
      // 성공적으로 응답을 받으면 ( 보통 201 Created )
      if (response.status === 201) {
        router.replace('/login');
      } else {
        // 201이 아닌 다른 2xx 응답일 경우 (예상치 못한 상황)
        throw new Error('서버에서 예상치 못한 응답이 왔습니다.');
      }
    } catch (err: any) {
      // API 에러 처리
      if (err.response) {
        // 서버가 응답했지만, 에러 상태 코드일 경우 (e.g., 400, 409, 500)
        setError(err.response.data.message || '이미 사용 중인 이메일이거나, 입력 형식이 잘못되었습니다.');
      } else {
        // 네트워크 에러 등
        setError('네트워크 오류가 발생했습니다. 다시 시도해주세요.');
      }
      console.error(err);
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
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <ChevronLeft size={28} color={DARK_TEXT} />
          </TouchableOpacity>
        </View>

        <View style={styles.formContainer}>
          <Text style={styles.title}>회원가입</Text>
          
          <View style={styles.inputGroup}>
            <Text style={styles.label}>닉네임</Text>
            <TextInput
              style={styles.input}
              placeholder="닉네임을 입력하세요"
              value={nickname}
              onChangeText={setNickname}
              autoCapitalize="none"
            />
          </View>
          
          <View style={styles.inputGroup}>
            <Text style={styles.label}>이메일</Text>
            <TextInput
              style={styles.input}
              placeholder="이메일 주소를 입력하세요"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>비밀번호</Text>
            <TextInput
              style={styles.input}
              placeholder="비밀번호 (8자 이상)"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />
          </View>

          {error ? <Text style={styles.errorText}>{error}</Text> : null}
        </View>

        <View style={styles.footer}>
          <TouchableOpacity
            style={[styles.signupButton, !isFormValid && styles.disabledButton]}
            onPress={handleSignup}
            disabled={!isFormValid || loading}
          >
            {loading ? (
              <ActivityIndicator color={WHITE} />
            ) : (
              <Text style={styles.signupButtonText}>회원가입 하기</Text>
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
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: DARK_TEXT,
    marginBottom: 40,
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
  },
  errorText: {
    color: ERROR_RED,
    fontSize: 14,
    marginTop: 10,
    textAlign: 'center',
  },
  footer: {
    padding: 24,
    paddingBottom: 40, // Add more padding at the very bottom
  },
  signupButton: {
    backgroundColor: PRIMARY_COLOR,
    paddingVertical: 18,
    borderRadius: 16,
    alignItems: 'center',
  },
  disabledButton: {
    backgroundColor: '#A9C5FF', // Faded primary color
  },
  signupButtonText: {
    color: WHITE,
    fontSize: 18,
    fontWeight: 'bold',
  },
});