import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, FlatList, Image, TouchableOpacity, ImageBackground, Modal, ActivityIndicator, TextInput, ScrollView, Alert, Platform } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ChevronLeft, User, ChevronRight } from 'lucide-react-native';
import FeedCard from '../../components/FeedCard';
import { userApi, followApi, myPageApi } from '../../src/api';
import AppStorage from '../../src/utils/storage';
import { parseJwt } from '../../src/utils/jwt';

// --- Color Constants ---
const Colors = {
  background: '#F2F4F6',
  surface: '#F8F9FA',
  textPrimary: '#191F28',
  textSecondary: '#6B7684',
  accentRed: '#F04452',
  accentBlue: '#3182F6',
  border: '#E5E8EB',
};

const FollowListModal = ({ visible, onClose, title, users, onFollowToggle }) => (
    <Modal animationType="slide" transparent={false} visible={visible} onRequestClose={onClose}>
        <SafeAreaView style={{ flex: 1, backgroundColor: Colors.background }}>
            <View style={styles.modalHeader}>
                <TouchableOpacity onPress={onClose} style={styles.modalCloseButton}><ChevronLeft size={28} color={Colors.textPrimary} /></TouchableOpacity>
                <Text style={styles.modalTitle}>{title}</Text>
                <View style={{ width: 28 }} />
            </View>
            <FlatList 
                data={users} 
                keyExtractor={(item) => String(item.id)} 
                renderItem={({ item }) => (
                <View style={styles.userListItem}>
                    <View style={{flexDirection: 'row', alignItems: 'center', flex: 1}}>
                        {item.profileImageUrl ? (
                            <Image source={{ uri: item.profileImageUrl }} style={styles.userListAvatar} />
                        ) : (
                            <View style={[styles.userListAvatar, { backgroundColor: '#E5E8EB', justifyContent: 'center', alignItems: 'center' }]}>
                                <User size={24} color="#B0B8C1" />
                            </View>
                        )}
                        <View style={styles.userListInfo}>
                            <Text style={styles.userListName}>{item.name}</Text>
                            {item.bio ? <Text style={styles.userListBio} numberOfLines={1}>{item.bio}</Text> : null}
                        </View>
                    </View>
                    <TouchableOpacity 
                        style={[
                            styles.followActionButton, 
                            item.isFollowing ? styles.buttonUnfollow : styles.buttonFollow
                        ]} 
                        onPress={() => onFollowToggle(item.id)}
                    >
                        <Text style={[
                            styles.followActionText, 
                            item.isFollowing ? styles.textUnfollow : styles.textFollow
                        ]}>
                            {item.isFollowing ? '언팔로우' : '팔로우'}
                        </Text>
                    </TouchableOpacity>
                </View>
            )} />
        </SafeAreaView>
    </Modal>
);

const EditProfileModal = ({ visible, onClose, profile, onSave }) => {
    const [nickname, setNickname] = useState(profile.nickname);
    const [bio, setBio] = useState(profile.bio);

    const handleSave = () => {
        onSave({ nickname, bio, profileImageUrl: profile.profileImageUrl });
        onClose();
    };

    return (
        <Modal
            animationType="slide"
            transparent={false}
            visible={visible}
            onRequestClose={onClose}
        >
            <SafeAreaView style={styles.safeArea}>
                <View style={styles.editModalHeader}>
                    <TouchableOpacity onPress={onClose}>
                        <Text style={styles.editModalHeaderText}>취소</Text>
                    </TouchableOpacity>
                    <Text style={styles.editModalTitle}>프로필 수정</Text>
                    <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
                        <Text style={styles.saveButtonText}>저장하기</Text>
                    </TouchableOpacity>
                </View>
                <ScrollView style={styles.editModalContent}>
                    <View style={styles.editImagesContainer}>
                        <ImageBackground source={{ uri: profile.banner }} style={styles.editBanner}>
                            <TouchableOpacity style={styles.editImageOverlay}>
                                <Text style={styles.editImageText}>배경 사진 변경</Text>
                            </TouchableOpacity>
                        </ImageBackground>
                        <View style={styles.editAvatarContainer}>
                            {profile.profileImageUrl ? (
                                <Image source={{ uri: profile.profileImageUrl }} style={styles.editAvatar} />
                            ) : (
                                <View style={[styles.editAvatar, styles.avatarPlaceholder]}>
                                    <User size={40} color="#B0B8C1" />
                                </View>
                            )}
                            <TouchableOpacity style={styles.editImageOverlay}>
                                <Text style={styles.editImageText}>프로필 사진 변경</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                    <View style={styles.inputContainer}>
                        <Text style={styles.inputLabel}>닉네임</Text>
                        <TextInput
                            style={styles.textInput}
                            value={nickname}
                            onChangeText={setNickname}
                        />
                    </View>
                    <View style={styles.inputContainer}>
                        <Text style={styles.inputLabel}>바이오</Text>
                        <TextInput
                            style={[styles.textInput, styles.bioInput]}
                            value={bio}
                            onChangeText={setBio}
                            multiline
                        />
                    </View>
                </ScrollView>
            </SafeAreaView>
        </Modal>
    );
};


const ProfileHeader = ({ profile, activeTab, setActiveTab, router, onStatPress, onEditProfilePress, isOwnProfile, userEmail, followerCount, followingCount, isFollowing, onToggleFollow }) => (
    <>
        <ImageBackground source={{ uri: profile.banner }} style={styles.banner}>
            <View style={styles.headerTop}>
                <TouchableOpacity 
                    onPress={() => {
                        if (router.canGoBack()) {
                            router.back();
                        } else {
                            router.replace('/(tabs)');
                        }
                    }} 
                    style={styles.backButton}
                >
                    <ChevronLeft size={28} color="#FFFFFF" />
                </TouchableOpacity>
            </View>
        </ImageBackground>
        <View style={styles.profileInfoContainer}>
            <View style={styles.avatarAndNameContainer}>
                {profile.profileImageUrl ? (
                    <Image source={{ uri: profile.profileImageUrl }} style={styles.avatar} />
                ) : (
                    <View style={[styles.avatar, styles.avatarPlaceholder]}>
                        <User size={40} color="#B0B8C1" />
                    </View>
                )}
                <View style={styles.userNameAndEditButtonContainer}>
                    <View>
                        <Text style={styles.userName}>{profile.nickname}</Text>
                        {isOwnProfile && userEmail && (
                            <Text style={styles.userEmail}>{userEmail}</Text>
                        )}
                    </View>
                    {isOwnProfile ? (
                        <TouchableOpacity style={styles.editProfileButton} onPress={onEditProfilePress}>
                            <Text style={styles.editProfileButtonText}>프로필 수정</Text>
                        </TouchableOpacity>
                    ) : (
                        <TouchableOpacity 
                            style={[
                                styles.editProfileButton, 
                                isFollowing ? styles.buttonUnfollowMain : { backgroundColor: Colors.accentBlue, borderColor: Colors.accentBlue }
                            ]} 
                            onPress={onToggleFollow}
                        >
                            <Text style={[
                                styles.editProfileButtonText, 
                                isFollowing ? { color: Colors.textPrimary } : { color: '#FFFFFF' }
                            ]}>
                                {isFollowing ? '언팔로우' : '팔로우'}
                            </Text>
                        </TouchableOpacity>
                    )}
                </View>
            </View>
            <Text style={styles.bio}>{profile.bio}</Text>
            <View style={styles.statsContainer}>
                <TouchableOpacity onPress={() => onStatPress('following')} style={{flexDirection: 'row', alignItems: 'center'}}>
                    <Text style={styles.statNumber}>{followingCount}</Text>
                    <Text style={styles.statLabel}>팔로잉</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => onStatPress('followers')} style={{flexDirection: 'row', alignItems: 'center', marginLeft: 20}}>
                    <Text style={styles.statNumber}>{followerCount}</Text>
                    <Text style={styles.statLabel}>팔로워</Text>
                </TouchableOpacity>
            </View>
        </View>
        <View style={styles.tabContainer}>
            <TouchableOpacity style={styles.tab} onPress={() => setActiveTab('posts')}><Text style={[styles.tabText, activeTab === 'posts' && styles.tabTextActive]}>게시글</Text>{activeTab === 'posts' && <View style={styles.activeTabIndicator} />}</TouchableOpacity>
            <TouchableOpacity style={styles.tab} onPress={() => setActiveTab('comments')}><Text style={[styles.tabText, activeTab === 'comments' && styles.tabTextActive]}>댓글</Text>{activeTab === 'comments' && <View style={styles.activeTabIndicator} />}</TouchableOpacity>
            <TouchableOpacity style={styles.tab} onPress={() => setActiveTab('likes')}><Text style={[styles.tabText, activeTab === 'likes' && styles.tabTextActive]}>마음에 들어요</Text>{activeTab === 'likes' && <View style={styles.activeTabIndicator} />}</TouchableOpacity>
            <TouchableOpacity style={styles.tab} onPress={() => setActiveTab('bookmarks')}><Text style={[styles.tabText, activeTab === 'bookmarks' && styles.tabTextActive]}>북마크</Text>{activeTab === 'bookmarks' && <View style={styles.activeTabIndicator} />}</TouchableOpacity>
        </View>
    </>
);

const UserProfileScreen = () => {
    const router = useRouter();
    const { id } = useLocalSearchParams();
    const [activeTab, setActiveTab] = useState('posts');
    const [modalVisible, setModalVisible] = useState(false);
    const [modalTitle, setModalTitle] = useState('');
    const [modalData, setModalData] = useState([]);
    const [isEditModalVisible, setEditModalVisible] = useState(false);
    const [currentUserId, setCurrentUserId] = useState(null);
    const [userEmail, setUserEmail] = useState(null);
    
    const [userProfile, setUserProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [followerCount, setFollowerCount] = useState(0);
    const [followingCount, setFollowingCount] = useState(0);
    const [myFollowingIds, setMyFollowingIds] = useState(new Set());
    const [isFollowing, setIsFollowing] = useState(false);

    // States for My Page specific data
    const [myHearts, setMyHearts] = useState([]);
    const [myComments, setMyComments] = useState([]);

    useEffect(() => {
        const fetchCurrentUserAndData = async () => {
            try {
                const token = await AppStorage.getItem('userToken');
                if (token) {
                    const decoded = parseJwt(token);
                    const uid = decoded?.userId || decoded?.id || decoded?.sub;
                    const email = decoded?.email;
                    
                    if (uid) {
                        const myId = Number(uid);
                        setCurrentUserId(myId);
                        
                        // Fetch my following list
                        try {
                            const followRes = await followApi.getFollowing(myId);
                            const ids = new Set(followRes.data.map(u => u.id || u.userId));
                            setMyFollowingIds(ids);
                        } catch (err) {
                            console.error("Failed to fetch my following list", err);
                        }

                        // If viewing own profile, fetch specific MyPage data
                        if (Number(id) === myId) {
                            fetchMyPageData();
                        }
                    }
                    if (email) setUserEmail(email);
                }
            } catch (e) {
                console.error("Failed to decode token", e);
            }
        };
        fetchCurrentUserAndData();
    }, [id]);

    const fetchMyPageData = async () => {
        try {
            const [heartsRes, commentsRes] = await Promise.all([
                myPageApi.getMyHearts(),
                myPageApi.getMyComments()
            ]);
            // Assuming DTO structure based on provided MyPageController
            setMyHearts(heartsRes.data.posts || heartsRes.data || []);
            setMyComments(commentsRes.data.comments || commentsRes.data || []);
        } catch (e) {
            console.error("Failed to fetch MyPage data:", e);
        }
    };

    const fetchFollowCounts = async () => {
        try {
            const countRes = await followApi.getFollowCount(id);
            setFollowerCount(countRes.data.followerCount || 0);
            setFollowingCount(countRes.data.followingCount || 0);
            if (countRes.data.isFollowing !== undefined) {
                setIsFollowing(countRes.data.isFollowing);
            }
        } catch (e) {
            console.error("Failed to fetch follow counts:", e);
        }
    };

    // Check if I follow this profile user (backup)
    useEffect(() => {
        if (currentUserId && id && Number(currentUserId) !== Number(id)) {
            const checkFollowStatus = async () => {
                try {
                    const response = await followApi.checkIsFollowing(currentUserId, id);
                    setIsFollowing(response.data);
                } catch (e) {
                    console.error("Failed to check follow status", e);
                }
            };
            checkFollowStatus();
        }
    }, [currentUserId, id]);

    useEffect(() => {
        if (!id) return;
        const fetchUserProfile = async () => {
            try {
                setLoading(true);
                const response = await userApi.getUserProfile(id);
                console.log("📊 [UserProfile] Fetched Data:", response.data);
                setUserProfile(response.data);
                
                setFollowerCount(response.data.stats?.followers || 0);
                setFollowingCount(response.data.stats?.following || 0);
                fetchFollowCounts();
            } catch (err) {
                setError('프로필 정보를 불러오는 데 실패했습니다.');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchUserProfile();
    }, [id]);

    const handleStatPress = async (type) => {
        if (!id) return;
        
        try {
            let data = [];
            if (type === 'following') {
                setModalTitle('팔로잉');
                const response = await followApi.getFollowing(id);
                data = response.data;
            } else {
                setModalTitle('팔로워');
                const response = await followApi.getFollowers(id);
                data = response.data;
            }

            const formattedData = data.map(user => {
                const targetId = user.id || user.userId;
                return {
                    id: targetId,
                    name: user.nickname || user.name || 'Unknown',
                    profileImageUrl: user.profileImageUrl || user.imageUrl,
                    bio: user.bio || '',
                    isFollowing: myFollowingIds.has(Number(targetId))
                };
            });

            setModalData(formattedData);
            setModalVisible(true);
        } catch (e) {
            console.error("Failed to fetch follow list:", e);
            Alert.alert("오류", "목록을 불러오는 데 실패했습니다.");
        }
    };

    const handleFollowToggle = async (targetId) => {
        try {
            await followApi.toggleFollow(currentUserId, targetId);
            
            const newFollowingIds = new Set(myFollowingIds);
            if (newFollowingIds.has(Number(targetId))) {
                newFollowingIds.delete(Number(targetId));
            } else {
                newFollowingIds.add(Number(targetId));
            }
            setMyFollowingIds(newFollowingIds);

            const updatedData = modalData.map(user => 
                user.id === targetId ? { ...user, isFollowing: !user.isFollowing } : user
            );
            setModalData(updatedData);
            
            if (Number(targetId) === Number(id)) {
                setIsFollowing(!isFollowing);
                fetchFollowCounts();
            }
            
        } catch (e) {
            console.error("Follow toggle failed:", e);
            Alert.alert("오류", "팔로우 처리에 실패했습니다.");
        }
    };

    const handleToggleFollowProfile = async () => {
        if (!currentUserId || !id) return;
        try {
            await followApi.toggleFollow(currentUserId, id);
            setIsFollowing(!isFollowing);
            fetchFollowCounts();
            
            const newFollowingIds = new Set(myFollowingIds);
            const targetId = Number(id);
            if (isFollowing) {
                newFollowingIds.delete(targetId);
            } else {
                newFollowingIds.add(targetId);
            }
            setMyFollowingIds(newFollowingIds);

        } catch (e) {
            console.error("Main profile follow toggle failed:", e);
            Alert.alert("오류", "팔로우 처리에 실패했습니다.");
        }
    };

    const handleEditProfilePress = () => {
        setEditModalVisible(true);
    };

    const handleSaveProfile = async (updatedData) => {
        const targetId = Number(id || currentUserId);
        const payload = {
            nickname: updatedData.nickname,
            bio: updatedData.bio,
            profileImageUrl: updatedData.profileImageUrl || userProfile.profileImageUrl
        };

        try {
            await userApi.updateProfile(targetId, payload);
            setUserProfile(currentProfile => ({
                ...currentProfile,
                nickname: updatedData.nickname,
                bio: updatedData.bio,
                profileImageUrl: payload.profileImageUrl
            }));
            Alert.alert("성공", "프로필이 수정되었습니다.");
        } catch (err) {
            console.error("❌ [Profile Update] Failed:", err);
            Alert.alert("오류", "프로필 수정에 실패했습니다.");
        }
    };

    const renderItem = ({ item }) => (
        <View style={{ paddingHorizontal: 16 }}>
            { (activeTab === 'posts' || activeTab === 'likes' || activeTab === 'bookmarks') && <FeedCard item={item} /> }
            { activeTab === 'comments' && item.post && <FeedCard item={item.post} /> }
        </View>
    );

    const getTabContent = () => {
        if (!userProfile) return [];
        const isOwnProfile = currentUserId && (Number(currentUserId) === Number(id));
        
        let content = [];
        if (activeTab === 'posts') {
            const rawPosts = Array.isArray(userProfile.posts) ? userProfile.posts : [];
            content = rawPosts.map(post => ({
                ...post,
                nickname: userProfile.nickname,
                profileImageUrl: userProfile.profileImageUrl, 
                userId: userProfile.id || id 
            }));
        }
        else if (activeTab === 'comments') {
            const sourceComments = isOwnProfile ? (Array.isArray(myComments) ? myComments : []) : (Array.isArray(userProfile.comments) ? userProfile.comments : []);
            
            console.log("🔍 [Debug] Raw Source Comments:", sourceComments); // Debug log

            content = sourceComments.map(item => {
                // Check if 'post' exists directly or nested
                const postData = item.post || item.board || null; 
                return {
                    id: item.id || Math.random().toString(),
                    post: postData,
                    myComment: item.content || item.text || ""
                };
            });
        }
        else if (activeTab === 'likes') {
            content = isOwnProfile ? (Array.isArray(myHearts) ? myHearts : []) : (Array.isArray(userProfile.likes) ? userProfile.likes : []);
        }
        else if (activeTab === 'bookmarks') {
            content = Array.isArray(userProfile.bookmarks) ? userProfile.bookmarks : [];
        }
        
        // Final guard: ensure content is iterable before sorting
        if (!Array.isArray(content)) return [];

        return [...content].sort((a, b) => {
            const idA = a.id || (a.post && a.post.id) || 0;
            const idB = b.id || (b.post && b.post.id) || 0;
            return idB - idA;
        });
    };

    if (loading) {
        return <View style={styles.loadingContainer}><ActivityIndicator size="large" color={Colors.accentBlue} /></View>;
    }

    if (error) {
        return <View style={styles.loadingContainer}><Text>{error}</Text></View>;
    }
    
    if (!userProfile) {
        return <View style={styles.loadingContainer}><Text>사용자 정보를 찾을 수 없습니다.</Text></View>;
    }

    const isOwnProfile = currentUserId && (Number(currentUserId) === Number(id));

    return (
        <SafeAreaView style={styles.safeArea}>
            <FlatList
                data={getTabContent()}
                renderItem={renderItem}
                keyExtractor={(item, index) => String(item.id || index)}
                ListHeaderComponent={
                    <ProfileHeader 
                        profile={userProfile} 
                        activeTab={activeTab} 
                        setActiveTab={setActiveTab} 
                        router={router} 
                        onStatPress={handleStatPress} 
                        onEditProfilePress={handleEditProfilePress}
                        isOwnProfile={isOwnProfile}
                        userEmail={userEmail}
                        followerCount={followerCount}
                        followingCount={followingCount}
                        isFollowing={isFollowing}
                        onToggleFollow={handleToggleFollowProfile}
                    />
                }
                contentContainerStyle={styles.listContent}
            />
            <FollowListModal
                visible={modalVisible}
                onClose={() => setModalVisible(false)}
                title={modalTitle}
                users={modalData}
                onFollowToggle={handleFollowToggle}
            />
            <EditProfileModal
                visible={isEditModalVisible}
                onClose={() => setEditModalVisible(false)}
                profile={userProfile}
                onSave={handleSaveProfile}
            />
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: Colors.background },
    loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: Colors.background },
    headerTop: { flexDirection: 'row', justifyContent: 'space-between', padding: 16 },
    backButton: { backgroundColor: 'rgba(0,0,0,0.3)', borderRadius: 20, padding: 4 },
    banner: { height: 120, backgroundColor: Colors.surface },
    profileInfoContainer: { paddingHorizontal: 16, marginTop: -30, },
    avatarAndNameContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    avatar: { width: 80, height: 80, borderRadius: 40, borderWidth: 2, borderColor: Colors.textPrimary, marginRight: 12 },
    userNameAndEditButtonContainer: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    editProfileButton: { borderColor: Colors.border, borderWidth: 1, borderRadius: 20, paddingHorizontal: 16, paddingVertical: 8, },
    buttonUnfollowMain: { backgroundColor: '#E5E8EB', borderColor: '#E5E8EB' },
    editProfileButtonText: { color: Colors.textPrimary, fontSize: 14, fontWeight: 'bold' },
    userName: { fontSize: 24, fontWeight: 'bold', color: Colors.textPrimary, marginRight: 10 },
    userEmail: { fontSize: 14, color: Colors.textSecondary, marginTop: 2 },
    bio: { fontSize: 16, color: Colors.textSecondary, marginTop: 8, lineHeight: 22, },
    statsContainer: { flexDirection: 'row', marginTop: 16 },
    statNumber: { fontSize: 16, fontWeight: 'bold', color: Colors.textPrimary },
    statLabel: { fontSize: 16, color: Colors.textSecondary, marginLeft: 4 },
    tabContainer: { flexDirection: 'row', justifyContent: 'space-around', borderBottomWidth: 1, borderBottomColor: Colors.border, marginTop: 20, },
    tab: { flex: 1, alignItems: 'center', paddingVertical: 12, },
    tabText: { fontSize: 16, fontWeight: '600', color: Colors.textSecondary },
    tabTextActive: { color: Colors.textPrimary },
    activeTabIndicator: { position: 'absolute', bottom: 0, height: 3, width: '100%', backgroundColor: Colors.textPrimary, borderRadius: 1.5, },
    listContent: { paddingBottom: 100 },
    modalHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16, borderBottomWidth: 1, borderBottomColor: Colors.border, },
    modalTitle: { fontSize: 20, fontWeight: 'bold', color: Colors.textPrimary, },
    modalCloseButton: { padding: 4, },
    userListItem: { flexDirection: 'row', alignItems: 'center', padding: 16, borderBottomWidth: 1, borderBottomColor: '#F2F4F6' },
    userListAvatar: { width: 50, height: 50, borderRadius: 25, marginRight: 12, },
    userListInfo: { flex: 1, marginRight: 10 },
    userListName: { fontSize: 16, fontWeight: 'bold', color: Colors.textPrimary, },
    userListBio: { fontSize: 14, color: Colors.textSecondary, marginTop: 2, },
    followActionButton: {
        paddingHorizontal: 14, 
        paddingVertical: 8, 
        borderRadius: 8,
        minWidth: 70,
        alignItems: 'center',
        justifyContent: 'center',
    },
    buttonFollow: {
        backgroundColor: Colors.accentBlue,
    },
    buttonUnfollow: {
        backgroundColor: '#E5E8EB',
    },
    followActionText: {
        fontSize: 13,
        fontWeight: 'bold',
    },
    textFollow: {
        color: '#FFFFFF',
    },
    textUnfollow: {
        color: Colors.textPrimary,
    },
    editModalHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: Colors.border,
    },
    editModalHeaderText: {
        fontSize: 16,
        color: Colors.textPrimary,
    },
    editModalTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: Colors.textPrimary,
    },
    saveButton: {
        backgroundColor: Colors.textPrimary,
        borderRadius: 20,
        paddingHorizontal: 16,
        paddingVertical: 8,
    },
    saveButtonText: {
        color: Colors.background,
        fontSize: 14,
        fontWeight: 'bold',
    },
    editModalContent: {
        flex: 1,
    },
    editImagesContainer: {
        alignItems: 'center',
    },
    editBanner: {
        width: '100%',
        height: 120,
        justifyContent: 'center',
        alignItems: 'center',
    },
    editAvatarContainer: {
        marginTop: -40,
        alignItems: 'center',
        justifyContent: 'center',
    },
    editAvatar: {
        width: 80,
        height: 80,
        borderRadius: 40,
        borderWidth: 4,
        borderColor: Colors.background,
    },
    editImageOverlay: {
        backgroundColor: 'rgba(0,0,0,0.4)',
        padding: 12,
        borderRadius: 8,
    },
    editImageText: {
        color: 'white',
        fontWeight: 'bold',
    },
    inputContainer: {
        paddingHorizontal: 20,
        marginTop: 30,
    },
    inputLabel: {
        fontSize: 14,
        color: Colors.textSecondary,
        marginBottom: 8,
    },
    textInput: {
        fontSize: 18,
        color: Colors.textPrimary,
        borderBottomWidth: 1,
        borderBottomColor: Colors.border,
        paddingBottom: 8,
    },
    bioInput: {
        height: 100,
        textAlignVertical: 'top',
    },
    avatarPlaceholder: {
        backgroundColor: '#F2F4F6',
        justifyContent: 'center',
        alignItems: 'center',
    },
});

export default UserProfileScreen;
