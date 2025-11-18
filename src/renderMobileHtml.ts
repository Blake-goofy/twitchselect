export function renderMobileHtml(content: string) {
    return String.raw`<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
    <title>Twitch Select</title>
    <link rel="icon" type="image/x-icon" href="/multitwitch.ico?v=2">
    <link rel="icon" type="image/png" href="/multitwitch.png?v=2">
    <style>
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { 
            background-color: #0e0e10; 
            color: #e0e0e0; 
            font-family: 'Arial', sans-serif; 
            overflow-x: hidden;
            padding-bottom: 80px; /* space for footer */
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
            padding: 0 0 80px 0;
        }

        /* Stream List */
        .stream-list { 
            padding: 12px; 
        }
        .stream-card { 
            background: #1b1b1f; 
            border-radius: 12px; 
            margin-bottom: 12px; 
            overflow: hidden;
            border: 2px solid transparent;
            transition: border-color 0.2s ease;
        }
        .stream-card.selected { 
            border-color: #a970ff; 
        }
        .stream-thumbnail-wrapper {
            position: relative;
            width: 100%;
            padding-top: 56.25%; /* 16:9 aspect ratio */
            background: #000;
        }
        .stream-thumbnail { 
            position: absolute;
            top: 0;
            left: 0;
            width: 100%; 
            height: 100%;
            object-fit: cover;
        }
        .live-badge {
            position: absolute;
            top: 8px;
            left: 8px;
            background: #ff4444;
            color: #fff;
            padding: 4px 8px;
            border-radius: 4px;
            font-size: 11px;
            font-weight: 700;
            text-transform: uppercase;
        }
        .viewer-badge {
            position: absolute;
            bottom: 8px;
            right: 8px;
            background: rgba(0,0,0,0.7);
            color: #fff;
            padding: 4px 8px;
            border-radius: 4px;
            font-size: 12px;
            font-weight: 600;
        }
        .stream-info { 
            padding: 12px; 
        }
        .stream-header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            margin-bottom: 8px;
        }
        .channel-name { 
            font-size: 16px; 
            font-weight: 700; 
            color: #ffffff;
            margin-bottom: 4px;
        }
        .stream-uptime {
            font-size: 11px;
            color: #8d8d96;
            white-space: nowrap;
        }
        .stream-title { 
            font-size: 13px; 
            color: #cfcfd4; 
            margin-bottom: 6px;
            line-height: 1.4;
        }
        .stream-game { 
            font-size: 12px; 
            color: #a970ff; 
            font-weight: 600;
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
        <button class="open-btn" id="openBtn" disabled>Select streams to open</button>
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
                
                const thumbnailUrl = stream.thumbnail_url.replace('{width}', '640').replace('{height}', '360');
                
                card.innerHTML = ${"`"}
                    <div class="stream-thumbnail-wrapper">
                        <img src="${'${thumbnailUrl}'}" alt="${'${stream.user_login}'}" class="stream-thumbnail" />
                        <div class="live-badge">LIVE</div>
                        <div class="viewer-badge">${'${formatViewers(stream.viewer_count)}'} viewers</div>
                    </div>
                    <div class="stream-info">
                        <div class="stream-header">
                            <div class="channel-name">${'${stream.user_login}'}</div>
                            <div class="stream-uptime">${'${calculateUptime(stream.started_at)}'}</div>
                        </div>
                        <div class="stream-title">${'${stream.title}'}</div>
                        <div class="stream-game">${'${stream.game_name || "No category"}'}</div>
                    </div>
                ${"`"};
                
                list.appendChild(card);
            });
            
            updateOpenButton();
        }

        function toggleSelection(login, card) {
            if (selectedChannels.has(login)) {
                selectedChannels.delete(login);
                card.classList.remove('selected');
            } else {
                selectedChannels.add(login);
                card.classList.add('selected');
            }
            updateOpenButton();
        }

        function updateOpenButton() {
            const btn = $('openBtn');
            btn.disabled = selectedChannels.size === 0;
            
            if (selectedChannels.size === 0) {
                btn.textContent = 'Select streams to open';
            } else {
                btn.textContent = 'Open ' + selectedChannels.size + ' Stream' + (selectedChannels.size > 1 ? 's' : '');
            }
        }

        $('openBtn').addEventListener('click', () => {
            if (!selectedChannels.size) return;
            const channels = Array.from(selectedChannels).join('/');
            window.open('https://www.multitwitch.tv/' + channels, '_blank');
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
