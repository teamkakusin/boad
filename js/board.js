/**
 * Board Module
 * 掲示板機能を管理
 */

class BoardManager {
    constructor() {
        this.storageKey = 'boad_threads';
        this.initializeBoard();
    }

    /**
     * 掲示板を初期化
     */
    initializeBoard() {
        if (!localStorage.getItem(this.storageKey)) {
            localStorage.setItem(this.storageKey, JSON.stringify([]));
        }
    }

    /**
     * すべてのスレッドを取得
     */
    getAllThreads() {
        return JSON.parse(localStorage.getItem(this.storageKey)) || [];
    }

    /**
     * スレッドを保存
     */
    saveThreads(threads) {
        localStorage.setItem(this.storageKey, JSON.stringify(threads));
    }

    /**
     * スレッドを作成
     */
    createThread(title, content, category, userId) {
        if (!title || !content) {
            return {
                success: false,
                message: 'タイトルと内容を入力してください'
            };
        }

        if (title.length < 3) {
            return {
                success: false,
                message: 'タイトルは3文字以上で入力してください'
            };
        }

        const threads = this.getAllThreads();
        const threadId = 'thread_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);

        const newThread = {
            id: threadId,
            title: title,
            content: content,
            category: category || 'general',
            userId: userId,
            userName: authManager.getUser(userId).id,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            replies: [],
            views: 0,
            likes: 0
        };

        threads.push(newThread);
        this.saveThreads(threads);

        // 統計情報を更新
        authManager.updateStats('thread', 1);

        return {
            success: true,
            message: 'スレッドを作成しました',
            thread: newThread
        };
    }

    /**
     * スレッドに返信を追加
     */
    addReply(threadId, userId, content) {
        if (!content.trim()) {
            return {
                success: false,
                message: '内容を入力してください'
            };
        }

        const threads = this.getAllThreads();
        const thread = threads.find(t => t.id === threadId);

        if (!thread) {
            return {
                success: false,
                message: 'スレッドが見つかりません'
            };
        }

        const reply = {
            id: 'reply_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
            userId: userId,
            userName: authManager.getUser(userId).id,
            content: content,
            createdAt: new Date().toISOString(),
            likes: 0
        };

        thread.replies.push(reply);
        thread.updatedAt = new Date().toISOString();
        this.saveThreads(threads);

        // 統計情報を更新
        authManager.updateStats('comment', 1);

        return {
            success: true,
            message: '返信を投稿しました',
            reply: reply
        };
    }

    /**
     * スレッドを取得
     */
    getThread(threadId) {
        const threads = this.getAllThreads();
        const thread = threads.find(t => t.id === threadId);

        if (thread) {
            thread.views = (thread.views || 0) + 1;
            this.saveThreads(threads);
        }

        return thread;
    }

    /**
     * カテゴリ別にスレッドを取得
     */
    getThreadsByCategory(category) {
        const threads = this.getAllThreads();
        return threads
            .filter(t => t.category === category)
            .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
    }

    /**
     * すべてのスレッドを最新順で取得
     */
    getLatestThreads(limit = 20) {
        const threads = this.getAllThreads();
        return threads
            .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
            .slice(0, limit);
    }

    /**
     * ユーザーが作成したスレッドを取得
     */
    getUserThreads(userId) {
        const threads = this.getAllThreads();
        return threads
            .filter(t => t.userId === userId)
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }

    /**
     * スレッドを削除
     */
    deleteThread(threadId) {
        let threads = this.getAllThreads();
        threads = threads.filter(t => t.id !== threadId);
        this.saveThreads(threads);

        return {
            success: true,
            message: 'スレッドを削除しました'
        };
    }

    /**
     * 返信を削除
     */
    deleteReply(threadId, replyId) {
        const threads = this.getAllThreads();
        const thread = threads.find(t => t.id === threadId);

        if (!thread) {
            return {
                success: false,
                message: 'スレッドが見つかりません'
            };
        }

        thread.replies = thread.replies.filter(r => r.id !== replyId);
        this.saveThreads(threads);

        return {
            success: true,
            message: '返信を削除しました'
        };
    }

    /**
     * スレッドに「いいね」を追加
     */
    likeThread(threadId) {
        const threads = this.getAllThreads();
        const thread = threads.find(t => t.id === threadId);

        if (!thread) {
            return {
                success: false,
                message: 'スレッドが見つかりません'
            };
        }

        thread.likes = (thread.likes || 0) + 1;
        this.saveThreads(threads);

        return {
            success: true,
            message: 'いいねしました'
        };
    }

    /**
     * 返信に「いいね」を追加
     */
    likeReply(threadId, replyId) {
        const threads = this.getAllThreads();
        const thread = threads.find(t => t.id === threadId);

        if (!thread) {
            return {
                success: false,
                message: 'スレッドが見つかりません'
            };
        }

        const reply = thread.replies.find(r => r.id === replyId);

        if (!reply) {
            return {
                success: false,
                message: '返信が見つかりません'
            };
        }

        reply.likes = (reply.likes || 0) + 1;
        this.saveThreads(threads);

        return {
            success: true,
            message: 'いいねしました'
        };
    }

    /**
     * スレッドを検索
     */
    searchThreads(keyword) {
        const threads = this.getAllThreads();
        const lowerKeyword = keyword.toLowerCase();

        return threads.filter(t =>
            t.title.toLowerCase().includes(lowerKeyword) ||
            t.content.toLowerCase().includes(lowerKeyword) ||
            t.userName.toLowerCase().includes(lowerKeyword)
        ).sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
    }
}

// グローバルインスタンスを作成
const boardManager = new BoardManager();
