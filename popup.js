// popup.js — Premium reminder logic with Dynamic Island

const titleInput = document.getElementById('title-input');
const msgInput   = document.getElementById('msg-input');
const timeInput  = document.getElementById('time-input');
const setBtn     = document.getElementById('set-btn');
const statusEl   = document.getElementById('status');
const listEl     = document.getElementById('reminder-list');
const badge      = document.getElementById('count-badge');
const diIsland   = document.getElementById('dynamic-island');
const diTitle    = diIsland.querySelector('.di-title');
const diMsg      = diIsland.querySelector('.di-msg');

// Default: now + 5 min
timeInput.value = toLocalStr(new Date(Date.now() + 5 * 60000));

function toLocalStr(d) {
  const p = n => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth()+1)}-${p(d.getDate())}T${p(d.getHours())}:${p(d.getMinutes())}`;
}

function escHtml(s) {
  const m = {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'};
  return s.replace(/[&<>"]/g, c => m[c]);
}

// ─── Dynamic Island ───
let diTimeout = null;
function showDynamicIsland(title, msg) {
  diTitle.textContent = title;
  diMsg.textContent = msg || 'Reminder completed ✓';
  diIsland.classList.add('show');

  // Expand after a tiny beat
  setTimeout(() => diIsland.classList.add('expanded'), 200);

  clearTimeout(diTimeout);
  diTimeout = setTimeout(() => {
    diIsland.classList.remove('expanded');
    setTimeout(() => diIsland.classList.remove('show'), 300);
  }, 4500);
}

// Listen for messages from background.js when a reminder fires
chrome.runtime.onMessage.addListener((message) => {
  if (message.type === 'reminder-fired') {
    showDynamicIsland(message.title, message.msg);
    loadReminders();
  }
});

// Check for recently fired reminders when popup opens
chrome.storage.local.get(['lastFired'], (result) => {
  if (result.lastFired && Date.now() - result.lastFired.firedAt < 10000) {
    showDynamicIsland(result.lastFired.title, result.lastFired.msg);
    chrome.storage.local.remove('lastFired');
  }
});

// ─── Load Reminders ───
function loadReminders() {
  chrome.storage.local.get(['reminders'], (result) => {
    const reminders = result.reminders || [];
    listEl.innerHTML = '';
    const now = Date.now();
    const upcoming = reminders.filter(r => r.fireAt > now).sort((a, b) => a.fireAt - b.fireAt);

    badge.textContent = upcoming.length;

    if (upcoming.length === 0) {
      listEl.innerHTML = '<div class="empty-msg">No reminders yet</div>';
      return;
    }

    upcoming.forEach((r, i) => {
      const item = document.createElement('div');
      item.className = 'reminder-item';
      item.style.animationDelay = `${i * 0.06}s`;

      const fireDate = new Date(r.fireAt);
      const isToday = fireDate.toDateString() === new Date().toDateString();
      const timeStr = isToday
        ? `Today at ${fireDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
        : fireDate.toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });

      item.innerHTML = `
        <div class="info">
          <div class="title">${escHtml(r.title)}</div>
          <div class="time">${timeStr}</div>
          ${r.message ? `<div class="msg">${escHtml(r.message)}</div>` : ''}
        </div>
        <button class="delete-btn" data-id="${r.id}" title="Remove">✕</button>
      `;
      listEl.appendChild(item);
    });

    document.querySelectorAll('.delete-btn').forEach(btn => {
      btn.addEventListener('click', () => deleteReminder(btn.dataset.id, btn.closest('.reminder-item')));
    });
  });
}

function deleteReminder(id, el) {
  el.classList.add('removing');
  setTimeout(() => {
    chrome.storage.local.get(['reminders'], (result) => {
      const reminders = (result.reminders || []).filter(r => r.id !== id);
      chrome.storage.local.set({ reminders }, () => {
        chrome.alarms.clear(id);
        loadReminders();
      });
    });
  }, 300);
}

// ─── Set Reminder ───
setBtn.addEventListener('click', () => {
  const title   = titleInput.value.trim();
  const message = msgInput.value.trim();
  const timeVal = timeInput.value;

  if (!title) { showStatus('Enter a title', true); return; }
  if (!timeVal) { showStatus('Pick a time', true); return; }

  const fireAt = new Date(timeVal).getTime();
  if (fireAt <= Date.now()) { showStatus('Must be in the future', true); return; }

  const id = 'rem_' + Date.now();
  const reminder = { id, title, message, fireAt };

  // Button press micro-animation
  setBtn.style.transform = 'scale(0.96)';
  setTimeout(() => setBtn.style.transform = '', 150);

  chrome.storage.local.get(['reminders'], (result) => {
    const reminders = result.reminders || [];
    reminders.push(reminder);
    chrome.storage.local.set({ reminders }, () => {
      chrome.alarms.create(id, { when: fireAt });
      showStatus('Reminder set ✓', false);
      titleInput.value = '';
      msgInput.value = '';
      timeInput.value = toLocalStr(new Date(Date.now() + 5 * 60000));
      loadReminders();
    });
  });
});

function showStatus(msg, isError) {
  statusEl.textContent = msg;
  statusEl.style.color = isError ? '#e04040' : '#c9a84c';
  statusEl.style.opacity = '1';
  setTimeout(() => { statusEl.style.opacity = '0'; }, 2500);
  setTimeout(() => { statusEl.textContent = ''; statusEl.style.opacity = '1'; }, 2800);
}

loadReminders();
