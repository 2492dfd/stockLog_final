import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, Image, ScrollView, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { ChevronRight, User, Mail, Shield, ChevronLeft } from 'lucide-react-native';
import { userApi } from '../src/api';
import AppStorage from '../src/utils/storage';
import { parseJwt } from '../src/utils/jwt';

const Colors = {
  background: '#F2F4F6',
  surface: '#FFFFFF',
  textPrimary: '#191F28',
  textSecondary: '#8B95A1',
  border: '#E5E8EB',
  accentBlue: '#3182F6',
};

const MyPageScreen = () => {
  const router = useRouter();
  const [userInfo, setUserInfo] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMyInfo = async () => {
      try {
        const token = await AppStorage.getItem('userToken');
        if (token) {
          const decoded = parseJwt(token);
          const userId = decoded?.userId || decoded?.id || decoded?.sub;
          const email = decoded?.email; // 토큰에 이메일이 있다면 사용

          if (userId) {
            // 상세 프로필 정보 가져오기
            const response = await userApi.getUserProfile(userId);
            setUserInfo({ ...response.data, email: email || response.data.email });
          }
        }
      } catch (error) {
        console.error("Failed to fetch my info:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchMyInfo();
  }, []);

  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/(tabs)');
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.accentBlue} />
      </View>
    );
  }

  if (!userInfo) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>정보를 불러올 수 없습니다.</Text>
        <TouchableOpacity onPress={handleBack} style={{ marginTop: 20 }}>
            <Text style={{ color: Colors.accentBlue }}>돌아가기</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <ChevronLeft size={28} color={Colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>마이페이지</Text>
        <View style={{ width: 28 }} /> 
      </View>

      <ScrollView style={styles.container}>
        {/* 1. 간략 프로필 섹션 */}
        <TouchableOpacity 
          style={styles.profileSection} 
          onPress={() => router.push(`/profile/${userInfo.id || userInfo.userId}`)}
        >
          <View style={styles.profileRow}>
            {userInfo.avatar ? (
              <Image source={{ uri: userInfo.avatar }} style={styles.avatar} />
            ) : (
              <View style={[styles.avatar, styles.avatarPlaceholder]}>
                <User size={32} color="#B0B8C1" />
              </View>
            )}
            <View style={styles.profileInfo}>
              <Text style={styles.nickname}>{userInfo.nickname}</Text>
              <Text style={styles.viewProfileText}>내 프로필 보기</Text>
            </View>
            <ChevronRight size={20} color={Colors.textSecondary} />
          </View>
        </TouchableOpacity>

        {/* 2. 계정 정보 섹션 */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>계정 정보</Text>
          
          <View style={styles.infoRow}>
            <View style={styles.infoLabelContainer}>
              <Mail size={20} color={Colors.textSecondary} />
              <Text style={styles.infoLabel}>이메일</Text>
            </View>
            <Text style={styles.infoValue}>{userInfo.email || '이메일 정보 없음'}</Text>
          </View>

          <View style={styles.separator} />

          <View style={styles.infoRow}>
            <View style={styles.infoLabelContainer}>
              <Shield size={20} color={Colors.textSecondary} />
              <Text style={styles.infoLabel}>로그인 방식</Text>
            </View>
            <Text style={styles.infoValue}>이메일 로그인</Text>
          </View>
        </View>

        {/* 3. 기타 메뉴 (예시) */}
        <View style={styles.sectionContainer}>
            <TouchableOpacity style={styles.menuItem}>
                <Text style={styles.menuText}>앱 버전</Text>
                <Text style={styles.versionText}>1.0.0</Text>
            </TouchableOpacity>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    color: Colors.textSecondary,
    fontSize: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  backButton: {
    padding: 4,
  },
  container: {
    flex: 1,
  },
  profileSection: {
    backgroundColor: Colors.surface,
    padding: 20,
    marginBottom: 12,
  },
  profileRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 16,
  },
  avatarPlaceholder: {
    backgroundColor: '#F2F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  nickname: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  viewProfileText: {
    fontSize: 14,
    color: Colors.accentBlue,
    fontWeight: '500',
  },
  sectionContainer: {
    backgroundColor: Colors.surface,
    paddingHorizontal: 20,
    paddingVertical: 24,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 20,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  infoLabelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  infoLabel: {
    fontSize: 16,
    color: Colors.textSecondary,
  },
  infoValue: {
    fontSize: 16,
    color: Colors.textPrimary,
    fontWeight: '500',
  },
  separator: {
    height: 1,
    backgroundColor: '#F2F4F6',
    marginVertical: 16,
  },
  menuItem: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: 4
  },
  menuText: {
      fontSize: 16,
      color: Colors.textPrimary
  },
  versionText: {
      fontSize: 14,
      color: Colors.textSecondary
  }
});

export default MyPageScreen;
