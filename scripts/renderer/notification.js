// Notification utility
export function showNotification(message, duration = 2000) {
    let notif = document.getElementById('custom-notification');
    if (!notif) {
        notif = document.createElement('div');
        notif.id = 'custom-notification';
        notif.style.position = 'fixed';
        notif.style.top = '80px';
        notif.style.left = '50%';
        notif.style.transform = 'translateX(-50%)';
        notif.style.background = '#222';
        notif.style.color = '#fff';
        notif.style.padding = '10px 24px';
        notif.style.borderRadius = '6px';
        notif.style.zIndex = '9999';
        notif.style.boxShadow = '0 2px 8px rgba(0,0,0,0.5)';
        document.body.appendChild(notif);
    }
    notif.textContent = message;
    notif.style.display = 'block';
    setTimeout(() => {
        notif.style.display = 'none';
    }, duration);
}
