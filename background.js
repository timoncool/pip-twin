// Service worker: injects twin.js on click, tracks the twin popup window,
// restores its last position/fullscreen state and serves hotkeys from the popup.

const twins = new Map();   // sourceTabId -> popup windowId
const pending = new Set(); // sourceTabIds waiting for their popup to appear

chrome.action.onClicked.addListener((tab) => openTwin(tab.id));

async function openTwin(tabId) {
  pending.add(tabId);
  setTimeout(() => pending.delete(tabId), 5000);
  await chrome.scripting.executeScript({
    target: { tabId, allFrames: true },
    files: ['twin.js'],
  });
}
globalThis.openTwin = openTwin;

chrome.tabs.onCreated.addListener(async (tab) => {
  if (tab.openerTabId === undefined || !pending.has(tab.openerTabId)) return;
  const win = await chrome.windows.get(tab.windowId);
  if (win.type !== 'popup') return;
  pending.delete(tab.openerTabId);
  twins.set(tab.openerTabId, tab.windowId);
  await restoreBounds(tab.windowId);
});

async function restoreBounds(windowId) {
  const { bounds } = await chrome.storage.local.get('bounds');
  if (!bounds) return;
  const { left, top, width, height, fullscreen } = bounds;
  await chrome.windows.update(windowId, { left, top, width, height, state: 'normal' });
  if (fullscreen) await chrome.windows.update(windowId, { state: 'fullscreen' });
}

chrome.windows.onBoundsChanged.addListener(async (win) => {
  if (![...twins.values()].includes(win.id)) return;
  const { bounds = {} } = await chrome.storage.local.get('bounds');
  if (win.state === 'normal') {
    Object.assign(bounds, { left: win.left, top: win.top, width: win.width, height: win.height, fullscreen: false });
  } else if (win.state === 'fullscreen') {
    bounds.fullscreen = true;
  } else {
    return;
  }
  await chrome.storage.local.set({ bounds });
});

chrome.windows.onRemoved.addListener((windowId) => {
  for (const [tabId, winId] of twins) if (winId === windowId) twins.delete(tabId);
});

chrome.tabs.onRemoved.addListener((tabId) => closeTwinWindow(tabId));

async function closeTwinWindow(tabId) {
  const windowId = twins.get(tabId);
  if (windowId === undefined) return;
  twins.delete(tabId);
  try { await chrome.windows.remove(windowId); } catch (_) { /* already closed */ }
}

async function setFullscreen(windowId, on) {
  const win = await chrome.windows.get(windowId);
  const isFull = win.state === 'fullscreen';
  if (on === undefined) on = !isFull;
  if (on === isFull) return;
  await chrome.windows.update(windowId, { state: on ? 'fullscreen' : 'normal' });
}

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  const tabId = sender.tab && sender.tab.id;
  if (tabId === undefined) return;
  (async () => {
    switch (msg.type) {
      case 'toggleFullscreen':
        if (twins.has(tabId)) await setFullscreen(twins.get(tabId));
        break;
      case 'setFullscreen':
        if (twins.has(tabId)) await setFullscreen(twins.get(tabId), msg.on);
        break;
      case 'closed':
        await closeTwinWindow(tabId);
        break;
      case 'blocked':
        await chrome.action.setBadgeBackgroundColor({ color: '#d93025' });
        await chrome.action.setBadgeText({ tabId, text: '!' });
        await chrome.action.setTitle({ tabId, title: 'PiP Twin: popup blocked. Allow pop-ups for this site (icon in the address bar) and click again.' });
        break;
      case 'opened':
        await chrome.action.setBadgeText({ tabId, text: '' });
        break;
    }
  })().then(() => sendResponse({ ok: true }));
  return true;
});
