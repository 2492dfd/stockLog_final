import React, { useState, useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Bell, Menu } from 'lucide-react-native';
import { notificationApi } from '../src/api';

const TossDarkGray = '#191F28';
const NotificationRed = '#F04452';

interface CustomHeaderProps {
  onNotificationPress: () => void;
  onMenuPress: () => void;
}

const CustomHeader: React.FC<CustomHeaderProps> = ({ onNotificationPress, onMenuPress }) => {
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    // Backend API for notifications not ready yet, commenting out to avoid 404
    /*
    const fetchUnreadCount = async () => {
      try {
        const response = await notificationApi.getUnreadCount();
        setUnreadCount(response.data);
      } catch (e) {
        // console.error("Failed to fetch unread count", e);
      }
    };
    fetchUnreadCount();
    
    const interval = setInterval(fetchUnreadCount, 60000);
    return () => clearInterval(interval);
    */
  }, []);

  return (
    <View style={styles.appBar}>
      {/* Empty View to occupy left space, or a logo can go here */}
      <View style={styles.appBarLeft} />
      <View style={styles.appBarIcons}>
        <TouchableOpacity onPress={onNotificationPress} style={styles.iconButton}>
          <View>
            <Bell color={TossDarkGray} size={24} />
            {unreadCount > 0 && <View style={styles.badge} />}
          </View>
        </TouchableOpacity>
        <TouchableOpacity onPress={onMenuPress}>
          <Menu color={TossDarkGray} size={24} />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  appBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    height: 60,
    backgroundColor: 'rgba(255, 255, 255, 0.8)', // Semi-transparent white
    // borderBottomWidth: 1, 
    // borderBottomColor: '#F2F4F6',
    zIndex: 10,
  },
  appBarLeft: {
    // This can be used for a logo or just remain empty
    width: 24 * 2 + 16, // Approximate width of the icons on the right for balanced spacing
  },
  appBarIcons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconButton: {
    marginRight: 16,
  },
  badge: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: NotificationRed,
  },
});

export default CustomHeader;