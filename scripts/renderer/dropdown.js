// Dropdown menu logic
export function initDropdown(menuBtn, dropdownMenu, webviewField) {
    document.addEventListener('click', (e) => {
        if (menuBtn.contains(e.target)) {
            dropdownMenu.classList.toggle('show');
        } else if (!dropdownMenu.contains(e.target)) {
            dropdownMenu.classList.remove('show');
        }
    });
    if (webviewField) {
        webviewField.addEventListener('focus', () => {
            dropdownMenu.classList.remove('show');
        });
        webviewField.addEventListener('mousedown', () => {
            dropdownMenu.classList.remove('show');
        });
    }
}
