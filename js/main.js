/**
 * Main Application
 * UIの制御とイベントハンドラーを管理
 */

class App {
    constructor() {
        this.currentPage = 'home';
        this.init();
    }

    /**
     * アプリケーション初期化
     */
    init() {
        this.setupEventListeners();
        this.updateUIBasedOnAuthState();
        this.renderLatestThreads();
        this.renderLiveRadios();
    }

    /**
     * イベントリスナーをセットアップ
     */
    setupEventListeners() {
        // ナビゲーション
        document.getElementById('navHome').addEventListener('click', () => this.navigateTo('home'));
        document.getElementById('navRadio').addEventListener('click', () => this.navigateTo('radio'));
        document.getElementById('navBoard').addEventListener('click', () => this.navigateTo('board'));
        document.getElementById('navProfile').addEventListener('click', () => this.navigateTo('profile'));
        document.getElementById('navLogin').addEventListener('click', () => this.openLoginModal());
        document.getElementById('navLogout').addEventListener('click', () => this.logout());

        // ホームページ
        document.getElementById('getStarted').addEventListener('click', () => this.openLoginModal());
        document.getElementById('viewDemo').addEventListener('click', () => this.navigateTo('radio'));

        // ログイン・登録フォーム
        document.getElementById('loginForm').addEventListener('submit', (e) => this.handleLogin(e));
        document.getElementById('registerForm').addEventListener('submit', (e) => this.handleRegister(e));
        document.getElementById('switchToRegister').addEventListener('click', () => this.switchToRegisterModal());
        document.getElementById('switchToLogin').addEventListener('click', () => this.switchToLoginModal());

        // ラジオフォーム
        document.getElementById('createRadioForm').addEventListener('submit', (e) => this.handleCreateRadio(e));

        // 掲示板フォーム
        document.getElementById('threadForm').addEventListener('submit', (e) => this.handleCreateThread(e));

        // モーダルの閉じるボタン
        document.querySelectorAll('.close-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.target.closest('.modal').classList.remove('active');
            });
        });

        // ID入力フィールドのバリデーション
        document.getElementById('registerId').addEventListener('input', (e) => {
            const id = e.target.value;
            const message = document.getElementById('idMessage');
            
            if (id.length === 0) {
                message.textContent = '';
            } else if (id.length < 3) {
                message.textContent = '3文字以上で入力してください';
                message.className = 'error';
            } else if (authManager.userExists(id)) {
                message.textContent = 'このユーザーIDは既に存在します';
                message.className = 'error';
            } else {
                message.textContent = '利用可能なユーザーIDです';
                message.className = 'success';
            }
        });

        // パスワード確認フィールドのバリデーション
        document.getElementById('registerPasswordConfirm').addEventListener('input', (e) => {
            const password = document.getElementById('registerPassword').value;
            const confirm = e.target.value;
            const message = document.getElementById('passwordMessage');

            if (confirm.length === 0) {
                message.textContent = '';
            } else if (password !== confirm) {
                message.textContent = 'パスワードが一致しません';
                message.className = 'error';
            } else {
                message.textContent = 'パスワードが一致しています';
                message.className = 'success';
            }
        });
    }

    /**
     * ページを移動
     */
    navigateTo(page) {
        if (!authManager.isLoggedIn() && page !== 'home') {
            this.showAlert('ログインしてください', 'error');
            this.openLoginModal();
            return;
        }

        this.currentPage = page;
        document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
        document.querySelectorAll('.modal').forEach(m => m.classList.remove('active'));

        // ナビゲーション項目をアクティブにする
        document.querySelectorAll('.nav-link').forEach(link => link.classList.remove('active'));
        if (page === 'home') {
            document.getElementById('navHome').classList.add('active');
        } else if (page === 'radio') {
            document.getElementById('navRadio').classList.add('active');
        } else if (page === 'board') {
            document.getElementById('navBoard').classList.add('active');
        } else if (page === 'profile') {
            document.getElementById('navProfile').classList.add('active');
        }

        if (page === 'home') {
            document.getElementById('homePage').classList.add('active');
        } else if (page === 'radio') {
            document.getElementById('radioPage').classList.add('active');
            this.renderRadioPage();
        } else if (page === 'board') {
            document.getElementById('boardPage').classList.add('active');
            this.renderBoardPage();
        } else if (page === 'profile') {
            document.getElementById('profilePage').classList.add('active');
            this.renderProfilePage();
        }
    }

    /**
     * 認証状態に基づいてUIを更新
     */
    updateUIBasedOnAuthState() {
        if (authManager.isLoggedIn()) {
            document.getElementById('navLogin').style.display = 'none';
            document.getElementById('navLogout').style.display = 'inline-block';
            document.getElementById('hostRadioForm').style.display = 'block';
            document.getElementById('createThreadForm').style.display = 'block';
        } else {
            document.getElementById('navLogin').style.display = 'inline-block';
            document.getElementById('navLogout').style.display = 'none';
            document.getElementById('hostRadioForm').style.display = 'none';
            document.getElementById('createThreadForm').style.display = 'none';
        }
    }

    /**
     * ログインモーダルを開く
     */
    openLoginModal() {
        document.getElementById('loginPage').classList.add('active');
        document.getElementById('registerPage').classList.remove('active');
    }

    /**
     * 登録モーダルに切り替える
     */
    switchToRegisterModal() {
        document.getElementById('loginPage').classList.remove('active');
        document.getElementById('registerPage').classList.add('active');
    }

    /**
     * ログインモーダルに切り替える
     */
    switchToLoginModal() {
        document.getElementById('loginPage').classList.add('active');
        document.getElementById('registerPage').classList.remove('active');
    }

    /**
     * ログイン処理
     */
    handleLogin(e) {
        e.preventDefault();

        const id = document.getElementById('loginId').value;
        const password = document.getElementById('loginPassword').value;

        const result = authManager.login(id, password);

        if (result.success) {
            this.showAlert(result.message, 'success');
            document.getElementById('loginPage').classList.remove('active');
            document.getElementById('loginForm').reset();
            this.updateUIBasedOnAuthState();
            this.navigateTo('home');
        } else {
            this.showAlert(result.message, 'error');
        }
    }

    /**
     * 登録処理
     */
    handleRegister(e) {
        e.preventDefault();

        const id = document.getElementById('registerId').value;
        const password = document.getElementById('registerPassword').value;
        const confirm = document.getElementById('registerPasswordConfirm').value;

        if (password !== confirm) {
            this.showAlert('パスワードが一致しません', 'error');
            return;
        }

        const result = authManager.register(id, password);

        if (result.success) {
            this.showAlert(result.message, 'success');
            setTimeout(() => {
                document.getElementById('registerPage').classList.remove('active');
                document.getElementById('registerForm').reset();
                this.switchToLoginModal();
            }, 1500);
        } else {
            this.showAlert(result.message, 'error');
        }
    }

    /**
     * ログアウト処理
     */
    logout() {
        if (confirm('ログアウトしますか？')) {
            authManager.logout();
            this.showAlert('ログアウトしました', 'success');
            this.updateUIBasedOnAuthState();
            this.navigateTo('home');
        }
    }

    /**
     * ラジオ作成処理
     */
    handleCreateRadio(e) {
        e.preventDefault();

        const title = document.getElementById('radioTitle').value;
        const description = document.getElementById('radioDescription').value;
        const tags = document.getElementById('radioTags').value;

        const result = radioManager.createRadio(
            title,
            description,
            tags,
            authManager.currentUser.id
        );

        if (result.success) {
            this.showAlert(result.message, 'success');
            document.getElementById('createRadioForm').reset();
            this.renderRadioPage();
        } else {
            this.showAlert(result.message, 'error');
        }
    }

    /**
     * スレッド作成処理
     */
    handleCreateThread(e) {
        e.preventDefault();

        const title = document.getElementById('threadTitle').value;
        const content = document.getElementById('threadContent').value;
        const category = document.getElementById('threadCategory').value;

        const result = boardManager.createThread(
            title,
            content,
            category,
            authManager.currentUser.id
        );

        if (result.success) {
            this.showAlert(result.message, 'success');
            document.getElementById('threadForm').reset();
            this.renderBoardPage();
        } else {
            this.showAlert(result.message, 'error');
        }
    }

    /**
     * ラジオページをレンダリング
     */
    renderRadioPage() {
        const radioList = document.getElementById('radioList');
        const liveRadios = radioManager.getLiveRadios();

        if (liveRadios.length === 0) {
            radioList.innerHTML = '<p style="text-align: center; padding: 2rem;">現在、配信中のラジオはありません</p>';
            return;
        }

        radioList.innerHTML = liveRadios.map(radio => `
            <div class="radio-card" onclick="app.viewRadio('${radio.id}')">
                <div class="radio-header">
                    <div class="radio-title">${this.escapeHtml(radio.title)}</div>
                    <div class="radio-host">${this.escapeHtml(radio.hostName)}がホスト中</div>
                </div>
                <div class="radio-body">
                    <p class="radio-description">${this.escapeHtml(radio.description)}</p>
                    <div class="radio-tags">
                        ${radio.tags.map(tag => `<span class="tag">${this.escapeHtml(tag)}</span>`).join('')}
                    </div>
                    <div class="radio-footer">
                        <span class="listener-count">👥 ${radio.listeners}人が聞いています</span>
                        <span class="status-badge status-live">🔴 LIVE</span>
                    </div>
                </div>
            </div>
        `).join('');
    }

    /**
     * ラジオを表示
     */
    viewRadio(radioId) {
        if (!authManager.isLoggedIn()) {
            this.openLoginModal();
            return;
        }

        const radio = radioManager.getRadio(radioId);
        if (!radio) {
            this.showAlert('ラジオが見つかりません', 'error');
            return;
        }

        // リスナーを追加
        radioManager.addListener(radioId, authManager.currentUser.id);

        // ラジオ詳細ページへのモーダルを表示
        const html = `
            <div class="modal" id="radioDetailModal">
                <div class="modal-content">
                    <button class="close-btn" onclick="document.getElementById('radioDetailModal').remove()">&times;</button>
                    <h2>${this.escapeHtml(radio.title)}</h2>
                    <p><strong>ホスト:</strong> ${this.escapeHtml(radio.hostName)}</p>
                    <p><strong>リスナー数:</strong> ${radio.listeners}人</p>
                    <p><strong>説明:</strong></p>
                    <p>${this.escapeHtml(radio.description)}</p>
                    
                    <div class="comments-section">
                        <h3>コメント</h3>
                        <form onsubmit="app.handleAddRadioComment(event, '${radioId}')">
                            <div class="form-group">
                                <input type="text" placeholder="コメントを入力..." required>
                                <button type="submit" class="btn btn-primary">コメント送信</button>
                            </div>
                        </form>
                        <div id="radioComments">
                            ${radio.comments.map(comment => `
                                <div class="comment">
                                    <div class="comment-header">
                                        <span class="comment-author">${authManager.getUser(comment.userId).profile.avatar} ${this.escapeHtml(comment.userName)}</span>
                                        <span class="comment-time">${commentUtils.formatTime(comment.createdAt)}</span>
                                    </div>
                                    <div class="comment-content">${this.escapeHtml(comment.content)}</div>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', html);
    }

    /**
     * ラジオコメント追加処理
     */
    handleAddRadioComment(e, radioId) {
        e.preventDefault();

        const input = e.target.querySelector('input');
        const content = input.value;

        const result = radioManager.addComment(radioId, authManager.currentUser.id, content);

        if (result.success) {
            input.value = '';
            this.viewRadio(radioId);
            this.showAlert(result.message, 'success');
        } else {
            this.showAlert(result.message, 'error');
        }
    }

    /**
     * 掲示板ページをレンダリング
     */
    renderBoardPage() {
        const threadList = document.getElementById('threadList');
        const threads = boardManager.getLatestThreads();

        if (threads.length === 0) {
            threadList.innerHTML = '<p style="text-align: center; padding: 2rem;">まだスレッドがありません。最初のスレッドを作成してください！</p>';
            return;
        }

        threadList.innerHTML = threads.map(thread => `
            <div class="thread-item" onclick="app.viewThread('${thread.id}')">
                <div class="thread-header">
                    <div class="thread-title">${this.escapeHtml(thread.title)}</div>
                    <span class="thread-category">${this.getCategoryEmoji(thread.category)} ${thread.category}</span>
                </div>
                <div class="thread-content">${this.escapeHtml(thread.content.substring(0, 100))}...</div>
                <div class="thread-meta">
                    ${authManager.getUser(thread.userId).profile.avatar} ${this.escapeHtml(thread.userName)} 
                    | ${commentUtils.formatTime(thread.updatedAt)}
                </div>
                <div class="thread-stats">
                    <span>💬 ${thread.replies.length}件の返信</span>
                    <span>👁️ ${thread.views}回表示</span>
                    <span>👍 ${thread.likes}いいね</span>
                </div>
            </div>
        `).join('');
    }

    /**
     * スレッドを表示
     */
    viewThread(threadId) {
        const thread = boardManager.getThread(threadId);
        if (!thread) {
            this.showAlert('スレッドが見つかりません', 'error');
            return;
        }

        const html = `
            <div class="modal active" id="threadDetailModal">
                <div class="modal-content">
                    <button class="close-btn" onclick="document.getElementById('threadDetailModal').remove()">&times;</button>
                    <div class="thread-header">
                        <div>
                            <h2>${this.escapeHtml(thread.title)}</h2>
                            <div class="thread-meta">
                                ${authManager.getUser(thread.userId).profile.avatar} ${this.escapeHtml(thread.userName)} 
                                | ${commentUtils.formatTime(thread.createdAt)}
                            </div>
                        </div>
                        <span class="thread-category">${this.getCategoryEmoji(thread.category)} ${thread.category}</span>
                    </div>
                    <div class="thread-content" style="padding: 1rem 0;">
                        ${this.escapeHtml(thread.content)}
                    </div>
                    <div class="thread-stats">
                        <button class="like-btn" onclick="app.likeThread('${thread.id}')">👍 ${thread.likes}</button>
                        <span>💬 ${thread.replies.length}件の返信</span>
                        <span>👁️ ${thread.views}回表示</span>
                    </div>

                    <div class="comments-section">
                        <h3>返信</h3>
                        ${authManager.isLoggedIn() ? `
                            <form onsubmit="app.handleAddReply(event, '${threadId}')">
                                <div class="form-group">
                                    <textarea placeholder="返信を入力..." rows="3" required></textarea>
                                    <button type="submit" class="btn btn-primary">返信送信</button>
                                </div>
                            </form>
                        ` : ''}
                        <div id="threadReplies">
                            ${thread.replies.length === 0 ? '<p style="text-align: center; color: #6b7280;">まだ返信がありません</p>' : thread.replies.map(reply => `
                                <div class="comment">
                                    <div class="comment-header">
                                        <span class="comment-author">${authManager.getUser(reply.userId).profile.avatar} ${this.escapeHtml(reply.userName)}</span>
                                        <span class="comment-time">${commentUtils.formatTime(reply.createdAt)}</span>
                                    </div>
                                    <div class="comment-content">${this.escapeHtml(reply.content)}</div>
                                    <div class="comment-actions">
                                        <button class="comment-action-btn" onclick="app.likeReply('${threadId}', '${reply.id}')">👍 ${reply.likes}</button>
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', html);
    }

    /**
     * スレッドに「いいね」を追加
     */
    likeThread(threadId) {
        const result = boardManager.likeThread(threadId);
        if (result.success) {
            this.showAlert(result.message, 'success');
            document.getElementById('threadDetailModal').remove();
            this.viewThread(threadId);
        }
    }

    /**
     * 返信に「いいね」を追加
     */
    likeReply(threadId, replyId) {
        const result = boardManager.likeReply(threadId, replyId);
        if (result.success) {
            this.showAlert(result.message, 'success');
            document.getElementById('threadDetailModal').remove();
            this.viewThread(threadId);
        }
    }

    /**
     * 返信追加処理
     */
    handleAddReply(e, threadId) {
        e.preventDefault();

        const textarea = e.target.querySelector('textarea');
        const content = textarea.value;

        const result = boardManager.addReply(threadId, authManager.currentUser.id, content);

        if (result.success) {
            textarea.value = '';
            document.getElementById('threadDetailModal').remove();
            this.viewThread(threadId);
            this.showAlert(result.message, 'success');
        } else {
            this.showAlert(result.message, 'error');
        }
    }

    /**
     * プロフィールページをレンダリング
     */
    renderProfilePage() {
        if (!authManager.isLoggedIn()) {
            return;
        }

        const user = authManager.currentUser;
        const profileContent = document.getElementById('profileContent');

        profileContent.innerHTML = `
            <div class="profile-header">
                <div class="profile-avatar">${user.profile.avatar}</div>
                <div class="profile-info">
                    <h3>${this.escapeHtml(user.id)}</h3>
                    <p>${this.escapeHtml(user.profile.bio || 'プロフィール情報がありません')}</p>
                    <button class="btn btn-primary" onclick="app.editProfile()">プロフィールを編集</button>
                </div>
            </div>

            <div class="profile-stats">
                <div class="stat-card">
                    <div class="stat-value">${user.stats.radioHosted || 0}</div>
                    <div class="stat-label">配信したラジオ</div>
                </div>
                <div class="stat-card">
                    <div class="stat-value">${user.stats.threadsCreated || 0}</div>
                    <div class="stat-label">作成したスレッド</div>
                </div>
                <div class="stat-card">
                    <div class="stat-value">${user.stats.commentsPosted || 0}</div>
                    <div class="stat-label">投稿したコメント</div>
                </div>
            </div>

            <div class="card">
                <h3>アカウント情報</h3>
                <p><strong>アカウント作成日:</strong> ${new Date(user.createdAt).toLocaleDateString('ja-JP')}</p>
            </div>
        `;
    }

    /**
     * プロフィール編集
     */
    editProfile() {
        const bio = prompt('プロフィール情報を入力してください:', authManager.currentUser.profile.bio);
        if (bio !== null) {
            authManager.updateProfile(bio);
            this.showAlert('プロフィールを更新しました', 'success');
            this.renderProfilePage();
        }
    }

    /**
     * ホームページの最新スレッドをレンダリング
     */
    renderLatestThreads() {
        const threads = boardManager.getLatestThreads(3);
        // ホームページに表示される最新スレッドなど
    }

    /**
     * ホームページのライブラジオをレンダリング
     */
    renderLiveRadios() {
        const radios = radioManager.getLiveRadios().slice(0, 3);
        // ホームページに表示されるライブラジオなど
    }

    /**
     * カテゴリに対応する絵文字を取得
     */
    getCategoryEmoji(category) {
        const emojiMap = {
            general: '💬',
            question: '❓',
            announcement: '📢',
            other: '📌'
        };
        return emojiMap[category] || '📌';
    }

    /**
     * アラートを表示
     */
    showAlert(message, type = 'info') {
        const alertClass = `alert alert-${type}`;
        const alertHtml = `<div class="${alertClass}" style="position: fixed; top: 20px; right: 20px; z-index: 10000; max-width: 400px;">${message}</div>`;
        
        document.body.insertAdjacentHTML('beforeend', alertHtml);
        
        const alert = document.body.querySelector(`.${alertClass}`);
        setTimeout(() => {
            alert.style.opacity = '1';
            alert.style.transition = 'opacity 0.3s';
        }, 10);

        setTimeout(() => {
            alert.style.opacity = '0';
            setTimeout(() => alert.remove(), 300);
        }, 3000);
    }

    /**
     * HTMLをエスケープ
     */
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

// アプリケーションを初期化
const app = new App();
