// New Window Handler Module
// This module handles forcing links that open in new tabs to open in the active tab instead

export function injectNewWindowHandler(webview) {
    if (!webview) return;

    // Inject comprehensive script to handle all new window/tab scenarios
    // This script runs ONLY in the webview context, not the main application
    webview.executeJavaScript(`
        (function() {
            // Prevent multiple injections
            if (window.__newWindowHandlerInjected) return;
            window.__newWindowHandlerInjected = true;
            
            console.log('🔧 New window handler injected for:', window.location.href);
              // 1. Override window.open to prevent new windows/tabs but allow popups
            const originalOpen = window.open;
            window.open = function(url, target, features) {
                console.log('🚫 window.open intercepted:', url, 'target:', target, 'features:', features);
                
                // More comprehensive popup detection
                const isPopup = (
                    // Explicit popup features
                    (features && (
                        features.includes('popup=yes') ||
                        features.includes('popup=1') ||
                        features.includes('popup=true') ||
                        features.includes('dialog=yes') ||
                        features.includes('dialog=1') ||
                        features.includes('modal=yes') ||
                        features.includes('modal=1') ||
                        // Small windows with no chrome are usually popups
                        (features.includes('width=') && features.includes('height=') &&
                         (features.includes('toolbar=no') || features.includes('toolbar=0') ||
                          features.includes('menubar=no') || features.includes('menubar=0') ||
                          features.includes('location=no') || features.includes('location=0') ||
                          features.includes('status=no') || features.includes('status=0'))) ||
                        // Auth/OAuth popup patterns
                        features.includes('scrollbars=yes') && features.includes('resizable=yes')
                    )) ||
                    
                    // Target patterns that suggest popups
                    (target && (
                        target.includes('popup') || 
                        target.includes('dialog') || 
                        target.includes('modal') ||
                        target.includes('auth') ||
                        target.includes('oauth')
                    )) ||
                    
                    // URL patterns that suggest popups
                    (url && (
                        url.includes('/auth/') ||
                        url.includes('/login/') ||
                        url.includes('/oauth/') ||
                        url.includes('/sso/') ||
                        url.includes('/popup/') ||
                        url.includes('/print/') ||
                        url.includes('/download/') ||
                        url.includes('popup=true') ||
                        url.includes('dialog=true') ||
                        url.includes('modal=true')
                    ))
                );
                
                if (isPopup) {
                    console.log('🪟 Allowing popup window:', url, 'target:', target, 'features:', features);
                    return originalOpen.call(this, url, target, features);
                }
                
                // Check for same-domain windows that might be legitimate
                if (url) {
                    try {
                        const currentDomain = new URL(window.location.href).hostname;
                        const targetDomain = new URL(url, window.location.href).hostname;
                        
                        // Same domain + specific dimensions = likely popup
                        if (currentDomain === targetDomain && features && 
                            features.includes('width=') && features.includes('height=') &&
                            (parseInt(features.match(/width=(\d+)/)?.[1]) < 1000 ||
                             parseInt(features.match(/height=(\d+)/)?.[1]) < 800)) {
                            console.log('🪟 Allowing same-domain small window:', url);
                            return originalOpen.call(this, url, target, features);
                        }
                    } catch (e) {
                        // URL parsing failed, continue with normal handling
                    }
                }
                
                // For everything else, redirect in current tab
                if (url) {
                    // Handle relative URLs
                    if (url.startsWith('/') || url.startsWith('./') || url.startsWith('../')) {
                        url = new URL(url, window.location.href).href;
                    }
                    
                    console.log('➡️ Redirecting to current tab:', url);
                    window.location.href = url;
                } else {
                    console.log('⚠️ window.open called without URL, creating mock window');
                }
                
                // Return a mock window object to prevent errors
                return {
                    closed: false,
                    close: function() { this.closed = true; },
                    focus: function() {},
                    blur: function() {},
                    postMessage: function() {}
                };
            };
            
            // 2. Handle clicks on links with target="_blank" or similar
            function handleLinkClick(event) {
                const link = event.target.closest('a');
                if (link && link.href) {
                    const target = link.target || '';
                    const rel = link.rel || '';
                    
                    // Check if link would open in new tab/window
                    if (target === '_blank' || target === '_new' || 
                        target.startsWith('_') && target !== '_self' && target !== '_parent' && target !== '_top' ||
                        rel.includes('noopener') || rel.includes('noreferrer')) {
                        
                        console.log('🔗 New tab link intercepted:', link.href, 'target:', target, 'rel:', rel);
                        event.preventDefault();
                        event.stopPropagation();
                        
                        // Navigate current page instead
                        window.location.href = link.href;
                        return false;
                    }
                }
            }
            
            // Attach click listener with capture to catch all link clicks
            document.addEventListener('click', handleLinkClick, true);
            
            // 3. Handle dynamically created links
            const observer = new MutationObserver(function(mutations) {
                mutations.forEach(function(mutation) {
                    mutation.addedNodes.forEach(function(node) {
                        if (node.nodeType === 1) { // Element node
                            // Check if the added node is a link
                            if (node.tagName === 'A') {
                                processLink(node);
                            }
                            // Check for links within the added node
                            if (node.querySelectorAll) {
                                const links = node.querySelectorAll('a');
                                links.forEach(processLink);
                            }
                        }
                    });
                });
            });
            
            function processLink(link) {
                const target = link.target || '';
                const rel = link.rel || '';
                
                // If link has new-tab behavior, add our handler
                if (target === '_blank' || target === '_new' || 
                    target.startsWith('_') && target !== '_self' && target !== '_parent' && target !== '_top' ||
                    rel.includes('noopener') || rel.includes('noreferrer')) {
                    
                    // Remove existing click handlers that might interfere
                    link.addEventListener('click', function(event) {
                        console.log('🔗 Dynamic link intercepted:', this.href, 'target:', this.target);
                        event.preventDefault();
                        event.stopPropagation();
                        if (this.href) {
                            window.location.href = this.href;
                        }
                        return false;
                    }, true);
                }
            }
            
            // Start observing
            if (document.body) {
                observer.observe(document.body, {
                    childList: true,
                    subtree: true
                });
            } else {
                // If body isn't ready yet, wait for it
                document.addEventListener('DOMContentLoaded', function() {
                    if (document.body) {
                        observer.observe(document.body, {
                            childList: true,
                            subtree: true
                        });
                    }
                });
            }
            
            // 4. Handle existing links on page load
            function processExistingLinks() {
                const links = document.querySelectorAll('a');
                links.forEach(processLink);
            }
            
            // Process existing links when DOM is ready
            if (document.readyState === 'loading') {
                document.addEventListener('DOMContentLoaded', processExistingLinks);
            } else {
                processExistingLinks();
            }
            
            // 5. Override form target="_blank" submissions
            document.addEventListener('submit', function(event) {
                const form = event.target;
                if (form && form.target === '_blank') {
                    console.log('📝 Form with target="_blank" intercepted');
                    form.target = '_self';
                }
            }, true);
            
            console.log('✅ New window handler fully initialized for:', window.location.href);
        })();
    `).catch(err => {
        console.log('Failed to inject new window handler:', err);
    });
}

export function setupNewWindowHandling(tab) {
    if (!tab || !tab.webview) return;

    // Handle new-window events at the webview level
    tab.webview.addEventListener('new-window', (event) => {
        console.log('🚫 new-window event intercepted:', event.url, 'disposition:', event.disposition, 'features:', event.windowFeatures);

        // Define conditions that indicate a legitimate popup vs unwanted new tab
        const isLegitimatePopup = (
            // Check disposition for popup types
            event.disposition === 'new-popup' ||
            event.disposition === 'popup' ||
            event.disposition === 'save-to-disk' ||
            event.disposition === 'other' ||

            // Check for popup window features
            (event.windowFeatures && (
                event.windowFeatures.includes('popup') ||
                event.windowFeatures.includes('dialog') ||
                event.windowFeatures.includes('modal') ||
                // Small windows with specific dimensions are usually popups
                (event.windowFeatures.includes('width=') && event.windowFeatures.includes('height=') &&
                    (event.windowFeatures.includes('toolbar=no') ||
                        event.windowFeatures.includes('menubar=no') ||
                        event.windowFeatures.includes('location=no')))
            )) ||

            // URLs that suggest legitimate popups
            (event.url && (
                event.url.includes('/auth/') ||
                event.url.includes('/login/') ||
                event.url.includes('/oauth/') ||
                event.url.includes('/popup/') ||
                event.url.includes('/print/') ||
                event.url.includes('/download/') ||
                event.url.includes('popup=true') ||
                event.url.includes('dialog=true') ||
                // Same origin popups are often legitimate
                event.url.startsWith(tab.webview.getURL().split('/').slice(0, 3).join('/'))
            )) ||

            // Default allow if disposition suggests it's not a regular new tab
            (event.disposition && event.disposition !== 'foreground-tab' && event.disposition !== 'background-tab')
        );

        if (isLegitimatePopup) {
            console.log('🪟 Allowing legitimate popup:', event.url, 'disposition:', event.disposition);
            return; // Allow the popup to open naturally
        }

        // Only block what appears to be regular new tabs/windows
        if (event.disposition === 'foreground-tab' || event.disposition === 'background-tab' ||
            event.disposition === 'new-window' || !event.disposition) {
            console.log('🚫 Blocking new tab/window, redirecting to current tab:', event.url);
            event.preventDefault();

            // Navigate the current active tab to the new URL instead of opening a new window
            if (event.url && tab.webview) {
                console.log('➡️ Redirecting to current tab:', event.url);
                tab.webview.loadURL(event.url);
            }
        } else {
            // For any other disposition types, allow them through
            console.log('🟡 Allowing unknown disposition type:', event.disposition, event.url);
        }
    });

    // Also handle will-navigate events for additional coverage
    tab.webview.addEventListener('will-navigate', (event) => {
        // Allow normal navigation
        console.log('🔄 will-navigate:', event.url);
    });

    console.log('✅ New window handling setup complete for tab:', tab.id);
}
