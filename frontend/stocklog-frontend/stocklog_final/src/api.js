import axios from 'axios';
import AppStorage from './utils/storage'; // Use the new cross-platform storage

// 🚨 중요: 안드로이드 실기기 또는 에뮬레이터에서 테스트 시,
// 'localhost' 대신 컴퓨터의 실제 IP 주소를 입력해야 합니다.
// 터미널에서 `ipconfig` (Windows) 또는 `ifconfig` (macOS) 명령어로 확인하세요.
// 예: 'http://192.168.1.10:8080'
const API_BASE_URL = "http://localhost:8080"; // 사용자님의 환경에 맞게 수정하세요.

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // 백엔드의 allowCredentials와 짝을 이룹니다.
});

api.interceptors.request.use(async (config) => {
  console.log(`📡 [API Interceptor] Request starting: ${config.url}`);
  // 로그인이나 회원가입 경로는 토큰 검사를 건너뜁니다.
  if (config.url?.includes('/api/auth/login') || config.url?.includes('/api/auth/signup')) {
    return config;
  }

  try {
    const token = await AppStorage.getItem('userToken');
    
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
        console.log(`🔐 [API Interceptor] Token added to header: Bearer ${token.substring(0, 10)}...`);
    } else {
        console.warn("⚠️ [API Interceptor] No token found in storage.");
    }
  } catch (err) {
      console.error("💥 [API Interceptor] Error retrieving token:", err);
  }
  
  return config;
}, (error) => {
  console.error("❌ [API Interceptor] Request error:", error);
  return Promise.reject(error);
});

export const authApi = {
    signUp: (userData) => api.post('/api/auth/signup', userData),
    login: (loginData) => api.post('/api/auth/login', loginData),
};

export const tradeApi = {
    // New functions for calendar
    getMonthlyTradeDays: (year, month) => api.get('/api/tradelogs/monthly/days-with-trades', { params: { year, month, _t: new Date().getTime() } }),
    getDailyTradeLogs: (date) => api.get('/api/tradelogs/day', { params: { date, _t: new Date().getTime() } }),
    getLog: (logId) => api.get(`/api/tradelogs/journal/detail/${logId}`),
    
    // Functions for settlement stats
    getMonthlySimple: (year, month) => api.get('/api/tradelogs/monthly/simple', { params: { year, month } }),
    getMonthlyDetail: (year, month) => api.get('/api/tradelogs/monthly/detail', { params: { year, month } }),
    getYearlySimple: (year) => api.get('/api/tradelogs/yearly/simple', { params: { year } }),
    getYearlyDetail: (year) => api.get('/api/tradelogs/yearly/detail', { params: { year } }),
    getMonthlySummary: (year, month) => api.get('/api/tradelogs/monthly/summary', { params: { year, month } }),
    getYearlySummary: (year) => api.get('/api/tradelogs/yearly/summary', { params: { year } }),

    createLog: (data) => api.post('/api/tradelogs', data),
    uploadImage: (formData) => api.post('/api/tradelogs/upload', formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    }),
    updateLog: (id, data) => api.put(`/api/tradelogs/${id}`, data),
    deleteLog: (id) => api.delete(`/api/tradelogs/${id}`),
    analyzeLog: (id) => api.post(`/api/tradelogs/${id}/analyze`, {}),
    getBrokers: () => api.get('/api/tradelogs/brokers'),
};

export const followApi = {
    toggleFollow: (followerId, followingId) => api.post('/api/follow', { followerId, followingId }),
    getFollowers: (userId) => api.get(`/api/follow/${userId}/followers`),
    getFollowing: (userId) => api.get(`/api/follow/${userId}/following`),
    getFollowCount: (userId) => api.get(`/api/follow/${userId}/count`),
    checkIsFollowing: (followerId, followingId) => api.get(`/api/follow/isFollowing/${followerId}/${followingId}`),
};

export const postApi = {
    createPost: (postData) => api.post('/api/posts', postData),
    getPosts: (userId) => {
        const params = {
            _t: new Date().getTime(), // Cache buster
        };
        if (userId) {
            params.userId = userId;
        }
        return api.get('/api/posts', { params });
    },
    getPostById: (postId, userId) => {
        const params = {};
        if (userId) {
            params.userId = userId;
        }
        return api.get(`/api/posts/${postId}`, { params });
    },
    createComment: (postId, commentData) => api.post(`/api/comments/${postId}`, commentData, {
        headers: {
            'Content-Type': 'application/json; charset=utf-8'
        }
    }),
    updateComment: (postId, commentId, commentData) => api.patch(`/api/comments/${commentId}`, commentData),
    deleteComment: (postId, commentId, userId) => api.delete(`/api/comments/${commentId}`, { 
        data: { userId } 
    }),
    toggleHeart: (postId) => api.post(`/api/heart/posts/${postId}`),
    getHeartCount: (postId) => api.get(`/api/heart/posts/${postId}/count`),
    toggleCommentHeart: (commentId) => api.post(`/api/heart/comment/${commentId}`),
    getCommentHeartCount: (commentId) => api.get(`/api/heart/comment/${commentId}/count`),
    updatePost: (postId, postData) => api.put(`/api/posts/${postId}`, postData),
    deletePost: (postId) => api.delete(`/api/posts/${postId}`, {
        headers: {
            'Cache-Control': 'no-cache',
            'Pragma': 'no-cache',
        }
    }),
    reportPost: (postId, reason) => api.post(`/api/posts/${postId}/report`, { reason }),
};

export const strategyApi = {
    getYearlyStrategy: (year) => api.get('/api/strategy/yearly', { params: { year } }),
};

export const stockApi = {
    searchStocks: (keyword) => api.get(`/api/tradelogs/stocks/search`, { params: { keyword } }),
};

export const userApi = {
    getUserProfile: (userId) => api.get(`/api/users/${userId}`),
    deleteUser: (userId) => api.delete(`/api/users/${userId}`), // Updated to include userId in path
    blockUser: (userId) => api.post(`/api/users/${userId}/block`),
    updateProfile: (userId, data) => api.put(`/api/users/${userId}`, data),
    updatePassword: (passwordData) => api.patch('/api/users/update/password', passwordData),
};

export const notificationApi = {
    getNotifications: () => api.get('/api/notifications'),
    markAsRead: (notificationId) => api.patch(`/api/notifications/${notificationId}/read`),
    getUnreadCount: () => api.get('/api/notifications/unread-count'),
    getNotificationSettings: () => api.get('/api/notification-settings'),
    updateNotificationSettings: (settings) => api.patch('/api/notification-settings', settings),
};

export const myPageApi = {
    getMyHearts: () => api.get('/api/mypage/hearts'),
    getMyComments: () => api.get('/api/mypage/comments'),
};

export const inquiryApi = {
    createInquiry: (data) => api.post('/api/inquiries', data),
    getMyInquiries: (userId) => api.get(`/api/inquiries/my/${userId}`),
};

export const portfolioApi = {
    getPortfolio: () => api.get('/api/portfolio'),
    addStock: (stockData) => api.post('/api/portfolio/write', stockData),
};

export default api;
