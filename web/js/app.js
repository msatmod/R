document.addEventListener('DOMContentLoaded', () => {
    initTheme();
    renderStats();
    renderCertificates();
    renderCurriculum('all');
    setupEventListeners();
    initScrollAnimations();
});

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
    const totalDays = curriculumData.length;
    const completedDays = curriculumData.filter(d => d.kaggle || d.colab || d.source).length;
    const progressPercent = Math.round((completedDays / 30) * 100);

    statsSection.innerHTML = `
        <div class="glass-panel stats-container reveal">
            <div class="stat-item">
                <span class="stat-value">${completedDays}/30</span>
                <span class="stat-label">Milestones Reached</span>
            </div>
            <div class="stat-item progress-wrapper">
                <div class="progress-bar">
                    <div class="progress-fill" style="width: ${progressPercent}%"></div>
                </div>
                <span class="stat-label">${progressPercent}% Mastered</span>
            </div>
            <div class="stat-item">
                <span class="stat-value">4</span>
                <span class="stat-label">Verified Certs</span>
            </div>
        </div>
    `;
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
