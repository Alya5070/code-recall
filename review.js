let currentQuestionIndex = 0;
let reviewOrder = [];

// DOM Elements
const btnTabPractice = document.getElementById('tab-practice');
const btnTabReview = document.getElementById('tab-review');

const practiceStatsBar = document.getElementById('practice-stats-bar');
const practiceTerminal = document.getElementById('practice-terminal-container');
const practiceFooter = document.getElementById('practice-workspace-footer');
const reviewModule = document.getElementById('review-module');

const reviewExamTitle = document.getElementById('review-exam-title');
const reviewQuestionTitle = document.getElementById('review-question-title');
const reviewQuestionText = document.getElementById('review-question-text');
const sidebarPractice = document.getElementById('sidebar-practice');
const sidebarReview = document.getElementById('sidebar-review');
const reviewIndexList = document.getElementById('review-index-list');

const accIntuition = document.getElementById('acc-intuition');
const accCode = document.getElementById('acc-code');
const accExecution = document.getElementById('acc-execution');

const btnReviewPrev = document.getElementById('btn-review-prev');
const btnReviewNext = document.getElementById('btn-review-next');
const btnReviewShuffle = document.getElementById('btn-review-shuffle');

const btnSubFlashcard = document.getElementById('btn-sub-flashcard');
const btnSubCheatsheet = document.getElementById('btn-sub-cheatsheet');
const reviewFlashcardUi = document.getElementById('review-flashcard-ui');
const reviewCheatsheetUi = document.getElementById('review-cheatsheet-ui');

function initReview() {
    reviewOrder = REVIEW_DATA.map((_, i) => i);
    
    // Tab switching
    btnTabPractice.addEventListener('click', showPracticeMode);
    btnTabReview.addEventListener('click', showReviewMode);
    
    // Controls
    btnReviewPrev.addEventListener('click', () => {
        if (currentQuestionIndex > 0) {
            currentQuestionIndex--;
            loadReviewCard();
        }
    });
    
    btnReviewNext.addEventListener('click', () => {
        if (currentQuestionIndex < reviewOrder.length - 1) {
            currentQuestionIndex++;
            loadReviewCard();
        }
    });
    
    btnReviewShuffle.addEventListener('click', () => {
        // Fisher-Yates shuffle
        for (let i = reviewOrder.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [reviewOrder[i], reviewOrder[j]] = [reviewOrder[j], reviewOrder[i]];
        }
        currentQuestionIndex = 0;
        loadReviewCard();
    });
    
    // Sub-toggle logic
    btnSubFlashcard.addEventListener('click', () => {
        btnSubFlashcard.classList.add('active');
        btnSubFlashcard.style.background = 'rgba(139, 92, 246, 0.2)';
        btnSubFlashcard.style.color = 'var(--accent-violet)';
        
        btnSubCheatsheet.classList.remove('active');
        btnSubCheatsheet.style.background = 'transparent';
        btnSubCheatsheet.style.color = 'var(--text-secondary)';
        
        reviewFlashcardUi.style.display = 'block';
        reviewCheatsheetUi.style.display = 'none';
    });
    
    btnSubCheatsheet.addEventListener('click', () => {
        btnSubCheatsheet.classList.add('active');
        btnSubCheatsheet.style.background = 'rgba(139, 92, 246, 0.2)';
        btnSubCheatsheet.style.color = 'var(--accent-violet)';
        
        btnSubFlashcard.classList.remove('active');
        btnSubFlashcard.style.background = 'transparent';
        btnSubFlashcard.style.color = 'var(--text-secondary)';
        
        reviewFlashcardUi.style.display = 'none';
        reviewCheatsheetUi.style.display = 'block';
        
        if (!reviewCheatsheetUi.innerHTML.includes('cs-exam-block')) {
            renderCheatSheet();
        }
    });
    
    renderSidebarIndex();
    loadReviewCard();
}

function showPracticeMode() {
    btnTabPractice.classList.add('active');
    btnTabPractice.style.background = 'rgba(0, 255, 102, 0.1)';
    btnTabPractice.style.color = 'var(--accent-emerald)';
    
    btnTabReview.classList.remove('active');
    btnTabReview.style.background = 'transparent';
    btnTabReview.style.color = 'var(--text-secondary)';
    
    practiceStatsBar.style.display = 'flex';
    practiceTerminal.style.display = 'flex';
    practiceFooter.style.display = 'flex';
    reviewModule.style.display = 'none';
    sidebarPractice.style.display = 'block';
    sidebarReview.style.display = 'none';
}

function showReviewMode() {
    btnTabReview.classList.add('active');
    btnTabReview.style.background = 'rgba(139, 92, 246, 0.1)';
    btnTabReview.style.color = 'var(--accent-violet)';
    
    btnTabPractice.classList.remove('active');
    btnTabPractice.style.background = 'transparent';
    btnTabPractice.style.color = 'var(--text-secondary)';
    
    practiceStatsBar.style.display = 'none';
    practiceTerminal.style.display = 'none';
    practiceFooter.style.display = 'none';
    reviewModule.style.display = 'block';
    sidebarPractice.style.display = 'none';
    sidebarReview.style.display = 'block';
}

// Global function to toggle accordion
window.toggleAccordion = function(section) {
    const content = document.getElementById(`acc-${section}`);
    const icon = document.getElementById(`btn-icon-${section}`);
    
    if (content.style.display === 'none' || content.style.display === '') {
        content.style.display = 'block';
        icon.innerHTML = `<span style="color:var(--accent-violet);">[-]</span> Hide`;
    } else {
        content.style.display = 'none';
        
        let label = 'Reveal';
        if (section === 'intuition') label = 'Reveal Intuition & Approach';
        if (section === 'code') label = 'Reveal Implementation';
        if (section === 'execution') label = 'Reveal Execution & Complexity';
        
        icon.innerHTML = `<span style="color:var(--accent-emerald);">[+]</span> ${label}`;
    }
}

function formatMarkdown(text) {
    if (!text) return '<p style="color:var(--text-muted); font-style:italic;">None provided.</p>';
    
    // Bold
    let formatted = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    
    // Inline code
    formatted = formatted.replace(/`([^`]+)`/g, '<code style="background:rgba(0,0,0,0.3); padding:0.1rem 0.3rem; border-radius:4px; font-family:var(--font-code); color:var(--accent-emerald);">$1</code>');
    
    // Parse tables
    let lines = formatted.split('\n');
    let formattedLines = [];
    let inTable = false;
    
    for (let i = 0; i < lines.length; i++) {
        let line = lines[i].trim();
        if (line.startsWith('|') && line.endsWith('|')) {
            if (!inTable) {
                inTable = true;
                formattedLines.push('<div class="table-wrapper"><table class="review-table">');
            }
            
            if (line.match(/^\|[\s\-\|:]+\|$/)) {
                // Separator line
                continue;
            }
            
            let cells = line.split('|').slice(1, -1).map(c => c.trim());
            // It is a header if it's the very first row
            let isHeader = formattedLines[formattedLines.length - 1] === '<div class="table-wrapper"><table class="review-table">';
            
            let rowHtml = '<tr>';
            for (let cell of cells) {
                if (isHeader) rowHtml += `<th>${cell}</th>`;
                else rowHtml += `<td>${cell}</td>`;
            }
            rowHtml += '</tr>';
            
            if (isHeader) {
                rowHtml = '<thead>' + rowHtml + '</thead><tbody>';
            }
            
            formattedLines.push(rowHtml);
        } else {
            if (inTable) {
                inTable = false;
                formattedLines.push('</tbody></table></div>');
            }
            formattedLines.push(lines[i]);
        }
    }
    
    if (inTable) {
        formattedLines.push('</tbody></table></div>');
    }
    
    // Wrap paragraphs
    let finalHtml = '';
    let joined = formattedLines.join('\n');
    let blocks = joined.split(/(<div class="table-wrapper">.*?<\/div>)/s);
    
    for (let block of blocks) {
        if (block.startsWith('<div class="table-wrapper">')) {
            finalHtml += block;
        } else {
            let p = block.trim();
            if (p) {
                p = p.replace(/\n\n/g, '</p><p style="margin-top: 1rem;">').replace(/\n/g, '<br>');
                finalHtml += `<p>${p}</p>`;
            }
        }
    }
    
    return finalHtml;
}

function loadReviewCard() {
    const qIndex = reviewOrder[currentQuestionIndex];
    const qData = REVIEW_DATA[qIndex];
    
    reviewExamTitle.textContent = qData.exam;
    reviewQuestionTitle.textContent = qData.title;
    reviewQuestionText.innerHTML = formatMarkdown(qData.question);
    
    accIntuition.innerHTML = formatMarkdown(qData.intuition);
    
    if (qData.code) {
        accCode.textContent = qData.code;
    } else {
        accCode.innerHTML = '<span style="color:var(--text-muted); font-style:italic;">No code implementation provided.</span>';
    }
    
    accExecution.innerHTML = formatMarkdown(qData.execution);
    
    // Close all accordions
    ['intuition', 'code', 'execution'].forEach(sec => {
        document.getElementById(`acc-${sec}`).style.display = 'none';
        const icon = document.getElementById(`btn-icon-${sec}`);
        let label = 'Reveal';
        if (sec === 'intuition') label = 'Reveal Intuition & Approach';
        if (sec === 'code') label = 'Reveal Implementation';
        if (sec === 'execution') label = 'Reveal Execution & Complexity';
        icon.innerHTML = `<span style="color:var(--accent-emerald);">[+]</span> ${label}`;
    });
    
    // Update buttons
    btnReviewPrev.disabled = currentQuestionIndex === 0;
    btnReviewNext.disabled = currentQuestionIndex === reviewOrder.length - 1;
    
    if (btnReviewPrev.disabled) btnReviewPrev.style.opacity = '0.5';
    else btnReviewPrev.style.opacity = '1';
    
    if (btnReviewNext.disabled) btnReviewNext.style.opacity = '0.5';
    else btnReviewNext.style.opacity = '1';
}

function renderCheatSheet() {
    // Group by exam
    const exams = {};
    REVIEW_DATA.forEach(q => {
        if (!exams[q.exam]) exams[q.exam] = [];
        exams[q.exam].push(q);
    });
    
    let html = '';
    
    for (const [examName, questions] of Object.entries(exams)) {
        html += `<div class="cs-exam-block">
            <h2 class="cs-exam-title">${examName}</h2>`;
            
        for (const q of questions) {
            html += `<div class="cs-question-block">
                <h3 class="cs-question-title">${q.title}</h3>
                <div style="font-family: var(--font-ui); font-size: 1.05rem; line-height: 1.6; margin-bottom: 1rem;">
                    ${formatMarkdown(q.question)}
                </div>`;
                
            if (q.intuition) {
                html += `<div class="cs-section">
                    <div class="cs-section-label">Intuition & Approach</div>
                    <div style="font-family: var(--font-ui); line-height: 1.6;">${formatMarkdown(q.intuition)}</div>
                </div>`;
            }
            
            if (q.code) {
                // Escape HTML for code to prevent rendering issues
                const safeCode = q.code.replace(/</g, "&lt;").replace(/>/g, "&gt;");
                html += `<div class="cs-section">
                    <div class="cs-section-label">Implementation</div>
                    <div class="cs-code-block">${safeCode}</div>
                </div>`;
            }
            
            if (q.execution) {
                html += `<div class="cs-section">
                    <div class="cs-section-label">Execution & Complexity</div>
                    <div style="font-family: var(--font-ui); line-height: 1.6;">${formatMarkdown(q.execution)}</div>
                </div>`;
            }
                
            html += `</div>`; // End question block
        }
        
        html += `</div>`; // End exam block
    }
    
    reviewCheatsheetUi.innerHTML = html;
}

function renderSidebarIndex() {
    let html = '';
    const exams = {};
    REVIEW_DATA.forEach((q, i) => {
        if (!exams[q.exam]) exams[q.exam] = [];
        exams[q.exam].push({ ...q, originalIndex: i });
    });
    
    for (const [examName, questions] of Object.entries(exams)) {
        html += `<li class="snippet-item" style="pointer-events: none; padding-top: 1rem; padding-bottom: 0.25rem;">
            <strong style="color: var(--text-secondary); font-size: 0.75rem; text-transform: uppercase;">${examName}</strong>
        </li>`;
        
        for (const q of questions) {
            html += `
            <li class="snippet-item" onclick="jumpToReviewQuestion(${q.originalIndex})">
                <div class="snippet-title" style="font-size: 0.85rem; font-weight: 400; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${q.title}</div>
            </li>`;
        }
    }
    
    reviewIndexList.innerHTML = html;
}

function jumpToReviewQuestion(index) {
    // Check if in Flashcard mode
    if (reviewFlashcardUi.style.display !== 'none') {
        currentQuestionIndex = reviewOrder.indexOf(index);
        if (currentQuestionIndex === -1) {
            // It might be filtered out if we shuffle, so we just set it
            currentQuestionIndex = index;
        }
        loadReviewCard();
    } else {
        // In cheat sheet mode, scroll to it
        if (!reviewCheatsheetUi.innerHTML.includes('cs-exam-block')) {
            renderCheatSheet();
        }
        // Need to add IDs to cheat sheet titles to scroll to them
        const titles = reviewCheatsheetUi.querySelectorAll('.cs-question-title');
        for (let titleEl of titles) {
            if (titleEl.textContent === REVIEW_DATA[index].title) {
                titleEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
                // Briefly flash the background to show which one was clicked
                const block = titleEl.parentElement;
                const oldBg = block.style.backgroundColor;
                block.style.transition = 'background-color 0.5s ease';
                block.style.backgroundColor = 'rgba(139, 92, 246, 0.2)';
                setTimeout(() => {
                    block.style.backgroundColor = oldBg || 'var(--bg-card)';
                }, 1000);
                break;
            }
        }
    }
    
    // Close mobile sidebar if open
    const sidebar = document.querySelector('.sidebar');
    const mobileOverlay = document.getElementById('mobile-overlay');
    if (sidebar && sidebar.classList.contains('open')) {
        sidebar.classList.remove('open');
        mobileOverlay.classList.remove('active');
    }
}

// Initialize when ready
window.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        if (typeof REVIEW_DATA !== 'undefined') {
            initReview();
        }
    }, 100);
});
