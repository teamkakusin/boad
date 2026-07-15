/**
 * Enhanced Main Application
 * ラジオ詳細ページ、スレッドチャット、ホスト機能を拡張
 */

class App {
    constructor() {
        this.currentPage = 'home';
        this.currentRadioId = null;
        this.currentThreadId = null;
        this.micEnabled = false;
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
            // ホストしているラジオの詳細ページを表示
            this.viewRadioDetail(result.radio.id);
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
            // スレッドのチャット画面を表示
            this.openThreadChat(result.thread.id);
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
            <div class="radio-card" onclick="app.viewRadioDetail('${radio.id}')">
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
     * ラジオ詳細ページを表示
     */
    viewRadioDetail(radioId) {
        const radio = radioManager.getRadio(radioId);
        if (!radio) {
            this.showAlert('ラジオが見つかりません', 'error');
            return;
        }

        // リスナーを追加
        if (authManager.isLoggedIn()) {
            radioManager.addListener(radioId, authManager.currentUser.id);
        }

        const isHost = authManager.isLoggedIn() && authManager.currentUser.id === radio.hostId;

        const html = `
            <div class="modal active" id="radioDetailModal">
                <div class="modal-content" style="width: 90%; max-width: 900px; height: 80vh; display: flex; flex-direction: column;">
                    <button class="close-btn" onclick="document.getElementById('radioDetailModal').remove()">&times;</button>
                    
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
                        <div>
                            <h2>${this.escapeHtml(radio.title)}</h2>
                            <p style="color: #6b7280;"><strong>ホスト:</strong> ${this.escapeHtml(radio.hostName)}</p>
                            <p style="color: #6b7280;"><strong>リスナー数:</strong> ${radio.listeners}人</p>
                        </div>
                        <div>
                            <span class="status-badge status-live">🔴 LIVE</span>
                        </div>
                    </div>

                    ${isHost ? `
                        <div class="card" style="margin-bottom: 1rem;">
                            <h3>ホスト操作</h3>
                            <div style="display: flex; gap: 1rem; flex-wrap: wrap;">
                                <button class="btn ${this.micEnabled ? 'btn-secondary' : 'btn-primary'}" onclick="app.toggleMic('${radioId}')">
                                    🎤 ${this.micEnabled ? 'マイク オン' : 'マイク オフ'}
                                </button>
                                <button class="btn btn-danger" onclick="app.endRadio('${radioId}')">
                                    ⏹️ 配信を終了
                                </button>
                                <button class="btn btn-danger" onclick="app.deleteRadio('${radioId}')">
                                    🗑️ ラジオを削除
                                </button>
                            </div>
                        </div>
                    ` : ''}

                    <div style="flex: 1; display: flex; flex-direction: column; overflow: hidden;">
                        <h3>コメント</h3>
                        <div id="radioComments" style="flex: 1; overflow-y: auto; border: 1px solid var(--border-color); border-radius: 4px; padding: 1rem; margin-bottom: 1rem;">
                            ${radio.comments.length === 0 ? '<p style="text-align: center; color: #6b7280;">コメントがまだありません</p>' : radio.comments.map(comment => `
                                <div class="comment">
                                    <div class="comment-header">
                                        <span class="comment-author">${authManager.getUser(comment.userId).profile.avatar} ${this.escapeHtml(comment.userName)}</span>
                                        <span class="comment-time">${commentUtils.formatTime(comment.createdAt)}</span>
                                    </div>
                                    <div class="comment-content">${this.escapeHtml(comment.content)}</div>
                                    <div class="comment-actions">
                                        <button class="comment-action-btn like-btn" onclick="app.likeRadioComment('${radioId}', '${comment.id}')">👍 ${comment.likes || 0}</button>
                                        ${isHost ? `<button class="comment-action-btn delete-btn" onclick="app.deleteRadioComment('${radioId}', '${comment.id}')">削除</button>` : ''}
                                    </div>
                                </div>
                            `).join('')}
                        </div>

                        ${authManager.isLoggedIn() ? `
                            <form onsubmit="app.handleAddRadioComment(event, '${radioId}')" style="display: flex; gap: 0.5rem;">
                                <input type="text" placeholder="コメントを入力..." required style="flex: 1; padding: 0.75rem; border: 1px solid var(--border-color); border-radius: 4px;">
                                <button type="submit" class="btn btn-primary">送信</button>
                            </form>
                        ` : '<p style="text-align: center; color: #6b7280;">コメントするにはログインしてください</p>'}
                    </div>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', html);
    }

    /**
     * マイクのオンオフを切り替え
     */
    toggleMic(radioId) {
        this.micEnabled = !this.micEnabled;
        this.showAlert(`マイクが${this.micEnabled ? 'オン' : 'オフ'}になりました`, 'success');
        
        // ページを再描画
        document.getElementById('radioDetailModal').remove();
        this.viewRadioDetail(radioId);
    }

    /**
     * ラジオ配信を終了
     */
    endRadio(radioId) {
        if (confirm('配信を終了しますか？')) {
            const result = radioManager.endRadio(radioId);
            if (result.success) {
                this.showAlert(result.message, 'success');
                document.getElementById('radioDetailModal').remove();
                this.renderRadioPage();
            }
        }
    }

    /**
     * ラジオを削除
     */
    deleteRadio(radioId) {
        if (confirm('このラジオを削除しますか？この操作は取り消せません。')) {
            const result = radioManager.deleteRadio(radioId);
            if (result.success) {
                this.showAlert(result.message, 'success');
                document.getElementById('radioDetailModal').remove();
                this.renderRadioPage();
            }
        }
    }

    /**
     * ラジオコメントを追加
     */
    handleAddRadioComment(e, radioId) {
        e.preventDefault();

        const input = e.target.querySelector('input');
        const content = input.value;

        const result = radioManager.addComment(radioId, authManager.currentUser.id, content);

        if (result.success) {
            input.value = '';
            document.getElementById('radioDetailModal').remove();
            this.viewRadioDetail(radioId);
        } else {
            this.showAlert(result.message, 'error');
        }
    }

    /**
     * ラジオコメントに「いいね」を追加
     */
    likeRadioComment(radioId, commentId) {
        const result = radioManager.likeComment(radioId, commentId);
        if (result.success) {
            document.getElementById('radioDetailModal').remove();
            this.viewRadioDetail(radioId);
        }
    }

    /**
     * ラジオコメントを削除
     */
    deleteRadioComment(radioId, commentId) {
        if (confirm('このコメントを削除しますか？')) {
            const result = radioManager.deleteComment(radioId, commentId);
            if (result.success) {
                this.showAlert(result.message, 'success');
                document.getElementById('radioDetailModal').remove();
                this.viewRadioDetail(radioId);
            }
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
            <div class="thread-item" onclick="app.openThreadChat('${thread.id}')">
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
     * スレッドのチャット画面を開く
     */
    openThreadChat(threadId) {
        const thread = boardManager.getThread(threadId);
        if (!thread) {
            this.showAlert('スレッドが見つかりません', 'error');
            return;
        }

        this.currentThreadId = threadId;

        const html = `
            <div class="modal active" id="threadChatModal">
                <div class="modal-content" style="width: 90%; max-width: 800px; height: 80vh; display: flex; flex-direction: column;">
                    <button class="close-btn" onclick="document.getElementById('threadChatModal').remove()">&times;</button>
                    
                    <div style="border-bottom: 1px solid var(--border-color); padding-bottom: 1rem; margin-bottom: 1rem;">
                        <div style="display: flex; justify-content: space-between; align-items: center;">
                            <div>
                                <h2 style="margin: 0;">${this.escapeHtml(thread.title)}</h2>
                                <p style="color: #6b7280; margin: 0.5rem 0 0 0;">
                                    ${authManager.getUser(thread.userId).profile.avatar} ${this.escapeHtml(thread.userName)}
                                </p>
                            </div>
                            <span class="thread-category">${this.getCategoryEmoji(thread.category)} ${thread.category}</span>
                        </div>
                        <p style="color: #6b7280; margin: 0.5rem 0 0 0;">${this.escapeHtml(thread.content)}</p>
                    </div>

                    <div id="threadChat" style="flex: 1; overflow-y: auto; border: 1px solid var(--border-color); border-radius: 4px; padding: 1rem; margin-bottom: 1rem;">
                        ${thread.replies.length === 0 ? '<p style="text-align: center; color: #6b7280;">返信がまだありません</p>' : thread.replies.map((reply, index) => `
                            <div class="comment" data-reply-id="${reply.id}">
                                <div class="comment-header">
                                    <span class="comment-author">${authManager.getUser(reply.userId).profile.avatar} ${this.escapeHtml(reply.userName)}</span>
                                    <span class="comment-time">${commentUtils.formatTime(reply.createdAt)}</span>
                                </div>
                                <div class="comment-content">${this.escapeHtml(reply.content)}</div>
                                <div class="comment-actions">
                                    <button class="comment-action-btn like-btn" onclick="app.likeThreadReply('${threadId}', '${reply.id}')">👍 ${reply.likes || 0}</button>
                                    ${authManager.isLoggedIn() && authManager.currentUser.id === reply.userId ? `<button class="comment-action-btn delete-btn" onclick="app.deleteThreadReply('${threadId}', '${reply.id}')">削除</button>` : ''}
                                </div>
                            </div>
                        `).join('')}
                    </div>

                    ${authManager.isLoggedIn() ? `
                        <form onsubmit="app.handleAddThreadReply(event, '${threadId}')" style="display: flex; gap: 0.5rem; flex-direction: column;">
                            <textarea placeholder="返信を入力..." rows="3" required style="padding: 0.75rem; border: 1px solid var(--border-color); border-radius: 4px; font-family: inherit;"></textarea>
                            <button type="submit" class="btn btn-primary">返信を送信</button>
                        </form>
                    ` : '<p style="text-align: center; color: #6b7280;">返信するにはログインしてください</p>'}
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', html);

        // チャットを自動スクロール
        setTimeout(() => {
            const chatDiv = document.getElementById('threadChat');
            chatDiv.scrollTop = chatDiv.scrollHeight;
        }, 100);
    }

    /**
     * スレッド返信を追加
     */
    handleAddThreadReply(e, threadId) {
        e.preventDefault();

        const textarea = e.target.querySelector('textarea');
        const content = textarea.value;

        const result = boardManager.addReply(threadId, authManager.currentUser.id, content);

        if (result.success) {
            textarea.value = '';
            document.getElementById('threadChatModal').remove();
            this.openThreadChat(threadId);
        } else {
            this.showAlert(result.message, 'error');
        }
    }

    /**
     * スレッド返信に「いいね」を追加
     */
    likeThreadReply(threadId, replyId) {
        const result = boardManager.likeReply(threadId, replyId);
        if (result.success) {
            this.showAlert(result.message, 'success');
            document.getElementById('threadChatModal').remove();
            this.openThreadChat(threadId);
        }
    }

    /**
     * スレッド返信を削除
     */
    deleteThreadReply(threadId, replyId) {
        if (confirm('この返信を削除しますか？')) {
            const result = boardManager.deleteReply(threadId, replyId);
            if (result.success) {
                this.showAlert(result.message, 'success');
                document.getElementById('threadChatModal').remove();
                this.openThreadChat(threadId);
            }
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
                    <p><strong>名前:</strong> ${this.escapeHtml(user.profile.displayName || '未設定')}</p>
                    <p><strong>自己紹介:</strong> ${this.escapeHtml(user.profile.bio || 'プロフィール情報がありません')}</p>
                    <p><strong>場所:</strong> ${this.escapeHtml(user.profile.location || '未設定')}</p>
                    <p><strong>ウェブサイト:</strong> ${user.profile.website ? `<a href="${this.escapeHtml(user.profile.website)}" target="_blank">${this.escapeHtml(user.profile.website)}</a>` : '未設定'}</p>
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
                <h3>セキュリティ設定</h3>
                <p><strong>アカウント作成日:</strong> ${new Date(user.createdAt).toLocaleDateString('ja-JP')}</p>
                <button class="btn btn-secondary" onclick="app.changePassword()">パスワードを変更</button>
                <button class="btn btn-danger" onclick="app.deleteAccount()" style="margin-left: 1rem;">アカウントを削除</button>
            </div>
        `;
    }

    /**
     * プロフィール編集
     */
    editProfile() {
        const user = authManager.currentUser;

        const html = `
            <div class="modal active" id="editProfileModal">
                <div class="modal-content">
                    <button class="close-btn" onclick="document.getElementById('editProfileModal').remove()">&times;</button>
                    <h2>プロフィール編集</h2>
                    <form onsubmit="app.handleProfileUpdate(event)">
                        <div class="form-group">
                            <label>表示名</label>
                            <input type="text" id="profileDisplayName" value="${this.escapeHtml(user.profile.displayName || '')}">
                        </div>
                        <div class="form-group">
                            <label>自己紹介</label>
                            <textarea id="profileBio" rows="3">${this.escapeHtml(user.profile.bio || '')}</textarea>
                        </div>
                        <div class="form-group">
                            <label>場所</label>
                            <input type="text" id="profileLocation" value="${this.escapeHtml(user.profile.location || '')}">
                        </div>
                        <div class="form-group">
                            <label>ウェブサイト</label>
                            <input type="url" id="profileWebsite" value="${this.escapeHtml(user.profile.website || '')}">
                        </div>
                        <button type="submit" class="btn btn-primary">保存</button>
                    </form>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', html);
    }

    /**
     * プロフィール更新処理
     */
    handleProfileUpdate(e) {
        e.preventDefault();

        const displayName = document.getElementById('profileDisplayName').value;
        const bio = document.getElementById('profileBio').value;
        const location = document.getElementById('profileLocation').value;
        const website = document.getElementById('profileWebsite').value;

        authManager.updateProfileInfo({
            displayName,
            bio,
            location,
            website
        });

        this.showAlert('プロフィールを更新しました', 'success');
        document.getElementById('editProfileModal').remove();
        this.renderProfilePage();
    }

    /**
     * パスワード変更
     */
    changePassword() {
        const oldPassword = prompt('現在のパスワードを入力してください:');
        if (!oldPassword) return;

        if (!authManager.verifyPassword(oldPassword, authManager.currentUser.passwordHash)) {
            this.showAlert('パスワードが正しくありません', 'error');
            return;
        }

        const newPassword = prompt('新しいパスワードを入力してください:');
        if (!newPassword || newPassword.length < 6) {
            this.showAlert('パスワードは6文字以上である必要があります', 'error');
            return;
        }

        const confirm = prompt('新しいパスワードを再度入力してください:');
        if (newPassword !== confirm) {
            this.showAlert('パスワードが一致しません', 'error');
            return;
        }

        authManager.changePassword(newPassword);
        this.showAlert('パスワードを変更しました', 'success');
    }

    /**
     * アカウント削除
     */
    deleteAccount() {
        const confirmation = prompt('本当にアカウントを削除しますか？「削除」と入力して確認してください:');
        if (confirmation === '削除') {
            authManager.deleteAccount();
            this.showAlert('アカウントを削除しました', 'success');
            this.logout();
        } else {
            this.showAlert('アカウント削除がキャンセルされました', 'info');
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
