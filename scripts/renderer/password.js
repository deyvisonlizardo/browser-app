// Password prompt logic
const SETTINGS_PASSWORD = '1234'; // Change as needed
export async function promptForPassword() {
    return new Promise((resolve) => {
        let overlay = document.getElementById('password-overlay');
        if (!overlay) {
            overlay = document.createElement('div');
            overlay.id = 'password-overlay';
            overlay.style.position = 'fixed';
            overlay.style.top = '0';
            overlay.style.left = '0';
            overlay.style.width = '100vw';
            overlay.style.height = '100vh';
            overlay.style.background = 'rgba(0,0,0,0.5)';
            overlay.style.zIndex = '10000';
            document.body.appendChild(overlay);
        }
        let promptBox = document.createElement('div');
        promptBox.id = 'password-prompt';
        promptBox.className = 'theme-popup';
        promptBox.style.position = 'fixed';
        promptBox.style.top = '50%';
        promptBox.style.left = '50%';
        promptBox.style.transform = 'translate(-50%, -50%)';
        promptBox.style.padding = '32px 28px 24px 28px';
        promptBox.style.borderRadius = '16px';
        promptBox.style.boxShadow = '0 8px 32px rgba(0,0,0,0.7)';
        promptBox.style.zIndex = '10001';
        promptBox.innerHTML = `
            <div style="display:flex;flex-direction:column;align-items:center;gap:12px;">
                <h3 style="margin:0 0 10px 0;">Enter Password</h3>
                <input id="password-input" type="password" style="padding:8px 16px;font-size:16px;border-radius:8px;border:1.5px solid #ccc;outline:none;background:inherit;color:inherit;" autofocus />
                <div style="color:red;font-size:13px;display:none;" id="password-error">Incorrect password</div>
                <div style="display:flex;gap:10px;margin-top:10px;">
                    <button id="password-ok" style="padding:6px 18px;border-radius:8px;border:none;background:#2563eb;color:#fff;font-size:15px;">OK</button>
                    <button id="password-cancel" style="padding:6px 18px;border-radius:8px;border:none;background:#aaa;color:#fff;font-size:15px;">Cancel</button>
                </div>
            </div>
        `;
        if (document.body.getAttribute('data-theme') === 'dark') {
            promptBox.style.background = '#23272e';
            promptBox.style.color = '#e3e3e3';
        } else {
            promptBox.style.background = '#fff';
            promptBox.style.color = '#222';
        }
        document.body.appendChild(promptBox);
        document.getElementById('password-input').focus();
        function cleanup() {
            promptBox.remove();
            overlay.remove();
        }
        document.getElementById('password-ok').onclick = () => {
            const val = document.getElementById('password-input').value;
            if (val === SETTINGS_PASSWORD) {
                cleanup();
                resolve(true);
            } else {
                document.getElementById('password-error').style.display = 'block';
            }
        };
        document.getElementById('password-cancel').onclick = () => {
            cleanup();
            resolve(false);
        };
        document.getElementById('password-input').onkeydown = (e) => {
            if (e.key === 'Enter') document.getElementById('password-ok').click();
            if (e.key === 'Escape') document.getElementById('password-cancel').click();
        };
    });
}
