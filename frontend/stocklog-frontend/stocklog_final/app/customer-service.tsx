import React, { useState, useEffect, useCallback } from 'react';
import { 
    View, 
    Text, 
    StyleSheet, 
    SafeAreaView, 
    TouchableOpacity, 
    TextInput, 
    ScrollView,
    Alert,
    Platform,
    ActivityIndicator
} from 'react-native';
import { ChevronLeft } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { inquiryApi } from '../src/api';
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
};

const CustomerServiceScreen = () => {
    const router = useRouter();
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [userId, setUserId] = useState(null);
    const [inquiries, setInquiries] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSending, setIsSending] = useState(false); // New state for sending status

    const fetchData = useCallback(async () => {
        setIsLoading(true);
        try {
            const token = await AppStorage.getItem('userToken');
            if (!token) {
                Alert.alert('오류', '로그인이 필요합니다.');
                setIsLoading(false);
                router.replace('/(auth)/login');
                return;
            }
            const decoded = parseJwt(token);
            const currentUserId = decoded?.userId || decoded?.id || decoded?.sub;
            setUserId(currentUserId);

            if (currentUserId) {
                const response = await inquiryApi.getMyInquiries(currentUserId);
                // Sort inquiries by creation date, newest first
                const sortedInquiries = response.data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
                setInquiries(sortedInquiries);
            }
        } catch (error) {
            console.error('Failed to fetch user data or inquiries:', error);
            Alert.alert('오류', '데이터를 불러오는 중 문제가 발생했습니다.');
        } finally {
            setIsLoading(false);
        }
    }, [router]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleSendInquiry = async () => {
        if (!title.trim() || !content.trim()) {
            Alert.alert('입력 오류', '제목과 내용을 모두 입력해주세요.');
            return;
        }
        if (!userId) {
            Alert.alert('오류', '사용자 정보를 확인할 수 없습니다. 다시 로그인해주세요.');
            return;
        }

        setIsSending(true); // Set sending state to true

        try {
            const response = await inquiryApi.createInquiry({ userId, title, content });
            Alert.alert('성공', response.data); // "문의가 성공적으로 접수되었습니다."
            setTitle('');
            setContent('');
            await fetchData(); // Refresh the list
        } catch (error) {
            console.error('Failed to send inquiry:', error);
            Alert.alert('전송 실패', '문의를 보내는 중 오류가 발생했습니다.');
        } finally {
            setIsSending(false); // Reset sending state
        }
    };

    const handleBack = () => {
        if (router.canGoBack()) {
            router.back();
        } else {
            router.replace('/(tabs)');
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return '';
        return new Date(dateString).toISOString().split('T')[0];
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity 
                    onPress={handleBack} 
                    style={styles.backButton}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                    <ChevronLeft size={28} color={Colors.textPrimary} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>고객센터</Text>
                <View style={{ width: 28 }} />
            </View>

            <ScrollView style={styles.container}>
                {/* Inquiry Section */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>1:1 문의하기</Text>
                    <View style={styles.inputContainer}>
                        <TextInput
                            style={styles.input}
                            placeholder="제목을 입력하세요"
                            value={title}
                            onChangeText={setTitle}
                            placeholderTextColor={Colors.textSecondary}
                        />
                        <TextInput
                            style={[styles.input, styles.textArea]}
                            placeholder="문의하실 내용을 입력하세요."
                            value={content}
                            onChangeText={setContent}
                            multiline
                            textAlignVertical="top"
                            placeholderTextColor={Colors.textSecondary}
                        />
                    </View>
                    <TouchableOpacity 
                        style={styles.sendButton} 
                        onPress={handleSendInquiry}
                        disabled={isSending} // Disable button while sending
                    >
                        {isSending ? (
                            <ActivityIndicator color={Colors.background} /> // Show loader
                        ) : (
                            <Text style={styles.sendButtonText}>보내기</Text>
                        )}
                    </TouchableOpacity>
                </View>
                
                {/* Divider */}
                <View style={styles.divider} />

                {/* Responses Section */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>고객센터 응답 보기</Text>
                    {isLoading ? (
                        <ActivityIndicator size="large" color={Colors.accentBlue} style={{ marginTop: 20 }}/>
                    ) : inquiries.length === 0 ? (
                        <Text style={styles.noInquiriesText}>아직 작성한 문의 내역이 없습니다.</Text>
                    ) : (
                        <View style={styles.responseList}>
                            {inquiries.map(item => (
                                <View key={item.id} style={styles.responseCard}>
                                    <View style={styles.responseHeader}>
                                        <Text style={styles.responseQuestion} numberOfLines={1}>{item.title}</Text>
                                        <View style={[styles.statusBadge, { backgroundColor: item.answer ? Colors.accentBlue : '#FFA500' }]}>
                                            <Text style={styles.statusText}>{item.answer ? '답변 완료' : '처리 중'}</Text>
                                        </View>
                                    </View>
                                    <Text style={styles.responseDate}>{formatDate(item.createdAt)}</Text>
                                    <View style={styles.contentContainer}>
                                        <Text style={styles.contentText}>{item.content}</Text>
                                    </View>
                                    {item.answer && (
                                        <View style={styles.answerContainer}>
                                            <Text style={styles.answerLabel}>답변:</Text>
                                            <Text style={styles.answerText}>{item.answer}</Text>
                                        </View>
                                    )}
                                </View>
                            ))}
                        </View>
                    )}
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: Colors.background },
    container: { flex: 1, padding: 20 },
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
    section: { marginBottom: 30 },
    sectionTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: Colors.textPrimary,
        marginBottom: 16,
    },
    inputContainer: {
        backgroundColor: Colors.surface,
        borderRadius: 8,
        padding: 12,
        borderWidth: 1,
        borderColor: Colors.border,
    },
    input: {
        fontSize: 16,
        color: Colors.textPrimary,
        paddingVertical: 10,
        paddingHorizontal: 8,
    },
    textArea: {
        minHeight: 150,
        marginTop: 10,
        borderTopWidth: 1,
        borderTopColor: Colors.border,
    },
    sendButton: {
        backgroundColor: Colors.accentBlue,
        borderRadius: 8,
        paddingVertical: 14,
        alignItems: 'center',
        marginTop: 16,
    },
    sendButtonText: {
        fontSize: 16,
        color: Colors.background,
        fontWeight: 'bold',
    },
    divider: {
        height: 8,
        backgroundColor: Colors.surface,
        marginHorizontal: -20,
    },
    responseList: {
        marginTop: 10,
    },
    responseCard: {
        backgroundColor: Colors.surface,
        borderRadius: 8,
        padding: 16,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: Colors.border,
    },
    responseHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    responseQuestion: {
        fontSize: 16,
        fontWeight: 'bold',
        color: Colors.textPrimary,
        flex: 1,
        marginRight: 10,
    },
    statusBadge: {
        borderRadius: 12,
        paddingHorizontal: 10,
        paddingVertical: 4,
    },
    statusText: {
        fontSize: 12,
        color: Colors.background,
        fontWeight: 'bold',
    },
    responseDate: {
        fontSize: 14,
        color: Colors.textSecondary,
        marginBottom: 12,
    },
    contentContainer: {
        marginBottom: 12,
    },
    contentText: {
        fontSize: 15,
        color: Colors.textPrimary,
        lineHeight: 22,
    },
    answerContainer: {
        paddingTop: 12,
        marginTop: 12,
        borderTopWidth: 1,
        borderTopColor: Colors.border,
    },
    answerLabel: {
        fontSize: 14,
        fontWeight: 'bold',
        color: Colors.textSecondary,
        marginBottom: 4,
    },
    answerText: {
        fontSize: 15,
        color: Colors.textPrimary,
        lineHeight: 22,
        backgroundColor: '#E9F5FF',
        padding: 10,
        borderRadius: 6,
    },
    noInquiriesText: {
        textAlign: 'center',
        marginTop: 20,
        fontSize: 16,
        color: Colors.textSecondary,
    },
});

export default CustomerServiceScreen;