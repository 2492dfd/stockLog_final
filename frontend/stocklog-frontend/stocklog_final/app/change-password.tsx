import React, { useState } from 'react';
import { 
    View, 
    Text, 
    StyleSheet, 
    SafeAreaView, 
    TouchableOpacity, 
    TextInput, 
    Alert,
    ActivityIndicator
} from 'react-native';
import { ChevronLeft } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { userApi } from '../src/api';

// --- Color Constants ---
const Colors = {
  background: '#FFFFFF',
  surface: '#F8F9FA',
  textPrimary: '#191F28',
  textSecondary: '#6B7684',
  accentBlue: '#3182F6',
  border: '#E5E8EB',
};

const ChangePasswordScreen = () => {
    const router = useRouter();
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmNewPassword, setConfirmNewPassword] = useState('');
    const [isSaving, setIsSaving] = useState(false);

    const handleChangePassword = async () => {
        if (!currentPassword || !newPassword || !confirmNewPassword) {
            Alert.alert('입력 오류', '모든 비밀번호 필드를 입력해주세요.');
            return;
        }
        if (newPassword !== confirmNewPassword) {
            Alert.alert('입력 오류', '새로운 비밀번호가 일치하지 않습니다.');
            return;
        }
        if (newPassword.length < 6) {
            Alert.alert('입력 오류', '새로운 비밀번호는 6자 이상이어야 합니다.');
            return;
        }

        setIsSaving(true);
        try {
            const passwordData = {
                currentPassword: currentPassword,
                newPassword: newPassword,
            };
            
            await userApi.updatePassword(passwordData);

            Alert.alert('성공', '비밀번호가 성공적으로 변경되었습니다.', [
                { text: '확인', onPress: () => router.back() }
            ]);
            setCurrentPassword('');
            setNewPassword('');
            setConfirmNewPassword('');
        } catch (error) {
            console.error('Failed to change password:', error);
            const errorMessage = error.response?.data?.message || '비밀번호 변경에 실패했습니다. 현재 비밀번호를 확인해주세요.';
            Alert.alert('오류', errorMessage);
        } finally {
            setIsSaving(false);
        }
    };

    const handleBack = () => {
        if (router.canGoBack()) {
            router.back();
        } else {
            router.replace('/(tabs)');
        }
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            <View style={styles.header}>
                <TouchableOpacity onPress={handleBack} style={styles.backButton}>
                    <ChevronLeft size={28} color={Colors.textPrimary} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>비밀번호 변경</Text>
                <View style={{ width: 28 }} />
            </View>

            <View style={styles.container}>
                <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>현재 비밀번호</Text>
                    <TextInput
                        style={styles.input}
                        secureTextEntry
                        value={currentPassword}
                        onChangeText={setCurrentPassword}
                        placeholder="현재 사용 중인 비밀번호"
                        placeholderTextColor={Colors.textSecondary}
                    />
                </View>
                <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>새로운 비밀번호</Text>
                    <TextInput
                        style={styles.input}
                        secureTextEntry
                        value={newPassword}
                        onChangeText={setNewPassword}
                        placeholder="6자 이상"
                        placeholderTextColor={Colors.textSecondary}
                    />
                </View>
                <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>새로운 비밀번호 확인</Text>
                    <TextInput
                        style={styles.input}
                        secureTextEntry
                        value={confirmNewPassword}
                        onChangeText={setConfirmNewPassword}
                        placeholder="비밀번호를 다시 입력하세요"
                        placeholderTextColor={Colors.textSecondary}
                    />
                </View>
                <TouchableOpacity 
                    style={[styles.actionButton, isSaving && styles.disabledButton]} 
                    onPress={handleChangePassword}
                    disabled={isSaving}
                >
                    {isSaving ? (
                        <ActivityIndicator color="#FFFFFF" />
                    ) : (
                        <Text style={styles.actionButtonText}>비밀번호 변경</Text>
                    )}
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: Colors.background },
    container: { 
        flex: 1,
        paddingHorizontal: 20,
        paddingTop: 24,
    },
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
    inputGroup: {
        marginBottom: 16,
    },
    inputLabel: {
        fontSize: 15,
        color: Colors.textPrimary,
        marginBottom: 8,
        fontWeight: '500',
    },
    input: {
        backgroundColor: Colors.surface,
        borderRadius: 8,
        paddingVertical: 12,
        paddingHorizontal: 14,
        fontSize: 16,
        borderWidth: 1,
        borderColor: Colors.border,
        color: Colors.textPrimary,
    },
    actionButton: {
        backgroundColor: Colors.accentBlue,
        borderRadius: 8,
        paddingVertical: 14,
        alignItems: 'center',
        marginTop: 16,
    },
    disabledButton: {
        backgroundColor: '#A4B8D3',
    },
    actionButtonText: {
        fontSize: 16,
        color: Colors.background,
        fontWeight: 'bold',
    },
});

export default ChangePasswordScreen;
