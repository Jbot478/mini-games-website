const quizData = {
    questions: [
        {
            text: "You're at a grocery store. How do you navigate the aisles?",
            answers: [
                { text: "Efficient route, in and out", scores: { sidewalk: 0, lecture: 1, broadcast: 0, character: 0, sidequest: 0, misplace: 0, manager: 0, magnet: 0 } },
                { text: "Stop to chat with someone you vaguely know", scores: { sidewalk: 2, lecture: 1, broadcast: 0, character: 1, sidequest: 0, misplace: 0, manager: 0, magnet: 0 } },
                { text: "Definitely forget something and go back twice", scores: { sidewalk: 0, lecture: 0, broadcast: 0, character: 0, sidequest: 0, misplace: 3, manager: 0, magnet: 1 } },
                { text: "Make the entire store your personal runway", scores: { sidewalk: 0, lecture: 0, broadcast: 0, character: 3, sidequest: 0, misplace: 0, manager: 0, magnet: 0 } }
            ]
        },
        {
            text: "A friend asks your opinion on something. You...",
            answers: [
                { text: "Give a thoughtful, concise answer", scores: { sidewalk: 0, lecture: 0, broadcast: 0, character: 0, sidequest: 0, misplace: 0, manager: 0, magnet: 0 } },
                { text: "Start with your opinion then keep going for 20 minutes", scores: { sidewalk: 0, lecture: 3, broadcast: 1, character: 0, sidequest: 0, misplace: 0, manager: 0, magnet: 0 } },
                { text: "Get distracted halfway through and ask them something random", scores: { sidewalk: 0, lecture: 0, broadcast: 0, character: 0, sidequest: 3, misplace: 0, manager: 0, magnet: 0 } },
                { text: "Make it sound way more dramatic than it needs to be", scores: { sidewalk: 0, lecture: 0, broadcast: 1, character: 2, sidequest: 0, misplace: 0, manager: 0, magnet: 0 } }
            ]
        },
        {
            text: "When someone mentions a topic, you typically...",
            answers: [
                { text: "Listen and nod politely", scores: { sidewalk: 0, lecture: 0, broadcast: 0, character: 0, sidequest: 0, misplace: 0, manager: 0, magnet: 0 } },
                { text: "Launch into an unsolicited 10-minute explanation", scores: { sidewalk: 0, lecture: 3, broadcast: 0, character: 0, sidequest: 0, misplace: 0, manager: 0, magnet: 0 } },
                { text: "Suddenly remember something completely unrelated", scores: { sidewalk: 0, lecture: 0, broadcast: 0, character: 0, sidequest: 3, misplace: 0, manager: 0, magnet: 0 } },
                { text: "Announce your thoughts loudly to the whole room", scores: { sidewalk: 0, lecture: 0, broadcast: 2, character: 2, sidequest: 0, misplace: 0, manager: 0, magnet: 0 } }
            ]
        },
        {
            text: "Your workspace or personal area looks like...",
            answers: [
                { text: "Neat and organized", scores: { sidewalk: 0, lecture: 0, broadcast: 0, character: 0, sidequest: 0, misplace: 0, manager: 2, magnet: 0 } },
                { text: "Surrounded by things you've misplaced", scores: { sidewalk: 0, lecture: 0, broadcast: 0, character: 0, sidequest: 0, misplace: 3, manager: 0, magnet: 0 } },
                { text: "Somehow in chaos despite your best efforts", scores: { sidewalk: 0, lecture: 0, broadcast: 0, character: 0, sidequest: 0, misplace: 1, manager: 0, magnet: 2 } },
                { text: "Perfectly curated to make an impression", scores: { sidewalk: 0, lecture: 0, broadcast: 0, character: 3, sidequest: 0, misplace: 0, manager: 0, magnet: 0 } }
            ]
        },
        {
            text: "Your phone is permanently...",
            answers: [
                { text: "Always charged and organized", scores: { sidewalk: 0, lecture: 0, broadcast: 0, character: 0, sidequest: 0, misplace: 0, manager: 2, magnet: 0 } },
                { text: "Missing from your pocket at least once a week", scores: { sidewalk: 0, lecture: 0, broadcast: 0, character: 0, sidequest: 0, misplace: 3, manager: 0, magnet: 0 } },
                { text: "On silent mode because you forgot it was there", scores: { sidewalk: 1, lecture: 0, broadcast: 0, character: 0, sidequest: 1, misplace: 2, manager: 0, magnet: 0 } },
                { text: "In your hand, being used while you're also using it", scores: { sidewalk: 0, lecture: 0, broadcast: 1, character: 2, sidequest: 0, misplace: 1, manager: 0, magnet: 0 } }
            ]
        },
        {
            text: "At a social event, you're the person who...",
            answers: [
                { text: "Stays in one spot and has deep conversations", scores: { sidewalk: 0, lecture: 1, broadcast: 0, character: 0, sidequest: 0, misplace: 0, manager: 0, magnet: 0 } },
                { text: "Blocks the doorway by just standing there", scores: { sidewalk: 3, lecture: 0, broadcast: 0, character: 0, sidequest: 0, misplace: 0, manager: 0, magnet: 0 } },
                { text: "Gets stuck helping the host with unexpected disasters", scores: { sidewalk: 0, lecture: 0, broadcast: 0, character: 0, sidequest: 0, misplace: 0, manager: 0, magnet: 3 } },
                { text: "Somehow becomes the center of attention without trying", scores: { sidewalk: 0, lecture: 0, broadcast: 0, character: 3, sidequest: 0, misplace: 0, manager: 0, magnet: 0 } }
            ]
        },
        {
            text: "You find something that needs doing. Your instinct is to...",
            answers: [
                { text: "Quietly fix it yourself", scores: { sidewalk: 0, lecture: 0, broadcast: 0, character: 0, sidequest: 0, misplace: 0, manager: 0, magnet: 0 } },
                { text: "Point out what someone else should be doing about it", scores: { sidewalk: 0, lecture: 2, broadcast: 0, character: 0, sidequest: 0, misplace: 0, manager: 2, magnet: 0 } },
                { text: "Announce it to the entire room", scores: { sidewalk: 0, lecture: 0, broadcast: 2, character: 1, sidequest: 0, misplace: 0, manager: 1, magnet: 0 } },
                { text: "Somehow get involved in fixing three other things instead", scores: { sidewalk: 0, lecture: 0, broadcast: 0, character: 0, sidequest: 3, misplace: 0, manager: 0, magnet: 1 } }
            ]
        },
        {
            text: "When plans change last minute, you...",
            answers: [
                { text: "Roll with it easily", scores: { sidewalk: 0, lecture: 0, broadcast: 0, character: 1, sidequest: 2, misplace: 0, manager: 0, magnet: 0 } },
                { text: "Explain all the reasons it won't work", scores: { sidewalk: 0, lecture: 2, broadcast: 0, character: 0, sidequest: 0, misplace: 0, manager: 1, magnet: 0 } },
                { text: "End up in a completely unrelated situation", scores: { sidewalk: 0, lecture: 0, broadcast: 0, character: 0, sidequest: 2, misplace: 0, manager: 0, magnet: 2 } },
                { text: "Become the reason there's more chaos now", scores: { sidewalk: 1, lecture: 0, broadcast: 1, character: 1, sidequest: 0, misplace: 1, manager: 0, magnet: 2 } }
            ]
        },
        {
            text: "Your friends describe you as...",
            answers: [
                { text: "Reliable and steady", scores: { sidewalk: 0, lecture: 0, broadcast: 0, character: 0, sidequest: 0, misplace: 0, manager: 1, magnet: 0 } },
                { text: "The one who can't stop talking", scores: { sidewalk: 0, lecture: 3, broadcast: 1, character: 0, sidequest: 0, misplace: 0, manager: 0, magnet: 0 } },
                { text: "Unpredictable and full of energy", scores: { sidewalk: 0, lecture: 0, broadcast: 1, character: 2, sidequest: 1, misplace: 0, manager: 0, magnet: 0 } },
                { text: "The one interesting things happen around", scores: { sidewalk: 0, lecture: 0, broadcast: 0, character: 0, sidequest: 0, misplace: 0, manager: 0, magnet: 3 } }
            ]
        },
        {
            text: "In a meeting, you tend to...",
            answers: [
                { text: "Listen and take notes", scores: { sidewalk: 0, lecture: 0, broadcast: 0, character: 0, sidequest: 0, misplace: 0, manager: 0, magnet: 0 } },
                { text: "Interrupt with corrections or additions", scores: { sidewalk: 0, lecture: 2, broadcast: 1, character: 0, sidequest: 0, misplace: 0, manager: 1, magnet: 0 } },
                { text: "Accidentally block the screen or materials", scores: { sidewalk: 2, lecture: 0, broadcast: 0, character: 0, sidequest: 0, misplace: 0, manager: 0, magnet: 0 } },
                { text: "Derail it with tangentially related stories", scores: { sidewalk: 0, lecture: 0, broadcast: 0, character: 0, sidequest: 3, misplace: 0, manager: 0, magnet: 0 } }
            ]
        },
        {
            text: "When ordering food, you...",
            answers: [
                { text: "Know exactly what you want", scores: { sidewalk: 0, lecture: 0, broadcast: 0, character: 0, sidequest: 0, misplace: 0, manager: 1, magnet: 0 } },
                { text: "Ask a million questions about every option", scores: { sidewalk: 0, lecture: 2, broadcast: 0, character: 0, sidequest: 1, misplace: 0, manager: 0, magnet: 0 } },
                { text: "Take forever and still pick the wrong thing", scores: { sidewalk: 0, lecture: 0, broadcast: 0, character: 0, sidequest: 1, misplace: 1, manager: 0, magnet: 1 } },
                { text: "Order something no one else would dare try", scores: { sidewalk: 0, lecture: 0, broadcast: 0, character: 2, sidequest: 1, misplace: 0, manager: 0, magnet: 0 } }
            ]
        },
        {
            text: "Someone complains about a problem. You...",
            answers: [
                { text: "Listen sympathetically", scores: { sidewalk: 0, lecture: 0, broadcast: 0, character: 0, sidequest: 0, misplace: 0, manager: 0, magnet: 0 } },
                { text: "Provide a full explanation of why it happened", scores: { sidewalk: 0, lecture: 3, broadcast: 0, character: 0, sidequest: 0, misplace: 0, manager: 0, magnet: 0 } },
                { text: "Accidentally end up helping fix multiple things", scores: { sidewalk: 0, lecture: 0, broadcast: 0, character: 0, sidequest: 2, misplace: 0, manager: 0, magnet: 2 } },
                { text: "Make it about your own similar experience", scores: { sidewalk: 0, lecture: 0, broadcast: 1, character: 2, sidequest: 1, misplace: 0, manager: 0, magnet: 0 } }
            ]
        },
        {
            text: "Your presence at an event typically causes...",
            answers: [
                { text: "Nothing notable", scores: { sidewalk: 0, lecture: 0, broadcast: 0, character: 0, sidequest: 0, misplace: 0, manager: 0, magnet: 0 } },
                { text: "People to seek you out for conversation", scores: { sidewalk: 0, lecture: 1, broadcast: 0, character: 2, sidequest: 0, misplace: 0, manager: 0, magnet: 0 } },
                { text: "Unexpected situations and small disasters", scores: { sidewalk: 1, lecture: 0, broadcast: 0, character: 0, sidequest: 0, misplace: 1, manager: 0, magnet: 3 } },
                { text: "Everyone to suddenly have to navigate around you", scores: { sidewalk: 3, lecture: 0, broadcast: 0, character: 0, sidequest: 0, misplace: 0, manager: 0, magnet: 0 } }
            ]
        }
    ]
    ,
    archetypes: {
        sidewalk: {
            name: "The Sidewalk Traffic Jam",
            emoji: "🧍",
            description: "You don't mean to create human gridlock wherever you go, but somehow your mere presence requires navigation around you. You're not rude—you're just inherently a traffic incident. People see you coming and calculate alternate routes."
        },
        lecture: {
            name: "The Unsolicited Lecture Gremlin",
            emoji: "🤓",
            description: "You have strong opinions and an even stronger need to share them. Whether someone asked or not, they're getting the full educational experience. You're not mean, just persistently informative. You have Wikipedia open in your soul at all times."
        },
        broadcast: {
            name: "The Public Broadcast Goblin",
            emoji: "📢",
            description: "Your thoughts are not private. Your voice is not inside. Every random observation gets shared with the general public at full volume. You're like a living social media feed with no off switch. People three rooms over know what you think about the avocado selection."
        },
        character: {
            name: "The Main Character Overflow",
            emoji: "⭐",
            description: "You live as if the world revolves around you, and honestly, in your presence, it kind of does. Not from arrogance—just pure, unshakeable confidence that you're the protagonist. Somehow things just happen around you. You make even boring moments feel cinematic."
        },
        sidequest: {
            name: "The Topic Side Quest Explorer",
            emoji: "🗺️",
            description: "You cannot stay on topic. Ever. One mention of tacos spirals into a 20-minute tangent about your cousin's road trip. Your conversations are like RPGs—nobody knows where they're going, but everyone's along for the ride. You are the definition of 'actually, that reminds me...'"
        },
        misplace: {
            name: "The Misplacement Magician",
            emoji: "✨",
            description: "You have a supernatural ability to lose things. Keys, phones, thoughts, entire conversations—they all vanish into the void around you. You're not scatterbrained; you're operating at a higher dimension where objects just cease to exist. Finding things you lost is a full quest."
        },
        manager: {
            name: "The Manager Summoner",
            emoji: "👔",
            description: "Something about your presence makes people want to escalate situations to a manager. You don't try—it just happens. You could be peacefully existing, and suddenly a supervisor appears. You're not a Karen, but Karen's energy follows you everywhere."
        },
        magnet: {
            name: "The Unfortunate Situation Magnet",
            emoji: "⚡",
            description: "Chaos follows you like a loyal pet. You don't start the drama, but you're always nearby when it happens. Things just go wrong in your vicinity. You're not unlucky—you're just naturally aligned with disorder. Disaster feels drawn to you."
        }
    }
};

let currentQuestion = 0;
let scores = {
    sidewalk: 0,
    lecture: 0,
    broadcast: 0,
    character: 0,
    sidequest: 0,
    misplace: 0,
    manager: 0,
    magnet: 0
};

const introScreen = document.getElementById('introScreen');
const quizScreen = document.getElementById('quizScreen');
const resultScreen = document.getElementById('resultScreen');

const startButton = document.getElementById('startButton');
const backButtonIntro = document.getElementById('backButtonIntro');
const backButtonQuiz = document.getElementById('backButtonQuiz');
const backButtonResult = document.getElementById('backButtonResult');
const retakeButton = document.getElementById('retakeButton');
const homeButton = document.getElementById('homeButton');

startButton.addEventListener('click', startQuiz);
backButtonIntro.addEventListener('click', goHome);
backButtonQuiz.addEventListener('click', goHome);
backButtonResult.addEventListener('click', goHome);
retakeButton.addEventListener('click', restartQuiz);
homeButton.addEventListener('click', goHome);

function showScreen(screen) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    screen.classList.add('active');
}

function startQuiz() {
    currentQuestion = 0;
    scores = {
        sidewalk: 0,
        lecture: 0,
        broadcast: 0,
        character: 0,
        sidequest: 0,
        misplace: 0,
        manager: 0,
        magnet: 0
    };
    showScreen(quizScreen);
    displayQuestion();
}

function displayQuestion() {
    const question = quizData.questions[currentQuestion];
    document.getElementById('questionTitle').textContent = `Question ${currentQuestion + 1} of ${quizData.questions.length}`;
    document.getElementById('questionText').textContent = question.text;

    const progress = ((currentQuestion + 1) / quizData.questions.length) * 100;
    document.getElementById('progressFill').style.width = progress + '%';

    const answersContainer = document.getElementById('answersContainer');
    answersContainer.innerHTML = '';

    question.answers.forEach((answer, index) => {
        const button = document.createElement('button');
        button.className = 'answer-button';
        button.textContent = answer.text;
        button.addEventListener('click', () => selectAnswer(answer, index));
        answersContainer.appendChild(button);
    });
}

function selectAnswer(answer, index) {
    Object.keys(answer.scores).forEach(key => {
        scores[key] += answer.scores[key];
    });

    currentQuestion++;

    if (currentQuestion < quizData.questions.length) {
        displayQuestion();
    } else {
        showResult();
    }
}

function showResult() {
    let maxScore = 0;
    let resultType = '';

    Object.keys(scores).forEach(type => {
        if (scores[type] > maxScore) {
            maxScore = scores[type];
            resultType = type;
        }
    });

    const archetype = quizData.archetypes[resultType];
    document.getElementById('resultTitle').textContent = archetype.name;
    document.getElementById('resultEmoji').textContent = archetype.emoji;
    document.getElementById('resultDescription').textContent = archetype.description;

    showScreen(resultScreen);
}

function restartQuiz() {
    showScreen(introScreen);
    currentQuestion = 0;
}

function goHome() {
    window.location.href = '../../index.html';
}

// Initialize on page load
showScreen(introScreen);
