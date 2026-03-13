// background.js — fires notifications + Dynamic Island when reminders trigger

chrome.alarms.onAlarm.addListener((alarm) => {
  if (!alarm.name.startsWith('rem_')) return;

  chrome.storage.local.get(['reminders'], (result) => {
    const reminders = result.reminders || [];
    const reminder = reminders.find(r => r.id === alarm.name);
    if (!reminder) return;

    const title = reminder.title;
    const msg = reminder.message || 'Your reminder is due!';

    // 1) System notification
    chrome.notifications.create(alarm.name, {
      type: 'basic',
      iconUrl: 'icon128.png',
      title: title,
      message: msg,
      priority: 2
    });

    // 2) Store last fired for popup to pick up
    chrome.storage.local.set({
      lastFired: { title, msg, firedAt: Date.now() }
    });

    // 3) Send message to popup (if open)
    chrome.runtime.sendMessage({
      type: 'reminder-fired',
      title: title,
      msg: msg
    }).catch(() => { });

    // 4) Inject Dynamic Island into the active tab
    injectDynamicIsland(title, msg);

    // 5) Remove fired reminder
    const updated = reminders.filter(r => r.id !== alarm.name);
    chrome.storage.local.set({ reminders: updated });
  });
});

// Inject Dynamic Island overlay into the currently active tab
async function injectDynamicIsland(title, msg) {
  try {
    const [tab] = await chrome.tabs.query({ active: true, lastFocusedWindow: true });
    if (!tab || !tab.id || tab.url.startsWith('chrome://')) return;

    await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: createDynamicIsland,
      args: [title, msg]
    });
  } catch (e) {
    // Ignore if we can't inject (e.g. restricted page)
  }
}

// This function runs IN the web page
function createDynamicIsland(title, msg) {
  // Remove existing
  const old = document.getElementById('__reminder_di__');
  if (old) old.remove();

  const island = document.createElement('div');
  island.id = '__reminder_di__';
  island.innerHTML = `
    <div style="display:flex;align-items:center;gap:12px;">
      <span style="display:inline-block;width:10px;height:10px;border-radius:50%;background:#c9a84c;box-shadow:0 0 8px rgba(201,168,76,0.5);animation:__di_pulse 1.5s ease infinite;"></span>
      <div>
        <div style="font-size:16px;font-weight:600;color:#e4c76b;">${title.replace(/</g, '&lt;')}</div>
        <div style="font-size:13px;color:#aaa;margin-top:3px;">${(msg || '').replace(/</g, '&lt;')}</div>
      </div>
    </div>
  `;

  const style = document.createElement('style');
  style.textContent = `
    @keyframes __di_pulse { 0%,100%{transform:scale(1)}50%{transform:scale(1.15)} }
    @keyframes __di_enter {
      0% { transform: translateX(-50%) scaleX(0.3) scaleY(0.3); opacity: 0; }
      100% { transform: translateX(-50%) scaleX(1) scaleY(1); opacity: 1; }
    }
    @keyframes __di_expand {
      0% { padding: 10px 20px; border-radius: 36px; }
      100% { padding: 14px 24px; border-radius: 22px; }
    }
    @keyframes __di_exit {
      0% { transform: translateX(-50%) scaleX(1) scaleY(1); opacity: 1; }
      100% { transform: translateX(-50%) scaleX(0.3) scaleY(0.3); opacity: 0; }
    }
  `;

  Object.assign(island.style, {
    position: 'fixed',
    top: '16px',
    left: '50%',
    transform: 'translateX(-50%)',
    zIndex: '2147483647',
    background: '#1c1c1e',
    borderRadius: '36px',
    padding: '16px 28px',
    boxShadow: '0 8px 40px rgba(0,0,0,0.6), 0 0 0 0.5px rgba(255,255,255,0.08)',
    fontFamily: '-apple-system, "Segoe UI", sans-serif',
    animation: '__di_enter 0.5s cubic-bezier(0.34,1.56,0.64,1) forwards',
    cursor: 'default',
    maxWidth: '420px'
  });

  document.documentElement.appendChild(style);
  document.documentElement.appendChild(island);

  // Expand after a beat
  setTimeout(() => {
    island.style.animation = '__di_expand 0.35s cubic-bezier(0.34,1.56,0.64,1) forwards';
  }, 600);

  // Auto dismiss
  setTimeout(() => {
    island.style.animation = '__di_exit 0.4s ease forwards';
    setTimeout(() => {
      island.remove();
      style.remove();
    }, 500);
  }, 5000);
}
