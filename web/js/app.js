document.addEventListener('DOMContentLoaded', () => {
    try {
        initTheme();
        renderStats();
        renderCertificates();
        renderCurriculum('all');
        setupEventListeners();
        initScrollAnimations();
        initSecurity();

        // Start animations
        moveSplashProgress();
        setTimeout(animateStatsCard, 2000);

        // Register PWA Service Worker
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.register('sw.js').catch(console.error);
        }
    } catch (error) {
        console.error("Institutional Hub Initialization Error:", error);
        dismissSkeletonLoader(); // Emergency reveal
    }

    // Fallback: Force dismiss loader if it hangs
    setTimeout(() => {
        const loader = document.getElementById('skeleton-loader');
        if (loader && loader.style.display !== 'none') {
            console.warn("Forcing loader dismissal due to delay.");
            dismissSkeletonLoader();
        }
    }, 5000);
});

function moveSplashProgress() {
    const splashBar = document.getElementById('splash-progress-bar');
    const splashIcon = document.getElementById('splash-r-icon');
    if (!splashBar || !splashIcon) return;

    let width = 0;
    const animate = () => {
        if (width >= 100) {
            width = 100;
            splashBar.style.width = '100%';
            splashIcon.style.left = '100%';
            setTimeout(dismissSkeletonLoader, 500);
            return;
        }

        const step = Math.random() * 2 + 0.5; // Smoother, smaller steps
        width += step;
        if (width > 100) width = 100;

        splashBar.style.width = width + '%';
        splashIcon.style.left = width + '%';

        requestAnimationFrame(animate);
    };

    requestAnimationFrame(animate);
}

function animateStatsCard() {
    const countElement = document.getElementById('milestone-count');
    const barElement = document.getElementById('stats-bar');
    const iconElement = document.getElementById('stats-r-icon');

    if (!countElement || !barElement || !iconElement) return;

    let startTime = null;
    const target = 30;
    const duration = 2000; // Smoother, longer animation

    const animate = (timestamp) => {
        if (!startTime) startTime = timestamp;
        const progressTime = timestamp - startTime;
        const percentage = Math.min(progressTime / duration, 1);

        // Easing function for premium feel
        const easeOut = 1 - Math.pow(1 - percentage, 3);
        const currentCount = Math.floor(easeOut * target);
        const currentProgress = easeOut * 100;

        countElement.innerText = currentCount;
        barElement.style.width = currentProgress + '%';
        iconElement.style.left = currentProgress + '%';

        if (percentage < 1) {
            requestAnimationFrame(animate);
        } else {
            countElement.innerText = target;
            barElement.style.width = '100%';
            iconElement.style.left = '100%';
        }
    };

    requestAnimationFrame(animate);
}

function dismissSkeletonLoader() {
    const loader = document.getElementById('skeleton-loader');
    if (loader) {
        loader.style.opacity = '0';
        loader.style.transition = 'opacity 0.5s ease';
        setTimeout(() => {
            loader.style.display = 'none';
        }, 500);
    }
}


// --- Theme System ---
function initTheme() {
    const savedTheme = localStorage.getItem('theme') || 'dark';
    document.documentElement.setAttribute('data-theme', savedTheme);
}

function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
}

// --- Data Rendering ---
function renderStats() {
    const statsContainer = document.getElementById('progress');
    if (!statsContainer) return;

    statsContainer.innerHTML = `
        <div class="stats-top-row">
            <div class="stat-unit">
                <div class="stat-header">
                    <i class="fas fa-check-square stat-check-icon"></i>
                    <span class="stat-label">COURSE MILESTONES</span>
                </div>
                <div class="stat-value-container">
                    <span id="milestone-count" class="stat-value">0</span>
                    <span class="stat-total">/ 30</span>
                </div>
            </div>
            <div class="stat-unit align-right">
                <div class="stat-header justify-end">
                    <span class="stat-label">FULL CERTIFICATES</span>
                    <i class="fas fa-certificate stat-cert-icon"></i>
                </div>
                <div class="stat-value-container">
                    <span id="cert-count" class="stat-value">0</span>
                </div>
            </div>
        </div>
        
        <div class="stats-animation-track">
            <div class="stats-r-icon" id="stats-r-icon">
                <svg viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12.193 2.503c-6.617 0-12 5.383-12 12s5.383 12 12 12 12-5.383 12-12-5.383-12-12-12zm4.332 17.5c-.273.084-.551.144-.834.182-1.396.184-2.822-.243-3.692-1.258l-1.996-2.332c-.104-.122-.162-.276-.162-.435v-1.666c0-.204.081-.4.225-.544.144-.144.34-.225.544-.225h.412c.506 0 .977-.253 1.259-.676l.322-.486c.071-.107.108-.232.108-.36s-.037-.253-.108-.36l-.322-.486a1.498 1.498 0 0 0-1.259-.676h-2.182v5.27h-1.636V8.636h3.818c1.506 0 2.727 1.221 2.727 2.727 0 .584-.183 1.127-.495 1.574-.336.483-.807.85-1.353 1.037.289.117.55.293.766.52l2.365 2.766c.159.186.241.424.227.662-.014.238-.119.461-.295.63s-.404.26-.642.257-.461-.131-.62-.31l-3.238-3.793z" />
                </svg>
            </div>
            <div class="stats-subtle-line"></div>
        </div>

        <div class="stat-center-unit">
            <div id="mastery-count" class="stat-footer-value accent-purple">0%</div>
            <div class="stat-footer-label">MASTERY LEVEL</div>
        </div>
    `;

    setTimeout(animateStatsCard, 500);
}

function animateStatsCard() {
    const milestoneCount = document.getElementById('milestone-count');
    const certCount = document.getElementById('cert-count');
    const masteryCount = document.getElementById('mastery-count');
    const iconElement = document.getElementById('stats-r-icon');

    if (!milestoneCount || !masteryCount || !iconElement) return;

    const completedDays = curriculumData.filter(d => d.kaggle || d.colab || d.source).length;
    const targetMilestones = completedDays;
    const targetCerts = 4;
    const targetMastery = Math.round((completedDays / 30) * 100);
    const duration = 2500;

    function animateValue(obj, start, end, duration, suffix = '') {
        let startTimestamp = null;
        const step = (timestamp) => {
            if (!startTimestamp) startTimestamp = timestamp;
            const progress = Math.min((timestamp - startTimestamp) / duration, 1);
            const ease = 1 - Math.pow(1 - progress, 4); // Quartic Out for smoothness

            const current = Math.floor(ease * (end - start) + start);
            obj.innerHTML = current + suffix;

            if (obj === milestoneCount) {
                iconElement.style.left = (ease * (end / 30) * 100) + '%';
            }

            if (progress < 1) {
                window.requestAnimationFrame(step);
            }
        };
        window.requestAnimationFrame(step);
    }

    animateValue(milestoneCount, 0, targetMilestones, duration);
    animateValue(certCount, 0, targetCerts, duration);
    animateValue(masteryCount, 0, targetMastery, duration, '%');
}

function renderCertificates() {
    const certGrid = document.getElementById('cert-grid');
    certGrid.innerHTML = certificateData.map((cert, index) => `
        <div class="cert-card reveal" onclick="openCertModal(${index})">
            <div class="cert-image-wrapper">
                <img src="${cert.image}" alt="${cert.name}">
            </div>
            <div class="cert-info">
                <span class="cert-author-badge">${cert.recipient}</span>
                <h3>${cert.name}</h3>
                <p>${cert.issuer}</p>
            </div>
        </div>
    `).join('');
}

function renderCurriculum(filter) {
    const dayGrid = document.getElementById('day-grid');
    const filteredData = filter === 'all'
        ? curriculumData
        : curriculumData.filter(d => d.module === filter);

    dayGrid.innerHTML = filteredData.map(day => `
        <div class="day-card reveal" data-day="${day.day}">
            <div class="day-header">
                <span class="day-number">Day ${day.day}</span>
                <span class="day-module-icon">${day.icon}</span>
            </div>
            <h3 class="day-title">${day.title}</h3>
            <div class="day-actions">
                ${day.kaggle ? `<a href="${day.kaggle}" class="action-btn kaggle-btn" target="_blank">Kaggle</a>` : ''}
                ${day.colab ? `<a href="${day.colab}" class="action-btn colab-btn" target="_blank">Colab</a>` : ''}
                ${day.source ? `<a href="${day.source}" class="action-btn source-btn" target="_blank">Source</a>` : ''}
                ${day.colab ? `<button class="action-btn explorer-btn" onclick="openNotebook('${day.day}', '${day.title}')">Explorer</button>` : ''}
            </div>
        </div>
    `).join('');

    // Trigger scroll animations for new items
    initScrollAnimations();
}

// --- Event Listeners & Modals ---
function setupEventListeners() {
    // Theme Toggle
    document.getElementById('theme-toggle').addEventListener('click', toggleTheme);

    // Page Share
    document.getElementById('share-btn').addEventListener('click', sharePage);

    // Filtering
    const filterBtns = document.querySelectorAll('.filter-btn');
    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            renderCurriculum(btn.dataset.filter);
        });
    });

    // Universal Close for modals
    window.addEventListener('click', (e) => {
        if (e.target.classList.contains('modal')) {
            closeModal();
            closeCertModal();
        }
    });

    // Close button for Notebook modal
    document.querySelector('#notebook-modal .close-modal').onclick = closeModal;
}

// --- Certificate Logic ---
function openCertModal(index) {
    const cert = certificateData[index];
    const modal = document.getElementById('cert-viewer-modal');

    document.getElementById('cert-modal-title').innerText = cert.name;
    document.getElementById('full-cert-image').src = cert.image;
    document.getElementById('download-cert-link').href = cert.image;

    modal.style.display = 'block';
    document.body.style.overflow = 'hidden';
}

function closeCertModal() {
    document.getElementById('cert-viewer-modal').style.display = 'none';
    document.body.style.overflow = 'auto';
}

function shareCertificate() {
    const url = window.location.href;
    const title = document.getElementById('cert-modal-title').innerText;

    if (navigator.share) {
        navigator.share({ title, text: `Check out this R Programming certificate!`, url })
            .catch(console.error);
    } else {
        copyToClipboard(url);
    }
}

// --- Notebook Logic ---
function openNotebook(day, title) {
    const modal = document.getElementById('notebook-modal');
    const content = document.getElementById('notebook-content');
    const modalTitle = document.getElementById('modal-title');

    modalTitle.innerText = `Day ${day}: ${title}`;
    modal.style.display = 'block';
    document.body.style.overflow = 'hidden';

    // Clear previous controls
    const controls = document.getElementById('notebook-controls');
    if (controls) controls.innerHTML = '';

    content.innerHTML = `
        <div class="modal-spinner-wrapper">
            <div class="premium-spinner"></div>
            <p>Initializing Research Archive...</p>
            <span class="day-label">Day ${day}: ${title}</span>
        </div>
    `;

    // Atmospheric initialization delay
    setTimeout(() => {
        // Find the day data to check for Colab fallback
        const dayData = curriculumData.find(d => d.day === day);

        content.innerHTML = `
            <div class="notebook-viewer-frame">
                <iframe 
                    src="notebooks/day${day}.html" 
                    frameborder="0" 
                    style="width:100%; height:100%; min-height:650px;"
                ></iframe>
            </div>
        `;

        const iframe = content.querySelector('iframe');
        let loadConfirmed = false;

        // Failsafe: If not loaded in 5 seconds, show fallback
        const fallbackTimer = setTimeout(() => {
            if (!loadConfirmed) {
                console.warn(`Notebook load timed out for day${day}.html`);
                handleNotebookError(iframe, dayData ? dayData.colab : '');
            }
        }, 5000);

        // Success Handler
        iframe.onload = () => {
            loadConfirmed = true;
            clearTimeout(fallbackTimer);
            console.log(`Successfully loaded local notebook: day${day}.html`);
            renderNotebookControls(day, dayData);
        };

        // Error Handler
        iframe.onerror = () => {
            loadConfirmed = false; // Just in case
            clearTimeout(fallbackTimer);
            console.error("Failed to load local notebook.");
            handleNotebookError(iframe, dayData ? dayData.colab : '');
        };

    }, 1200);
}

function renderNotebookControls(day, dayData) {
    const controls = document.getElementById('notebook-controls');
    if (!controls) return;

    const colabLink = dayData ? dayData.colab : '#';
    let downloadLink = '#';

    // Construct Raw GitHub Link for IDL/Python Download
    if (colabLink && colabLink.includes('colab.research.google.com/github')) {
        const rawPath = colabLink.replace('https://colab.research.google.com/github/', '');
        downloadLink = `https://raw.githubusercontent.com/${rawPath.replace('/blob/', '/')}`;
    }

    controls.innerHTML = `
        <a href="${downloadLink}" download="Day_${day}_Notebook.ipynb" class="control-icon-btn download-action" title="Download Python Notebook (.ipynb)">
            <i class="fas fa-download"></i>
        </a>
        <button class="control-icon-btn" onclick="shareNotebook('${colabLink}')" title="Share Notebook">
            <i class="fas fa-share-alt"></i>
        </button>
    `;
}

function shareNotebook(url) {
    if (navigator.share) {
        navigator.share({
            title: 'R Programming Challenge Notebook',
            text: 'Check out this notebook from the R Programming Challenge!',
            url: url
        }).catch(err => {
            console.log('Share failed:', err);
            // Fallback to clipboard
            copyToClipboard(url);
        });
    } else {
        copyToClipboard(url);
    }
}

function handleNotebookError(iframe, colabUrl) {
    const content = document.getElementById('notebook-content');
    content.innerHTML = `
        <div class="modal-spinner-wrapper">
            <i class="fas fa-exclamation-triangle" style="font-size: 3rem; color: var(--accent-purple); margin-bottom: 1.5rem;"></i>
            <h3>Digital Archive Optimized</h3>
            <p>This session is best viewed through our high-performance cloud environment.</p>
            <a href="${colabUrl || '#'}" target="_blank" class="view-btn" style="margin-top: 2rem; background: var(--accent-blue); color: var(--bg-color); text-decoration: none; padding: 1rem 2rem; border-radius: 12px; font-weight: 700;">
                <i class="fas fa-external-link-alt"></i> Open in Google Colab
            </a>
        </div>
    `;
}

function closeModal() {
    document.getElementById('notebook-modal').style.display = 'none';
    document.body.style.overflow = 'auto';
}

// --- Utilities ---
function sharePage() {
    const shareData = {
        title: 'R Programming Challenge',
        text: 'Mastering R in 30 days - Collaborative Journey by Amey & Mega.',
        url: window.location.href
    };

    if (navigator.share) {
        navigator.share(shareData).catch(console.error);
    } else {
        copyToClipboard(window.location.href);
    }
}

function copyToClipboard(text) {
    navigator.clipboard.writeText(text).then(() => {
        alert('Link copied to clipboard!');
    });
}

function initScrollAnimations() {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
            }
        });
    }, { threshold: 0.1 });

    document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
}

function initSecurity() {
    // 🛡️ Institutional Integrity: Anti-Right-Click & Anti-Select
    document.addEventListener('contextmenu', e => e.preventDefault());

    document.addEventListener('keydown', e => {
        // Disable F12, Ctrl+Shift+I, Ctrl+Shift+J, Ctrl+U, Ctrl+S
        if (
            e.key === 'F12' ||
            (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'J' || e.key === 'C')) ||
            (e.ctrlKey && e.key === 'u') ||
            (e.ctrlKey && e.key === 's')
        ) {
            e.preventDefault();
            console.warn("🛡️ Access Restricted: Institutional Hub Integrity Active.");
            return false;
        }
    });

    // 🥚 Personalized Easter Egg: The Truth in Code
    console.log(
        "%c📊 R 30-DAY CHALLENGE ARCHIVE %c\n\nAuthorship: Amey Thakur & Mega Satish\nProject: R Programming Challenge\n\n%c\"Challenge successfully completed with Mega Satish.\"",
        "color: #58a6ff; font-size: 24px; font-weight: bold; font-family: 'Play', sans-serif; text-shadow: 2px 2px 0px rgba(0,0,0,0.2);",
        "color: #f0f6fc; font-size: 16px; font-family: 'Play', sans-serif; font-weight: 500;",
        "color: #bc8cff; font-style: italic; font-size: 14px;"
    );
}
