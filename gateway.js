(function () {
    const style = document.createElement('style');
    style.innerHTML = `
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            background: #ffffff;
            font-family: -apple-system, "Segoe UI", monospace, sans-serif;
            height: 100vh;
            overflow: hidden;
        }
        #secure-root {
            width: 100%;
            height: 100%;
            position: relative;
        }
        .layer {
            position: absolute;
            inset: 0;
            margin: auto;
            width: max-content;
            height: max-content;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            transition: all 0.6s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .hidden { opacity: 0; visibility: hidden; transform: scale(0.95); pointer-events: none; }
        .visible { opacity: 1; visibility: visible; transform: scale(1); pointer-events: auto; }
        .spinner {
            width: 40px; height: 40px; border: 3px solid #f3f4f6; border-top-color: #111;
            border-radius: 50%; animation: spin 1s linear infinite; margin-bottom: 20px;
        }
        .boot-text { font-size: 14px; color: #666; letter-spacing: 2px; font-family: monospace; }
        @keyframes spin { 100% { transform: rotate(360deg); } }
        
        .v-box {
            background: #fff; padding: 40px; border-radius: 20px;
            box-shadow: 0 20px 40px rgba(0,0,0,0.04), 0 0 0 1px rgba(0,0,0,0.02);
            text-align: center; width: 340px;
            display: flex; flex-direction: column; align-items: center;
        }
        .v-title { font-size: 24px; font-weight: 900; margin-bottom: 8px; }
        .v-sub { font-size: 13px; color: #888; margin-bottom: 24px; font-family: monospace; }
        
        #turnstile-container { margin-bottom: 20px; min-height: 65px; }
        
        .v-status { font-size: 12px; color: #9ca3af; height: 16px; font-family: monospace; margin-top: 10px; }
        .fade-out { opacity: 0; transition: 0.6s; pointer-events: none; }
    `;
    document.head.appendChild(style);

    const root = document.getElementById('secure-root');
    root.innerHTML = `
        <div class="layer visible" id="bootLayer">
            <div class="spinner"></div>
            <div class="boot-text" id="bootText">INITIALIZING SECURE ENVIRONMENT...</div>
        </div>
        <div class="layer hidden v-box" id="verifyLayer">
            <div class="v-title">Security Gateway</div>
            <div class="v-sub">NULN STUDIO PROTECTED</div>
            <div id="turnstile-container"></div>
            <div class="v-status" id="vStatus">正在加载安全组件...</div>
        </div>
    `;

    const bootLayer = document.getElementById('bootLayer');
    const verifyLayer = document.getElementById('verifyLayer');
    const vStatus = document.getElementById('vStatus');

    const _target = atob('aG9tZS5odG1s');
    const _vercelApi = '/api/verify';
    const _siteKey = '0x4AAAAAAFgv875C5jufHVVN'; 

    setTimeout(() => {
        bootLayer.classList.replace('visible', 'hidden');
        setTimeout(() => {
            verifyLayer.classList.replace('hidden', 'visible');
            loadTurnstile();
        }, 400);
    }, 1200);

    function loadTurnstile() {
        const script = document.createElement('script');
        script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?onload=onloadTurnstileCallback';
        script.async = true;
        script.defer = true;
        document.head.appendChild(script);

        window.onloadTurnstileCallback = function() {
            vStatus.innerText = "请完成下方人机验证";
            window.turnstile.render('#turnstile-container', {
                sitekey: _siteKey,
                theme: 'light',
                callback: function(token) {
                    vStatus.innerText = "正在向云端校验凭证...";
                    verifyTokenWithBackend(token);
                }
            });
        };
    }

    async function verifyTokenWithBackend(token) {
        try {
            const res = await fetch(_vercelApi, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ token: token })
            });
            const data = await res.json();

            if (data.success) {
                vStatus.innerText = "验证通过，正在进入...";
                
                const resources = ['2.webp', 'b.png', 'h.png', 'm.webp', 'y.webp', 'app.png'];
                resources.forEach(src => {
                    const img = new Image();
                    img.src = src;
                });

                setTimeout(() => {
                    document.body.classList.add('fade-out');
                    setTimeout(() => {
                        window.location.replace(_target); 
                    }, 400);
                }, 600);
            } else {
                vStatus.innerText = "校验失败，请刷新重试";
                window.turnstile.reset();
            }
        } catch (e) {
            vStatus.innerText = "网络异常，校验失败";
            window.turnstile.reset();
        }
    }
})();