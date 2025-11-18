export function renderMobileHtml(content: string) {
    return String.raw`<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
    <title>Twitch Select</title>
    <link rel="icon" type="image/x-icon" href="/multitwitch.ico?v=2">
    <link rel="icon" type="image/png" href="/multitwitch.png?v=2">
    <link rel="apple-touch-icon" href="/apple-touch-icon.png">
    <link rel="manifest" href="/manifest.json">
    <meta name="apple-mobile-web-app-capable" content="yes">
    <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
    <meta name="apple-mobile-web-app-title" content="Twitch Select">
    <style>
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { 
            background-color: #0e0e10; 
            color: #e0e0e0; 
            font-family: 'Arial', sans-serif; 
            overflow-x: hidden;
        }
        body.player-open {
            overflow: hidden;
        }
        
        /* Top Bar */
        .top-bar { 
            background: #18181b; 
            width: 100%; 
            padding: 12px 16px; 
            position: fixed; 
            top: 0; 
            left: 0; 
            z-index: 100; 
            box-shadow: 0 2px 8px rgba(0,0,0,0.3);
        }
        .top-bar-inner { 
            display: flex; 
            align-items: center; 
            justify-content: space-between; 
        }
        .twitch-logo { display: inline-flex; align-items: center; }
        .twitch-logo-img { height: 32px; width: auto; display: block; }
        h1 { 
            font-size: 18px; 
            font-weight: 700; 
            color: #ffffff; 
            text-align: center;
            flex: 1;
        }
        .profile-avatar { 
            width: 32px; 
            height: 32px; 
            border-radius: 50%; 
            overflow: hidden; 
            border: 1px solid #303036; 
        }
        .profile-avatar img { 
            width: 100%; 
            height: 100%; 
            object-fit: cover; 
            display: block; 
        }

        /* Main Container */
        .main-container { 
            margin-top: 56px;
            padding: 0;
            min-height: calc(100vh - 56px - 68px); /* viewport - header - footer */
        }

        /* Stream List */
        .stream-list { 
            padding: 8px 8px 76px 8px; /* bottom padding for sticky footer */
        }
        .stream-card { 
            background: #1b1b1f; 
            border-radius: 10px; 
            margin-bottom: 8px; 
            border: 2px solid transparent;
            transition: border-color 0.2s ease;
            display: flex;
            align-items: center;
            gap: 12px;
            padding: 10px;
        }
        .stream-card.selected { 
            border-color: #a970ff; 
        }
        .stream-thumbnail-wrapper {
            position: relative;
            width: 120px;
            height: 68px;
            flex-shrink: 0;
            background: #000;
            border-radius: 6px;
            overflow: hidden;
        }
        .stream-thumbnail { 
            width: 100%; 
            height: 100%;
            object-fit: cover;
        }
        .viewer-badge {
            position: absolute;
            bottom: 4px;
            right: 4px;
            background: rgba(0,0,0,0.75);
            color: #fff;
            padding: 2px 6px;
            border-radius: 3px;
            font-size: 10px;
            font-weight: 600;
        }
        .stream-info { 
            flex: 1;
            min-width: 0;
            display: flex;
            flex-direction: column;
            justify-content: center;
        }
        .channel-name { 
            font-size: 15px; 
            font-weight: 700; 
            color: #ffffff;
            margin-bottom: 4px;
        }
        .stream-title { 
            font-size: 13px; 
            color: #cfcfd4; 
            margin-bottom: 4px;
            line-height: 1.3;
            overflow: hidden;
            text-overflow: ellipsis;
            display: -webkit-box;
            -webkit-line-clamp: 2;
            -webkit-box-orient: vertical;
        }
        .stream-meta {
            display: flex;
            gap: 8px;
            align-items: center;
            flex-wrap: wrap;
        }
        .stream-game { 
            font-size: 11px; 
            color: #a970ff; 
            font-weight: 600;
        }
        .stream-uptime {
            font-size: 11px;
            color: #8d8d96;
        }

        /* Footer */
        .footer { 
            position: fixed; 
            bottom: 0; 
            left: 0; 
            right: 0; 
            background: #18181b; 
            padding: 12px 16px;
            box-shadow: 0 -2px 8px rgba(0,0,0,0.3);
            z-index: 100;
        }
        .open-btn { 
            background: #a970ff; 
            color: #fff; 
            padding: 14px 24px; 
            border: none; 
            border-radius: 8px; 
            font-size: 16px; 
            font-weight: 700; 
            cursor: pointer; 
            width: 100%;
            transition: background 0.2s ease;
        }
        .open-btn:disabled { 
            background: #555; 
            cursor: not-allowed; 
        }
        .open-btn:not(:disabled):active { 
            background: #8a50df; 
        }

        /* Player Overlay */
        .player-overlay {
            position: fixed;
            inset: 0;
            background: #000;
            z-index: 300;
            display: none;
            overflow: hidden;
        }
        .player-overlay.open {
            display: flex;
            flex-direction: column;
        }
        .player-header {
            background: #18181b;
            padding: 12px 16px;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
        .player-info {
            display: flex;
            flex-direction: column;
            gap: 2px;
        }
        .player-channel-name {
            color: #fff;
            font-size: 16px;
            font-weight: 600;
        }
        .player-uptime {
            color: #8d8d96;
            font-size: 12px;
        }
        .close-player-btn {
            background: none;
            border: none;
            color: #fff;
            font-size: 24px;
            cursor: pointer;
            padding: 4px 8px;
        }
        .player-iframe {
            flex: 1;
            border: none;
            width: 100%;
            height: 100%;
        }

        /* Empty State */
        .no-results { 
            text-align: center; 
            color: #8d8d96; 
            padding: 40px 20px; 
            font-style: italic; 
        }

        /* Loading State */
        .loading { 
            text-align: center; 
            color: #8d8d96; 
            padding: 40px 20px; 
        }

        /* Logged-out screen */
        .loggedout-screen { 
            position: fixed; 
            inset: 0; 
            display: none; 
            align-items: center; 
            justify-content: center; 
            background: #0e0e10; 
            z-index: 200; 
            padding: 20px;
        }
        .loggedout-screen.open { display: flex; }
        .loggedout-card { 
            background: #1b1b1f; 
            border: 1px solid #303036; 
            border-radius: 12px; 
            padding: 24px; 
            max-width: 400px;
            width: 100%;
            text-align: center; 
        }
        .loggedout-title { 
            font-size: 18px; 
            font-weight: 700; 
            margin-bottom: 12px; 
        }
        .loggedout-text { 
            font-size: 13px; 
            color: #cfcfd4; 
            margin-bottom: 16px; 
            line-height: 1.5;
        }
        .login-btn { 
            background: #a970ff; 
            color: #fff; 
            padding: 12px 24px; 
            border: none; 
            border-radius: 8px; 
            font-size: 14px; 
            font-weight: 600; 
            cursor: pointer; 
            width: 100%;
        }
    </style>
</head>
<body>
    <div class="loggedout-screen" id="loggedOutScreen">
        <div class="loggedout-card">
            <div class="loggedout-title">Sign in to continue</div>
            <div class="loggedout-text">Sign in with your Twitch account to see your followed channels</div>
            <button class="login-btn" id="loginBtn">Login with Twitch</button>
        </div>
    </div>

    <div class="top-bar">
        <div class="top-bar-inner">
            <a href="https://twitch.tv" target="_blank" rel="noopener" class="twitch-logo">
                <img src="/twitch.png?v=2" alt="Twitch" class="twitch-logo-img" />
            </a>
            <h1>Twitch Select</h1>
            <div class="profile-avatar">
                <img id="profileImg" src="" alt="Profile" />
            </div>
        </div>
    </div>

    <div class="main-container">
        <div class="stream-list" id="streamList">
            <div class="loading">Loading streams...</div>
        </div>
    </div>

    <div class="footer">
        <button class="open-btn" id="openBtn" disabled>Select a stream to watch</button>
    </div>

    <div class="player-overlay" id="playerOverlay">
        <div class="player-header">
            <div class="player-info">
                <div class="player-channel-name" id="playerChannelName"></div>
                <div class="player-uptime" id="playerUptime"></div>
            </div>
            <button class="close-player-btn" id="closePlayerBtn">×</button>
        </div>
        <iframe id="playerIframe" class="player-iframe" allowfullscreen></iframe>
    </div>

    <script>
        const TWITCH_CLIENT_ID = "8nsznpvw3o37hr4sbfh5gn6wxdymre";
        const PROD_ORIGIN = 'https://twitchselect.com';
        const APP_ORIGIN = (location.hostname === 'twitchselect.com') ? PROD_ORIGIN : location.origin;
        const REDIRECT_URI = APP_ORIGIN + "/";
        
        let accessToken = localStorage.getItem('twitch_access_token') || null;
        let userData = null;
        let userId = null;
        let followedChannels = [];
        let liveStreams = [];
        const selectedChannels = new Set();

        function $(id) { return document.getElementById(id); }

        function startAuth() {
            const authUrl = "https://id.twitch.tv/oauth2/authorize?client_id=" + TWITCH_CLIENT_ID + 
                "&redirect_uri=" + encodeURIComponent(REDIRECT_URI) + 
                "&response_type=token&scope=user:read:follows";
            location.href = authUrl;
        }

        function parseHashToken() {
            if (location.hash.includes('access_token')) {
                const params = new URLSearchParams(location.hash.substring(1));
                accessToken = params.get('access_token');
                if (accessToken) {
                    localStorage.setItem('twitch_access_token', accessToken);
                    history.replaceState({}, document.title, location.pathname + location.search);
                }
            }
        }

        async function apiHelix(path) {
            const resp = await fetch("https://api.twitch.tv/helix" + path, {
                headers: { 
                    'Client-Id': TWITCH_CLIENT_ID, 
                    'Authorization': 'Bearer ' + accessToken 
                }
            });
            if (resp.status === 401) { 
                throw new Error('Unauthorized'); 
            }
            return resp.json();
        }

        async function fetchUser() {
            if (!accessToken) return;
            try {
                const data = await apiHelix('/users');
                if (data.data && data.data.length) {
                    userData = data.data[0];
                    userId = userData.id;
                    $('profileImg').src = userData.profile_image_url;
                    await loadFollowedChannels();
                    await refreshLiveStreams();
                } else {
                    throw new Error('User not found');
                }
            } catch (e) {
                console.warn('Auth failed, clearing token', e);
                logout();
            }
        }

        function logout() {
            localStorage.removeItem('twitch_access_token');
            accessToken = null;
            userData = null;
            userId = null;
            showLoggedOutScreen();
        }

        function showLoggedOutScreen() { 
            $('loggedOutScreen').classList.add('open'); 
        }

        function hideLoggedOutScreen() { 
            $('loggedOutScreen').classList.remove('open'); 
        }

        async function loadFollowedChannels() {
            if (!userId) return;
            followedChannels = [];
            let cursor = null;
            
            for (let i = 0; i < 10; i++) {
                let url = '/channels/followed?user_id=' + userId + '&first=100';
                if (cursor) url += '&after=' + cursor;
                const data = await apiHelix(url);
                if (data.data) followedChannels.push(...data.data);
                cursor = data.pagination && data.pagination.cursor;
                if (!cursor) break;
            }
            
            const seen = new Set();
            followedChannels = followedChannels.filter(fc => {
                if (seen.has(fc.broadcaster_id)) return false;
                seen.add(fc.broadcaster_id);
                return true;
            });
        }

        async function refreshLiveStreams() {
            if (!followedChannels.length) return;
            const ids = followedChannels.map(c => c.broadcaster_id);
            liveStreams = [];
            
            for (let i = 0; i < ids.length; i += 100) {
                const batch = ids.slice(i, i + 100);
                const query = batch.map(id => 'user_id=' + encodeURIComponent(id)).join('&');
                const data = await apiHelix('/streams?' + query);
                if (data.data) liveStreams.push(...data.data);
            }
            
            const seenStream = new Set();
            liveStreams = liveStreams.filter(s => {
                if (seenStream.has(s.user_id)) return false;
                seenStream.add(s.user_id);
                return true;
            });
            
            // Sort by viewer count descending
            liveStreams.sort((a, b) => b.viewer_count - a.viewer_count);
            
            renderStreams();
        }

        function calculateUptime(startedAt) {
            const start = new Date(startedAt);
            const diff = Date.now() - start.getTime();
            const h = Math.floor(diff / 3600000);
            const m = Math.floor((diff % 3600000) / 60000);
            return h + 'h ' + m + 'm';
        }

        function formatViewers(v) {
            if (v >= 1000) return (v / 1000).toFixed(1).replace(/\.0$/, '') + 'K';
            return String(v);
        }

        function renderStreams() {
            const list = $('streamList');
            
            if (!liveStreams.length) {
                list.innerHTML = '<div class="no-results">No live streams from followed channels</div>';
                updateOpenButton();
                return;
            }
            
            list.innerHTML = '';
            liveStreams.forEach(stream => {
                const card = document.createElement('div');
                card.className = 'stream-card';
                card.dataset.channel = stream.user_login;
                
                if (selectedChannels.has(stream.user_login)) {
                    card.classList.add('selected');
                }
                
                card.addEventListener('click', () => toggleSelection(stream.user_login, card));
                
                const thumbnailUrl = stream.thumbnail_url.replace('{width}', '320').replace('{height}', '180');
                
                card.innerHTML = ${"`"}
                    <div class="stream-thumbnail-wrapper">
                        <img src="${'${thumbnailUrl}'}" alt="${'${stream.user_login}'}" class="stream-thumbnail" />
                        <div class="viewer-badge">${'${formatViewers(stream.viewer_count)}'}</div>
                    </div>
                    <div class="stream-info">
                        <div class="channel-name">${'${stream.user_login}'}</div>
                        <div class="stream-title">${'${stream.title}'}</div>
                        <div class="stream-meta">
                            <div class="stream-game">${'${stream.game_name || "No category"}'}</div>
                            <div class="stream-uptime">${'${calculateUptime(stream.started_at)}'}</div>
                        </div>
                    </div>
                ${"`"};
                
                list.appendChild(card);
            });
            
            updateOpenButton();
        }

        function toggleSelection(login, card) {
            // Mobile: single selection only (radio button behavior)
            if (selectedChannels.has(login)) {
                // Clicking selected stream deselects it
                selectedChannels.delete(login);
                card.classList.remove('selected');
            } else {
                // Clear all previous selections
                selectedChannels.clear();
                document.querySelectorAll('.stream-card.selected').forEach(c => {
                    c.classList.remove('selected');
                });
                // Select the new stream
                selectedChannels.add(login);
                card.classList.add('selected');
            }
            updateOpenButton();
        }

        function updateOpenButton() {
            const btn = $('openBtn');
            btn.disabled = selectedChannels.size === 0;
            
            if (selectedChannels.size === 0) {
                btn.textContent = 'Select a stream to watch';
            } else {
                btn.textContent = 'Watch Stream';
            }
        }

        $('openBtn').addEventListener('click', () => {
            if (!selectedChannels.size) return;
            const channel = Array.from(selectedChannels)[0];
            
            // Navigate to Twitch directly to preserve login/Turbo status
            // Using location.href keeps the session
            location.href = 'https://www.twitch.tv/' + encodeURIComponent(channel);
        });

        $('closePlayerBtn').addEventListener('click', () => {
            $('playerOverlay').classList.remove('open');
            $('playerIframe').src = '';
            document.body.classList.remove('player-open');
        });

        $('loginBtn').addEventListener('click', () => {
            hideLoggedOutScreen();
            startAuth();
        });

        // Initialize
        parseHashToken();
        if (!accessToken) {
            showLoggedOutScreen();
        } else {
            fetchUser();
        }
    </script>
</body>
</html>`;
}
