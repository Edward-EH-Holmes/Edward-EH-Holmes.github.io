// Main application logic for Jobs Chat UI

document.addEventListener("DOMContentLoaded", () => {
  renderTechStack();
  renderConversations();
});

function renderTechStack() {
  const container = document.getElementById("tech-stack");
  if (!container) return;
  techStack.forEach(item => {
    const tag = document.createElement("a");
    tag.className = "tech-tag";
    tag.href = item.link;
    tag.target = "_blank";
    tag.rel = "noopener noreferrer";
    tag.innerHTML = `<span class="tech-label">${item.label}</span><span class="tech-name">${item.name}</span>`;
    tag.title = item.desc;
    container.appendChild(tag);
  });
}

// Global audio player — only one plays at a time
let currentAudio = null;

/**
 * Try to play an audio file for the given message.
 * Expected file paths (tried in order):
 *   ./audio/<sender>_<convId>_<msgIdx>.mp3
 *   ./audio/<sender>_<convId>_<msgIdx>.wav
 *
 * Example: ./audio/jobs_3_0.mp3  or  ./audio/user_1_0.wav
 *
 * If no file is found, the bubble briefly flashes to indicate "no audio".
 */
function playBubbleAudio(sender, convId, msgIdx, bubbleEl) {
  const candidates = [
    `./audio/${sender}_${convId}_${msgIdx}.mp3`,
    `./audio/${sender}_${convId}_${msgIdx}.wav`,
  ];

  // Stop current playback
  if (currentAudio) {
    currentAudio.pause();
    currentAudio.currentTime = 0;
    document.querySelectorAll(".bubble.playing").forEach(b => b.classList.remove("playing"));
    const wasThisBubble = currentAudio._bubbleEl === bubbleEl;
    currentAudio = null;
    if (wasThisBubble) return; // second click = toggle off
  }

  function tryNext(i) {
    if (i >= candidates.length) {
      bubbleEl.classList.add("audio-missing");
      setTimeout(() => bubbleEl.classList.remove("audio-missing"), 700);
      return;
    }
    const audio = new Audio(candidates[i]);
    audio._bubbleEl = bubbleEl;
    audio.addEventListener("error", () => tryNext(i + 1));
    audio.addEventListener("canplaythrough", () => {
      currentAudio = audio;
      bubbleEl.classList.add("playing");
      audio.play();
    }, { once: true });
    audio.addEventListener("ended", () => {
      bubbleEl.classList.remove("playing");
      currentAudio = null;
    }, { once: true });
    audio.load();
  }

  tryNext(0);
}

function renderConversations() {
  const feed = document.getElementById("chat-feed");
  if (!feed) return;

  conversations.forEach((conv, idx) => {
    // Section divider
    const divider = document.createElement("div");
    divider.className = "section-divider";
    divider.innerHTML = `<span>${conv.id}</span>`;
    feed.appendChild(divider);

    conv.messages.forEach((msg, msgIdx) => {
      const row = document.createElement("div");
      row.className = `message-row ${msg.sender === "user" ? "row-user" : "row-jobs"}`;
      row.style.animationDelay = `${(idx * 0.3) + (msgIdx * 0.15)}s`;

      if (msg.sender === "jobs") {
        row.innerHTML = `
          <div class="avatar avatar-jobs" title="Steve Jobs AI">
            <img src="./image/jobs.png" onerror="this.style.display='none';this.parentElement.classList.add('avatar-fallback')" alt="Jobs">
            <span class="avatar-init">SJ</span>
          </div>
          <div class="bubble-wrap">
            <div class="sender-name">Steve Jobs</div>
            <div class="bubble bubble-jobs" title="点击播放语音">${formatText(msg.text)}</div>
          </div>
        `;
      } else {
        // avatar first, bubble-wrap second — row-reverse puts avatar on the RIGHT
        row.innerHTML = `
          <div class="avatar avatar-user" title="Edward">
            <img src="./image/user.png" onerror="this.style.display='none';this.parentElement.classList.add('avatar-fallback')" alt="User">
            <span class="avatar-init">E</span>
          </div>
          <div class="bubble-wrap bubble-wrap-user">
            <div class="sender-name sender-name-user">Edward</div>
            <div class="bubble bubble-user" title="点击播放语音">${formatText(msg.text)}</div>
          </div>
        `;
      }

      feed.appendChild(row);

      // Attach click → audio to the bubble
      const bubble = row.querySelector(".bubble");
      if (bubble) {
        bubble.addEventListener("click", () => {
          playBubbleAudio(msg.sender, conv.id, msgIdx, bubble);
        });
      }
    });
  });
}

function formatText(text) {
  return text
    .replace(/\n/g, "<br>")
    .replace(/——/g, "<span class='em-dash'>——</span>");
}
