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
            <div class="bubble bubble-jobs">${formatText(msg.text)}</div>
          </div>
        `;
      } else {
        row.innerHTML = `
          <div class="bubble-wrap bubble-wrap-user">
            <div class="sender-name sender-name-user">Edward</div>
            <div class="bubble bubble-user">${formatText(msg.text)}</div>
          </div>
          <div class="avatar avatar-user" title="You">
            <img src="./image/user.png" onerror="this.style.display='none';this.parentElement.classList.add('avatar-fallback')" alt="User">
            <span class="avatar-init">E</span>
          </div>
        `;
      }

      feed.appendChild(row);
    });
  });
}

function formatText(text) {
  // Convert newlines to <br> and wrap emphasis text
  return text
    .replace(/\n/g, "<br>")
    .replace(/——/g, "<span class='em-dash'>——</span>");
}
