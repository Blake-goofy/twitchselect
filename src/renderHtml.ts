// Renders the MultiTwitch offline demo HTML. The incoming `content` string can be
// used to inject server-fetched JSON (e.g., autoselect rows) for debugging or hydration.
// For production you'd likely swap to a proper bundler and static asset hosting.
export function renderHtml(content: string) {
    // Use String.raw to avoid accidental interpretation of inner backticks or ${} in embedded JS.
    return String.raw`<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>MultiTwitch Live Selector</title>
    <link rel="icon" type="image/x-icon" href="/multitwitch.ico?v=2">
    <link rel="icon" type="image/png" href="/multitwitch.png?v=2">
    <style>
        * { box-sizing: border-box; }
        body { background-color: #0e0e10; color: #e0e0e0; font-family: 'Arial', sans-serif; margin:0; padding:0; overflow:hidden; }
        h1 { font-size:28px; margin:0; font-weight:700; letter-spacing:.5px; color:#ffffff; font-family:'Segoe UI', Arial, sans-serif; }
        .top-bar { background:#18181b; width:100%; padding:10px 0; margin:0; position:fixed; top:0; left:0; z-index:100; height:60px; }
    .top-bar-inner { display:flex; align-items:center; justify-content:space-between; padding:0 22px; height:100%; }
    .nav-left, .nav-right { display:flex; align-items:center; gap:18px; }
    .twitch-logo-img { height:40px; width:auto; display:block; }
    .profile-wrapper { position:relative; display:flex; align-items:center; gap:10px; }
    .profile-avatar { width:40px; height:40px; border-radius:50%; overflow:hidden; box-shadow:0 0 10px rgba(0,0,0,.3); cursor:default; border:1px solid #303036; }
    .profile-avatar img { width:100%; height:100%; object-fit:cover; display:block; }
    .logout-btn { background:#2d2d34; color:#e8ddff; border:1px solid #3d3d46; padding:6px 14px; border-radius:20px; font-size:12px; cursor:pointer; transition:background .25s,border-color .25s,color .25s, transform .18s ease; }
    .logout-btn:hover { background:#a970ff; border-color:#a970ff; color:#fff; transform:translateY(-2px); }
    .username-tooltip { position:absolute; bottom:-34px; left:0; background:#201f24; color:#e9e6f2; padding:4px 8px; font-size:11px; border-radius:6px; white-space:nowrap; box-shadow:0 4px 12px -2px rgba(0,0,0,.55), 0 0 0 1px rgba(255,255,255,0.04); opacity:0; pointer-events:none; transform:translateY(-4px); transition:opacity .18s ease, transform .18s ease; }
    .profile-wrapper:hover .username-tooltip { opacity:1; transform:translateY(0); }
        .nav-center { flex:1; text-align:center; }
        .main-container { display:flex; height:100vh; padding-top:60px; }
        .filter-pane { width:280px; background:#1b1b1f; border-right:1px solid #303036; padding:20px; overflow-y:auto; display:flex; flex-direction:column; }
        .filter-section { margin-bottom:20px; }
        .filter-section label { display:block; margin-bottom:5px; font-weight:600; font-size:13px; color:#cfcfd4; }
        .filter-input, .filter-select { width:100%; padding:8px 12px; background:#24242a; border:1px solid #303036; border-radius:6px; color:#e0e0e0; font-size:14px; }
        .filter-input:focus, .filter-select:focus { outline:none; border-color:#a970ff; }
    #generate { background:#a970ff; color:#fff; padding:12px 24px; border:none; border-radius:30px; font-size:14px; font-weight:600; cursor:pointer; margin-bottom:30px; transition:background .25s, transform .18s ease, box-shadow .25s; box-shadow:0 6px 18px -6px rgba(169,112,255,0.6); width:100%; }
        #generate:hover { background:#b685ff; transform:translateY(-2px) scale(1.02); box-shadow:0 10px 26px -8px rgba(169,112,255,0.75); }
        #generate:disabled { background:#555; cursor:not-allowed; transform:none; box-shadow:none; }
        .last-updated { margin-top:auto; padding-top:20px; font-size:11px; color:#7d7d86; text-align:center; border-top:1px solid #303036; }
    .results-area { flex:1; background:#0e0e10; padding:20px; overflow-y:auto; display:flex; flex-direction:column; }
        .results-header { display:flex; gap:15px; margin-bottom:20px; align-items:center; }
        .sort-option { background:#24242a; border:1px solid #303036; color:#cfcfd4; padding:8px 16px; border-radius:20px; cursor:pointer; font-size:13px; transition:all .25s; user-select:none; }
        .sort-option:hover { background:#2a2a30; border-color:#a970ff; }
    .sort-option.active-asc, .sort-option.active-desc { background:#24242a; color:#cfcfd4; border-color:#a970ff; }
    .sort-option.active-asc:hover, .sort-option.active-desc:hover { background:#2a2a30; border-color:#a970ff; box-shadow:0 6px 14px -6px rgba(0,0,0,.6); }
        .sort-option.active-asc::after { content:" ↑"; }
        .sort-option.active-desc::after { content:" ↓"; }
        .channel-list { flex:1; }
        .channel-container { display:flex; align-items:center; gap:14px; margin:8px 0; padding:12px; background:#24242a; border-radius:12px; cursor:pointer; transition:background .25s, transform .18s ease, box-shadow .25s; border:1px solid #303036; }
        .channel-container:hover { background:#2a2a30; box-shadow:0 6px 14px -6px rgba(0,0,0,.6); }
    .channel-container.selected { background:#a970ff; color:#fff; border-color:#b98bff; }
    .channel-container.selected .channel-name { color:#ffffff; }
    .channel-container.selected .stream-title { color:#fbf7ff; }
    .channel-container.selected .stream-game { color:#ffffff; }
    .channel-container.selected .stream-uptime { color:#f2eaff; }
    .channel-container.selected .viewer-count { color:#ffffff; background:rgba(255,255,255,0.18); }
        .stream-thumbnail { width:160px; height:90px; border-radius:8px; object-fit:cover; box-shadow:0 4px 10px rgba(0,0,0,.35); }
        .channel-info { display:flex; flex-direction:column; justify-content:center; flex:1; }
        .channel-name { font-size:16px; font-weight:600; margin-bottom:4px; }
        .stream-title { font-size:13px; color:#cfcfd4; margin:2px 0; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; max-width:500px; }
        .stream-game { font-size:12px; color:#a970ff; margin:2px 0; font-weight:500; }
        .stream-uptime { font-size:11px; color:#8d8d96; margin:2px 0; }
        .viewer-count { font-size:14px; color:#ff6b6b; font-weight:600; margin-left:auto; padding:4px 8px; background:rgba(255,107,107,0.1); border-radius:12px; }
    .follower-pane { width:250px; background:#1b1b1f; border-left:1px solid #303036; transition:width .3s ease; overflow:hidden; }
        .follower-pane.collapsed { width:40px; }
        .follower-header { padding:20px 20px 10px 20px; border-bottom:1px solid #303036; display:flex; justify-content:space-between; align-items:center; }
        .follower-header h3 { margin:0; font-size:14px; font-weight:600; white-space:nowrap; }
    .follower-filter-wrap { padding:10px 20px 6px 20px; border-bottom:1px solid #303036; }
    #followerFilter { width:100%; padding:6px 10px; background:#24242a; border:1px solid #303036; border-radius:6px; color:#e0e0e0; font-size:12px; }
    #followerFilter:focus { outline:none; border-color:#a970ff; }
    .follower-column-headers { display:flex; align-items:center; padding:8px 20px 5px 20px; border-bottom:1px solid #303036; font-size:11px; font-weight:600; color:#8d8d96; letter-spacing:.5px; }
        .header-streamer { flex:1; margin-left:18px; }
        .follower-list { padding:10px; overflow-y:auto; height:calc(100vh - 180px); }
        .follower-item { display:flex; align-items:center; padding:8px 10px; margin:2px 0; border-radius:6px; transition:background .25s; white-space:nowrap; }
        .follower-item:hover { background:#24242a; }
        .auto-select-toggle { margin-left:auto; margin-right:8px; position:relative; width:32px; height:18px; flex-shrink:0; }
        .toggle-switch { position:absolute; width:100%; height:100%; background:#555; border-radius:12px; cursor:pointer; transition:background .3s; }
        .toggle-switch.active { background:#a970ff; }
        .toggle-slider { position:absolute; top:2px; left:2px; width:14px; height:14px; background:#fff; border-radius:50%; transition:transform .3s; }
        .toggle-switch.active .toggle-slider { transform:translateX(14px); }
        .live-indicator { width:8px; height:8px; border-radius:50%; background:#ff4444; margin-right:10px; flex-shrink:0; }
        .live-indicator.offline { background:#555; }
        .follower-name { font-size:13px; overflow:hidden; text-overflow:ellipsis; color:inherit; text-decoration:none; cursor:pointer; display:inline-block; }
        .follower-pane.collapsed .follower-header h3, .follower-pane.collapsed .follower-name, .follower-pane.collapsed .follower-column-headers { display:none; }
        .follower-pane.collapsed .follower-item { justify-content:center; }
    .follower-pane.collapsed .auto-select-toggle { display:none; }
    .follower-pane.collapsed .follower-list { overflow:hidden; }
    .follower-pane.collapsed .follower-list::-webkit-scrollbar { width:0 !important; height:0 !important; }
        .collapse-btn { background:none; border:none; color:#cfcfd4; cursor:pointer; font-size:18px; line-height:1; padding:4px 6px; border-radius:6px; transition:background .25s,color .25s, transform .25s; }
        .collapse-btn:hover { color:#a970ff; background:#24242a; }
        .follower-pane.collapsed .collapse-btn { transform:rotate(180deg); }
        .no-results { text-align:center; color:#8d8d96; padding:40px 20px; font-style:italic; }

        /* Custom scrollbars (WebKit/Blink) */
        .filter-pane::-webkit-scrollbar, .results-area::-webkit-scrollbar, .follower-list::-webkit-scrollbar { width:10px; }
        .filter-pane::-webkit-scrollbar-track, .results-area::-webkit-scrollbar-track, .follower-list::-webkit-scrollbar-track { background:#252525; border-radius:10px; }
        .filter-pane::-webkit-scrollbar-thumb, .results-area::-webkit-scrollbar-thumb, .follower-list::-webkit-scrollbar-thumb { background:#D9D9D9; border-radius:10px; transition:background .3s; }
        .filter-pane::-webkit-scrollbar-thumb:hover, .results-area::-webkit-scrollbar-thumb:hover, .follower-list::-webkit-scrollbar-thumb:hover { background:#BFBFBF; }
        /* Generate row with star presets */
    .generate-row { display:flex; align-items:center; gap:10px; margin-bottom:12px; }
    .generate-row #generate { height:40px; display:flex; align-items:center; justify-content:center; padding:0 16px; border-radius:10px; margin-bottom:0; width:240px; white-space:nowrap; }
        #presetStarBtn { width:40px; height:40px; border-radius:10px; border:1px solid #303036; background:#24242a; display:flex; align-items:center; justify-content:center; cursor:pointer; transition:transform .18s ease, background .25s, border-color .25s; }
        #presetStarBtn:hover { background:#2a2a30; border-color:#a970ff; transform:translateY(-1px); }
        .star-icon { width:22px; height:22px; display:block; }
        .star-white { fill:#ffffff; filter:drop-shadow(0 2px 4px rgba(0,0,0,.35)); }
        .star-yellow { fill:#FFD54A; filter:drop-shadow(0 2px 4px rgba(0,0,0,.35)); }
        .preset-dropdown { position:relative; }
    .preset-panel { position:absolute; top:44px; left:0; width:260px; background:#1b1b1f; border:1px solid #303036; border-radius:10px; box-shadow:0 10px 30px rgba(0,0,0,.5); z-index:200; display:none; }
        .preset-panel.open { display:block; }
        .preset-list { max-height:260px; overflow:auto; padding:6px; }
        .preset-item { display:flex; align-items:center; justify-content:space-between; gap:10px; padding:8px 10px; border-radius:8px; cursor:pointer; transition:background .2s; }
        .preset-item:hover { background:#24242a; }
        .preset-name { font-size:13px; color:#e0e0e0; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
        .preset-badges { display:flex; align-items:center; gap:6px; }
        .badge-default { font-size:10px; color:#a970ff; border:1px solid #a970ff; padding:2px 6px; border-radius:10px; white-space:nowrap; }
        .preset-footer { padding:8px; border-top:1px solid #303036; display:flex; gap:8px; }
        #newPresetName { flex:1; padding:6px 10px; background:#24242a; border:1px solid #303036; border-radius:8px; color:#e0e0e0; }
        #addPresetBtn { background:#a970ff; color:#fff; border:none; border-radius:8px; padding:6px 10px; cursor:pointer; }
        .ctx-menu { position:absolute; background:#1f1f24; border:1px solid #303036; border-radius:8px; box-shadow:0 10px 30px rgba(0,0,0,.5); z-index:400; display:none; min-width:180px; }
        .ctx-menu.open { display:block; }
        .ctx-item { padding:8px 12px; color:#ddd; cursor:pointer; font-size:13px; }
        .ctx-item:hover { background:#2a2a30; }
        .ctx-sep { height:1px; background:#303036; margin:4px 0; }
    </style>
</head>
<body>
    <div class="top-bar">
        <div class="top-bar-inner">
            <div class="nav-left">
                <a href="https://twitch.tv" target="_blank" rel="noopener" class="twitch-logo" title="Twitch Home" style="text-decoration:none;">
                    <img src="/twitch.png?v=2" alt="Twitch" class="twitch-logo-img" />
                </a>
            </div>
            <div class="nav-center"><h1>MultiTwitch Live Channel Selector</h1></div>
                        <div class="nav-right">
                            <div id="navDarkToggle" title="Append ?darkmode to MultiTwitch links" style="display:flex; align-items:center; gap:8px; cursor:pointer;">
                                <div class="auto-select-toggle" style="margin:0;">
                                    <div class="toggle-switch" id="darkUrlSwitch"><div class="toggle-slider"></div></div>
                                </div>
                                <span style="font-size:12px; color:#cfcfd4; user-select:none;">Dark URL</span>
                            </div>
                            <div class="profile-wrapper" id="profileWrapper">
                                <div class="profile-avatar"><img id="profileImg" src="" alt="Profile" /></div>
                                <div class="username-tooltip" id="usernameTooltip">Not signed in</div>
                            </div>
                            <button class="logout-btn" id="logoutBtn" style="display:none;">Logout</button>
                        </div>
        </div>
    </div>
    <div class="main-container">
        <div class="filter-pane">
            <div class="generate-row">
                <div class="preset-dropdown" id="presetDropdown">
                    <button id="presetStarBtn" title="Saved filters">
                        <svg class="star-icon" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path id="starPath" class="star-white" d="M12 .587l3.668 7.431 8.2 1.193-5.934 5.786 1.402 8.168L12 18.896l-7.336 3.869 1.402-8.168L.132 9.211l8.2-1.193z"/>
                        </svg>
                    </button>
                    <div class="preset-panel" id="presetPanel">
                        <div class="preset-list" id="presetList"></div>
                        <div class="preset-footer">
                            <input type="text" id="newPresetName" placeholder="New preset name..." />
                            <button id="addPresetBtn" title="Add">+</button>
                        </div>
                    </div>
                </div>
                <button id="generate" disabled>Select channels</button>
            </div>
            <div class="filter-section">
                <label for="streamerFilter">Streamer Name</label>
                <input type="text" id="streamerFilter" class="filter-input" placeholder="Search streamers..." />
            </div>
            <div class="filter-section">
                <label for="titleFilter">Stream Title</label>
                <input type="text" id="titleFilter" class="filter-input" placeholder="Search titles..." />
            </div>
            <div class="filter-section">
                <label for="gameFilter">Game</label>
                <select id="gameFilter" class="filter-select"></select>
            </div>
            <div class="last-updated"><div id="lastRefreshed">Loading...</div></div>
        </div>
        <div class="results-area">
            <div class="results-header">
                <span style="font-size:13px;color:#cfcfd4;margin-right:8px;">Sort by:</span>
                <div class="sort-option" data-sort="viewers">Viewers</div>
                <div class="sort-option" data-sort="alphabetical">Channel Name</div>
                <div class="sort-option" data-sort="uptime">Uptime</div>
            </div>
            <div class="channel-list" id="channelList"></div>
        </div>
        <div class="follower-pane" id="followerPane">
            <div class="follower-header">
                <h3>Followed Channels</h3>
                <button class="collapse-btn" id="collapseBtn" title="Collapse / Expand">‹</button>
            </div>
            <div class="follower-filter-wrap">
                <input id="followerFilter" type="text" placeholder="Filter followers..." />
            </div>
            <div class="follower-column-headers">
                <div class="header-streamer">Streamer</div>
                <div class="header-auto-select">Auto</div>
            </div>
            <div class="follower-list" id="followerList"></div>
        </div>
    </div>
        <script>
            // Inject server data for debugging
            const serverContent = ${JSON.stringify(JSON.stringify(content))};
            console.log('Server content (escaped JSON string):', serverContent);

            // --- Minimal Twitch OAuth client helper (placeholder) ---
            const TWITCH_CLIENT_ID = "8nsznpvw3o37hr4sbfh5gn6wxdymre";
            const REDIRECT_URI = location.origin + "/"; // adjust if needed
            let accessToken = localStorage.getItem('twitch_access_token') || null;
            let userData = null;
            let userId = null;

            // App State
            const selectedChannels = new Set();
            let autoSelectPreferences = new Set(); // streamer_username lowercased
            let autoSelectIdMap = {}; // streamer_username -> row id (if needed later)
            let followedChannels = []; // list of followed channel meta (broadcaster info)
            let liveStreams = []; // current live streams enriched
            let filteredStreams = []; // after filtering/sorting
            let currentSort = { field: null, direction: null }; // direction: 'asc' | 'desc'
            // Background refresh timer removed; refresh only when page shown/focused.
            let userPrefs = { sort_field: null, sort_direction: null, darkmode_url: true, default_filter_preset_id: null };
            let filterPresets = [];
            let activePresetId = null;
            let activePresetGameName = null; // handle non-live game options
            let allowNativeContextMenuOnce = false; // for Inspect
            let lastRefreshAt = 0;

            // Utility
            const qs = sel => document.querySelector(sel);
            function $(id){ return document.getElementById(id); }

            function startAuth() {
                const authUrl = "https://id.twitch.tv/oauth2/authorize?client_id=" + TWITCH_CLIENT_ID + "&redirect_uri=" + encodeURIComponent(REDIRECT_URI) + "&response_type=token&scope=user:read:follows";
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
                    headers: { 'Client-Id': TWITCH_CLIENT_ID, 'Authorization': 'Bearer ' + accessToken }
                });
                if (resp.status === 401) { throw new Error('Unauthorized'); }
                return resp.json();
            }

            async function fetchUser() {
                if (!accessToken) return;
                try {
                    const data = await apiHelix('/users');
                    if (data.data && data.data.length) {
                        userData = data.data[0];
                        userId = userData.id;
                        hydrateUserUI();
                        await loadAutoSelectPreferences();
                        await loadFollowedChannels();
                        await refreshLiveStreams();
                        await loadUserPreferences();
                        await loadFilterPresets();
                        applyUserPrefsToUI();
                        // Apply default preset if configured
                        if (userPrefs.default_filter_preset_id) {
                            applyPresetById(userPrefs.default_filter_preset_id);
                        }
                        updateStarIcon();
                    } else {
                        throw new Error('User not found');
                    }
                } catch (e) {
                    console.warn('Auth failed, clearing token', e);
                    logout(true);
                }
            }

            function hydrateUserUI() {
                const img = $('profileImg');
                const tt = $('usernameTooltip');
                const logoutBtn = $('logoutBtn');
                if (userData) {
                    img.src = userData.profile_image_url;
                    tt.textContent = userData.display_name;
                    logoutBtn.style.display = 'inline-block';
                } else {
                    img.src = '';
                    tt.textContent = 'Not signed in';
                    logoutBtn.style.display = 'none';
                }
            }

            function logout(auto) {
                localStorage.removeItem('twitch_access_token');
                accessToken = null;
                userData = null; userId = null;
                selectedChannels.clear();
                autoSelectPreferences.clear();
                hydrateUserUI();
                // no background timer to clear
                if(!auto) startAuth();
            }
            $('logoutBtn').addEventListener('click', () => logout(false));

            // ---------------- Autoselect API ----------------
            const WORKER_BASE = location.origin; // if different domain, set explicitly

            async function loadAutoSelectPreferences(){
                if(!userId) return;
                const tempSet = new Set();
                const tempMap = {};
                try {
                    console.log('[autoselect] loading preferences for user', userId);
                    const resp = await fetch(location.origin + '/api/autoselect?user_id=' + encodeURIComponent(userId));
                    const data = await resp.json();
                    if(data.preferences){
                        data.preferences.forEach(p => {
                            const uname = (p.streamer_username||'').toLowerCase();
                            tempSet.add(uname);
                            tempMap[uname] = p.id;
                        });
                        autoSelectPreferences = tempSet; // atomic swap
                        autoSelectIdMap = tempMap;
                        console.log('[autoselect] loaded', autoSelectPreferences.size, 'preferences (swapped)');
                        syncFollowerToggleStates();
                    }
                } catch(e){ console.warn('Failed to load autoselect prefs', e); }
            }

            async function addAutoSelect(streamer){
                if(!userId) return;
                try {
                    console.log('[autoselect] add', streamer);
                    const resp = await fetch(location.origin + '/api/autoselect?user_id=' + encodeURIComponent(userId), {
                        method:'POST', headers:{'Content-Type':'application/json'},
                        body: JSON.stringify({ user_id: userId, streamer_username: streamer })
                    });
                    const j = await resp.json();
                    console.log('[autoselect] add response', j);
                    autoSelectPreferences.add(streamer.toLowerCase());
                    console.log('[autoselect] set size (optimistic, no reload)', autoSelectPreferences.size);
                    syncFollowerToggleStates();
                } catch(e){ console.warn('addAutoSelect failed', e); }
            }
            async function removeAutoSelect(streamer){
                if(!userId) return;
                try {
                    console.log('[autoselect] remove', streamer);
                    const resp = await fetch(location.origin + '/api/autoselect?user_id=' + encodeURIComponent(userId) + '&streamer_username=' + encodeURIComponent(streamer), { method:'DELETE' });
                    const j = await resp.json();
                    console.log('[autoselect] remove response', j);
                    autoSelectPreferences.delete(streamer.toLowerCase());
                    console.log('[autoselect] set size (optimistic, no reload)', autoSelectPreferences.size);
                    syncFollowerToggleStates();
                } catch(e){ console.warn('removeAutoSelect failed', e); }
            }
            async function toggleAutoSelect(streamer){
                const lower = streamer.toLowerCase();
                console.log('[autoselect] toggle request', streamer, 'currently has?', autoSelectPreferences.has(lower));
                if(autoSelectPreferences.has(lower)){
                    await removeAutoSelect(lower);
                } else {
                    await addAutoSelect(lower);
                }
                console.log('[autoselect] toggle complete, now has?', autoSelectPreferences.has(lower));
            }

            // ---------------- Followed Channels & Live Streams ----------------
            async function loadFollowedChannels(){
                if(!userId) return;
                followedChannels = [];
                let cursor = null;
                // Twitch API: GET /channels/followed?user_id=<viewer>&first=100&after=cursor
                for(let i=0;i<10;i++){ // safeguard max pages
                    let url = '/channels/followed?user_id=' + userId + '&first=100';
                    if(cursor) url += '&after=' + cursor;
                    const data = await apiHelix(url);
                    if(data.data) followedChannels.push(...data.data);
                    cursor = data.pagination && data.pagination.cursor;
                    if(!cursor) break;
                }
                // Deduplicate by broadcaster_id
                const seen = new Set();
                followedChannels = followedChannels.filter(fc => {
                    if(seen.has(fc.broadcaster_id)) return false;
                    seen.add(fc.broadcaster_id); return true;
                });
                console.log('[followed] total after dedupe:', followedChannels.length);
                renderFollowerList();
            }

            async function refreshLiveStreams(){
                if(!followedChannels.length) return;
                const ids = followedChannels.map(c => c.broadcaster_id);
                liveStreams = [];
                // Helix /streams supports multiple user_id params; chunk to <=100
                for(let i=0;i<ids.length;i+=100){
                    const batch = ids.slice(i,i+100);
                    const query = batch.map(id => 'user_id=' + encodeURIComponent(id)).join('&');
                    const data = await apiHelix('/streams?' + query);
                    if(data.data) liveStreams.push(...data.data);
                }
                // Deduplicate streams by user_id
                const seenStream = new Set();
                liveStreams = liveStreams.filter(s => {
                    if(seenStream.has(s.user_id)) return false;
                    seenStream.add(s.user_id); return true;
                });
                console.log('[streams] live count after dedupe:', liveStreams.length);
                // Enrich with mapping for quick lookups
                populateGameFilter();
                applyAutoSelections();
                applyFilters();
                renderFollowerList();
                lastRefreshAt = Date.now();
                updateLastRefreshed();
            }

            function scheduleAutoRefresh(){ /* disabled */ }

            // ---------------- Rendering & Interaction ----------------
            function calculateUptime(startedAt){
                const start = new Date(startedAt);
                const diff = Date.now() - start.getTime();
                const h = Math.floor(diff/3_600_000);
                const m = Math.floor((diff % 3_600_000)/60_000);
                return h + 'h ' + m + 'm';
            }
            function formatViewers(v){ if(v>=1000) return (v/1000).toFixed(1).replace(/\.0$/,'') + 'K'; return String(v); }

            function buildStreamCard(stream){
                const container = document.createElement('div');
                container.className = 'channel-container';
                container.dataset.channel = stream.user_login;
                if(selectedChannels.has(stream.user_login)) container.classList.add('selected');
                container.addEventListener('click', () => toggleSelection(stream.user_login, container));
                container.addEventListener('dblclick', () => {
                    const dark = userPrefs.darkmode_url ? '?darkmode' : '';
                    window.open('https://www.multitwitch.tv/' + stream.user_login + dark, '_blank');
                });
                container.addEventListener('auxclick', (e)=>{ if(e.button===1){ e.preventDefault(); const dark = userPrefs.darkmode_url ? '?darkmode' : ''; window.open('https://www.multitwitch.tv/' + stream.user_login + dark, '_blank'); }});
                container.addEventListener('contextmenu', (e)=>{
                    if (e.shiftKey || allowNativeContextMenuOnce) { allowNativeContextMenuOnce = false; return; }
                    e.preventDefault(); e.stopPropagation();
                    showChannelContextMenu(stream.user_login, e.clientX, e.clientY);
                });

                const img = document.createElement('img');
                img.className='stream-thumbnail';
                img.src = stream.thumbnail_url.replace('{width}','160').replace('{height}','90') + '?v=' + Date.now();
                img.alt = stream.user_login + ' thumbnail';

                const info = document.createElement('div'); info.className='channel-info';
                const nameEl = document.createElement('div'); nameEl.className='channel-name'; nameEl.textContent = stream.user_login;
                const titleEl = document.createElement('div'); titleEl.className='stream-title'; titleEl.textContent = stream.title;
                const gameEl = document.createElement('div'); gameEl.className='stream-game'; gameEl.textContent = stream.game_name || '';
                const uptimeEl = document.createElement('div'); uptimeEl.className='stream-uptime'; uptimeEl.textContent = 'Live for ' + calculateUptime(stream.started_at);
                const viewersEl = document.createElement('div'); viewersEl.className='viewer-count'; viewersEl.textContent = formatViewers(stream.viewer_count);

                info.appendChild(nameEl); info.appendChild(titleEl); info.appendChild(gameEl); info.appendChild(uptimeEl);
                container.appendChild(img); container.appendChild(info); container.appendChild(viewersEl);
                return container;
            }

            function renderStreams(){
                const list = $('channelList');
                list.innerHTML='';
                if(!filteredStreams.length){
                    list.innerHTML = '<div class="no-results">No live streams match filters.</div>';
                    updateGenerateButton();
                    return;
                }
                filteredStreams.forEach(stream => list.appendChild(buildStreamCard(stream)));
                updateGenerateButton();
            }

            function toggleSelection(login, container){
                if(selectedChannels.has(login)){
                    selectedChannels.delete(login);
                    container.classList.remove('selected');
                } else {
                    selectedChannels.add(login);
                    container.classList.add('selected');
                }
                updateGenerateButton();
            }

            function updateGenerateButton(){
                const btn = $('generate');
                btn.disabled = selectedChannels.size === 0;
                btn.textContent = selectedChannels.size ? 'Open ' + selectedChannels.size + ' Stream' + (selectedChannels.size>1?'s':'') : 'Generate MultiTwitch Link';
            }

            $('generate').addEventListener('click', ()=>{
                if(!selectedChannels.size) return;
                const channels = Array.from(selectedChannels).join('/');
                const dark = userPrefs.darkmode_url ? '?darkmode' : '';
                window.open('https://www.multitwitch.tv/' + channels + dark,'_blank');
            });
            document.addEventListener('keydown', e=>{ if(e.key==='Enter'){ const b=$('generate'); if(!b.disabled) b.click(); }});

            // ---------------- Filters & Sorting ----------------
            function populateGameFilter(){
                const select = $('gameFilter'); if(!select) return;
                const prev = select.value;
                const gamesSet = new Set(liveStreams.map(function(s){ return s.game_name; }).filter(Boolean));
                // If a preset refers to a game that's not currently live, include it anyway
                if (activePresetGameName && activePresetGameName !== '' && !gamesSet.has(activePresetGameName)) {
                    gamesSet.add(activePresetGameName);
                }
                const games = Array.from(gamesSet).sort();
                let html = '<option value="">All Games</option>';
                games.forEach(function(g){
                    html += '<option value="' + g.replace(/"/g,'&quot;') + '">' + g + '</option>';
                });
                select.innerHTML = html;
                if(prev && Array.from(select.options).some(o=>o.value===prev)) select.value = prev;
            }

            function applyFilters(){
                const streamerValue = $('streamerFilter').value.toLowerCase();
                const titleValue = $('titleFilter').value.toLowerCase();
                const gameValue = $('gameFilter').value;
                filteredStreams = liveStreams.filter(s => {
                    const matchStreamer = !streamerValue || s.user_login.toLowerCase().includes(streamerValue);
                    const matchTitle = !titleValue || (s.title||'').toLowerCase().includes(titleValue);
                    const matchGame = !gameValue || s.game_name === gameValue;
                    return matchStreamer && matchTitle && matchGame;
                });
                applySorting();
            }

            function setSort(field){
                if(currentSort.field === field){
                    currentSort.direction = currentSort.direction === 'asc' ? 'desc' : currentSort.direction === 'desc' ? null : 'asc';
                    if(!currentSort.direction) currentSort.field = null;
                } else {
                    currentSort.field = field; currentSort.direction = 'asc';
                }
                document.querySelectorAll('.sort-option').forEach(opt=>{
                    opt.classList.remove('active-asc','active-desc');
                    if(opt.dataset.sort === currentSort.field){
                        opt.classList.add(currentSort.direction === 'asc' ? 'active-asc' : 'active-desc');
                    }
                });
                // Persist sort preference
                saveUserPreferences({ sort_field: currentSort.field, sort_direction: currentSort.direction });
                applySorting();
            }

            function applySorting(){
                if(!currentSort.field){ renderStreams(); return; }
                const dir = currentSort.direction === 'asc' ? 1 : -1;
                filteredStreams.sort((a,b)=>{
                    switch(currentSort.field){
                        case 'viewers': return (a.viewer_count - b.viewer_count) * dir;
                        case 'alphabetical': return a.user_login.localeCompare(b.user_login) * dir;
                        case 'uptime': return (new Date(a.started_at).getTime() - new Date(b.started_at).getTime()) * dir;
                    }
                    return 0;
                });
                renderStreams();
            }

            $('streamerFilter').addEventListener('input', applyFilters);
            $('titleFilter').addEventListener('input', applyFilters);
            $('gameFilter').addEventListener('change', applyFilters);
            document.querySelectorAll('.sort-option').forEach(opt=> opt.addEventListener('click', ()=> setSort(opt.dataset.sort)));

            // ---------------- Follower Pane ----------------
            function renderFollowerList(){
                const list = $('followerList');
                if(!list) return;
                list.innerHTML='';
                if(!followedChannels.length){
                    list.innerHTML = '<div class="no-results" style="padding:10px;">No followed channels</div>';
                    return;
                }
                const filterValue = ($('followerFilter')?.value || '').toLowerCase();
                const liveLoginSet = new Set(liveStreams.map(s=>s.user_login.toLowerCase()));
                const sorted = [...followedChannels]
                    .filter(ch => !filterValue || ch.broadcaster_login.toLowerCase().includes(filterValue))
                    .sort((a,b)=> a.broadcaster_login.localeCompare(b.broadcaster_login));
                sorted.forEach(ch => {
                    const item = document.createElement('div'); item.className='follower-item';
                    const liveDot = document.createElement('div'); liveDot.className='live-indicator ' + (liveLoginSet.has(ch.broadcaster_login.toLowerCase()) ? '' : 'offline');
                    const name = document.createElement('a'); name.href='https://twitch.tv/' + ch.broadcaster_login; name.target='_blank'; name.rel='noopener'; name.className='follower-name'; name.textContent = ch.broadcaster_login;
                    const toggleWrap = document.createElement('div'); toggleWrap.className='auto-select-toggle';
                    const toggle = document.createElement('div'); toggle.className='toggle-switch'; if(autoSelectPreferences.has(ch.broadcaster_login.toLowerCase())) toggle.classList.add('active');
                    const slider = document.createElement('div'); slider.className='toggle-slider';
                    toggle.appendChild(slider); toggleWrap.appendChild(toggle);
                    toggle.addEventListener('click', (e)=>{
                        e.preventDefault(); e.stopPropagation();
                        const isActiveNow = toggle.classList.toggle('active');
                        toggleAutoSelect(ch.broadcaster_login).catch(err => {
                            console.warn('toggleAutoSelect error', err);
                            // revert on error
                            if(isActiveNow) toggle.classList.remove('active'); else toggle.classList.add('active');
                        });
                    });
                    item.appendChild(liveDot); item.appendChild(name); item.appendChild(toggleWrap);
                    list.appendChild(item);
                });
            }

            function syncFollowerToggleStates(){
                const list = $('followerList'); if(!list) return;
                list.querySelectorAll('.follower-item').forEach(item => {
                    const nameEl = item.querySelector('.follower-name');
                    const toggle = item.querySelector('.toggle-switch');
                    if(!nameEl || !toggle) return;
                    const login = nameEl.textContent.toLowerCase();
                    if(autoSelectPreferences.has(login)) toggle.classList.add('active'); else toggle.classList.remove('active');
                });
            }

            // Collapse follower pane
            $('collapseBtn').addEventListener('click', ()=>{
                const pane = $('followerPane');
                pane.classList.toggle('collapsed');
                // Keep arrow direction consistent: rotate via CSS; text stays constant
            });

            // Follower filter input
            document.addEventListener('input', (e)=>{
                if(e.target && e.target.id === 'followerFilter'){
                    renderFollowerList();
                }
            });

            // ---------------- Refresh & Visibility ----------------
            function updateLastRefreshed(){
                const el = $('lastRefreshed'); if(!el) return;
                const d = new Date();
                el.textContent = 'Last refreshed at ' + d.toLocaleTimeString([], {hour:'2-digit', minute:'2-digit', second:'2-digit'});
            }
            function maybeRefresh(){
                const now = Date.now();
                if(now - lastRefreshAt >= 60_000){
                    refreshLiveStreams();
                } else {
                    // too soon; skip
                }
            }
            document.addEventListener('visibilitychange', ()=>{ if(!document.hidden) maybeRefresh(); });
            window.addEventListener('focus', ()=> maybeRefresh());

            // ---------------- User Preferences & Presets ----------------
            async function loadUserPreferences(){
                if(!userId) return;
                try{
                    const resp = await fetch(location.origin + '/api/userprefs?user_id=' + encodeURIComponent(userId));
                    const data = await resp.json();
                    userPrefs.sort_field = data.sort_field || null;
                    userPrefs.sort_direction = data.sort_direction || null;
                    userPrefs.darkmode_url = (typeof data.darkmode_url === 'number') ? !!data.darkmode_url : (data.darkmode_url !== false);
                    userPrefs.default_filter_preset_id = data.default_filter_preset_id || null;
                    console.log('[prefs] loaded', userPrefs);
                } catch(e){ console.warn('failed to load user prefs', e); }
            }

            function applyUserPrefsToUI(){
                // Apply dark URL toggle
                const darkSwitch = $('darkUrlSwitch'); if(darkSwitch){ if(userPrefs.darkmode_url) darkSwitch.classList.add('active'); else darkSwitch.classList.remove('active'); }
                // Apply sort
                if(userPrefs.sort_field && userPrefs.sort_direction){
                    currentSort.field = userPrefs.sort_field;
                    currentSort.direction = userPrefs.sort_direction;
                    document.querySelectorAll('.sort-option').forEach(opt=>{
                        opt.classList.remove('active-asc','active-desc');
                        if(opt.dataset.sort === currentSort.field){
                            opt.classList.add(currentSort.direction === 'asc' ? 'active-asc' : 'active-desc');
                        }
                    });
                    applySorting();
                }
            }

            async function saveUserPreferences(partial){
                if(!userId) return;
                try{
                    const payload = {
                        user_id: userId,
                        sort_field: ('sort_field' in partial) ? partial.sort_field : userPrefs.sort_field,
                        sort_direction: ('sort_direction' in partial) ? partial.sort_direction : userPrefs.sort_direction,
                        darkmode_url: ('darkmode_url' in partial) ? !!partial.darkmode_url : userPrefs.darkmode_url,
                        default_filter_preset_id: ('default_filter_preset_id' in partial) ? partial.default_filter_preset_id : userPrefs.default_filter_preset_id,
                    };
                    const resp = await fetch(location.origin + '/api/userprefs?user_id=' + encodeURIComponent(userId), {
                        method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(payload)
                    });
                    const data = await resp.json();
                    userPrefs.sort_field = data.sort_field || null;
                    userPrefs.sort_direction = data.sort_direction || null;
                    userPrefs.darkmode_url = (typeof data.darkmode_url === 'number') ? !!data.darkmode_url : (data.darkmode_url !== false);
                    userPrefs.default_filter_preset_id = data.default_filter_preset_id || null;
                    console.log('[prefs] saved', userPrefs);
                } catch(e){ console.warn('failed to save prefs', e); }
            }

            // Dark URL toggle behavior
            (function(){
                const wrap = $('navDarkToggle');
                const sw = $('darkUrlSwitch');
                wrap?.addEventListener('click', ()=>{
                    const isActive = sw.classList.toggle('active');
                    userPrefs.darkmode_url = isActive;
                    saveUserPreferences({ darkmode_url: isActive });
                });
            })();

            async function loadFilterPresets(){
                if(!userId) return;
                try{
                    const resp = await fetch(location.origin + '/api/filter-presets?user_id=' + encodeURIComponent(userId));
                    const data = await resp.json();
                    filterPresets = data.presets || [];
                    renderPresetList();
                    updateStarIcon();
                } catch(e){ console.warn('failed to load presets', e); }
            }

            function applyPresetById(id){
                const preset = filterPresets.find(p => String(p.id) === String(id));
                if(!preset) return;
                activePresetId = preset.id;
                // Apply filters
                $('streamerFilter').value = preset.streamer_query || '';
                $('titleFilter').value = preset.title_query || '';
                activePresetGameName = preset.game_name || null;
                // Update game filter options to include non-live game if necessary
                populateGameFilter();
                if (preset.game_name) {
                    $('gameFilter').value = preset.game_name;
                } else {
                    $('gameFilter').value = '';
                }
                applyFilters();
                renderPresetList();
            }

            function renderPresetList(){
                const list = $('presetList'); if(!list) return;
                list.innerHTML = '';
                const defId = userPrefs.default_filter_preset_id;
                if(!filterPresets.length){
                    const empty = document.createElement('div');
                    empty.className='no-results';
                    empty.style.padding = '12px';
                    empty.textContent = 'No saved filters';
                    list.appendChild(empty);
                } else {
                    filterPresets.forEach(p => {
                        const row = document.createElement('div'); row.className='preset-item'; row.dataset.id = String(p.id);
                        const name = document.createElement('div'); name.className='preset-name'; name.textContent = p.name;
                        const badges = document.createElement('div'); badges.className='preset-badges';
                        if(defId && p.id === defId){
                            const b = document.createElement('div'); b.className='badge-default'; b.textContent='default'; badges.appendChild(b);
                        }
                        row.appendChild(name); row.appendChild(badges);
                        row.addEventListener('click', ()=>{ applyPresetById(p.id); });
                        row.addEventListener('contextmenu', (e)=>{
                            if(e.shiftKey){ return; }
                            e.preventDefault(); e.stopPropagation();
                            showPresetContextMenu(p, e.clientX, e.clientY);
                        });
                        list.appendChild(row);
                    });
                }
            }

            function updateStarIcon(){
                const path = $('starPath'); if(!path) return;
                if(userPrefs.default_filter_preset_id){ path.classList.remove('star-white'); path.classList.add('star-yellow'); }
                else { path.classList.remove('star-yellow'); path.classList.add('star-white'); }
            }

            $('presetStarBtn')?.addEventListener('click', (e)=>{
                e.preventDefault(); e.stopPropagation();
                const panel = $('presetPanel'); if(!panel) return;
                panel.classList.toggle('open');
            });

            document.addEventListener('click', (e)=>{
                const panel = $('presetPanel'); if(!panel) return;
                if(panel.classList.contains('open')){
                    // Close when clicking outside
                    const dropdown = $('presetDropdown');
                    if(dropdown && !dropdown.contains(e.target)){ panel.classList.remove('open'); }
                }
                hideAnyContextMenus();
            });

            $('addPresetBtn')?.addEventListener('click', async ()=>{
                if(!userId) return;
                const name = ($('newPresetName').value || '').trim();
                if(!name){ alert('Enter a preset name'); return; }
                const payload = {
                    user_id: userId,
                    name: name,
                    streamer_query: $('streamerFilter').value || null,
                    title_query: $('titleFilter').value || null,
                    game_name: $('gameFilter').value || null,
                };
                try{
                    const resp = await fetch(location.origin + '/api/filter-presets?user_id=' + encodeURIComponent(userId), { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(payload) });
                    const data = await resp.json();
                    activePresetId = data.id;
                    $('newPresetName').value = '';
                    await loadFilterPresets();
                    const panel = $('presetPanel'); if(panel) panel.classList.add('open');
                } catch(e){ console.warn('failed to save preset', e); }
            });

            function showPresetContextMenu(preset, x, y){
                let menu = document.getElementById('presetCtx');
                if(!menu){
                    menu = document.createElement('div'); menu.id='presetCtx'; menu.className='ctx-menu';
                    menu.innerHTML = '<div class="ctx-item" id="ctxSetDefault"></div><div class="ctx-item" id="ctxUnsetDefault" style="display:none;">Unset default</div><div class="ctx-sep"></div><div class="ctx-item" id="ctxDelete">Delete</div><div class="ctx-sep"></div><div class="ctx-item" id="ctxInspect">Inspect (browser menu)</div>';
                    document.body.appendChild(menu);
                }
                // attach context data without TS assertions (inline JS)
                menu['currentPresetId'] = preset.id;
                const setItem = document.getElementById('ctxSetDefault');
                const unsetItem = document.getElementById('ctxUnsetDefault');
                const deleteItem = document.getElementById('ctxDelete');
                const inspectItem = document.getElementById('ctxInspect');
                if(userPrefs.default_filter_preset_id && preset.id === userPrefs.default_filter_preset_id){
                    setItem.style.display = 'none'; unsetItem.style.display = 'block';
                } else { setItem.style.display = 'block'; setItem.textContent = 'Set default'; unsetItem.style.display = 'none'; }
                menu.style.left = x + 'px'; menu.style.top = y + 'px'; menu.classList.add('open');
                setItem.onclick = async ()=>{ await saveUserPreferences({ default_filter_preset_id: Number(preset.id) }); renderPresetList(); updateStarIcon(); hideAnyContextMenus(); };
                unsetItem.onclick = async ()=>{ await saveUserPreferences({ default_filter_preset_id: null }); renderPresetList(); updateStarIcon(); hideAnyContextMenus(); };
                deleteItem.onclick = async ()=>{
                    try{
                        await fetch(location.origin + '/api/filter-presets?user_id=' + encodeURIComponent(userId) + '&id=' + encodeURIComponent(preset.id), { method:'DELETE' });
                        if (userPrefs.default_filter_preset_id && String(userPrefs.default_filter_preset_id) === String(preset.id)) {
                            await saveUserPreferences({ default_filter_preset_id: null });
                        }
                        if (activePresetId && String(activePresetId) === String(preset.id)) activePresetId = null;
                        await loadFilterPresets();
                    } catch(e){ console.warn('failed to delete preset', e); }
                    hideAnyContextMenus();
                };
                // Can't programmatically open DevTools; instruct user to Shift+Right-Click for browser menu
                if (inspectItem) {
                    inspectItem.onclick = ()=>{ hideAnyContextMenus(); allowNativeContextMenuOnce = true; };
                }
            }

            function showChannelContextMenu(login, x, y){
                let menu = document.getElementById('channelCtx');
                if(!menu){
                    menu = document.createElement('div'); menu.id='channelCtx'; menu.className='ctx-menu';
                    menu.innerHTML = '<div class="ctx-item" id="chOpen">Open in new tab</div><div class="ctx-sep"></div><div class="ctx-item" id="chInspect">Inspect (browser menu)</div>';
                    document.body.appendChild(menu);
                }
                menu.style.left = x + 'px'; menu.style.top = y + 'px'; menu.classList.add('open');
                const openItem = document.getElementById('chOpen');
                const inspItem = document.getElementById('chInspect');
                openItem.onclick = ()=>{ const dark = userPrefs.darkmode_url ? '?darkmode' : ''; window.open('https://www.multitwitch.tv/' + login + dark, '_blank'); hideAnyContextMenus(); };
                inspItem.onclick = ()=>{ hideAnyContextMenus(); allowNativeContextMenuOnce = true; };
            }

            function hideAnyContextMenus(){
                document.querySelectorAll('.ctx-menu.open').forEach(el => el.classList.remove('open'));
            }

            // ---------------- Auto-select application ----------------
            function applyAutoSelections(){
                if(!autoSelectPreferences || !autoSelectPreferences.size) return;
                try{
                    liveStreams.forEach(s => {
                        const login = (s.user_login || '').toLowerCase();
                        if(autoSelectPreferences.has(login)){
                            selectedChannels.add(s.user_login);
                        }
                    });
                } catch(e){ console.warn('applyAutoSelections error', e); }
                updateGenerateButton();
            }

            // Initial Flow
            parseHashToken();
            if(!accessToken){
                startAuth();
            } else {
                fetchUser();
            }

            // Expose for console debugging
            window.__multi = { get state(){ return { userData, selectedChannels:[...selectedChannels], autoSelect:[...autoSelectPreferences], liveStreams, followedChannels, filteredStreams }; }, refreshLiveStreams, applyFilters };
        </script>
</body>
</html>`;
}
