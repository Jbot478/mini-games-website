const answers = [
    "Absolutely not.",
    "Wow. You really asked that?",
    "The universe says no ❤️",
    "Sure. If you're into disappointment.",
    "Ask again when you’re smarter.",
    "I rolled my eyes so hard and I don't have eyes.",
    "This feels like a bad idea.",
    "Even I wouldn’t bet on that.",
    "Technically yes. Emotionally? No.",
    "Let’s pretend you didn’t ask that."
];

const askButton = document.getElementById("askButton");
const questionInput = document.getElementById("questionInput");
const answerText = document.getElementById("answerText");
const eightBall = document.getElementById("eightBall");

// Web Audio for magic sounds
const audioContext = new (window.AudioContext || window.webkitAudioContext)();

function playMagicSound() {
    // Create multiple oscillators for a magical chime effect
    const frequencies = [523.25, 659.25, 783.99]; // C, E, G (major chord)
    
    frequencies.forEach((freq, index) => {
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.value = freq;
        oscillator.type = 'sine';
        
        gainNode.gain.setValueAtTime(0.15, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 1.5);
        
        oscillator.start(audioContext.currentTime + index * 0.1);
        oscillator.stop(audioContext.currentTime + 1.5);
    });
}

function playMagicalShimmer() {
    // Ascending sparkle notes for magical thinking effect
    const sparkleFreqs = [800, 1000, 1200, 1400, 1600, 1400, 1200];
    
    sparkleFreqs.forEach((freq, index) => {
        const osc = audioContext.createOscillator();
        const gain = audioContext.createGain();
        
        osc.connect(gain);
        gain.connect(audioContext.destination);
        
        osc.frequency.value = freq;
        osc.type = 'triangle';
        
        const startTime = audioContext.currentTime + (index * 0.15);
        gain.gain.setValueAtTime(0.08, startTime);
        gain.gain.exponentialRampToValueAtTime(0.01, startTime + 0.3);
        
        osc.start(startTime);
        osc.stop(startTime + 0.3);
    });
}

function askQuestion() {
    if (questionInput.value.trim() === "") return;

    // Play magic sound
    playMagicSound();

    // Add shake animation
    eightBall.classList.remove("shake");
    void eightBall.offsetWidth; // reset animation
    eightBall.classList.add("shake");

    // Add glow to answer circle
    answerText.classList.add("thinking");
    answerText.textContent = "Thinking…";
    
    // Play magical shimmer after initial shake
    setTimeout(() => playMagicalShimmer(), 400);

    setTimeout(() => {
        const randomAnswer =
            answers[Math.floor(Math.random() * answers.length)];
        answerText.textContent = randomAnswer;
        answerText.classList.remove("thinking");
    }, 1500);
}

askButton.addEventListener("click", askQuestion);

questionInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
        askQuestion();
    }
});
