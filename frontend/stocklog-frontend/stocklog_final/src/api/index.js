// stocklog_final/src/api/index.js
import axios from 'axios';
import API_BASE_URL from './config';
import AppStorage from '../utils/storage';

// Axios 인스턴스 생성
export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 요청 인터셉터 추가
apiClient.interceptors.request.use(
  async (config) => {
    const token = await AppStorage.getItem('userToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// ==================================================================
// API Functions (All exported individually)
// ==================================================================

// Strategy API Functions
export const strategyApi = {
  getYearlyStrategy: (year) => {
    return apiClient.get('/api/strategy/yearly', { params: { year } });
  },
};

// Post API Functions
export const getPosts = (userId) => { 
    return apiClient.get('/api/posts', { params: { userId } });
};
export const getPostById = (postId, userId) => {
    return apiClient.get(`/api/posts/${postId}`, { params: { userId } });
};
export const createPost = (data) => {
    return apiClient.post('/api/posts', data);
};
export const updatePost = (postId, data) => {
    return apiClient.put(`/api/posts/${postId}`, data);
};
export const deletePost = (postId) => {
    return apiClient.delete(`/api/posts/${postId}`);
};
export const toggleHeart = (postId) => {
    return apiClient.post(`/api/posts/${postId}/heart`);
};
export const toggleCommentHeart = (commentId) => {
    return apiClient.post(`/api/posts/comments/${commentId}/heart`);
};
export const createComment = (postId, data) => {
    return apiClient.post(`/api/posts/${postId}/comments`, data);
};
export const updateComment = (postId, commentId, data) => {
    return apiClient.put(`/api/posts/${postId}/comments/${commentId}`, data);
};
export const deleteComment = (postId, commentId, userId) => {
    return apiClient.delete(`/api/posts/${postId}/comments/${commentId}`, { params: { userId } });
};
export const reportPost = (postId) => {
    return apiClient.post(`/api/posts/${postId}/report`);
};
export const getMyTradeLogs = () => { 
    return apiClient.get('/api/posts/share/my-logs');
};
export const shareTradeLog = (data) => {
    return apiClient.post('/api/posts/share', data);
};

// User API Functions
export const signUp = (signupData) => { return apiClient.post('/api/auth/signup', signupData); };
export const deleteUser = (userId) => { return apiClient.delete(`/api/users/${userId}`); };
export const blockUser = (targetId) => { return apiClient.post(`/api/users/${targetId}/block`); };

// Follow API Functions
export const getFollowing = (userId) => { return apiClient.get(`/api/follows/${userId}/following`); };
export const toggleFollow = (followerId, followingId) => { return apiClient.post(`/api/follows/toggle`, { followerId, followingId }); };

// Portfolio API Functions
export const getPortfolioList = () => {
    return apiClient.get('/api/portfolio/list');
};
export const getPortfolioSummary = () => {
    return apiClient.get('/api/portfolio/summary');
};
export const addPortfolioItem = (data) => {
    return apiClient.post('/api/portfolio/write', data);
};
export const updatePortfolioItem = (portfolioId, data) => {
    return apiClient.patch(`/api/portfolio/update/${portfolioId}`, data);
};
export const deletePortfolioItem = (portfolioId) => {
    return apiClient.delete(`/api/portfolio/${portfolioId}`);
};

// Other individual exports
export const importTradeLogs = (tradeLogs) => {
    return apiClient.post('/api/tradelogs/import', tradeLogs);
};
export const getAiAnalysis = (tradeLogId) => {
    return apiClient.post(`/api/tradelogs/${tradeLogId}/analyze`);
};

// API_BASE_URL은 config.js에서 가져오므로 그대로 유지
export { default as API_BASE_URL } from './config';
