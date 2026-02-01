document.addEventListener('DOMContentLoaded', () => {
    renderStats();
    renderCertificates();
    renderCurriculum('all');
    setupEventListeners();
});

function renderStats() {
    const statsSection = document.getElementById('progress');
    const totalDays = curriculumData.length;
    const completedDays = curriculumData.filter(d => d.kaggle || d.colab || d.source).length;
    const progressPercent = Math.round((completedDays / 30) * 100);

    statsSection.innerHTML = `
        <div class="glass-panel stats-container">
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
                <span class="stat-value">3</span>
                <span class="stat-label">Verified Certs</span>
            </div>
        </div>
    `;
}

function renderCertificates() {
    const certGrid = document.getElementById('cert-grid');
    certGrid.innerHTML = certificateData.map(cert => `
        <div class="cert-card">
            <img src="${cert.image}" alt="${cert.name}">
            <div class="cert-info">
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
        <div class="day-card" data-day="${day.day}">
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
}

function setupEventListeners() {
    // Filtering logic
    const filterBtns = document.querySelectorAll('.filter-btn');
    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            renderCurriculum(btn.dataset.filter);
        });
    });

    // Close modal
    document.querySelector('.close-modal').addEventListener('click', closeModal);
    window.addEventListener('click', (e) => {
        if (e.target.classList.contains('modal')) closeModal();
    });
}

function openNotebook(day, title) {
    const modal = document.getElementById('notebook-modal');
    const content = document.getElementById('notebook-content');
    const modalTitle = document.getElementById('modal-title');

    modalTitle.innerText = `Day ${day}: ${title}`;
    modal.style.display = 'block';

    // In a real environment, we'd fetch the converted HTML
    content.innerHTML = `
        <div class="explorer-placeholder">
            <div class="loading-spinner"></div>
            <p>Initializing Premium Jupyter Wrapper for <strong>${title}</strong>...</p>
            <p class="viewer-note">This feature uses <code>nbconvert</code> to render high-fidelity R code blocks and visual outputs directly in your browser.</p>
        </div>
    `;

    // Simulate loading for effect
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
}
