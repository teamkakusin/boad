/**
 * Comment Module
 * コメント管理用ユーティリティ
 */

class CommentUtils {
    /**
     * 時間を表示用にフォーマット
     */
    static formatTime(timestamp) {
        const date = new Date(timestamp);
        const now = new Date();
        const diffMs = now - date;
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 1) {
            return '今';
        } else if (diffMins < 60) {
            return `${diffMins}分前`;
        } else if (diffHours < 24) {
            return `${diffHours}時間前`;
        } else if (diffDays < 7) {
            return `${diffDays}日前`;
        } else {
            return date.toLocaleDateString('ja-JP');
        }
    }

    /**
     * テキストをエスケープ
     */
    static escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    /**
     * URLをリンクに変換
     */
    static linkify(text) {
        const urlPattern = /(https?:\/\/[^\s]+)/g;
        return text.replace(urlPattern, '<a href="$1" target="_blank">$1</a>');
    }

    /**
     * コメント表示用のHTMLを生成
     */
    static renderComment(comment, isReply = false) {
        const avatar = authManager.getUser(comment.userId).profile.avatar;
        const timeFormatted = this.formatTime(comment.createdAt);

        return `
            <div class="comment" data-comment-id="${comment.id}">
                <div class="comment-header">
                    <span class="comment-author">${avatar} ${this.escapeHtml(comment.userName)}</span>
                    <span class="comment-time">${timeFormatted}</span>
                </div>
                <div class="comment-content">${this.linkify(this.escapeHtml(comment.content))}</div>
                <div class="comment-actions">
                    <button class="comment-action-btn like-btn">
                        👍 ${comment.likes || 0}
                    </button>
                    ${isReply ? '' : '<button class="comment-action-btn reply-btn">返信</button>'}
                    <button class="comment-action-btn delete-btn" style="display: none;">削除</button>
                </div>
            </div>
        `;
    }

    /**
     * 絵文字を自動選択
     */
    static getEmojiForCategory(category) {
        const emojiMap = {
            general: '💬',
            question: '❓',
            announcement: '📢',
            other: '📌'
        };
        return emojiMap[category] || '📌';
    }
}

// グローバルインスタンスを作成
const commentUtils = new CommentUtils();
