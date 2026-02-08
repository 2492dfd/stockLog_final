import React, { useState, useEffect } from 'react';
import { 
    View, 
    Text, 
    StyleSheet, 
    SafeAreaView, 
    TouchableOpacity, 
    Switch,
    ActivityIndicator,
    Alert,
} from 'react-native';
import { ChevronLeft } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { notificationApi } from '../src/api';

// --- Color Constants ---
const Colors = {
  background: '#FFFFFF',
  textPrimary: '#191F28',
  textSecondary: '#6B7684',
  accentBlue: '#3182F6',
  border: '#E5E8EB',
};

const NotificationSettingsScreen = () => {
    const router = useRouter();
    const [notifyHeart, setNotifyHeart] = useState(false);
    const [notifyComment, setNotifyComment] = useState(false);
    const [notifyFollow, setNotifyFollow] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const response = await notificationApi.getNotificationSettings();
                const settings = response.data;
                setNotifyHeart(settings.notifyHeart);
                setNotifyComment(settings.notifyComment);
                setNotifyFollow(settings.notifyFollow);
            } catch (error) {
                console.error("Failed to fetch notification settings:", error);
                Alert.alert("오류", "알림 설정을 불러오는 데 실패했습니다.");
            } finally {
                setIsLoading(false);
            }
        };

        fetchSettings();
    }, []);

    const handleValueChange = async (type, value) => {
        // Optimistically update UI
        const oldSettings = { notifyHeart, notifyComment, notifyFollow };
        let newSettings;

        if (type === 'heart') {
            setNotifyHeart(value);
            newSettings = { ...oldSettings, notifyHeart: value };
        } else if (type === 'comment') {
            setNotifyComment(value);
            newSettings = { ...oldSettings, notifyComment: value };
        } else if (type === 'follow') {
            setNotifyFollow(value);
            newSettings = { ...oldSettings, notifyFollow: value };
        }

        try {
            await notificationApi.updateNotificationSettings(newSettings);
        } catch (error) {
            console.error("Failed to update notification settings:", error);
            Alert.alert("오류", "설정 저장에 실패했습니다.");
            // Revert UI on failure
            if (type === 'heart') setNotifyHeart(oldSettings.notifyHeart);
            if (type === 'comment') setNotifyComment(oldSettings.notifyComment);
            if (type === 'follow') setNotifyFollow(oldSettings.notifyFollow);
        }
    };

    const handleBack = () => {
        if (router.canGoBack()) {
            router.back();
        } else {
            router.replace('/settings');
        }
    };
    
    if (isLoading) {
        return (
            <SafeAreaView style={styles.safeArea}>
                <View style={styles.header}>
                  <TouchableOpacity onPress={handleBack} style={styles.backButton}>
                      <ChevronLeft size={28} color={Colors.textPrimary} />
                  </TouchableOpacity>
                  <Text style={styles.headerTitle}>알림 설정</Text>
                  <View style={{ width: 28 }} />
                </View>
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={Colors.accentBlue} />
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.safeArea}>
            <View style={styles.header}>
                <TouchableOpacity onPress={handleBack} style={styles.backButton}>
                    <ChevronLeft size={28} color={Colors.textPrimary} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>알림 설정</Text>
                <View style={{ width: 28 }} />
            </View>

            <View style={styles.container}>
                <View style={styles.settingItem}>
                    <Text style={styles.settingLabel}>좋아요 알림</Text>
                    <Switch
                        trackColor={{ false: Colors.border, true: Colors.accentBlue }}
                        thumbColor={Colors.background}
                        ios_backgroundColor={Colors.border}
                        onValueChange={(value) => handleValueChange('heart', value)}
                        value={notifyHeart}
                    />
                </View>
                <View style={styles.settingItem}>
                    <Text style={styles.settingLabel}>댓글 알림</Text>
                    <Switch
                        trackColor={{ false: Colors.border, true: Colors.accentBlue }}
                        thumbColor={Colors.background}
                        ios_backgroundColor={Colors.border}
                        onValueChange={(value) => handleValueChange('comment', value)}
                        value={notifyComment}
                    />
                </View>
                <View style={styles.settingItem}>
                    <Text style={styles.settingLabel}>팔로우 알림</Text>
                    <Switch
                        trackColor={{ false: Colors.border, true: Colors.accentBlue }}
                        thumbColor={Colors.background}
                        ios_backgroundColor={Colors.border}
                        onValueChange={(value) => handleValueChange('follow', value)}
                        value={notifyFollow}
                    />
                </View>
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: Colors.background },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
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
    settingItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: Colors.border,
    },
    settingLabel: {
        fontSize: 16,
        color: Colors.textPrimary,
    },
});

export default NotificationSettingsScreen;
