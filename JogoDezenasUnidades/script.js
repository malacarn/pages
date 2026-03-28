// Game State
const state = {
    level: 1,
    score: 0,
    targetNumber: 0,
    counts: {
        1000: 0,
        100: 0,
        10: 0,
        1: 0
    },
    // Available units per level. Level 1: units. Level 2: +tens. Level 3: +hundreds. Level 4: +thousands.
    levelConfig: [
        { maxTarget: 9, availableKeys: [1] },
        { maxTarget: 99, availableKeys: [10, 1] },
        { maxTarget: 999, availableKeys: [100, 10, 1] },
        { maxTarget: 9999, availableKeys: [1000, 100, 10, 1] }
    ]
};

// DOM Elements
const elements = {
    levelDisplay: document.getElementById('level-display'),
    scoreDisplay: document.getElementById('score-display'),
    targetNumber: document.getElementById('target-number'),
    currentNumber: document.getElementById('current-number'),
    verifyBtn: document.getElementById('verify-btn'),
    
    // Cards
    cards: {
        1000: document.getElementById('card-1000'),
        100: document.getElementById('card-100'),
        10: document.getElementById('card-10'),
        1: document.getElementById('card-1')
    },
    
    // Counts
    countsDisplay: {
        1000: document.getElementById('count-1000'),
        100: document.getElementById('count-100'),
        10: document.getElementById('count-10'),
        1: document.getElementById('count-1')
    },
    
    // Visuals container
    visuals: {
        1000: document.getElementById('visuals-1000'),
        100: document.getElementById('visuals-100'),
        10: document.getElementById('visuals-10'),
        1: document.getElementById('visuals-1')
    },

    // Modal
    modal: document.getElementById('feedback-modal'),
    modalTitle: document.getElementById('feedback-title'),
    modalMessage: document.getElementById('feedback-message'),
    modalEmoji: document.getElementById('feedback-emoji'),
    rewardPoints: document.getElementById('reward-points'),
    nextBtn: document.getElementById('next-btn'),
    tryAgainBtn: document.getElementById('try-again-btn')
};

// Start the game
function initGame() {
    bindEvents();
    startNewRound();
}

// Generate Target based on Level
function startNewRound() {
    // Determine level config
    const lvlIndex = Math.min(state.level - 1, 3);
    const config = state.levelConfig[lvlIndex];
    
    // Reset Counts
    state.counts = { 1000: 0, 100: 0, 10: 0, 1: 0 };
    updateUI();
    
    // Show/Hide Cards based on level
    Object.keys(elements.cards).forEach(key => {
        if(config.availableKeys.includes(parseInt(key))) {
            elements.cards[key].style.display = 'flex';
        } else {
            elements.cards[key].style.display = 'none';
        }
    });

    // Generate Target Number
    // Always include a number that uses the highest available unit to challenge the player
    let maxNum = config.maxTarget;
    let minNum = lvlIndex > 0 ? state.levelConfig[lvlIndex-1].maxTarget + 1 : 1;
    
    state.targetNumber = Math.floor(Math.random() * (maxNum - minNum + 1)) + minNum;
    
    // Update display
    elements.targetNumber.textContent = formatNumber(state.targetNumber);
    // Tiny animation
    elements.targetNumber.classList.remove('pulse-text');
    void elements.targetNumber.offsetWidth; // trigger reflow
    elements.targetNumber.classList.add('pulse-text');
}

// Bind Button Events
function bindEvents() {
    // Plus and Minus buttons
    document.querySelectorAll('.btn-step').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const type = parseInt(e.target.getAttribute('data-type'));
            const isPlus = e.target.classList.contains('btn-plus');
            
            if (isPlus) {
                // Limit amount to avoid visual overflow (e.g. max 9 of each except if needed)
                if (state.counts[type] < 9) {
                    state.counts[type]++;
                    addVisualBlock(type);
                }
            } else {
                if (state.counts[type] > 0) {
                    state.counts[type]--;
                    removeVisualBlock(type);
                }
            }
            updateTotal();
            updateCountDisplay(type);
        });
    });

    // Verify Button
    elements.verifyBtn.addEventListener('click', verifyAnswer);

    // Modal buttons
    elements.nextBtn.addEventListener('click', () => {
        elements.modal.classList.add('hidden');
        startNewRound();
    });

    elements.tryAgainBtn.addEventListener('click', () => {
        elements.modal.classList.add('hidden');
    });
}

function updateCountDisplay(type) {
    elements.countsDisplay[type].textContent = state.counts[type];
}

function updateTotal() {
    const total = calculateTotal();
    elements.currentNumber.textContent = formatNumber(total);
}

function calculateTotal() {
    return (state.counts[1000] * 1000) + 
           (state.counts[100] * 100) + 
           (state.counts[10] * 10) + 
           (state.counts[1] * 1);
}

function formatNumber(num) {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}

function updateUI() {
    // Reset Displays
    [1000, 100, 10, 1].forEach(type => {
        updateCountDisplay(type);
        elements.visuals[type].innerHTML = ''; // clear visual blocks
    });
    updateTotal();
    elements.levelDisplay.textContent = state.level;
    elements.scoreDisplay.textContent = state.score;
}

// Visual blocks logic
function addVisualBlock(type) {
    const container = elements.visuals[type];
    const block = document.createElement('div');
    
    // Class names: block-milhar, block-centena, etc
    let typeName = "";
    if(type === 1000) typeName = "milhar";
    if(type === 100) typeName = "centena";
    if(type === 10) typeName = "dezena";
    if(type === 1) typeName = "unidade";
    
    block.className = `block-visual block-${typeName}`;
    container.appendChild(block);
    
    // play a soft pop sound if possible (omitted for now)
}

function removeVisualBlock(type) {
    const container = elements.visuals[type];
    if (container.lastChild) {
        container.removeChild(container.lastChild);
    }
}

function verifyAnswer() {
    const total = calculateTotal();
    
    if (total === state.targetNumber) {
        showWin();
    } else {
        showLose();
    }
}

function showWin() {
    // Update stats
    const pointsGained = state.level * 10;
    state.score += pointsGained;
    
    // Every 3 wins, increase level
    if (state.score % 30 === 0 && state.level < 4) {
        state.level++;
    }
    
    elements.scoreDisplay.textContent = state.score;
    elements.levelDisplay.textContent = state.level;

    // Show feedback
    elements.modalTitle.textContent = "Fantástico!";
    elements.modalTitle.style.color = "var(--color-unidade)";
    elements.modalEmoji.textContent = ["🎉", "⭐", "🚀", "🏆"][Math.floor(Math.random() * 4)];
    elements.modalMessage.textContent = `Você formou o número ${formatNumber(state.targetNumber)} perfeitamente!`;
    
    elements.rewardPoints.textContent = `+${pointsGained} Pontos!`;
    elements.rewardPoints.classList.remove('hidden');
    
    elements.nextBtn.classList.remove('hidden');
    elements.tryAgainBtn.classList.add('hidden');
    
    elements.modal.classList.remove('hidden');
}

function showLose() {
    const total = calculateTotal();
    
    elements.modalTitle.textContent = "Quase lá...";
    elements.modalTitle.style.color = "var(--color-dezena)";
    elements.modalEmoji.textContent = "🤔";
    
    if(total > state.targetNumber) {
        elements.modalMessage.textContent = `Você montou ${formatNumber(total)}, que é maior que ${formatNumber(state.targetNumber)}. Tente remover alguns blocos.`;
    } else {
        elements.modalMessage.textContent = `Você montou ${formatNumber(total)}, que é menor que ${formatNumber(state.targetNumber)}. Tente adicionar mais blocos.`;
    }
    
    elements.rewardPoints.classList.add('hidden');
    elements.nextBtn.classList.add('hidden');
    elements.tryAgainBtn.classList.remove('hidden');
    
    elements.modal.classList.remove('hidden');
}

// Start
document.addEventListener('DOMContentLoaded', initGame);
