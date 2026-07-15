/**
 * Authentication Module
 * ユーザーの登録、ログイン、ログアウト機能を管理
 */

class AuthManager {
    constructor() {
        this.storageKey = 'boad_users';
        this.currentUserKey = 'boad_current_user';
        this.currentUser = this.getCurrentUser();
        this.initializeUsers();
    }

    /**
     * ユーザーデータベースを初期化
     */
    initializeUsers() {
        if (!localStorage.getItem(this.storageKey)) {
            localStorage.setItem(this.storageKey, JSON.stringify({}));
        }
    }

    /**
     * すべてのユーザーを取得
     */
    getAllUsers() {
        return JSON.parse(localStorage.getItem(this.storageKey)) || {};
    }

    /**
     * ユーザーを保存
     */
    saveUsers(users) {
        localStorage.setItem(this.storageKey, JSON.stringify(users));
    }

    /**
     * 簡易的なハッシュ化（本番環境ではbcryptなどを使用）
     */
    hashPassword(password) {
        let hash = 0;
        for (let i = 0; i < password.length; i++) {
            const char = password.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // Convert to 32bit integer
        }
        return Math.abs(hash).toString(16);
    }

    /**
     * パスワードを検証
     */
    verifyPassword(password, hash) {
        return this.hashPassword(password) === hash;
    }

    /**
     * ユーザーIDが存在するか確認
     */
    userExists(userId) {
        const users = this.getAllUsers();
        return users.hasOwnProperty(userId);
    }

    /**
     * アカウント登録
     */
    register(userId, password) {
        if (this.userExists(userId)) {
            return {
                success: false,
                message: 'ユーザーIDは既に存在します'
            };
        }

        if (userId.length < 3) {
            return {
                success: false,
                message: 'ユーザーIDは3文字以上で入力してください'
            };
        }

        if (password.length < 6) {
            return {
                success: false,
                message: 'パスワードは6文字以上で入力してください'
            };
        }

        const users = this.getAllUsers();
        users[userId] = {
            id: userId,
            passwordHash: this.hashPassword(password),
            createdAt: new Date().toISOString(),
            profile: {
                bio: '',
                avatar: this.generateAvatar(userId)
            },
            stats: {
                radioHosted: 0,
                threadsCreated: 0,
                commentsPosted: 0
            }
        };

        this.saveUsers(users);
        return {
            success: true,
            message: 'アカウントを作成しました'
        };
    }

    /**
     * ログイン
     */
    login(userId, password) {
        const users = this.getAllUsers();

        if (!users.hasOwnProperty(userId)) {
            return {
                success: false,
                message: 'ユーザーIDまたはパスワードが正しくありません'
            };
        }

        const user = users[userId];

        if (!this.verifyPassword(password, user.passwordHash)) {
            return {
                success: false,
                message: 'ユーザーIDまたはパスワードが正しくありません'
            };
        }

        this.currentUser = user;
        localStorage.setItem(this.currentUserKey, JSON.stringify(user));

        return {
            success: true,
            message: 'ログインしました',
            user: user
        };
    }

    /**
     * ログアウト
     */
    logout() {
        this.currentUser = null;
        localStorage.removeItem(this.currentUserKey);
        return {
            success: true,
            message: 'ログアウトしました'
        };
    }

    /**
     * 現在のユーザーを取得
     */
    getCurrentUser() {
        const userJson = localStorage.getItem(this.currentUserKey);
        return userJson ? JSON.parse(userJson) : null;
    }

    /**
     * ユーザーがログインしているか確認
     */
    isLoggedIn() {
        return this.currentUser !== null;
    }

    /**
     * アバターを生成
     */
    generateAvatar(userId) {
        const avatars = ['😺', '😸', '😹', '😻', '😼', '😽', '🐱'];
        const index = userId.charCodeAt(0) % avatars.length;
        return avatars[index];
    }

    /**
     * プロフィールを更新
     */
    updateProfile(bio) {
        if (!this.currentUser) return false;

        const users = this.getAllUsers();
        const user = users[this.currentUser.id];
        
        user.profile.bio = bio;
        user.updatedAt = new Date().toISOString();

        this.saveUsers(users);
        this.currentUser = user;
        localStorage.setItem(this.currentUserKey, JSON.stringify(user));

        return true;
    }

    /**
     * ユーザーの統計情報を更新
     */
    updateStats(type, increment = 1) {
        if (!this.currentUser) return false;

        const users = this.getAllUsers();
        const user = users[this.currentUser.id];

        if (type === 'radio') {
            user.stats.radioHosted = (user.stats.radioHosted || 0) + increment;
        } else if (type === 'thread') {
            user.stats.threadsCreated = (user.stats.threadsCreated || 0) + increment;
        } else if (type === 'comment') {
            user.stats.commentsPosted = (user.stats.commentsPosted || 0) + increment;
        }

        this.saveUsers(users);
        this.currentUser = user;
        localStorage.setItem(this.currentUserKey, JSON.stringify(user));

        return true;
    }

    /**
     * ユーザー情報を取得
     */
    getUser(userId) {
        const users = this.getAllUsers();
        return users[userId] || null;
    }
}

// グローバルインスタンスを作成
const authManager = new AuthManager();
