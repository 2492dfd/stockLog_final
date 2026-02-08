import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const AppStorage = {
    /**
     * @param {string} key
     * @param {string} value
     */
    setItem: async (key, value) => {
        if (Platform.OS === 'web') {
            try {
                localStorage.setItem(key, value);
                return Promise.resolve();
            } catch (e) {
                console.error('localStorage.setItem error:', e);
                return Promise.reject(e);
            }
        } else {
            return AsyncStorage.setItem(key, value);
        }
    },

    /**
     * @param {string} key
     */
    getItem: async (key) => {
        if (Platform.OS === 'web') {
            try {
                const value = localStorage.getItem(key);
                return Promise.resolve(value);
            } catch (e) {
                console.error('localStorage.getItem error:', e);
                return Promise.reject(e);
            }
        } else {
            return AsyncStorage.getItem(key);
        }
    },

    /**
     * @param {string} key
     */
    removeItem: async (key) => {
        if (Platform.OS === 'web') {
            try {
                localStorage.removeItem(key);
                return Promise.resolve();
            } catch (e) {
                console.error('localStorage.removeItem error:', e);
                return Promise.reject(e);
            }
        } else {
            return AsyncStorage.removeItem(key);
        }
    }
};

export default AppStorage;
