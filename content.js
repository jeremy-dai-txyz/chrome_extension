function findPDFLinks() {
    const links = document.getElementsByTagName('a');
    for (const link of links) {
        if (isPdfLink(link.href)) {
            addSummaryButton(link);
        }
    }
}


function addSummaryButton(pdfLink) {
    // Don't add button if it already exists
    if (pdfLink.nextSibling?.classList?.contains('pdf-summary-btn')) {
        return;
    }

    const button = document.createElement('button');
    button.className = 'pdf-summary-btn';
    // Reset any potential inherited attributes that might affect styling
    button.setAttribute('style', 'list-style: none !important; text-indent: 0 !important;');

    // Load a higher resolution icon
    const icon = document.createElement('img');
    icon.src = chrome.runtime.getURL('images/icon48.png');
    icon.className = 'pdf-summary-icon';
    icon.alt = '';
    icon.draggable = false;
    icon.width = 20;
    icon.height = 20;

    // Create text span to control spacing better
    const textSpan = document.createElement('span');
    textSpan.className = 'pdf-summary-text';
    textSpan.textContent = 'Read with TXYZ';

    // Direct children of button to avoid any interference
    button.appendChild(icon);
    button.appendChild(textSpan);

    // Create click handler
    const handleClick = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (button.disabled) return;

        const pdfUrl = encodeURIComponent(pdfLink.href);
        window.open(`https://app.txyz.ai/fetch?url=${pdfUrl}`, '_blank', 'noopener,noreferrer');
    };

    // Add click handler to the button
    button.addEventListener('click', handleClick);

    // Create a container for the link and button if needed
    let container = pdfLink.parentNode;
    if (!container.classList.contains('pdf-link-container')) {
        container = document.createElement('div');
        container.className = 'pdf-link-container';
        // Add inline styles to override any parent list styling
        container.setAttribute('style', 'list-style: none !important; text-indent: 0 !important;');
        pdfLink.parentNode.insertBefore(container, pdfLink);
        container.appendChild(pdfLink);
    }

    // Insert button after the PDF link
    container.appendChild(button);
}


function isPdfLink(url) {
    try {
        // Direct PDF URLs ending with .pdf
        if (url.toLowerCase().endsWith('.pdf')) {
            return true;
        }

        // ArXiv-style PDF links
        if (url.match(/arxiv\.org\/pdf\/\d+\.\d+/i)) {
            return true;
        }

        // Parse URL to check path and query parameters
        const urlObj = new URL(url);

        // URLs containing .pdf in the pathname (handles PDFs with query parameters)
        if (urlObj.pathname.toLowerCase().includes('.pdf')) {
            return true;
        }

        // Handle known academic repositories with special PDF URL patterns
        if (urlObj.hostname.includes('researchgate.net') &&
            (urlObj.pathname.includes('/links/') || urlObj.pathname.includes('/publication/'))) {
            return true;
        }

        if (urlObj.hostname.includes('citeseerx.ist.psu.edu') &&
            (urlObj.pathname.includes('/document') || urlObj.searchParams.get('type') === 'pdf')) {
            return true;
        }

        // Add other common academic PDF repositories as needed
        if (urlObj.hostname.includes('semanticscholar.org') && urlObj.pathname.includes('/pdf')) {
            return true;
        }

        return false;
    } catch (e) {
        return false
    }
}


// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', findPDFLinks);

// Handle dynamically added PDF links
const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
        if (mutation.addedNodes.length) {
            findPDFLinks();
        }
    });
});

observer.observe(document.body, {
    childList: true,
    subtree: true
});
