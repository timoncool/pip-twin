// Injected into every frame of the active tab on click.
// Finds the largest playing <video>, opens a bare popup window and feeds it
// the same decoded frames via captureStream(). The original keeps playing
// (and may sit in the browser's own Picture-in-Picture); the twin is muted.
//
// findLargestPlayingVideo() follows GoogleChromeLabs/picture-in-picture-chrome-extension (Apache-2.0).

(() => {
  const STATE_KEY = '__pipTwin';
  const state = window[STATE_KEY] || (window[STATE_KEY] = { popup: null, stream: null, source: null, timer: 0 });

  function findLargestPlayingVideo() {
    const videos = Array.from(document.querySelectorAll('video'))
      .filter((video) => video.readyState !== 0)
      .sort((v1, v2) => {
        const r1 = v1.getClientRects()[0] || { width: 0, height: 0 };
        const r2 = v2.getClientRects()[0] || { width: 0, height: 0 };
        return (Number(!v2.paused) - Number(!v1.paused)) || (r2.width * r2.height - r1.width * r1.height);
      });
    return videos[0];
  }

  function send(msg) {
    try { chrome.runtime.sendMessage(msg); } catch (_) { /* extension reloaded */ }
  }

  function stopStream() {
    if (state.stream) state.stream.getTracks().forEach((t) => t.stop());
    state.stream = null;
    state.source = null;
  }

  function closeTwin() {
    clearInterval(state.timer);
    state.timer = 0;
    stopStream();
    const popup = state.popup;
    state.popup = null;
    if (popup && !popup.closed) popup.close();
    window.removeEventListener('pagehide', closeTwin);
    send({ type: 'closed' });
  }

  function attach(video, twinVideo) {
    stopStream();
    state.source = video;
    state.stream = video.captureStream();
    twinVideo.srcObject = state.stream;
    twinVideo.play().catch(() => {});
  }

  function watch(twinVideo) {
    state.timer = setInterval(() => {
      const popup = state.popup;
      if (!popup || popup.closed) { closeTwin(); return; }
      const best = findLargestPlayingVideo();
      if (!best) return;
      const stale = !state.stream || !state.stream.active || !document.contains(state.source);
      if (stale || best !== state.source) attach(best, twinVideo);
    }, 1000);
  }

  function seek(delta) {
    const v = state.source;
    if (v) v.currentTime = Math.max(0, Math.min(v.duration || Infinity, v.currentTime + delta));
  }

  function bindKeys(doc) {
    doc.addEventListener('keydown', (e) => {
      const v = state.source;
      switch (e.key) {
        case 'f': case 'F': case 'а': case 'А': send({ type: 'toggleFullscreen' }); break;
        case 'Escape': send({ type: 'setFullscreen', on: false }); break;
        case ' ': case 'k': case 'K': case 'л': case 'Л':
          if (v) (v.paused ? v.play() : v.pause());
          break;
        case 'ArrowLeft': seek(-5); break;
        case 'ArrowRight': seek(5); break;
        case 'j': case 'J': case 'о': case 'О': seek(-10); break;
        case 'l': case 'L': case 'д': case 'Д': seek(10); break;
        case 'm': case 'M': case 'ь': case 'Ь': if (v) v.muted = !v.muted; break;
        case 'q': case 'Q': case 'й': case 'Й': closeTwin(); break;
        default: return;
      }
      e.preventDefault();
    });
    doc.addEventListener('dblclick', () => send({ type: 'toggleFullscreen' }));
  }

  function buildPopup(popup) {
    const doc = popup.document;
    doc.title = 'PiP Twin';
    const style = doc.createElement('style');
    style.textContent = [
      'html,body{margin:0;width:100%;height:100%;background:#000;overflow:hidden;cursor:default}',
      'video{display:block;width:100%;height:100%;object-fit:contain;background:#000}',
      'body.idle{cursor:none}',
    ].join('');
    doc.head.appendChild(style);
    const twinVideo = doc.createElement('video');
    twinVideo.muted = true;
    twinVideo.autoplay = true;
    twinVideo.playsInline = true;
    twinVideo.disablePictureInPicture = true;
    doc.body.appendChild(twinVideo);

    let idleTimer = 0;
    doc.addEventListener('mousemove', () => {
      doc.body.classList.remove('idle');
      clearTimeout(idleTimer);
      idleTimer = setTimeout(() => doc.body.classList.add('idle'), 2000);
    });
    bindKeys(doc);
    popup.addEventListener('pagehide', closeTwin);
    return twinVideo;
  }

  if (state.popup && !state.popup.closed) {
    closeTwin();
    return;
  }

  const video = findLargestPlayingVideo();
  if (!video) return;

  const popup = window.open('about:blank', 'pip-twin', 'popup=1,width=960,height=540');
  if (!popup) {
    send({ type: 'blocked' });
    return;
  }
  state.popup = popup;
  const twinVideo = buildPopup(popup);
  attach(video, twinVideo);
  watch(twinVideo);
  window.addEventListener('pagehide', closeTwin);
  send({ type: 'opened' });
})();
