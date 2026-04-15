// Jennifer Bathroom Bestie - Main Game Script

class JenniferGame {
    constructor() {
        this.apiBaseCandidates = [
            'http://localhost:8787/api',
            '/api'
        ];
        this.apiBase = this.apiBaseCandidates[0];
        this.conversationHistory = [];
        this.isWaiting = false;
        this.lastJenniferReply = '';

        this.setupEventListeners();
        this.init();
    }

    async init() {
        await this.loadClientConfig();
        const ok = await this.checkServerStatus();
        if (!ok) {
            this.showServerPrompt();
            return;
        }

        this.startGame();
    }

    setupEventListeners() {
        const sendButton = document.getElementById('sendButton');
        const playerInput = document.getElementById('playerInput');
        const backButton = document.getElementById('backButton');

        sendButton.addEventListener('click', () => this.sendMessage());
        playerInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !this.isWaiting) {
                this.sendMessage();
            }
        });
        backButton.addEventListener('click', () => this.returnToMenu());
    }

    showServerPrompt() {
        const loadingScreen = document.getElementById('loadingScreen');
        loadingScreen.innerHTML = `
            <h2>Jennifer Setup Required 🛠️</h2>
            <p>Jennifer needs a backend. The API key stays on the server (not in the browser).</p>
            <div style="margin: 20px 0; text-align: left; max-width: 500px; margin-left: auto; margin-right: auto;">
                <p><strong>Public mode (GitHub Pages + hosted backend):</strong></p>
                <ol>
                    <li>Open <strong>games/jennifer-bathroom-bestie/config.local.json</strong></li>
                    <li>Set <strong>API_BASE_URL</strong> to your hosted backend URL</li>
                    <li>Deploy <strong>games/jennifer-bathroom-bestie/server</strong></li>
                    <li>Set backend env vars: <strong>OPENROUTER_API_KEY</strong>, <strong>FRONTEND_ORIGIN</strong>, <strong>SITE_URL</strong></li>
                    <li>Commit + push config update</li>
                    <li>Reload this page</li>
                </ol>
                <p><strong>Private local mode:</strong></p>
                <ol>
                    <li>Open <strong>games/jennifer-bathroom-bestie/server</strong></li>
                    <li>Copy <strong>.env.example</strong> to <strong>.env</strong> and paste your OpenRouter key</li>
                    <li>Run <strong>npm install</strong> then <strong>npm start</strong></li>
                    <li>Keep this page on localhost:5500 open and running</li>
                </ol>
                <button id="retryServerBtn" style="padding: 10px 20px; cursor: pointer;">Retry Connection</button>
            </div>
        `;

        document.getElementById('retryServerBtn').addEventListener('click', async () => {
            await this.loadClientConfig();
            const ok = await this.checkServerStatus();
            if (ok) {
                this.startGame();
            }
        });
    }

    async loadClientConfig() {
        const candidates = ['./config.local.json', 'config.local.json'];
        for (const path of candidates) {
            try {
                const response = await fetch(path, { cache: 'no-store' });
                if (!response.ok) {
                    continue;
                }
                const config = await response.json();
                const baseUrl = String(config?.API_BASE_URL || '').trim().replace(/\/+$/, '');
                if (!baseUrl) {
                    continue;
                }

                const normalized = /\/api$/i.test(baseUrl) ? baseUrl : `${baseUrl}/api`;
                this.apiBaseCandidates = [
                    normalized,
                    ...this.apiBaseCandidates.filter((candidate) => candidate !== normalized)
                ];
                this.apiBase = this.apiBaseCandidates[0];
                return;
            } catch (_) {
                // Try next candidate
            }
        }
    }

    async checkServerStatus() {
        for (const base of this.apiBaseCandidates) {
            try {
                const response = await fetch(`${base}/health`, { cache: 'no-store' });
                if (!response.ok) {
                    continue;
                }
                const data = await response.json();
                if (data.ok) {
                    this.apiBase = base;
                    return true;
                }
            } catch (_) {
                // Try the next candidate.
            }
        }

        return false;
    }

    startGame() {
        document.getElementById('loadingScreen').style.display = 'none';
        document.getElementById('gameView').style.display = 'flex';
        this.addToConversation('Jennifer', 'Hey girl! Welcome to the bathroom!, I like you already.');
        this.setThinking(false);
    }

    addToConversation(speaker, text) {
        const finalText = speaker === 'Jennifer' ? this.clampJenniferText(text) : text;
        this.conversationHistory.push({ speaker, text: finalText });
        
        const logElement = document.getElementById('conversationLog');
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${speaker.toLowerCase()}`;
        messageDiv.innerHTML = `<strong>${speaker}:</strong> ${finalText}`;
        logElement.appendChild(messageDiv);
        logElement.scrollTop = logElement.scrollHeight;

        if (speaker === 'Jennifer') {
            document.getElementById('jenniferText').textContent = finalText;
            this.lastJenniferReply = finalText;
            this.playTalkAnimation();
        }
    }

    playTalkAnimation() {
        const character = document.querySelector('.jennifer-character');
        if (!character) {
            return;
        }

        character.classList.remove('talking');
        void character.offsetWidth;
        character.classList.add('talking');

        clearTimeout(this.talkTimer);
        this.talkTimer = setTimeout(() => {
            character.classList.remove('talking');
        }, 900);
    }

    clampJenniferText(text) {
        if (typeof text !== 'string') {
            return '';
        }
        const cleaned = text
            .replace(/[#*_`~]/g, '')
            .replace(/\((?:laughs?|pauses?|sighs?|smirks?|grins?|nods?|shrugs?|whispers?|chuckles?|gasps?|winks?|rolls?\s+eyes?|clears?\s+throat)[^)]*\)/gi, '')
            .replace(/\[(?:laughs?|pauses?|sighs?|smirks?|grins?|nods?|shrugs?|whispers?|chuckles?|gasps?|winks?|rolls?\s+eyes?|clears?\s+throat)[^\]]*\]/gi, '')
            .replace(/[\(\[]\s*(?:as\s+a\s+joke|if\s+user\s+proposes\s+chaos|if\s+the\s+user\s+proposes\s+chaos|if\s+the\s+user|meta|note:)[^\)\]]*[\)\]]/gi, '')
            .replace(/\bbaby girl\b/gi, 'you')
            .replace(/\bplayer\b/gi, 'you')
            .replace(/\bhottie\b/gi, 'guy')
            .replace(/\bcatch\b/gi, 'problem')
            .replace(/\bwelcome to my sanctuary\b/gi, 'yeah, welcome to this bathroom')
            .replace(/\bmidwest\b/gi, 'Rustwater Hollow')
            .replace(/(?:\s+[a-z]{6,}){2,}\s*$/g, '')
            .replace(/\s+/g, ' ')
            .trim();
        const sentenceParts = cleaned.match(/[^.!?]+[.!?]?/g) || [cleaned];
        const shortened = sentenceParts.slice(0, 4).join(' ').trim();
            const maxLen = 1400;
        if (shortened.length <= maxLen) {
            return shortened;
        }
        const boundary = shortened.slice(0, maxLen - 1).match(/.*[.!?](?=\s|$)/s);
        const clipped = boundary ? boundary[0].trimEnd() : shortened.slice(0, maxLen - 1).trimEnd();
        return /[.!?]$/.test(clipped) ? clipped : `${clipped}…`;
    }

    setThinking(isVisible) {
        const bubble = document.getElementById('thinkingBubble');
        const dialogueBox = document.querySelector('.dialogue-box');
        if (!bubble) {
            return;
        }
        bubble.textContent = isVisible
            ? 'Thinkinggg... hold up bestie, my tequila brain is loading 🍸⏳'
            : '';
        bubble.classList.toggle('visible', isVisible);
        if (dialogueBox) {
            dialogueBox.classList.toggle('is-hidden', isVisible);
        }
    }

    async sendMessage() {
        const playerInput = document.getElementById('playerInput');
        const playerText = playerInput.value.trim();

        if (!playerText || this.isWaiting) {
            return;
        }

        // Add player message
        this.addToConversation('You', playerText);
        playerInput.value = '';
        this.isWaiting = true;
        this.setThinking(true);

        const sendButton = document.getElementById('sendButton');
        sendButton.disabled = true;
        sendButton.textContent = 'Loading...';

        try {
            const response = await this.getJenniferResponse(playerText);
            this.addToConversation('Jennifer', response);
        } catch (error) {
            console.error('Error:', error);
            this.addToConversation('Jennifer', 'OMG sorry babe, I\'m too drunk to talk rn! 😵 Ask me again!');
        }

        this.isWaiting = false;
        this.setThinking(false);
        sendButton.disabled = false;
        sendButton.textContent = 'Send';
        document.getElementById('playerInput').focus();
    }

    async getJenniferResponse(playerMessage) {
        const messages = [
            ...this.conversationHistory.map(msg => ({
                role: msg.speaker === 'Jennifer' ? 'assistant' : 'user',
                content: msg.text
            })),
            { role: 'user', content: playerMessage }
        ];

        const response = await fetch(`${this.apiBase}/jennifer`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                messages
            })
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error?.message || 'API Error');
        }

        const data = await response.json();
        return data.reply;
    }

    returnToMenu() {
        if (confirm('Leave Jennifer? She\'ll miss you! 💔')) {
            window.location.href = '../../index.html';
        }
    }
}

// Initialize game when DOM is ready
window.addEventListener('DOMContentLoaded', () => {
    console.log('🚽 Jennifer\'s Bathroom Bestie loading...');
    window.game = new JenniferGame();
});
