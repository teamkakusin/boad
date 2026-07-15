/**
 * Enhanced Authentication Module
 * ユーザーの登録、ログイン、ログアウト機能を管理
 * プロフィール情報の拡張設定に対応
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
            hash = hash & hash;
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
                displayName: userId,
                bio: '',
                location: '',
                website: '',
                avatar: this.generateAvatar(userId),
                avatarEmoji: this.getRandomEmoji()
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
     * アバター絵文字を生成
     */
    generateAvatar(userId) {
        const avatars = ['😺', '😸', '😹', '😻', '😼', '😽', '🐱'];
        const index = userId.charCodeAt(0) % avatars.length;
        return avatars[index];
    }

    /**
     * ランダムな絵文字を取得
     */
    getRandomEmoji() {
        const emojis = ['😺', '😸', '😹', '😻', '😼', '😽', '🐱', '🦁', '🐯', '😸', '😻', '😽', '😼'];
        return emojis[Math.floor(Math.random() * emojis.length)];
    }

    /**
     * プロフィール情報を更新
     */
    updateProfileInfo(profileData) {
        if (!this.currentUser) return false;

        const users = this.getAllUsers();
        const user = users[this.currentUser.id];
        
        if (profileData.displayName) user.profile.displayName = profileData.displayName;
        if (profileData.bio !== undefined) user.profile.bio = profileData.bio;
        if (profileData.location !== undefined) user.profile.location = profileData.location;
        if (profileData.website !== undefined) user.profile.website = profileData.website;
        if (profileData.avatarEmoji !== undefined) user.profile.avatarEmoji = profileData.avatarEmoji;

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

    /**
     * パスワードを変更
     */
    changePassword(oldPassword, newPassword) {
        if (!this.currentUser) return false;

        if (!this.verifyPassword(oldPassword, this.currentUser.passwordHash)) {
            return false;
        }

        const users = this.getAllUsers();
        const user = users[this.currentUser.id];
        user.passwordHash = this.hashPassword(newPassword);

        this.saveUsers(users);
        this.currentUser = user;
        localStorage.setItem(this.currentUserKey, JSON.stringify(user));

        return true;
    }

    /**
     * アカウントを削除
     */
    deleteAccount() {
        if (!this.currentUser) return false;

        const users = this.getAllUsers();
        delete users[this.currentUser.id];

        this.saveUsers(users);
        this.currentUser = null;
        localStorage.removeItem(this.currentUserKey);

        return true;
    }
}

// グローバルインスタンスを作成
const authManager = new AuthManager();
