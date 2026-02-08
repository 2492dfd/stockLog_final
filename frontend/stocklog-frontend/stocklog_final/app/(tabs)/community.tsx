import { useRouter } from 'expo-router';
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, Image, ScrollView } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import FeedCard from '../../components/FeedCard';
import { Plus, UserPlus } from 'lucide-react-native';
import CreatePostModal from '../../components/CreatePostModal';
import { getPosts, getPostById, shareTradeLog, createPost, getFollowing, toggleFollow } from '../../src/api/index.js';
import AppStorage from '../../src/utils/storage';
import { parseJwt } from '../../src/utils/jwt';

const Colors = {
  background: '#F2F4F6',
  surface: '#F8F9FA',
  textPrimary: '#191F28',
  textSecondary: '#6B7684',
  accentRed: '#F04452',
  accentBlue: '#3182F6',
  border: '#E5E8EB',
  gold: '#FFD700',
};

const CommunityScreen = () => {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('recommended');
  const [isCreateModalVisible, setCreateModalVisible] = useState(false); 
  const [isLoading, setIsLoading] = useState(false); 
  const [postsData, setPostsData] = useState([]); 
  const [isFeedLoading, setIsFeedLoading] = useState(true);
  
  const [currentUserId, setCurrentUserId] = useState(null);
  const [followingIds, setFollowingIds] = useState([]);
  const [recommendedUsers, setRecommendedUsers] = useState([]);

  // Fetch posts and user info
  const fetchAllData = async () => {
    setIsFeedLoading(true);
    try {
      // 1. Get Current User
      const token = await AppStorage.getItem('userToken');
      let myId = null;
      if (token) {
        const decoded = parseJwt(token);
        myId = decoded?.userId || decoded?.id || decoded?.sub;
        setCurrentUserId(Number(myId));
      }

      // 2. Fetch Posts
      const idObjectsResponse = await getPosts(myId);
      const postObjects = idObjectsResponse.data;
      if (!Array.isArray(postObjects)) throw new Error('Invalid posts data');

      const postPromises = postObjects.map(post => getPostById(post.id, myId));
      const postResponses = await Promise.all(postPromises);
      const fullPosts = postResponses.map(res => res.data).sort((a, b) => b.id - a.id);
      setPostsData(fullPosts);

      // 3. Fetch Following List (if logged in)
      let myFollowing = [];
      if (myId) {
        try {
          const followRes = await getFollowing(myId);
          // Assuming API returns array of user objects or IDs. Adjust based on actual response structure.
          // If it returns objects with 'id' or 'userId':
          myFollowing = followRes.data.map(u => u.id || u.userId || u.followingId); 
          setFollowingIds(myFollowing);
        } catch (err) {
          console.warn('Failed to fetch following list', err);
        }
      }

      // 4. Generate Recommended Users (Simple Algorithm: High activity in feed)
      if (fullPosts.length > 0) {
        const userMap = new Map();
        fullPosts.forEach(post => {
          const uid = post.userId || post.user_id;
          if (!uid) return;
          // Exclude self and already followed
          if (Number(uid) === Number(myId)) return;
          if (myFollowing.includes(Number(uid))) return;

          if (!userMap.has(uid)) {
            userMap.set(uid, {
              id: uid,
              nickname: post.nickname || post.nick_name || 'User',
              avatar: post.profileImageUrl || post.imageUrl || post.avatarUrl,
              postCount: 0
            });
          }
          userMap.get(uid).postCount += 1;
        });
        
        // Sort by post count and take top 5
        const recs = Array.from(userMap.values())
          .sort((a, b) => b.postCount - a.postCount)
          .slice(0, 5);
        setRecommendedUsers(recs);
      }

    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setIsFeedLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchAllData();
    }, [])
  );

  const handleSavePost = async (postData) => {
    setIsLoading(true);
    try {
      let response;
      const dataToSend = {
          title: postData.title,
          content: postData.content,
          imageUrl: postData.imageUrl,
          tradeLogId: postData.tradeLogId,
      };

      if (postData.tradeLogId) { // tradeLogId가 존재하면 shareTradeLog 호출
        response = await shareTradeLog(dataToSend);
      } else { // tradeLogId가 없으면 일반 게시글 생성
        response = await createPost(dataToSend);
      }
      
      const newlyCreatedPost = response.data;
      setPostsData(currentPosts => [newlyCreatedPost, ...currentPosts]);
      setCreateModalVisible(false);
    } catch (error) {
      console.error("Error creating post:", error);
      alert('게시글 작성에 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFollow = async (targetId) => {
      try {
          await toggleFollow(currentUserId, targetId);
          
          // Update state only after success
          setFollowingIds(prev => [...prev, targetId]);
          setRecommendedUsers(prev => prev.filter(u => u.id !== targetId));
      } catch (e) {
          console.error(e);
          alert("팔로우 실패");
      }
  };

  const filteredPosts = useMemo(() => {
    if (activeTab === 'recommended') {
      return postsData;
    } else {
      // 'following' tab
      if (!currentUserId) return [];
      return postsData.filter(post => {
        const uid = post.userId || post.user_id;
        return followingIds.includes(Number(uid));
      });
    }
  }, [activeTab, postsData, followingIds, currentUserId]);

  const Header = () => (
    <>
      <Text style={styles.screenTitle}>커뮤니티</Text>
      <View style={styles.tabContainer}>
        <TouchableOpacity style={styles.tab} onPress={() => setActiveTab('recommended')}>
          <Text style={[styles.tabText, activeTab === 'recommended' && styles.tabTextActive]}>추천</Text>
          {activeTab === 'recommended' && <View style={styles.activeTabIndicator} />}
        </TouchableOpacity>
        <TouchableOpacity style={styles.tab} onPress={() => setActiveTab('following')}>
          <Text style={[styles.tabText, activeTab === 'following' && styles.tabTextActive]}>팔로우 중</Text>
          {activeTab === 'following' && <View style={styles.activeTabIndicator} />}
        </TouchableOpacity>
      </View>
    </>
  );

  const EmptyFollowingState = () => (
    <View style={styles.emptyStateContainer}>
      <Text style={styles.emptyStateTitle}>아직 팔로우한 사용자가 없습니다</Text>
      <Text style={styles.emptyStateSub}>인기 투자자들을 팔로우하고 소식을 받아보세요!</Text>
      
      <Text style={styles.recSectionTitle}>추천 사용자</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.recList}>
        {recommendedUsers.map((user) => (
          <View key={user.id} style={styles.recCard}>
            <TouchableOpacity onPress={() => router.push(`/profile/${user.id}`)}>
                {user.avatar ? (
                <Image source={{ uri: user.avatar }} style={styles.recAvatar} />
                ) : (
                <View style={[styles.recAvatar, styles.recAvatarPlaceholder]} />
                )}
            </TouchableOpacity>
            <Text style={styles.recName} numberOfLines={1}>{user.nickname}</Text>
            <TouchableOpacity 
                style={styles.recFollowBtn}
                onPress={() => handleFollow(user.id)}
            >
              <Text style={styles.recFollowText}>팔로우</Text>
            </TouchableOpacity>
          </View>
        ))}
      </ScrollView>
    </View>
  );

  return (
    <View style={{ flex: 1, backgroundColor: Colors.background }}>
      {isFeedLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.accentBlue} />
        </View>
      ) : (
        <FlatList
          data={filteredPosts}
          renderItem={({ item }) => <FeedCard item={item} />}
          keyExtractor={item => String(item.id)}
          ListHeaderComponent={<Header />}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            activeTab === 'following' && followingIds.length === 0 ? (
               <EmptyFollowingState />
            ) : (
               <Text style={styles.noPostsText}>게시글이 없습니다.</Text>
            )
          }
        />
      )}
      <TouchableOpacity style={styles.floatingButton} onPress={() => setCreateModalVisible(true)}>
        <Plus size={30} color="#FFFFFF" />
      </TouchableOpacity>
      <CreatePostModal
        visible={isCreateModalVisible}
        onClose={() => setCreateModalVisible(false)}
        onSave={handleSavePost}
        isLoading={isLoading}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  tabContainer: {
    flexDirection: 'row',
    marginTop: 10,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  screenTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: Colors.textPrimary,
    marginBottom: 20,
    marginTop: 10,
  },
  tab: {
    alignItems: 'center',
    marginRight: 24,
  },
  tabText: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.textSecondary,
    paddingVertical: 12,
  },
  tabTextActive: {
    color: Colors.textPrimary,
  },
  activeTabIndicator: {
    height: 3,
    width: '100%',
    backgroundColor: Colors.textPrimary,
    borderRadius: 1.5,
  },
  listContent: {
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 100,
  },
  floatingButton: {
    position: 'absolute',
    bottom: 110,
    right: 25,
    backgroundColor: '#3182F6',
    width: 58,
    height: 58,
    borderRadius: 29,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    zIndex: 9999,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  noPostsText: {
    textAlign: 'center',
    marginTop: 40,
    fontSize: 16,
    color: Colors.textSecondary,
  },
  // Empty State & Recommendations
  emptyStateContainer: {
    padding: 20,
    alignItems: 'center',
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.textPrimary,
    marginBottom: 8,
    marginTop: 20,
  },
  emptyStateSub: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 30,
  },
  recSectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.textPrimary,
    alignSelf: 'flex-start',
    marginBottom: 16,
  },
  recList: {
    paddingBottom: 20,
  },
  recCard: {
    width: 120,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    marginRight: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  recAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginBottom: 8,
  },
  recAvatarPlaceholder: {
    backgroundColor: '#E0E0E0',
  },
  recName: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: 12,
  },
  recFollowBtn: {
    backgroundColor: Colors.accentBlue,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    width: '100%',
    alignItems: 'center',
  },
  recFollowText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
});

export default CommunityScreen;

