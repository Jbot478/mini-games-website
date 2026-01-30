const responses = [
    "Absolutely not. Next question.",
    "Sure, if you enjoy disappointment.",
    "Ask again when the stars care.",
    "Technically possible. Practically? No.",
    "The 8 Ball rolled its eyes.",
    "Yes, but only because chaos demanded it.",
    "Your guess is as good as mine. Actually, better.",
    "The answer is buried under your unread emails.",
    "Try again after a snack and a nap.",
    "No. Like, really no.",
    "Yes. Don’t let it go to your head.",
    "Probably. The universe is lazy though.",
    "If you stop overthinking for five seconds, maybe.",
    "The 8 Ball says: " + "¯\\_(ツ)_/¯",
    "It’s giving… uncertain."
];

const answerEl = document.getElementById("answer");
const placeholderEl = document.getElementById("placeholder");
const questionInput = document.getElementById("question");
const askButton = document.getElementById("ask");
const ballEl = document.querySelector(".ball");

let audioContext;

function playMagicSound() {
    if (!audioContext) {
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
    }

    const now = audioContext.currentTime;
    const gain = audioContext.createGain();
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(0.25, now + 0.05);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.6);
    gain.connect(audioContext.destination);

    const osc1 = audioContext.createOscillator();
    const osc2 = audioContext.createOscillator();
    osc1.type = "triangle";
    osc2.type = "sine";
    osc1.frequency.setValueAtTime(440, now);
    osc2.frequency.setValueAtTime(660, now + 0.02);
    osc1.frequency.exponentialRampToValueAtTime(880, now + 0.4);
    osc2.frequency.exponentialRampToValueAtTime(990, now + 0.45);

    osc1.connect(gain);
    osc2.connect(gain);
    osc1.start(now);
    osc2.start(now + 0.02);
    osc1.stop(now + 0.6);
    osc2.stop(now + 0.6);
}

function getResponse() {
    const question = questionInput.value.trim();
    if (!question) {
        answerEl.textContent = "Ask an actual question. I dare you.";
        ballEl.classList.add("show-answer");
        return;
    }

    ballEl.classList.remove("show-answer");
    placeholderEl.textContent = "8";
    answerEl.textContent = "";
    ballEl.classList.remove("shake");
    void ballEl.offsetWidth;
    ballEl.classList.add("shake");
    playMagicSound();

    setTimeout(() => {
        const randomIndex = Math.floor(Math.random() * responses.length);
        answerEl.textContent = responses[randomIndex];
        ballEl.classList.add("show-answer");
    }, 600);
}

askButton.addEventListener("click", getResponse);
questionInput.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
        getResponse();
    }
});
