import { Tabs, useRouter, useLocalSearchParams } from 'expo-router';
import React, { useState, useEffect } from 'react';
import { View, SafeAreaView, Alert } from 'react-native';
import CustomTabBar from '../../components/CustomTabBar';
import CustomHeader from '../../components/CustomHeader';
import NotificationModal from '../../components/NotificationModal';
import SideMenuModal from '../../components/SideMenuModal';
import { userApi } from '../../src/api.js';
import AppStorage from '../../src/utils/storage';
import { parseJwt } from '../../src/utils/jwt';

export default function TabLayout() {
  const [notificationModalVisible, setNotificationModalVisible] = useState(false);
  const [sideMenuModalVisible, setSideMenuModalVisible] = useState(false);
  const router = useRouter();
  const { openSideMenu } = useLocalSearchParams();

  useEffect(() => {
    if (openSideMenu === 'true') {
        setSideMenuModalVisible(true);
    }
  }, [openSideMenu]);

  const handleNotificationPress = () => {
    setNotificationModalVisible(true);
  };

  const handleMenuPress = () => {
    setSideMenuModalVisible(true);
  };

  const handleLogout = async () => {
    await AppStorage.removeItem('userToken');
    router.replace('/(auth)');
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: 'white' }}>
      <View style={{ flex: 1, position: 'relative' }}>
        <Tabs tabBar={(props) => <CustomTabBar {...props} />} screenOptions={{ headerShown: false }}>
          <Tabs.Screen
            name="index"
            options={{
              title: '매매일지',
              tabBarLabel: '매매일지',
            }}
          />
          <Tabs.Screen
            name="settlement"
            options={{
              title: '결산',
              tabBarLabel: '결산',
            }}
          />
          <Tabs.Screen
            name="strategy"
            options={{
              title: '전략',
              tabBarLabel: '전략',
            }}
          />
          <Tabs.Screen
            name="community"
            options={{
              title: '커뮤니티',
              tabBarLabel: '커뮤니티',
            }}
          />
        </Tabs>
        <View style={{ position: 'absolute', top: 0, left: 0, right: 0, zIndex: 10 }}>
            <CustomHeader onNotificationPress={handleNotificationPress} onMenuPress={handleMenuPress} />
        </View>
        <NotificationModal
          visible={notificationModalVisible}
          onClose={() => setNotificationModalVisible(false)}
        />
        <SideMenuModal
          visible={sideMenuModalVisible}
          onClose={() => setSideMenuModalVisible(false)}
          onLogout={handleLogout}
        />
      </View>
    </SafeAreaView>
  );
}