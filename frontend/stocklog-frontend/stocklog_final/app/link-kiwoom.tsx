import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    SafeAreaView,
    ScrollView,
    TouchableOpacity,
    TextInput,
    Alert,
    Linking,
    Platform
} from 'react-native';
import { ChevronLeft, CheckCircle2, Circle, Eye, EyeOff, ArrowUpRight } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import axios from 'axios'; // Import axios
import AppStorage from '../src/utils/storage'; // Import AppStorage
import API_BASE_URL from '../src/api/config'; // Import API_BASE_URL

// --- Color Constants ---
const Colors = {
    background: '#F8F9FA',
    surface: '#FFFFFF',
    textPrimary: '#191F28',
    textSecondary: '#6B7684',
    accentBlue: '#3182F6',
    border: '#E5E8EB',
    placeholder: '#ADB5BD',
};

const LinkKiwoomScreen = () => {
    const router = useRouter();
    const [appKey, setAppKey] = useState('');
    const [secretKey, setSecretKey] = useState('');
    const [isSecretVisible, setSecretVisible] = useState(false);

    const handleLinkPress = async () => {
        await WebBrowser.openBrowserAsync('https://openap.kiwoom.com/dev');
    };

    const handleValidation = async () => {
        const SERVER_IP = "192.168.200.134";
        let isSuccess = false;
        let alertMessage = "연결 실패! 서버 로그를 확인하세요.";

        try {
            console.log("🔥 버튼 눌림! 서버 주소:", SERVER_IP);
            const response = await axios.post(`http://${SERVER_IP}:8080/api/kiwoom/verify`, { appKey, secretKey });

            // 1. 서버가 200 OK로 정직하게 success: true를 준 경우
            if (response.data && response.data.success === true) {
                isSuccess = true;
                alertMessage = "서버 응답 성공! 화면 이동합니다.";
            } else if (response.data && response.data.success === false && response.data.message) {
                // 2. 서버가 200 OK를 줬지만 outer success가 false이고, message 안에 nested success 정보가 있는 경우
                const messageString = response.data.message;
                const startIndex = messageString.indexOf('{"success":');
                if (startIndex !== -1) {
                    try {
                        const nestedJsonString = messageString.substring(startIndex);
                        const nestedData = JSON.parse(nestedJsonString);
                        if (nestedData.success === true || nestedData.success === "true") {
                            isSuccess = true;
                            alertMessage = "서버 응답 도착! (내부 성공 확인) 화면 이동합니다.";
                        }
                    } catch (e) {
                        console.error("중첩된 JSON 파싱 실패:", e);
                    }
                }
            }

            if (isSuccess) {
                alert(alertMessage);
                router.push('LinkSuccessScreen');
            } else {
                alert(alertMessage + " (응답 데이터: " + JSON.stringify(response.data) + ")");
            }

        } catch (error: any) {
            const serverData = error.response?.data;
            let nestedSuccessInError = false;

            if (serverData && serverData.message) {
                const messageString = serverData.message;
                const startIndex = messageString.indexOf('{"success":');
                if (startIndex !== -1) {
                    try {
                        const nestedJsonString = messageString.substring(startIndex);
                        const nestedData = JSON.parse(nestedJsonString);
                        if (nestedData.success === true || nestedData.success === "true") {
                            nestedSuccessInError = true;
                        }
                    } catch (e) {
                        console.error("에러 응답의 중첩된 JSON 파싱 실패:", e);
                    }
                }
            }

            // 🚩 서버가 401을 줬지만 본문에 성공 데이터가 있는 경우 (사용자님 상황)
            if (nestedSuccessInError) { // `serverData && (serverData.success === true || serverData.success === "true")` 대신 nestedSuccessInError 사용
                isSuccess = true;
                alertMessage = "✅ 401 에러 무시하고 성공 처리함! 화면 이동합니다.";
                alert(alertMessage);
                router.push('LinkSuccessScreen');
            } else {
                alertMessage = "❌ 연결 실패: " + (serverData?.message || "네트워크 확인");
                console.log("❌ 상세 에러 로그:", error.response);
                alert(alertMessage);
            }
        }
    };
    const steps = [
        {
            text: '키움증권 OPEN API 접속 및 로그인',
            action: handleLinkPress,
            buttonText: '바로가기',
        },
        {
            text: '상단 개발서비스 > 서비스신청 > OPEN API 사용 신청',
        },
        {
            text: '앱 관리 메뉴에서 App Key와 Secret Key 복사하기',
        },
    ];


    return (
        <SafeAreaView style={styles.safeArea}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => {
                    console.log('Back button pressed on LinkKiwoomScreen, navigating to / with openSideMenu param');
                    router.replace({ pathname: '/(tabs)', params: { openSideMenu: 'true' } });
                }} style={styles.backButton} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                    <ChevronLeft size={28} color={Colors.textPrimary} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>키움증권 계좌 연동</Text>
                <View style={{ width: 28 }} />
            </View>

            <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
                {/* Step-by-Step Guide */}
                <View style={styles.card}>
                    <Text style={styles.cardTitle}>API Key 발급 가이드</Text>
                    {steps.map((step, index) => (
                        <View key={index} style={styles.stepContainer}>
                            <CheckCircle2 size={20} color={Colors.accentBlue} style={styles.stepIcon} />
                            <View style={styles.stepTextContainer}>
                                <Text style={styles.stepText}>{`${index + 1}단계: ${step.text}`}</Text>
                            </View>
                            {step.action && (
                                <TouchableOpacity onPress={step.action} style={styles.stepButton}>
                                    <Text style={styles.stepButtonText}>{step.buttonText}</Text>
                                    <ArrowUpRight size={14} color={Colors.accentBlue} />
                                </TouchableOpacity>
                            )}
                        </View>
                    ))}
                </View>

                {/* Input Section */}
                <View style={styles.card}>
                     <Text style={styles.cardTitle}>Key 입력</Text>
                    <View style={styles.inputWrapper}>
                        <Text style={styles.inputLabel}>App Key</Text>
                        <TextInput
                            style={styles.input}
                            value={appKey}
                            onChangeText={setAppKey}
                            placeholder="발급받은 App Key를 입력하세요"
                            placeholderTextColor={Colors.placeholder}
                            autoCapitalize="none"
                        />
                    </View>
                    <View style={styles.inputWrapper}>
                        <Text style={styles.inputLabel}>Secret Key</Text>
                        <View style={styles.secretInputContainer}>
                            <TextInput
                                style={[styles.input, { flex: 1 }]}
                                value={secretKey}
                                onChangeText={setSecretKey}
                                placeholder="발급받은 Secret Key를 입력하세요"
                                placeholderTextColor={Colors.placeholder}
                                secureTextEntry={!isSecretVisible}
                                autoCapitalize="none"
                            />
                            <TouchableOpacity onPress={() => setSecretVisible(!isSecretVisible)} style={styles.eyeIcon}>
                                {isSecretVisible ? <Eye size={22} color={Colors.textSecondary} /> : <EyeOff size={22} color={Colors.textSecondary} />}
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
                 {/* Action Button */}
                 <TouchableOpacity style={styles.actionButton} onPress={handleValidation}>
                    <Text style={styles.actionButtonText}>계좌 연동 및 검증하기</Text>
                </TouchableOpacity>
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: Colors.surface },
    container: { flex: 1, backgroundColor: Colors.background, },
    contentContainer: { padding: 20, },
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
    backButton: { padding: 4 },
    headerTitle: { fontSize: 18, fontWeight: 'bold', color: Colors.textPrimary },
    card: {
        backgroundColor: Colors.surface,
        borderRadius: 12,
        padding: 20,
        marginBottom: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 3,
    },
    cardTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: Colors.textPrimary,
        marginBottom: 16,
    },
    stepContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 15,
    },
    stepIcon: { marginRight: 12, marginTop: 2, },
    stepTextContainer: { flex: 1, },
    stepText: { fontSize: 15, color: Colors.textSecondary, lineHeight: 22, },
    stepButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 6,
        backgroundColor: '#E9F2FF',
    },
    stepButtonText: {
        color: Colors.accentBlue,
        fontSize: 14,
        fontWeight: '600',
        marginRight: 4,
    },
    inputWrapper: { marginBottom: 16 },
    inputLabel: {
        fontSize: 14,
        fontWeight: '600',
        color: Colors.textSecondary,
        marginBottom: 8,
    },
    input: {
        backgroundColor: Colors.background,
        borderWidth: 1,
        borderColor: Colors.border,
        borderRadius: 8,
        paddingHorizontal: 16,
        paddingVertical: 12,
        fontSize: 16,
        color: Colors.textPrimary,
    },
    secretInputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        position: 'relative',
    },
    eyeIcon: {
        position: 'absolute',
        right: 0,
        padding: 12,
    },
    actionButton: {
        backgroundColor: Colors.accentBlue,
        borderRadius: 10,
        paddingVertical: 16,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 10,
    },
    actionButtonText: {
        color: '#FFFFFF',
        fontSize: 18,
        fontWeight: 'bold',
    },
});

export default LinkKiwoomScreen;
