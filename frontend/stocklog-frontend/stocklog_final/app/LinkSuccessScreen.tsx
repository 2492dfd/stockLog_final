import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';

export default function LinkSuccessScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <Text style={{ fontSize: 60 }} style={styles.emoji}>🎉</Text>
      <Text style={styles.title}>연동 성공!</Text>
      <Text style={styles.subtitle}>
        키움증권 계좌 연동이 완료되었습니다.{"\n"}이제 전략 화면에서 보유 종목을 확인하세요!
      </Text>

      <TouchableOpacity 
        style={styles.button}
        onPress={() => router.replace('/(tabs)')} // Go to home tab group
      >
        <Text style={styles.buttonText}>홈으로 돌아가기</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        padding: 24,
    },
    iconContainer: {
        backgroundColor: '#D1FAE5', // bg-green-100
        padding: 24,
        borderRadius: 9999, // rounded-full
        marginBottom: 24,
    },
    title: {
        fontSize: 24, // text-2xl
        fontWeight: 'bold',
        color: '#1F2937', // text-gray-800
        marginBottom: 8,
    },
    subtitle: {
        color: '#6B7280', // text-gray-500
        textAlign: 'center',
        marginBottom: 40,
        lineHeight: 22,
    },
    button: {
        width: '100%',
        backgroundColor: '#3B82F6', // bg-blue-500
        paddingVertical: 16,
        borderRadius: 12, // rounded-xl
    },
    buttonText: {
        color: '#FFFFFF',
        textAlign: 'center',
        fontWeight: 'bold',
        fontSize: 18, // text-lg
    },
});
