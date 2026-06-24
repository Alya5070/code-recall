// Initial snippets are now loaded from snippets-data.js

// App State
let snippets = [];
let activeSnippet = null;
let currentMode = 'guided'; // 'guided' or 'blind'
let activeCharIndex = 0;
let flatChars = []; // Array of { char: string, element: HTMLElement, isNewline: boolean }
let isPlaying = false;
let startTime = null;
let timerInterval = null;
let correctPresses = 0;
let totalPresses = 0;
let isFocusMode = false;
let currentTheme = 'dark';
let editingSnippetId = null;

// DOM Elements
const snippetList = document.getElementById('snippet-list');
const activeTitle = document.getElementById('active-title');
const activeLang = document.getElementById('active-lang');
const terminalFilename = document.getElementById('terminal-filename');
const codePlayground = document.getElementById('code-playground');
const keyboardGate = document.getElementById('keyboard-gate');
const btnRestart = document.getElementById('btn-restart');
const btnFocus = document.getElementById('btn-focus');
const btnTheme = document.getElementById('btn-theme');
const themeIcon = document.getElementById('theme-icon');
const btnNewSnippet = document.getElementById('btn-new-snippet');
const modeGuided = document.getElementById('mode-guided');
const modeBlind = document.getElementById('mode-blind');

// Stats Elements
const statWpm = document.getElementById('stat-wpm');
const statAccuracy = document.getElementById('stat-accuracy');
const statProgress = document.getElementById('stat-progress');
const completionOverlay = document.getElementById('completion-overlay');

// Hint Buttons
const btnHintChar = document.getElementById('btn-hint-char');
const btnHintLine = document.getElementById('btn-hint-line');
const btnPeek = document.getElementById('btn-peek');

// Modal Elements
const snippetModal = document.getElementById('snippet-modal');
const snippetForm = document.getElementById('snippet-form');
const btnCloseModal = document.getElementById('btn-close-modal');
const btnCancelModal = document.getElementById('btn-cancel-modal');

// Init Application
function init() {
    loadSnippets();
    loadTheme();
    setupEventListeners();
    if (snippets.length > 0) {
        selectSnippet(snippets[0].id);
    } else {
        activeTitle.textContent = "No snippets found";
        activeLang.textContent = "none";
        terminalFilename.textContent = "empty";
        codePlayground.innerHTML = '<div class="empty-state" style="color: var(--text-muted); text-align: center; padding: 2rem;">Click "+ New Code" in the sidebar to add a snippet!</div>';
    }
}

// Load from LocalStorage or use defaults
function loadSnippets() {
    const stored = localStorage.getItem('coderecall_snippets');
    if (stored) {
        snippets = JSON.parse(stored);
    } else {
        // Fallback to static deployment data if present
        snippets = typeof INITIAL_SNIPPETS !== 'undefined' ? [...INITIAL_SNIPPETS] : [];
    }
    renderSidebar();
}

function saveSnippetsToStorage() {
    localStorage.setItem('coderecall_snippets', JSON.stringify(snippets));
}

// Render Sidebar List
function renderSidebar() {
    snippetList.innerHTML = '';
    snippets.forEach(snippet => {
        const li = document.createElement('li');
        li.className = `snippet-item ${activeSnippet && activeSnippet.id === snippet.id ? 'active' : ''}`;
        li.dataset.id = snippet.id;
        
        li.innerHTML = `
            <div class="snippet-item-content">
                <div class="snippet-item-title">${escapeHTML(snippet.title)}</div>
                <div class="snippet-item-meta">
                    <span>${escapeHTML(snippet.lang)}</span>
                    <span>${snippet.code.split('\n').length} lines</span>
                </div>
            </div>
            <div class="snippet-actions">
                <button class="btn-action-edit" title="Edit snippet">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7M18.5 2.5a2.121 2.121 0 1 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                </button>
                <button class="btn-action-delete" title="Delete snippet">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                </button>
            </div>
        `;
        
        li.querySelector('.snippet-item-content').addEventListener('click', () => {
            selectSnippet(snippet.id);
        });

        li.querySelector('.btn-action-edit').addEventListener('click', (e) => {
            e.stopPropagation();
            openEditModal(snippet.id);
        });

        li.querySelector('.btn-action-delete').addEventListener('click', (e) => {
            e.stopPropagation();
            deleteSnippet(snippet.id);
        });

        snippetList.appendChild(li);
    });
}

// Edit Snippet Modal
function openEditModal(id) {
    const snippet = snippets.find(s => s.id === id);
    if (!snippet) return;
    
    editingSnippetId = id;
    
    document.getElementById('input-title').value = snippet.title;
    document.getElementById('input-lang').value = snippet.lang;
    document.getElementById('input-filename').value = snippet.filename || '';
    document.getElementById('input-code').value = snippet.code;
    
    document.querySelector('.modal-header h2').textContent = "Edit Practice Code";
    snippetModal.classList.add('active');
}

// Delete Snippet
function deleteSnippet(id) {
    const snippet = snippets.find(s => s.id === id);
    if (!snippet) return;
    
    if (confirm(`Are you sure you want to delete the snippet "${snippet.title}"?`)) {
        snippets = snippets.filter(s => s.id !== id);
        saveSnippetsToStorage();
        renderSidebar();
        
        if (activeSnippet && activeSnippet.id === id) {
            if (snippets.length > 0) {
                selectSnippet(snippets[0].id);
            } else {
                activeSnippet = null;
                activeTitle.textContent = "No snippets found";
                activeLang.textContent = "none";
                terminalFilename.textContent = "empty";
                codePlayground.innerHTML = '<div class="empty-state" style="color: var(--text-muted); text-align: center; padding: 2rem;">Click "+ New Code" in the sidebar to add a snippet!</div>';
            }
        }
    }
}

// Select Active Snippet
function selectSnippet(id) {
    activeSnippet = snippets.find(s => s.id === id);
    if (!activeSnippet) return;
    
    // Update active state in sidebar
    document.querySelectorAll('.snippet-item').forEach(item => {
        item.classList.toggle('active', item.dataset.id === id);
    });

    activeTitle.textContent = activeSnippet.title;
    activeLang.textContent = activeSnippet.lang;
    terminalFilename.textContent = activeSnippet.filename || `${activeSnippet.title.toLowerCase().replace(/\s+/g, '_')}.${getExt(activeSnippet.lang)}`;

    resetSession();
}

// Helper to get file extension
function getExt(lang) {
    const mapping = { python: 'py', javascript: 'js', html: 'html', css: 'css', 'c++': 'cpp', go: 'go' };
    return mapping[lang.toLowerCase()] || 'txt';
}

// Build Code Layout into SPAN elements
function buildCodeLayout() {
    codePlayground.innerHTML = '';
    flatChars = [];
    activeCharIndex = 0;

    const lines = activeSnippet.code.split('\n');
    const isPython = activeSnippet.lang.toLowerCase() === 'python';
    let inDocstring = false;
    let docstringChar = ''; 

    lines.forEach((lineText, lineIdx) => {
        const lineDiv = document.createElement('div');
        lineDiv.className = 'code-line';
        
        // Add line number
        const lineNum = document.createElement('span');
        lineNum.className = 'line-number';
        lineNum.textContent = String(lineIdx + 1).padStart(3, ' ') + '  ';
        lineNum.style.color = 'var(--text-muted)';
        lineNum.style.userSelect = 'none';
        lineNum.style.fontFamily = 'var(--font-code)';
        lineDiv.appendChild(lineNum);

        // Detect Python docstrings and standard comments
        let docstringStartIdx = -1;
        let docstringEndIdx = -1;
        
        if (isPython) {
            const tripleDouble = lineText.indexOf('"""');
            const tripleSingle = lineText.indexOf("'''");
            
            if (inDocstring) {
                const endIdx = lineText.indexOf(docstringChar);
                if (endIdx !== -1) {
                    docstringEndIdx = endIdx + 2; 
                    inDocstring = false;
                }
            } else {
                if (tripleDouble !== -1) {
                    docstringStartIdx = tripleDouble;
                    docstringChar = '"""';
                    inDocstring = true;
                    const secondDouble = lineText.indexOf('"""', tripleDouble + 3);
                    if (secondDouble !== -1) {
                        docstringEndIdx = secondDouble + 2;
                        inDocstring = false;
                    }
                } else if (tripleSingle !== -1) {
                    docstringStartIdx = tripleSingle;
                    docstringChar = "'''";
                    inDocstring = true;
                    const secondSingle = lineText.indexOf("'''", tripleSingle + 3);
                    if (secondSingle !== -1) {
                        docstringEndIdx = secondSingle + 2;
                        inDocstring = false;
                    }
                }
            }
        }

        let commentStartIdx = -1;
        if (!inDocstring && docstringStartIdx === -1) {
            if (isPython) {
                commentStartIdx = lineText.indexOf('#');
            } else {
                commentStartIdx = lineText.indexOf('//');
            }
        }

        // Process line text character-by-character
        for (let i = 0; i < lineText.length; i++) {
            const char = lineText[i];
            const span = document.createElement('span');
            span.className = 'char-span';
            
            let isComment = false;
            if (inDocstring) {
                isComment = true;
            } else if (docstringStartIdx !== -1) {
                if (docstringEndIdx !== -1) {
                    isComment = (i >= docstringStartIdx && i <= docstringEndIdx);
                } else {
                    isComment = (i >= docstringStartIdx);
                }
            } else if (commentStartIdx !== -1 && i >= commentStartIdx) {
                isComment = true;
            }

            if (char === ' ') {
                span.classList.add('space');
                span.innerHTML = '&nbsp;';
            } else {
                span.textContent = char;
            }
            
            if (isComment) {
                span.classList.add('comment-text');
                span.classList.add('correct');
            }
            
            lineDiv.appendChild(span);
            
            // Only add non-comment characters to the flat typing list
            if (!isComment) {
                flatChars.push({
                    char: char,
                    element: span,
                    isNewline: false,
                    lineIndex: lineIdx
                });
            }
        }

        // Add a newline character at the end of the line (except for the last line)
        if (lineIdx < lines.length - 1) {
            const nlSpan = document.createElement('span');
            nlSpan.className = 'char-span newline-char';
            nlSpan.innerHTML = '↵'; 
            nlSpan.style.opacity = '0.15';
            nlSpan.style.fontSize = '0.85rem';
            lineDiv.appendChild(nlSpan);
            
            flatChars.push({
                char: '\n',
                element: nlSpan,
                isNewline: true,
                lineIndex: lineIdx
            });
        }

        codePlayground.appendChild(lineDiv);
    });

    if (flatChars.length > 0) {
        flatChars[0].element.classList.add('cursor-active');
    }
}

// Reset typing session
function resetSession() {
    isPlaying = false;
    startTime = null;
    correctPresses = 0;
    totalPresses = 0;
    
    if (timerInterval) {
        clearInterval(timerInterval);
        timerInterval = null;
    }

    statWpm.textContent = '0';
    statAccuracy.textContent = '100%';
    statProgress.textContent = '0%';
    
    completionOverlay.style.display = 'none';

    // Apply mode class to playground
    if (currentMode === 'blind') {
        codePlayground.classList.add('mode-blind-active');
    } else {
        codePlayground.classList.remove('mode-blind-active');
    }

    buildCodeLayout();
    keyboardGate.value = '';
    keyboardGate.focus();
}

// Start Timer
function startSessionTimer() {
    isPlaying = true;
    startTime = new Date();
    timerInterval = setInterval(updateStats, 500);
}

// Calculate and Update Real-time Stats
function updateStats() {
    if (!startTime) return;
    
    const elapsedMinutes = (new Date() - startTime) / 60000;
    if (elapsedMinutes <= 0) return;

    // Standard WPM: 5 characters = 1 word
    const wpm = Math.round((correctPresses / 5) / elapsedMinutes);
    statWpm.textContent = wpm;

    const accuracy = totalPresses > 0 ? Math.round((correctPresses / totalPresses) * 100) : 100;
    statAccuracy.textContent = `${accuracy}%`;

    const progress = Math.round((activeCharIndex / flatChars.length) * 100);
    statProgress.textContent = `${progress}%`;
}

function processKeyInput(typedChar, isEnterKey = false) {
    if (activeCharIndex >= flatChars.length) return;

    if (!isPlaying) {
        startSessionTimer();
    }

    totalPresses++;
    const targetItem = flatChars[activeCharIndex];
    
    // Check if correct
    let isCorrect = false;
    
    if (targetItem.isNewline) {
        // Must press Enter key for newline
        isCorrect = (typedChar === '\n' || isEnterKey);
    } else {
        isCorrect = (typedChar === targetItem.char);
    }

    if (isCorrect) {
        // Mark correct
        targetItem.element.classList.remove('incorrect');
        targetItem.element.classList.add('correct');
        correctPresses++;
        
        advanceCursor();
    }
}

// Keyboard input logic
function handleInput(e) {
    if (activeCharIndex >= flatChars.length) return;

    const inputVal = keyboardGate.value;
    if (inputVal.length === 0) return;

    const typedChar = inputVal[inputVal.length - 1];
    keyboardGate.value = ''; // clear input

    processKeyInput(typedChar, e.inputType === 'insertLineBreak');
}

// Move cursor forward
function advanceCursor() {
    // Clean current cursor
    if (flatChars[activeCharIndex]) {
        flatChars[activeCharIndex].element.classList.remove('cursor-active');
    }

    activeCharIndex++;

    if (activeCharIndex >= flatChars.length) {
        finishSession();
        return;
    }

    // Set new cursor
    const nextItem = flatChars[activeCharIndex];
    nextItem.element.classList.add('cursor-active');
    
    // Auto-scroll terminal body if cursor goes out of view
    nextItem.element.scrollIntoView({ behavior: 'smooth', block: 'nearest' });

    // AUTO-INDENT SKIPPER:
    // If the next character is a space, and it is part of a leading indentation block, auto-skip it.
    skipLeadingSpaces();
}

// Skip leading indentation spaces automatically on new line
function skipLeadingSpaces() {
    if (activeCharIndex >= flatChars.length) return;

    let currentItem = flatChars[activeCharIndex];
    
    // If we just landed on a space at the start of a line
    if (currentItem.char === ' ' && (activeCharIndex === 0 || flatChars[activeCharIndex - 1].char === '\n')) {
        
        // Remove the cursor from the initial space before skipping
        currentItem.element.classList.remove('cursor-active');

        while (currentItem && currentItem.char === ' ' && !currentItem.isNewline) {
            currentItem.element.classList.add('correct');
            activeCharIndex++;
            if (activeCharIndex >= flatChars.length) {
                finishSession();
                return;
            }
            currentItem = flatChars[activeCharIndex];
        }
        
        // Set cursor on the first non-space character
        if (currentItem) {
            currentItem.element.classList.add('cursor-active');
            currentItem.element.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
    }
}

// Undo last typed character
function handleBackspace() {
    if (activeCharIndex === 0) return;

    // Reset current cursor styling
    if (flatChars[activeCharIndex]) {
        flatChars[activeCharIndex].element.classList.remove('cursor-active', 'incorrect');
    }

    // Back up the pointer
    activeCharIndex--;

    // If it was a skipped space during auto-indent, jump all the way back to the newline
    let currentItem = flatChars[activeCharIndex];
    while (activeCharIndex > 0 && currentItem.element.classList.contains('correct') && 
           currentItem.char === ' ' && (activeCharIndex === 0 || flatChars[activeCharIndex - 1].char === '\n' || flatChars[activeCharIndex - 1].element.classList.contains('correct'))) {
        
        // Remove correct class as we backtrack
        currentItem.element.classList.remove('correct', 'incorrect');
        activeCharIndex--;
        currentItem = flatChars[activeCharIndex];
    }
    
    // Reset status of the target item
    flatChars[activeCharIndex].element.classList.remove('correct', 'incorrect');
    flatChars[activeCharIndex].element.classList.add('cursor-active');
    flatChars[activeCharIndex].element.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    
    updateStats();
}

// Reveal next correct character
function revealNextChar() {
    if (activeCharIndex >= flatChars.length) return;
    
    const targetItem = flatChars[activeCharIndex];
    targetItem.element.classList.remove('incorrect');
    targetItem.element.classList.add('correct');
    
    // Register as a correct press to avoid ruining accuracy for hints
    correctPresses++;
    totalPresses++;
    
    advanceCursor();
    updateStats();
}

// Reveal the rest of the current line
function revealCurrentLine() {
    if (activeCharIndex >= flatChars.length) return;
    
    // Remove current cursor highlight before advancing
    flatChars[activeCharIndex].element.classList.remove('cursor-active');

    const currentLineIdx = flatChars[activeCharIndex].lineIndex;
    
    while (activeCharIndex < flatChars.length && flatChars[activeCharIndex].lineIndex === currentLineIdx) {
        const item = flatChars[activeCharIndex];
        item.element.classList.remove('incorrect');
        item.element.classList.add('correct');
        correctPresses++;
        totalPresses++;
        
        // Increment index manually without calling advanceCursor to avoid multi-triggering skipLeadingSpaces
        activeCharIndex++;
    }
    
    if (activeCharIndex >= flatChars.length) {
        finishSession();
        return;
    }
    
    // Highlight next cursor
    const nextItem = flatChars[activeCharIndex];
    nextItem.element.classList.add('cursor-active');
    nextItem.element.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    
    skipLeadingSpaces();
    updateStats();
}

// Complete the session successfully
function finishSession() {
    isPlaying = false;
    if (timerInterval) {
        clearInterval(timerInterval);
        timerInterval = null;
    }
    
    updateStats();
    completionOverlay.style.display = 'flex';
}

// Event Listeners setup
function setupEventListeners() {
    // Focus keyboard gate on terminal click
    codePlayground.addEventListener('click', () => {
        keyboardGate.focus();
    });

    // Capture standard keys
    keyboardGate.addEventListener('input', handleInput);
    
    // Capture special keys
    keyboardGate.addEventListener('keydown', (e) => {
        if (e.key === 'Backspace') {
            e.preventDefault();
            handleBackspace();
        } else if (e.key === 'Tab') {
            e.preventDefault();
            revealNextChar();
        } else if (e.key === 'Escape') {
            e.preventDefault();
            resetSession();
        } else if (e.key === ' ' && e.ctrlKey) {
            e.preventDefault();
            revealCurrentLine();
        } else if (e.key === 'Enter') {
            e.preventDefault();
            processKeyInput('\n', true);
        }
    });

    // Hint buttons
    btnHintChar.addEventListener('click', () => {
        revealNextChar();
        keyboardGate.focus();
    });
    
    btnHintLine.addEventListener('click', () => {
        revealCurrentLine();
        keyboardGate.focus();
    });

    // Hold Shift to peek / Alt+F to toggle focus / Alt+T to toggle theme
    window.addEventListener('keydown', (e) => {
        if (e.key === 'Shift') {
            codePlayground.classList.remove('mode-blind-active');
        } else if (e.altKey && (e.key === 'f' || e.key === 'F')) {
            e.preventDefault();
            toggleFocusMode();
        } else if (e.altKey && (e.key === 't' || e.key === 'T')) {
            e.preventDefault();
            toggleTheme();
        }
    });

    window.addEventListener('keyup', (e) => {
        if (e.key === 'Shift' && currentMode === 'blind') {
            codePlayground.classList.add('mode-blind-active');
        }
    });

    btnPeek.addEventListener('mousedown', () => {
        codePlayground.classList.remove('mode-blind-active');
    });

    btnPeek.addEventListener('mouseup', () => {
        if (currentMode === 'blind') {
            codePlayground.classList.add('mode-blind-active');
        }
    });
    
    btnPeek.addEventListener('mouseleave', () => {
        if (currentMode === 'blind') {
            codePlayground.classList.add('mode-blind-active');
        }
    });

    // Mode Selector
    modeGuided.addEventListener('click', () => {
        currentMode = 'guided';
        modeGuided.classList.add('active');
        modeBlind.classList.remove('active');
        resetSession();
    });

    modeBlind.addEventListener('click', () => {
        currentMode = 'blind';
        modeBlind.classList.add('active');
        modeGuided.classList.remove('active');
        resetSession();
    });

    // Restart button
    btnRestart.addEventListener('click', resetSession);

    // Focus mode button
    btnFocus.addEventListener('click', toggleFocusMode);

    // Theme button
    btnTheme.addEventListener('click', toggleTheme);

    // Modal Actions
    btnNewSnippet.addEventListener('click', () => {
        editingSnippetId = null;
        document.querySelector('.modal-header h2').textContent = "Add New Practice Code";
        snippetModal.classList.add('active');
    });

    const closeModal = () => {
        snippetModal.classList.remove('active');
        snippetForm.reset();
        editingSnippetId = null;
        document.querySelector('.modal-header h2').textContent = "Add New Practice Code";
    };

    btnCloseModal.addEventListener('click', closeModal);
    btnCancelModal.addEventListener('click', closeModal);

    // Save or Update Snippet
    snippetForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const title = document.getElementById('input-title').value.trim();
        const lang = document.getElementById('input-lang').value;
        const filename = document.getElementById('input-filename').value.trim();
        const code = document.getElementById('input-code').value;

        const savedId = editingSnippetId || ('snippet-' + Date.now());

        if (editingSnippetId) {
            const snippet = snippets.find(s => s.id === editingSnippetId);
            if (snippet) {
                snippet.title = title;
                snippet.lang = lang;
                snippet.filename = filename || `${title.toLowerCase().replace(/\s+/g, '_')}.${getExt(lang)}`;
                snippet.code = code;
            }
            editingSnippetId = null;
        } else {
            const newSnippet = {
                id: savedId,
                title: title,
                lang: lang,
                filename: filename || `${title.toLowerCase().replace(/\s+/g, '_')}.${getExt(lang)}`,
                code: code
            };
            snippets.push(newSnippet);
        }

        saveSnippetsToStorage();
        renderSidebar();
        selectSnippet(savedId);
        closeModal();
    });
}

// Toggle Focus Mode
function toggleFocusMode() {
    isFocusMode = !isFocusMode;
    document.body.classList.toggle('focus-mode-active', isFocusMode);
    
    if (isFocusMode) {
        btnFocus.innerHTML = `
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 14h6v6m10-6h-6v6M4 10h6V4m10 6h-6V4"/></svg>
            Unfocus
        `;
    } else {
        btnFocus.innerHTML = `
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"/></svg>
            Focus
        `;
    }
    
    keyboardGate.focus();
}

// Load Theme from LocalStorage
function loadTheme() {
    const storedTheme = localStorage.getItem('coderecall_theme') || 'dark';
    setTheme(storedTheme);
}

// Set Theme Class and SVG Icon
function setTheme(theme) {
    currentTheme = theme;
    localStorage.setItem('coderecall_theme', theme);
    
    if (theme === 'light') {
        document.body.classList.add('light-theme');
        themeIcon.innerHTML = `<path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>`;
    } else {
        document.body.classList.remove('light-theme');
        themeIcon.innerHTML = `<path d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707m0-12.728l.707.707m11.314 11.314l.707.707M12 7a5 5 0 1 0 0 10 5 5 0 0 0 0-10z"/>`;
    }
}

// Toggle light / dark theme
function toggleTheme() {
    setTheme(currentTheme === 'dark' ? 'light' : 'dark');
}

// Escapes special HTML chars
function escapeHTML(str) {
    return str.replace(/[&<>'"]/g, 
        tag => ({
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            "'": '&#39;',
            '"': '&quot;'
        }[tag] || tag)
    );
}

// Start the app when loaded
window.addEventListener('DOMContentLoaded', init);
