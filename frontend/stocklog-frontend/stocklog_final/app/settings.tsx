import React, { useState, useEffect } from 'react';
import { 
    View, 
    Text, 
    StyleSheet, 
    SafeAreaView, 
    TouchableOpacity, 
    TextInput, 
    ScrollView,
    Alert,
    ActivityIndicator
} from 'react-native';
import { ChevronLeft } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { userApi } from '../src/api';
import AppStorage from '../src/utils/storage';
import { parseJwt } from '../src/utils/jwt';

// --- Color Constants ---
const Colors = {
  background: '#FFFFFF',
  surface: '#F8F9FA',
  textPrimary: '#191F28',
  textSecondary: '#6B7684',
  accentBlue: '#3182F6',
  border: '#E5E8EB',
  danger: '#F04452',
};

const SettingsScreen = () => {
    const router = useRouter();
    const [userEmail, setUserEmail] = useState('');
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchUserData = async () => {
            setIsLoading(true);
            try {
                const token = await AppStorage.getItem('userToken');
                if (!token) {
                    router.replace('/(auth)/login');
                    return;
                }
                const decoded = parseJwt(token);
                const userId = decoded?.userId || decoded?.id || decoded?.sub;

                if (userId) {
                    const response = await userApi.getUserProfile(userId);
                    setUserEmail(response.data.email);
                }
            } catch (error) {
                console.error('Failed to fetch user data:', error);
                Alert.alert('오류', '사용자 정보를 불러오는 데 실패했습니다.');
            } finally {
                setIsLoading(false);
            }
        };

        fetchUserData();
    }, [router]);

    const handleBack = () => {
        if (router.canGoBack()) {
            router.back();
        } else {
            router.replace('/(tabs)');
        }
    };

    if (isLoading) {
        return (
            <SafeAreaView style={styles.safeArea}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={handleBack} style={styles.backButton}>
                        <ChevronLeft size={28} color={Colors.textPrimary} />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>설정</Text>
                    <View style={{ width: 28 }} />
                </View>
                <ActivityIndicator size="large" color={Colors.accentBlue} style={{ flex: 1 }}/>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.safeArea}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={handleBack} style={styles.backButton}>
                    <ChevronLeft size={28} color={Colors.textPrimary} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>설정</Text>
                <View style={{ width: 28 }} />
            </View>

            <ScrollView style={styles.container}>
                {/* Account Info Section */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>계정 정보</Text>
                    <View style={styles.fieldContainer}>
                        <Text style={styles.fieldLabel}>이메일</Text>
                        <Text style={styles.fieldValue}>{userEmail}</Text>
                    </View>

                </View>
                
                {/* Divider */}
                <View style={styles.divider} />

                {/* Security and Notifications Section */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>보안 및 알림</Text>
                    <TouchableOpacity style={styles.menuItem} onPress={() => router.push('/change-password')}>
                        <Text style={styles.menuItemText}>비밀번호 변경</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.menuItem} onPress={() => router.push('/notification-settings')}>
                        <Text style={styles.menuItemText}>알림 설정</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: Colors.background },
    container: { flex: 1 },
    header: { 
        flexDirection: 'row', 
        alignItems: 'center', 
        justifyContent: 'space-between', 
        paddingHorizontal: 16, 
        paddingVertical: 12, 
        borderBottomWidth: 1, 
        borderBottomColor: Colors.border, 
    },
    backButton: { padding: 4 },
    headerTitle: { fontSize: 18, fontWeight: 'bold', color: Colors.textPrimary },
    section: { 
        paddingHorizontal: 20,
        paddingVertical: 24,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: Colors.textPrimary,
        marginBottom: 20,
    },
    fieldContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    fieldLabel: {
        fontSize: 16,
        color: Colors.textSecondary,
    },
    fieldValue: {
        fontSize: 16,
        color: Colors.textPrimary,
        fontWeight: '500',
    },
    divider: {
        height: 8,
        backgroundColor: Colors.surface,
    },
    menuItem: {
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: Colors.border,
    },
    menuItemText: {
        fontSize: 16,
        color: Colors.textPrimary,
    },
});

export default SettingsScreen;
