// Notification utility
export function showNotification(message, duration = 2000) {
    // Create or get overlay container that sits above everything
    let overlay = document.getElementById('notification-overlay');
    if (!overlay) {
        overlay = document.createElement('div');
        overlay.id = 'notification-overlay';
        overlay.style.position = 'fixed';
        overlay.style.top = '0';
        overlay.style.left = '0';
        overlay.style.width = '100vw';
        overlay.style.height = '100vh';
        overlay.style.pointerEvents = 'none';
        overlay.style.zIndex = '2147483647'; // Maximum z-index value
        overlay.style.display = 'flex';
        overlay.style.justifyContent = 'center';
        overlay.style.alignItems = 'flex-start';
        overlay.style.paddingTop = '80px';
        document.body.appendChild(overlay);
    }

    // Create or get notification element
    let notif = document.getElementById('notification');
    if (!notif) {
        notif = document.createElement('div');
        notif.id = 'notification';
        notif.style.background = '#222';
        notif.style.color = '#fff';
        notif.style.padding = '10px 24px';
        notif.style.borderRadius = '6px';
        notif.style.boxShadow = '0 2px 8px rgba(0,0,0,0.5)';
        notif.style.pointerEvents = 'none'; // Allow clicks to pass through
        notif.style.fontSize = '14px';
        notif.style.fontFamily = 'system-ui, -apple-system, sans-serif';
        notif.style.maxWidth = '400px';
        notif.style.textAlign = 'center';
        notif.style.opacity = '0';
        notif.style.transition = 'opacity 0.3s ease-in-out';
        overlay.appendChild(notif);
    }

    notif.textContent = message;
    notif.style.opacity = '1';
    
    // Clear any existing timeout
    if (notif._hideTimeout) {
        clearTimeout(notif._hideTimeout);
    }
    
    // Set new timeout to hide notification
    notif._hideTimeout = setTimeout(() => {
        notif.style.opacity = '0';
        // Clean up after animation
        setTimeout(() => {
            if (notif.style.opacity === '0') {
                notif.textContent = '';
            }
        }, 300);
    }, duration);
}
