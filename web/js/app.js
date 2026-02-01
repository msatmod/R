document.addEventListener('DOMContentLoaded', () => {
    initLoadingBar();
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
});

function moveSplashProgress() {
    const splashBar = document.getElementById('splash-progress-bar');
    const splashIcon = document.getElementById('splash-r-icon');
    let width = 0;
    const interval = setInterval(() => {
        if (width >= 100) {
            clearInterval(interval);
            setTimeout(dismissSkeletonLoader, 500);
        } else {
            width += Math.random() * 5;
            if (width > 100) width = 100;
            if (splashBar) splashBar.style.width = width + '%';
            if (splashIcon) splashIcon.style.left = width + '%';
        }
    }, 50);
}

function animateStatsCard() {
    const countElement = document.getElementById('milestone-count');
    const barElement = document.getElementById('stats-bar');
    const iconElement = document.getElementById('stats-r-icon');

    if (!countElement || !barElement || !iconElement) return;

    // Reset for animation
    countElement.innerText = '0';
    barElement.style.width = '0%';
    iconElement.style.left = '0%';

    let count = 0;
    const target = 30;
    const duration = 1500;
    const frames = duration / 16;
    const increment = target / frames;

    const timer = setInterval(() => {
        count += increment;
        if (count >= target) {
            count = target;
            clearInterval(timer);
        }

        const progress = (count / target) * 100;
        countElement.innerText = Math.floor(count);
        barElement.style.width = progress + '%';
        iconElement.style.left = progress + '%';
    }, 16);
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

// --- Elite Loading Bar ---
function initLoadingBar() {
    const bar = document.getElementById('loading-bar');
    let width = 0;

    // Simulate premium Apple-style loading
    const interval = setInterval(() => {
        if (width >= 100) {
            clearInterval(interval);
            setTimeout(() => {
                bar.style.opacity = '0';
                setTimeout(() => bar.style.display = 'none', 500);
            }, 500);
        } else {
            // Speed up at the end for "snap" effect
            const increment = width > 80 ? 5 : 2;
            width += increment;
            bar.style.width = width + '%';
        }
    }, 40);
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
    const statsSection = document.getElementById('progress');
    const completedDays = curriculumData.filter(d => d.kaggle || d.colab || d.source).length;
    const progressPercent = Math.round((completedDays / 30) * 100);

    statsSection.innerHTML = `
        <div class="stat-card reveal stats-progress-card" onclick="animateStatsCard()">
            <div class="stat-header">
                <span class="stat-icon">✅</span>
                <span class="stat-label">Verified Course Milestones</span>
            </div>
            <div class="stat-value" id="milestone-count">0</div>
            <div class="stats-progress-wrapper">
                <div class="stats-r-icon" id="stats-r-icon">
                    <svg viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12.193 2.503c-6.617 0-12 5.383-12 12s5.383 12 12 12 12-5.383 12-12-5.383-12-12-12zm4.332 17.5c-.273.084-.551.144-.834.182-1.396.184-2.822-.243-3.692-1.258l-1.996-2.332c-.104-.122-.162-.276-.162-.435v-1.666c0-.204.081-.4.225-.544.144-.144.34-.225.544-.225h.412c.506 0 .977-.253 1.259-.676l.322-.486c.071-.107.108-.232.108-.36s-.037-.253-.108-.36l-.322-.486a1.498 1.498 0 0 0-1.259-.676h-2.182v5.27h-1.636V8.636h3.818c1.506 0 2.727 1.221 2.727 2.727 0 .584-.183 1.127-.495 1.574-.336.483-.807.85-1.353 1.037.289.117.55.293.766.52l2.365 2.766c.159.186.241.424.227.662-.014.238-.119.461-.295.63s-.404.26-.642.257-.461-.131-.62-.31l-3.238-3.793z" />
                    </svg>
                </div>
                <div class="stats-bar-container">
                    <div class="stats-bar" id="stats-bar"></div>
                </div>
            </div>
            <div style="margin-top: 1.5rem; display: flex; justify-content: space-between; align-items: center; border-top: 1px solid var(--border-color); padding-top: 1rem;">
                <div style="text-align: left;">
                    <div style="font-size: 1.2rem; font-weight: 700; color: var(--accent-blue);">4</div>
                    <div style="font-size: 0.8rem; color: var(--text-secondary); text-transform: uppercase;">Full Course Certificates</div>
                </div>
                <div style="text-align: right;">
                    <div style="font-size: 1.2rem; font-weight: 700; color: var(--accent-purple);">${progressPercent}%</div>
                    <div style="font-size: 0.8rem; color: var(--text-secondary); text-transform: uppercase;">Mastery Level</div>
                </div>
            </div>
        </div>
    `;

    // Trigger animation after render
    setTimeout(animateStatsCard, 100);
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

    content.innerHTML = `
        <div class="explorer-placeholder">
            <div class="loading-spinner"></div>
            <p>Initializing Premium Jupyter Wrapper for <strong>${title}</strong>...</p>
            <p class="viewer-note">This feature uses <code>nbconvert</code> to render high-fidelity R code blocks directly in your browser.</p>
        </div>
    `;

    setTimeout(() => {
        content.innerHTML = `
            <div class="notebook-viewer-frame">
                <iframe src="notebooks/day${day}.html" frameborder="0" style="width:100%; height:100%; min-height:600px;"></iframe>
            </div>
        `;
    }, 1500);
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
