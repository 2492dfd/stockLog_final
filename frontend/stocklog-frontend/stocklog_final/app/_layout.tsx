import { Stack } from 'expo-router';
import React, { useEffect, useRef } from 'react';
import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import axios from 'axios';
import AppStorage from '../src/utils/storage';

// 알림이 왔을 때 어떻게 보여줄지 설정
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

async function registerForPushNotificationsAsync() {
  // 1. 웹 브라우저라면 그냥 바로 종료 (에러 방지)
  if (Platform.OS === 'web') {
    console.log('웹 환경에서는 푸시 알림을 지원하지 않습니다.');
    return;
  }

  let token;

  // 1. 실제 기기인지 확인 (에뮬레이터는 안됨)
  if (Device.isDevice) {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    
    // 권한 없으면 요청
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    
    if (finalStatus !== 'granted') {
      alert('알림 권한을 허용하지 않으면 알림을 받을 수 없습니다!');
      return;
    }

    // 2. FCM 토큰 가져오기 (Expo 프로젝트 ID 필요)
    token = (await Notifications.getDevicePushTokenAsync()).data;
    console.log('생성된 FCM 토큰:', token);

    // 3. 백엔드로 토큰 전송
    try {
      const userLoginToken = await AppStorage.getItem('userToken');
      if (userLoginToken) {
        // TODO: 백엔드 API의 기본 URL이 axios 인스턴스에 설정되어 있다고 가정합니다.
        await axios.patch('/api/notifications/fcm-token', 
          { fcmToken: token }, 
          { headers: { Authorization: `Bearer ${userLoginToken}` } }
        );
        console.log('FCM 토큰을 서버에 성공적으로 저장했습니다.');
      }
    } catch (e) {
      console.log('서버 토큰 저장 실패:', e);
    }
    
  } else {
    // alert('푸시 알림 테스트는 실제 기기에서 진행해야 합니다.');
    console.log('푸시 알림은 실제 기기에서만 작동합니다.');
  }

  return token;
}


export default function RootLayout() {
  // 향후 여기서 인증 상태에 따라 (auth) 또는 (tabs)로 분기할 수 있습니다.
  // 예: const { isLoggedIn } = useAuth();
  // if (isLoggedIn) return <Stack.Screen name="(tabs)" />;
  
  useEffect(() => {
    // 1. 토큰 등록 실행
    registerForPushNotificationsAsync();

    // 2. 알림 수신 리스너 (앱이 켜져 있을 때)
    const notificationListener = Notifications.addNotificationReceivedListener(notification => {
      console.log('알림 수신:', notification);
    });

    // 3. 알림에 반응하는 리스너 (예: 알림 클릭 시)
    const responseListener = Notifications.addNotificationResponseReceivedListener(response => {
      console.log('알림 반응 수신:', response);
      // 여기서 특정 화면으로 이동하는 등의 로직을 추가할 수 있습니다.
      // 예: const { screen } = response.notification.request.content.data;
      // if (screen) router.push(screen);
    });

    return () => {
      if (notificationListener) {
        notificationListener.remove();
      }
      if (responseListener) {
        responseListener.remove();
      }
    };
  }, []);
  
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(auth)" />
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="LinkSuccessScreen" options={{ headerShown: false }} />
      <Stack.Screen name="my-stocks" options={{ presentation: 'modal', headerShown: false }} />
    </Stack>
  );
}
