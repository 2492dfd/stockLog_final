import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Modal, FlatList, TouchableOpacity, SafeAreaView, ActivityIndicator } from 'react-native';
import { X, Heart, MessageCircle, UserPlus, Bell } from 'lucide-react-native';
import { notificationApi } from '../src/api';
import { useRouter } from 'expo-router';

const Colors = {
  background: '#FFFFFF',
  textPrimary: '#191F28',
  textSecondary: '#8B95A1',
  border: '#E5E8EB',
  accentBlue: '#3182F6',
  accentRed: '#F04452',
};

const NotificationModal = ({ visible, onClose }) => {
  const router = useRouter();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (visible) {
      // fetchNotifications(); // Disabled until backend is ready
      setLoading(false);
      setNotifications([]);
    }
  }, [visible]);

  const fetchNotifications = async () => {
    /*
    try {
      setLoading(true);
      const response = await notificationApi.getNotifications();
      setNotifications(response.data);
    } catch (error) {
      console.error("Failed to fetch notifications:", error);
    } finally {
      setLoading(false);
    }
    */
  };

  const handleNotificationPress = async (item) => {
    // 1. Mark as read
    try {
        if (!item.isRead) {
            await notificationApi.markAsRead(item.id);
            // Local update to reflect read status immediately
            setNotifications(prev => prev.map(n => n.id === item.id ? { ...n, isRead: true } : n));
        }
    } catch (e) {
        console.error("Failed to mark notification as read", e);
    }

    // 2. Navigate based on type
    onClose();
    if (item.type === 'FOLLOW') {
        router.push(`/profile/${item.senderId}`);
    } else if (item.type === 'HEART' || item.type === 'COMMENT') {
        if (item.postId) {
            router.push(`/post/${item.postId}`);
        }
    }
  };

  const getIcon = (type) => {
    switch (type) {
      case 'HEART': return <Heart size={20} color={Colors.accentRed} fill={Colors.accentRed} />;
      case 'COMMENT': return <MessageCircle size={20} color={Colors.accentBlue} />;
      case 'FOLLOW': return <UserPlus size={20} color={Colors.accentBlue} />;
      default: return <Bell size={20} color={Colors.textSecondary} />;
    }
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity 
        style={[styles.notificationItem, !item.isRead && styles.unreadItem]} 
        onPress={() => handleNotificationPress(item)}
    >
      <View style={styles.iconContainer}>
        {getIcon(item.type)}
      </View>
      <View style={styles.contentContainer}>
        <Text style={styles.message}>{item.message}</Text>
        <Text style={styles.time}>{item.createdAt ? new Date(item.createdAt).toLocaleDateString() : '방금 전'}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <Text style={styles.title}>알림</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <X size={24} color={Colors.textPrimary} />
          </TouchableOpacity>
        </View>
        
        {loading ? (
            <View style={styles.center}>
                <ActivityIndicator size="large" color={Colors.accentBlue} />
            </View>
        ) : (
            <FlatList
            data={notifications}
            renderItem={renderItem}
            keyExtractor={(item) => String(item.id)}
            contentContainerStyle={styles.listContent}
            ListEmptyComponent={
                <View style={styles.emptyContainer}>
                    <Text style={styles.emptyText}>새로운 알림이 없습니다.</Text>
                </View>
            }
            />
        )}
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.textPrimary,
  },
  closeButton: {
    padding: 4,
  },
  listContent: {
    paddingBottom: 20,
  },
  notificationItem: {
    flexDirection: 'row',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    alignItems: 'center',
  },
  unreadItem: {
      backgroundColor: '#F0F7FF', // Light blue background for unread
  },
  iconContainer: {
    marginRight: 16,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F2F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  contentContainer: {
    flex: 1,
  },
  message: {
    fontSize: 16,
    color: Colors.textPrimary,
    marginBottom: 4,
    lineHeight: 22,
  },
  time: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
  center: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
  },
  emptyContainer: {
      padding: 40,
      alignItems: 'center',
  },
  emptyText: {
      color: Colors.textSecondary,
      fontSize: 16,
  }
});

export default NotificationModal;
