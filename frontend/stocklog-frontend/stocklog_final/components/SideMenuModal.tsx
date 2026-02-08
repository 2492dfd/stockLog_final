import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Modal, SafeAreaView, TouchableOpacity, ScrollView, Alert, Image, Platform } from 'react-native';
import { X, User, Settings, HelpCircle, LogOut, UserX, Upload } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import * as DocumentPicker from 'expo-document-picker';
import axios from 'axios'; // axios import 추가
import { userApi } from '../src/api.js';
import AppStorage from '../src/utils/storage';
import { parseJwt } from '../src/utils/jwt';
import API_BASE_URL from '../src/api/config.js';
import ImportCSVModal from './ImportCSVModal'; // ImportCSVModal을 사용하도록 변경

const Colors = {
    background: '#FFFFFF',
    surface: '#F8F9FA',
    textPrimary: '#191F28',
    textSecondary: '#6B7684',
    border: '#E5E8EB',
};

const SideMenuModal = ({ visible, onClose, onLogout }) => {
    const router = useRouter();
    const [userId, setUserId] = useState(null);
    const [isImportModalVisible, setImportModalVisible] = useState(false); // 새로운 모달의 표시 상태

    useEffect(() => {
        if (visible) {
            fetchUserId();
        }
    }, [visible]);

    const fetchUserId = async () => {
        try {
            const token = await AppStorage.getItem('userToken');
            if (token) {
                const decoded = parseJwt(token);
                const uid = decoded?.userId || decoded?.id || decoded?.sub;
                if (uid) {
                    setUserId(uid);
                }
            }
        } catch (e) {
            console.error('Failed to load user info:', e);
        }
    };

    const handleProfilePress = () => {
        if (userId) {
            onClose();
            router.push('/my-page');
        }
    };

    const handleImportCsv = async () => {
        try {
            const result = await DocumentPicker.getDocumentAsync({
                type: ['text/csv', 'text/plain'], // CSV 파일 타입 지정
                copyToCacheDirectory: true,
            });

            if (result.canceled) {
                console.log('File picking was cancelled');
                return;
            }
    
            const fileAsset = result.assets?.[0]; // file -> fileAsset으로 이름 변경 (가독성)
    
            if (!fileAsset) {
                // 사용자가 파일 선택을 취소한 경우, 조용히 종료
                return;
            }

            const token = await AppStorage.getItem('userToken'); // 여기에서 토큰을 가져옵니다.
            console.log('--- FrontEnd: Retrieved Token ---', token); // 토큰 값 콘솔 출력 추가
            if (!token) {
                Alert.alert('오류', '로그인이 필요합니다.');
                return;
            }

            const formData = new FormData();

            if (Platform.OS === 'web') {
                // 웹 환경 대응: URI를 Blob으로 변환
                const response = await fetch(fileAsset.uri);
                const blob = await response.blob();
                // 백엔드 @RequestParam("file")과 일치시키기 위해 세 번째 인자로 파일명 전달
                formData.append('file', blob, fileAsset.name); 
            } else {
                // 앱(아이폰/안드로이드) 환경 대응
                formData.append('file', {
                    uri: fileAsset.uri,
                    name: fileAsset.name,
                    type: fileAsset.mimeType || 'text/csv', // mimeType이 없을 경우 기본값
                } as any); // TypeScript 오류를 피하기 위해 'as any' 사용
            }

            // axios를 사용한 API 호출로 변경
            const response = await axios.post(`${API_BASE_URL}/api/tradelogs/import`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data', // FormData 사용 시 axios가 자동으로 설정하지만 명시적으로 추가
                    'Authorization': `Bearer ${token}`, // Authorization 헤더 추가
                },
            });
            
            // alert으로 변경
            alert("성공적으로 불러왔습니다!");

        } catch (error) {
            console.error("Failed to import CSV:", error);
            // 백엔드에서 던진 IllegalArgumentException 메시지를 보여줌
            const errorMsg = error.response?.data?.message || error.message || "파일 형식이 맞지 않습니다.";
            Alert.alert(
                "불러오기 실패",
                `${errorMsg}\n\n엑셀 첫 줄 이름을 [날짜, 종목명, 구분, 수량, 단가]으로 수정 후 다시 시도해 주세요.`,
                [{ text: "확인" }]
            );
        }
    };

    const handleImportAndClose = async () => {
        setImportModalVisible(false);
        // 작은 지연을 주어 모달이 닫히는 애니메이션이 완료될 시간을 줍니다.
        setTimeout(async () => {
            await handleImportCsv();
        }, 300);
    };

    const handleDeleteAccount = () => {
        const performDelete = async () => {
            try {
                const token = await AppStorage.getItem('userToken');
                if (!token) throw new Error('인증 토큰이 없습니다. 다시 로그인해주세요.');

                const decoded = parseJwt(token);
                const uid = decoded?.userId || decoded?.id || decoded?.sub;

                if (!uid) throw new Error('사용자 정보를 확인할 수 없습니다.');

                // Sanitize the UID to handle potential "1:1" format
                let sanitizedUid = uid;
                if (typeof uid === 'string' && uid.includes(':')) {
                    sanitizedUid = uid.split(':')[0];
                }

                await userApi.deleteUser(sanitizedUid);
                
                const successMsg = '계정이 성공적으로 삭제되었습니다.';
                if (Platform.OS === 'web') {
                    alert(successMsg);
                    await AppStorage.removeItem('userToken');
                    onClose();
                    router.replace('/(auth)');
                } else {
                    Alert.alert('성공', successMsg, [
                        {
                            text: '확인',
                            onPress: async () => {
                                await AppStorage.removeItem('userToken');
                                onClose();
                                router.replace('/(auth)');
                            }
                        }
                    ]);
                }
            } catch (error) {
                console.error('Failed to delete account:', error);
                const errorMsg = `계정 삭제에 실패했습니다.\n${error.message || '알 수 없는 오류'}`;
                if (Platform.OS === 'web') {
                    alert(errorMsg);
                } else {
                    Alert.alert('오류', errorMsg);
                }
            }
        };

        if (Platform.OS === 'web') {
            if (window.confirm('정말로 계정을 탈퇴하시겠습니까?')) {
                performDelete();
            }
        } else {
            Alert.alert('계정 탈퇴', '정말로 계정을 탈퇴하시겠습니까?', [
                { text: '취소', style: 'cancel' },
                {
                    text: '탈퇴',
                    style: 'destructive',
                    onPress: performDelete,
                },
            ]);
        }
    };

    const menuItems = [
        {
            id: '1',
            title: '내 프로필',
            icon: <User color={Colors.textPrimary} size={24} />,
            action: handleProfilePress
        },
        { id: '2', title: '설정', icon: <Settings color={Colors.textPrimary} size={24} />, action: () => { onClose(); router.push('/settings'); } },
        { 
            id: '6', 
            title: '매매일지 불러오기', 
            icon: <Upload color={Colors.textPrimary} size={24} />, 
            action: () => setImportModalVisible(true) // 설명 모달을 열도록 변경
        },
        {
            id: '7',
            title: '증권사 연동하기 (키움증권)',
            icon: <Upload color={Colors.textPrimary} size={24} />, // Placeholder icon
            action: () => {
                console.log('Kiwoom link button pressed in SideMenuModal');
                onClose();
                router.push('/link-kiwoom');
            }
        },

        { id: '3', title: '고객센터', icon: <HelpCircle color={Colors.textPrimary} size={24} />, action: () => { onClose(); router.push('/customer-service'); } },
        { id: '4', title: '로그아웃', icon: <LogOut color={Colors.textPrimary} size={24} />, action: onLogout },
        {
            id: '5',
            title: '계정 탈퇴',
            icon: <UserX color={Colors.textPrimary} size={24} />,
            action: handleDeleteAccount
        },
    ];

    return (
        <>
            <Modal
                animationType="slide"
                transparent={true}
                visible={visible}
                onRequestClose={onClose}
            >
                <SafeAreaView style={styles.safeArea}>
                    <View style={styles.modalHeader}>
                        <TouchableOpacity onPress={onClose} style={styles.modalCloseButton}>
                            <X size={32} color={Colors.textPrimary} />
                        </TouchableOpacity>
                    </View>
                    
                    <ScrollView>
                        {menuItems.map(item => (
                            <TouchableOpacity key={item.id} style={styles.menuItem} onPress={item.action}>
                                <View style={styles.menuItemIcon}>{item.icon}</View>
                                <Text style={styles.menuItemText}>{item.title}</Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                </SafeAreaView>
            </Modal>
            <ImportCSVModal
                visible={isImportModalVisible}
                onClose={() => setImportModalVisible(false)}
                onImport={handleImportAndClose}
            />
        </>
    );
};

const styles = StyleSheet.create({
    safeArea: { 
        flex: 1, 
        backgroundColor: Colors.background,
    },
    modalHeader: {
        alignItems: 'flex-end',
        padding: 16,
    },
    modalCloseButton: {
        padding: 4,
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 20,
        paddingHorizontal: 24,
    },
    menuItemIcon: {
        marginRight: 20,
    },
    menuItemText: {
        fontSize: 18,
        fontWeight: '500',
        color: Colors.textPrimary,
    },
});

export default SideMenuModal;