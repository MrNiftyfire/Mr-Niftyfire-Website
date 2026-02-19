

const trailerImages = [
  "Minecraft Achievements.png",
  "Blooket Calculator.png",
  "Chess Achievements.png",
  "Blooket Blooks.png",
  "Duolingo Achievements.png",
  "MSM.png"
];
let isChatFocused = false;

let currentTrailerIndex = 0;
const trailerImageElement = document.getElementById("swapImage");
const musicButton = document.getElementById("music-toggle"); // music button reference

if (trailerImageElement) {
  trailerImageElement.style.cursor = "pointer";

  document.addEventListener("click", (event) => {
    const target = event.target;

    // ✅ Ignore clicks on other buttons, menus, or the music button
    if (
      target.closest(".menu-bar") ||          // menu area
      target.closest(".top-menu") ||          // top menu bar
      target.closest("#music-toggle") ||      // music toggle button
      target.closest("button") ||             // any generic button
      target.tagName === "A"                  // any links
    ) {
      return; // ignore
    }

    // ✅ Only trigger if clicking on the image itself
    if (target === trailerImageElement) {
      trailerImageElement.style.transition = "opacity 0.4s ease";
      trailerImageElement.style.opacity = "0"; // fade out

      setTimeout(() => {
        currentTrailerIndex = (currentTrailerIndex + 1) % trailerImages.length;
        trailerImageElement.src = trailerImages[currentTrailerIndex];
        trailerImageElement.style.opacity = "1"; // fade in
      }, 400);
    }
  });
}

window.addEventListener("DOMContentLoaded", () => {
  const canvas = document.getElementById("flappyCanvas");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");

  canvas.width = 300;
  canvas.height = 450;

  // === Images ===
  const bgImg = new Image();
  bgImg.src = "Flappy Bird Background (Game).png";
  const birdImg = new Image();
  birdImg.src = "Flappy Bird.png";
  const upPipeImg = new Image();
  upPipeImg.src = "Up Pipe.png"; // bottom pipe
  const downPipeImg = new Image();
  downPipeImg.src = "Down Pipe.png"; // top pipe
  const groundImg = new Image();
  groundImg.src = "Grass.png";

  // === Sounds ===
  const flySound = new Audio("Flappy Bird Fly.mp3");
  const scoreSound = new Audio("Flappy Bird Score.mp3");
  const dieSound = new Audio("Flappy Bird Die.mp3");

  // === Game Variables ===
  let birdX = 70;
  let birdY = 150;
  let gravity = 0.4;
  let lift = -7;
  let velocity = 0;
  let pipes = [];
  let frame = 0;
  let score = 0;
  const groundHeight = 60;
  const pipeGap = 120;
  let gameOver = false;
  let gameStarted = false;

  // === Add Pipe Pair ===
  function addPipe() {
    const topHeight = Math.floor(Math.random() * 120) + 50;
    pipes.push({
      x: canvas.width,
      top: topHeight,
      bottom: topHeight + pipeGap,
      passed: false
    });
  }

  // === Restart ===
  function restartGame() {
    birdY = 150;
    velocity = 0;
    pipes = [];
    frame = 0;
    score = 0;
    gameOver = false;
    gameStarted = true;
    addPipe();
    loop();
  }

  function handleInput() {
    if (!gameStarted) {
      restartGame();
    } else if (gameOver) {
      restartGame();
    } else {
      velocity = lift;
      flySound.currentTime = 0;
      flySound.play();
    }
  }

  // === Ignore Menu Bar Clicks ===
  function isClickOnMenuBar(target) {
    return target.closest && target.closest(".menu-bar");
  }

  let touchJustTriggered = false;

  document.addEventListener("click", e => {
    if (touchJustTriggered) {
      touchJustTriggered = false;
      return;
    }
    if (isClickOnMenuBar(e.target)) return;
    handleInput();
  });

  document.addEventListener("touchstart", e => {
    const touch = e.touches[0];
    const element = document.elementFromPoint(touch.clientX, touch.clientY);
    if (isClickOnMenuBar(element)) return;
    touchJustTriggered = true;
    handleInput();
  });

document.addEventListener("keydown", e => {
  if (isChatFocused) return; // ✅ ignore ALL keys while typing

  if (e.code === "Space") {
    e.preventDefault();
    handleInput();
  }
});



  // === Main Loop ===
  function loop() {
    if (gameOver) return;
    frame++;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(bgImg, 0, 0, canvas.width, canvas.height);

    velocity += gravity;
    birdY += velocity;

    // === Top of screen reset ===
    if (birdY < -30) {
      dieSound.currentTime = 0;
      dieSound.play();
      restartGame();
      return;
    }

    if (frame % 100 === 0) addPipe();

    // === Pipes ===
    for (let i = pipes.length - 1; i >= 0; i--) {
      const p = pipes[i];
      p.x -= 2;

      // Top pipe (Down Pipe.png)
      ctx.drawImage(downPipeImg, p.x, 0, 50, p.top);

      // Bottom pipe (Up Pipe.png)
      ctx.drawImage(
        upPipeImg,
        p.x,
        p.bottom,
        50,
        canvas.height - p.bottom - groundHeight
      );

      // Collision check
      if (
        birdX + 30 > p.x &&
        birdX < p.x + 50 &&
        (birdY < p.top || birdY + 24 > p.bottom)
      ) {
        dieSound.currentTime = 0;
        dieSound.play();
        gameOver = true;
      }

      // Scoring (once per tunnel)
      if (!p.passed && p.x + 50 < birdX) {
        score++;
        p.passed = true;
        scoreSound.currentTime = 0;
        scoreSound.play();
      }

      // Remove offscreen pipes
      if (p.x + 50 < 0) {
        pipes.splice(i, 1);
      }
    }

    // === Ground ===
    for (let i = 0; i < canvas.width; i += 80) {
      ctx.drawImage(groundImg, i, canvas.height - groundHeight, 80, groundHeight);
    }

    // === Bird ===
    ctx.drawImage(birdImg, birdX, birdY, 30, 24);

    // === Ground Collision ===
    if (birdY + 24 >= canvas.height - groundHeight) {
      dieSound.currentTime = 0;
      dieSound.play();
      gameOver = true;
    }

    // === Score ===
    ctx.fillStyle = "white";
    ctx.font = "20px Fredoka, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("Score: " + score, canvas.width / 2, 40);

    // === Game Over Screen ===
    if (gameOver) {
      ctx.fillStyle = "rgba(0,0,0,0.5)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = "white";
      ctx.font = "28px Fredoka, sans-serif";
      ctx.fillText("Game Over!", canvas.width / 2, 200);
      ctx.font = "16px Fredoka, sans-serif";
      ctx.fillText("Tap, or Press Space to Start", canvas.width / 2, 230);
      return;
    }

    requestAnimationFrame(loop);
  }

  function drawStartScreen() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(bgImg, 0, 0, canvas.width, canvas.height);
    for (let i = 0; i < canvas.width; i += 80) {
      ctx.drawImage(groundImg, i, canvas.height - groundHeight, 80, groundHeight);
    }
    ctx.drawImage(birdImg, birdX, birdY, 30, 24);
    ctx.fillStyle = "white";
    ctx.font = "22px Fredoka, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("Tap, or Press Space to Start", canvas.width / 2, 220);
  }

  drawStartScreen();
});
 

/// ======================================================================
// 🔥 CHATBOT SYSTEM — PRO MODE
// Strict Mode • Smart Mode • Levenshtein • Suggestions • Typing FX
// ======================================================================



// =============================
// 🎛 ELEMENT REFERENCES
// =============================

const chatToggle   = document.getElementById("chatbot-toggle");
const chatbot      = document.getElementById("chatbot");
const chatInput    = document.getElementById("chat-input");
const chatMessages = document.getElementById("chat-messages");



// =============================
// ⚙ SETTINGS
// =============================

let strictMode      = true;     // true = strict | false = smart
const CHAT_TOLERANCE = 3;       // typo tolerance level



// =============================
// 🎛 OPEN / CLOSE
// =============================

chatToggle.onclick = (e) => {
    e.stopPropagation();
    chatbot.classList.toggle("open");
};

chatbot.addEventListener("click",  e => e.stopPropagation());
chatToggle.addEventListener("click", e => e.stopPropagation());



// ======================================================================
// 🧠 LEVENSHTEIN ENGINE
// ======================================================================

function levenshtein(a, b) {

    const matrix = [];

    for (let i = 0; i <= b.length; i++) matrix[i] = [i];
    for (let j = 0; j <= a.length; j++) matrix[0][j] = j;

    for (let i = 1; i <= b.length; i++) {

        for (let j = 1; j <= a.length; j++) {

            matrix[i][j] =
                b.charAt(i - 1) === a.charAt(j - 1)
                    ? matrix[i - 1][j - 1]
                    : Math.min(
                        matrix[i - 1][j - 1] + 1,
                        matrix[i][j - 1] + 1,
                        matrix[i - 1][j] + 1
                      );
        }
    }

    return matrix[b.length][a.length];
}



// =============================
// 🧠 KNOWN PHRASES
// =============================

const knownTriggers = [

    "hello",
    "how do i navigate the website",
    "how can i contact help",
    "can you tell me something about this website",
    "play",
    "game",
    "flappy",
    "score",
    "restart",
    "music",
    "bug",
    "mobile",
    "keyboard",
    "about",
    "who made"

];



function findClosestMatch(input) {

    let closest = null;
    let minDist = Infinity;

    for (let phrase of knownTriggers) {

        const dist = levenshtein(input, phrase);

        if (dist < minDist) {
            minDist = dist;
            closest = phrase;
        }
    }

    return minDist <= CHAT_TOLERANCE ? closest : null;
}



// ======================================================================
// ✨ TYPING EFFECT (HTML SAFE)
// ======================================================================

function typeEffect(element, html, speed = 15) {

    let i = 0;
    element.innerHTML = "";

    const temp = document.createElement("div");
    temp.innerHTML = html;
    const fullText = temp.innerHTML;

    const interval = setInterval(() => {

        element.innerHTML = fullText.slice(0, i);
        i++;

        if (i > fullText.length) clearInterval(interval);

    }, speed);
}





function addChat(sender, text) {

    const bubble = document.createElement("div");
    bubble.className = `chat-bubble ${sender === "You" ? "user" : "bot"}`;

    chatMessages.appendChild(bubble);

    if (sender === "Bot") {
        typeEffect(bubble, text);
    } else {
        bubble.innerHTML = text;   // allows <b>
    }

    chatMessages.scrollTop = chatMessages.scrollHeight;
}

window.addEventListener("DOMContentLoaded", () => {

  const chatToggle   = document.getElementById("chatbot-toggle");
  const chatbot      = document.getElementById("chatbot");
  const chatInput    = document.getElementById("chat-input");
  const chatMessages = document.getElementById("chat-messages");

  if (!chatInput || !chatMessages) return;

  chatInput.addEventListener("keydown", (e) => {

    if (e.key === "Enter") {

      e.preventDefault();

      const userText = chatInput.value.trim();
      if (!userText) return;

      addChat("You", userText);
      chatInput.value = "";

      const reply = getReply(userText);

      setTimeout(() => {
        addChat("Bot", reply);
      }, 200);
    }

  });

});




const customResponses = {
    "who is the owner": "The owner is Mr Niftyfire 👑",
    "contact": "Contact 👉 mrniftyfireofficial<br>@outlook.com.",
    "play": "Tap, click, or press to play flappy bird. Avoid pipes! 🎮",
    "secret": "🤫 This website leads you somewhere special <br> https://whatthezbot.github.io <br> /IDK/Secret-Page.html",
    "hi": "Hey! 👋 I can help you navigate, report issues, or find out info about the website. Just ask how to get to another page or asking about info on the site or how to report issues.",
    "favorite color": "My favorite color is red!",
    "navigate": "Press the one of the icons on the menu bar and then press the text that pops up below the icon.",
    "other pages": "Press the one of the icons on the menu bar and then press the text that pops up below the icon.",
    "secret page": "This website leads you somewhere special <br> https://whatthezbot.github.io <br> /IDK/Secret-Page.html",
    "issue": "Contact 👉 mrniftyfireofficial<br>@outlook.com.",
    "report issue": "Contact 👉 mrniftyfireofficial<br>@outlook.com.",
    "updates": "This site is still being worked on for mobile, stay tuned for updates.",
    "best video": "I really like my videos, my best one by far is my trailer",
    "favourite video": "I really like my videos, my best one by far is my trailer",
    "favorite video": "I really like my videos, my best one by far is my trailer",
    "you real": "If you're wondering, I am automated.",
    "real person": "If you're wondering, I am automated.",
    "you real?": "If you're wondering, I am automated.",
    "help": "What do you need help with?",
    "info": "This site has was made with HTML CSS and Javascript and was made out of passion and love",
    "pixar": "I am planning to make a movie review on all the movies",
    "67": "67",
    "score": "You get points by passing pipes 🏆",
    "restart": "Tap or press <b>Space</b> after Game Over.",
    "music": "Use the <b>music button</b> at the bottom right to turn on the music 🎵.",
    "bug": "To report a bug to this email mrniftyfireofficial<br>@outlook.com",
    "who made": "This site was made by Mr Niftyfire 👑",
    "home page": "Press the home icon on the menu bar and then press the text that pops up below the icon.",
    "lego page": "Press the lego icon on the menu bar and then press the text that pops up below the icon.",
    "roblox page": "Press the minecraft icon on the menu bar and then press the text that pops up below the icon.",
    "gd page": "Press the GD icon on the menu bar and then press the text that pops up below the icon.",
    "gemoetry dash page": "Press the GD icon on the menu bar and then press the text that pops up below the icon.",
    "duolingo page": "Press the duolingo icon on the menu bar and then press the text that pops up below the icon.",
    "duolingo achievements page": "Press the duolingo achievements icon on the menu bar and then press the text that pops up below the icon.",
    "blooket page": "Press the blooket icon on the menu bar and then press the text that pops up below the icon.",
    "Get every blook page": "Press the Get every blook icon on the menu bar and then press the text that pops up below the icon.",
    "HTGEB page": "Press the Get every blook icon on the menu bar and then press the text that pops up below the icon.",
    "blooket calculator page": "Press the blooket calculator icon on the menu bar and then press the text that pops up below the icon.",
    "minecraft page": "Press the minecraft icon on the menu bar and then press the text that pops up below the icon.",
    "minecraft story mode": "Press the minecraft icon on the menu bar and then press the text that pops up below the icon.",
    "msm": "Press the minecraft icon on the menu bar and then press the text that pops up below the icon.",
    "minecraft achievements page": "Press the min t icon on the menu bar and then press the text that pops up below the icon.",
    "chess page": "Press the chess icon on the menu bar and then press the text that pops up below the icon.",
    "chess achievements page": "Press the chess achievements icon on the menu bar and then press the text that pops up below the icon.",
    "christianity page": "Press the christianity icon on the menu bar and then press the text that pops up below the icon.",
    "uncommon videos page": "Press the uncommon videos icon on the menu bar and then press the text that pops up below the icon.",
    "uv page": "Press the uncommon videos icon on the menu bar and then press the text that pops up below the icon.",
    "time to create": "This website is still being developed but it has been worked on for over 9 months",
    "time to make": "This website is still being developed but it has been worked on for over 9 months",
    "time to code": "This website is still being developed but it has been worked on for over 9 months",
    "take to make": "This website is still being developed but it has been worked on for over 9 months",
    "take to code": "This website is still being developed but it has been worked on for over 9 months",
    "how does the website work": "It works with HTML, CSS and Javascript and was made out of passion and love",
    "how does the site work": "It works with HTML, CSS and Javascript and was made out of passion and love",
    "how was the website made": "It works with HTML, CSS and Javascript and was made out of passion and love",
    "website made": "It works with HTML, CSS and Javascript and was made out of passion and love",
    "site made": "It works with HTML, CSS and Javascript and was made out of passion and love",
    "wesite works": "It works with HTML, CSS and Javascript and was made out of passion and love",
    "site works": "It works with HTML, CSS and Javascript and was made out of passion and love",
    "specific": "For more specific answers Contact 👉 mrniftyfireofficial<br>@outlook.com.",
    "be specific": "For more specific answers Contact 👉 mrniftyfireofficial<br>@outlook.com.",
    "what's this website info about": "Its about my videos, channel and more!",
    "site info": "Its about my videos, channel and more! ",
    "type of content": "I make a variaty of videos, like videos about minecraft!",
    "type of videos": "I make a variaty of videos, like videos about minecraft!",
    "style of videos": "I make a variaty of videos, like videos about minecraft!",
    "style of content": "I make a variaty of videos, like videos about minecraft!",
    "what does the website include": "Its about my videos, channel and more!",
    "what does the site include": "Its about my videos, channel and more!",
    "site include": "Its about my videos, channel and more!",
    "website include": "Its about my videos, channel and more!",
    "what does the website have": "Its about my videos, channel and more!",
    "what does the site have": "Its about my videos, channel and more!",
    "website have": "Its about my videos, channel and more!",
    "site have": "Its about my videos, channel and more!",
    "what is on the site": "Stuff like my videos, channel and more!",
    "what is on the website": "Stuff like my videos, channel and more!",
    "on the site": "Stuff like my videos, channel and more!",
    "on the website": "Stuff like my videos, channel and more!",
    "videos about": "I make a variaty of videos, like videos about minecraft!",
    "suggestions": "To give suggestions Contact 👉 mrniftyfireofficial<br>@outlook.com.",
    "suggestion": "To give suggestions Contact 👉 mrniftyfireofficial<br>@outlook.com.",
    "questions": "To ask questions Contact 👉 mrniftyfireofficial<br>@outlook.com.",
    "question": "To ask questions Contact 👉 mrniftyfireofficial<br>@outlook.com.",
    "copywrite": "To ask about issues you have Contact 👉 mrniftyfireofficial<br>@outlook.com.",
    "complaints": "To ask about issues you have Contact 👉 mrniftyfireofficial<br>@outlook.com.",
    "complain": "To ask about issues you have Contact 👉 mrniftyfireofficial<br>@outlook.com.",
    "complains": "To ask about issues you have Contact 👉 mrniftyfireofficial<br>@outlook.com.",
    "complaint": "To ask about issues you have Contact 👉 mrniftyfireofficial<br>@outlook.com.",
    "joke": "Why did the chicken cross the road, to get to the other side!!!!!",
    "mr niftyfire": "No, this is automated",
    "thanks": "Your welcome!",
    "thank you": "Your welcome!",
    "tysm": "Your welcome!",
    "ty": "Your welcome!",
    "subscriber count": "Scroll down to the bottom on the home page to see how manys subs I have!",
    "subscriber": "Scroll down to the bottom on the home page to see how manys subs I have!",
    "subscribers": "Scroll down to the bottom on the home page to see how manys subs I have!",
    "home": "Press the home icon on the menu bar and then press the text that pops up below the icon.",
    "lego": "Press the lego icon on the menu bar and then press the text that pops up below the icon.",
    "roblox": "Press the minecraft icon on the menu bar and then press the text that pops up below the icon.",
    "gd": "Press the GD icon on the menu bar and then press the text that pops up below the icon.",
    "gemoetry dash": "Press the GD icon on the menu bar and then press the text that pops up below the icon.",
    "duolingo": "Press the duolingo icon on the menu bar and then press the text that pops up below the icon.",
    "duolingo achievements": "Press the duolingo achievements icon on the menu bar and then press the text that pops up below the icon.",
    "blooket": "Press the blooket icon on the menu bar and then press the text that pops up below the icon.",
    "Get every blook": "Press the Get every blook icon on the menu bar and then press the text that pops up below the icon.",
    "HTGEB": "Press the Get every blook icon on the menu bar and then press the text that pops up below the icon.",
    "blooket calculator": "Press the blooket calculator icon on the menu bar and then press the text that pops up below the icon.",
    "minecraft": "Press the minecraft icon on the menu bar and then press the text that pops up below the icon.",
    "minecraft story mode": "Press the minecraft icon on the menu bar and then press the text that pops up below the icon.",
    "msm": "Press the minecraft icon on the menu bar and then press the text that pops up below the icon.",
    "minecraft achievements": "Press the min t icon on the menu bar and then press the text that pops up below the icon.",
    "chess": "Press the chess icon on the menu bar and then press the text that pops up below the icon.",
    "chess achievements": "Press the chess achievements icon on the menu bar and then press the text that pops up below the icon.",
    "christianity": "Press the christianity icon on the menu bar and then press the text that pops up below the icon.",
    "uncommon videos": "Press the uncommon videos icon on the menu bar and then press the text that pops up below the icon.",
    "uv page": "Press the uncommon videos icon on the menu bar and then press the text that pops up below the icon.",
}





function getReply(msg) {

    msg = msg.toLowerCase().trim();
    // ======================================
// ⭐ CHECK CUSTOM RESPONSES FIRST
// ======================================

for (let trigger in customResponses) {
    if (msg.includes(trigger)) {
        return customResponses[trigger];
    }
}




    // =============================
    // 🔄 MODE SWITCH COMMAND
    // =============================

    if (msg === "/mode") {

        strictMode = !strictMode;

        return `Mode switched to <b>${strictMode ? "STRICT" : "SMART"}</b>`;
    }



    // =============================
    // 🧠 SMART MATCH CHECK
    // =============================

    const suggestion = findClosestMatch(msg);

    if (!knownTriggers.some(trigger => msg.includes(trigger))) {

        if (strictMode) {

            if (suggestion) {
                return `❌ I didn’t understand, please use proper spelling`;
            }

            return "❌ I’m not sure 🤔<br><br>Try:<br><b>How can I contact help</b><br><b>How do I navigate the website</b><br>Or contact mrniftyfireofficial<br>@outlook.com.";
        }

        if (suggestion) {
            msg = suggestion;   // auto-correct in smart mode
        }
    }



    // ==================================================================
    // 💬 RESPONSES
    // ==================================================================

if (msg.includes("hello"))
        return "Hey! 👋 I can help you navigate, report issues, or find out info about the website. Just ask how to get to another page or asking about info on the site or how to report issues.";

    if (msg.includes("how do i navigate the website"))
        return "Press the one of the icons on the menu bar and then press the text below.";

    if (msg.includes("how can i contact help"))
        return "Contact 👉 mrniftyfireofficial<br>@outlook.com";

    if (msg.includes("can you tell me something about this website"))
        return "This website is made using <b>HTML</b>, <b>CSS</b>, and <b>JavaScript</b>.";

    if (msg.includes("play") || msg.includes("game") || msg.includes("flappy"))
        return "Tap, click, or press to play flappy bird. Avoid pipes! 🎮";

    if (msg.includes("score"))
        return "You get points by passing pipes 🏆";

    if (msg.includes("restart"))
        return "Tap or press <b>Space</b> after Game Over.";

    if (msg.includes("music"))
        return "Use the <b>music button</b> at the bottom right to turn on the music 🎵";

    if (msg.includes("bug"))
        return "To report a bug to this email mrniftyfireofficial<br>@outlook.com";

    if (msg.includes("mobile"))
        return "This site is still being worked on for mobile, stay tunned for updates!";

    if (msg.includes("keyboard"))
        return "Controls:<br>• <b>Space</b> = Fly<br>• Click / Tap = Fly";

    if (msg.includes("about"))
        return "This site has was made with HTML CSS and Javascript";

    if (msg.includes("who made"))
        return "This site was made by the site Mr Niftyfire 👑";

if (msg.includes("updates"))
        return "This site is still being worked on for mobile, stay tunned for updates";
 
if (msg.includes("secrets"))
        return "🤫 This website leds you somewhere special <br> https://whatthezbot.github.io <br> /IDK/Secret-Page.html"



    return "I’m not sure 🤔";
}





chatInput.addEventListener("focus", () => {
  isChatFocused = true;
});

chatInput.addEventListener("blur", () => {
  isChatFocused = false;
});






addChat("Bot", "Hi! Try saying <b>Hello</b> 😊 (try use correct spelling) ");
