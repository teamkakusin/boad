/**
 * Radio Module
 * ラジオ配信機能を管理
 */

class RadioManager {
    constructor() {
        this.storageKey = 'boad_radios';
        this.listenersKey = 'boad_listeners';
        this.initializeRadios();
    }

    /**
     * ラジオデータベースを初期化
     */
    initializeRadios() {
        if (!localStorage.getItem(this.storageKey)) {
            localStorage.setItem(this.storageKey, JSON.stringify([]));
        }
        if (!localStorage.getItem(this.listenersKey)) {
            localStorage.setItem(this.listenersKey, JSON.stringify({}));
        }
    }

    /**
     * すべてのラジオを取得
     */
    getAllRadios() {
        return JSON.parse(localStorage.getItem(this.storageKey)) || [];
    }

    /**
     * ラジオを保存
     */
    saveRadios(radios) {
        localStorage.setItem(this.storageKey, JSON.stringify(radios));
    }

    /**
     * リスナー情報を取得
     */
    getListeners() {
        return JSON.parse(localStorage.getItem(this.listenersKey)) || {};
    }

    /**
     * リスナー情報を保存
     */
    saveListeners(listeners) {
        localStorage.setItem(this.listenersKey, JSON.stringify(listeners));
    }

    /**
     * ラジオを作成
     */
    createRadio(title, description, tags, hostId) {
        if (!title) {
            return {
                success: false,
                message: '番組名を入力してください'
            };
        }

        const radios = this.getAllRadios();
        const radioId = 'radio_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);

        const newRadio = {
            id: radioId,
            title: title,
            description: description,
            tags: tags ? tags.split(',').map(t => t.trim()) : [],
            hostId: hostId,
            hostName: authManager.getUser(hostId).id,
            isLive: true,
            startTime: new Date().toISOString(),
            endTime: null,
            listeners: 0,
            comments: [],
            createdAt: new Date().toISOString()
        };

        radios.push(newRadio);
        this.saveRadios(radios);

        // 統計情報を更新
        authManager.updateStats('radio', 1);

        return {
            success: true,
            message: '配信を開始しました',
            radio: newRadio
        };
    }

    /**
     * ラジオを終了
     */
    endRadio(radioId) {
        const radios = this.getAllRadios();
        const radio = radios.find(r => r.id === radioId);

        if (!radio) {
            return {
                success: false,
                message: 'ラジオが見つかりません'
            };
        }

        if (!radio.isLive) {
            return {
                success: false,
                message: 'このラジオは既に終了しています'
            };
        }

        radio.isLive = false;
        radio.endTime = new Date().toISOString();

        this.saveRadios(radios);

        return {
            success: true,
            message: '配信を終了しました'
        };
    }

    /**
     * ラジオのコメントを追加
     */
    addComment(radioId, userId, content) {
        if (!content.trim()) {
            return {
                success: false,
                message: 'コメントを入力してください'
            };
        }

        const radios = this.getAllRadios();
        const radio = radios.find(r => r.id === radioId);

        if (!radio) {
            return {
                success: false,
                message: 'ラジオが見つかりません'
            };
        }

        const comment = {
            id: 'comment_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
            userId: userId,
            userName: authManager.getUser(userId).id,
            content: content,
            createdAt: new Date().toISOString(),
            likes: 0
        };

        radio.comments.push(comment);
        this.saveRadios(radios);

        // 統計情報を更新
        authManager.updateStats('comment', 1);

        return {
            success: true,
            message: 'コメントを投稿しました',
            comment: comment
        };
    }

    /**
     * ラジオにリスナーを追加
     */
    addListener(radioId, userId) {
        const radios = this.getAllRadios();
        const radio = radios.find(r => r.id === radioId);

        if (!radio) {
            return {
                success: false,
                message: 'ラジオが見つかりません'
            };
        }

        const listeners = this.getListeners();

        if (!listeners[radioId]) {
            listeners[radioId] = [];
        }

        if (!listeners[radioId].includes(userId)) {
            listeners[radioId].push(userId);
            radio.listeners = listeners[radioId].length;
            this.saveRadios(radios);
            this.saveListeners(listeners);
        }

        return {
            success: true,
            message: 'リスナーを追加しました'
        };
    }

    /**
     * ラジオからリスナーを削除
     */
    removeListener(radioId, userId) {
        const listeners = this.getListeners();

        if (listeners[radioId]) {
            listeners[radioId] = listeners[radioId].filter(id => id !== userId);
            this.saveListeners(listeners);

            const radios = this.getAllRadios();
            const radio = radios.find(r => r.id === radioId);
            if (radio) {
                radio.listeners = listeners[radioId] ? listeners[radioId].length : 0;
                this.saveRadios(radios);
            }
        }

        return {
            success: true,
            message: 'リスナーを削除しました'
        };
    }

    /**
     * ライブのラジオを取得
     */
    getLiveRadios() {
        const radios = this.getAllRadios();
        return radios.filter(r => r.isLive).sort((a, b) => 
            new Date(b.startTime) - new Date(a.startTime)
        );
    }

    /**
     * ユーザーがホストしているラジオを取得
     */
    getUserHostedRadios(userId) {
        const radios = this.getAllRadios();
        return radios.filter(r => r.hostId === userId).sort((a, b) =>
            new Date(b.createdAt) - new Date(a.createdAt)
        );
    }

    /**
     * ラジオを取得
     */
    getRadio(radioId) {
        const radios = this.getAllRadios();
        return radios.find(r => r.id === radioId);
    }

    /**
     * コメントを削除
     */
    deleteComment(radioId, commentId) {
        const radios = this.getAllRadios();
        const radio = radios.find(r => r.id === radioId);

        if (!radio) {
            return {
                success: false,
                message: 'ラジオが見つかりません'
            };
        }

        radio.comments = radio.comments.filter(c => c.id !== commentId);
        this.saveRadios(radios);

        return {
            success: true,
            message: 'コメントを削除しました'
        };
    }

    /**
     * コメントに「いいね」を追加
     */
    likeComment(radioId, commentId, userId) {
        const radios = this.getAllRadios();
        const radio = radios.find(r => r.id === radioId);

        if (!radio) {
            return {
                success: false,
                message: 'ラジオが見つかりません'
            };
        }

        const comment = radio.comments.find(c => c.id === commentId);

        if (!comment) {
            return {
                success: false,
                message: 'コメントが見つかりません'
            };
        }

        comment.likes = (comment.likes || 0) + 1;
        this.saveRadios(radios);

        return {
            success: true,
            message: 'いいねしました'
        };
    }
}

// グローバルインスタンスを作成
const radioManager = new RadioManager();
