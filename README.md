# PiP Twin

Chrome extension that opens a second window with the same video that is playing in the tab.
Keep the browser's own Picture-in-Picture on your main monitor, drag the twin to the TV and go fullscreen.

Chrome allows only one Picture-in-Picture window per browser, so the twin is a plain popup window.
It receives the decoded frames of the page `<video>` through `captureStream()`: same stream, same time,
full resolution, no re-encoding. Audio keeps playing from the original; the twin is muted.

## Install

1. `chrome://extensions` → enable Developer mode.
2. Load unpacked → pick this folder.

## Use

- Click the toolbar icon or press `Alt+Shift+P` on a page with a playing video. Click again to close the twin.
- The twin remembers where you left it (position, size, fullscreen) and reopens there next time.

Keys inside the twin window:

| Key | Action |
| --- | --- |
| `F`, double-click | toggle fullscreen |
| `Esc` | leave fullscreen |
| `Space`, `K` | play / pause the original |
| `←` / `→` | seek 5 s |
| `J` / `L` | seek 10 s |
| `M` | mute / unmute the original |
| `Q` | close the twin |

## Limits

- DRM streams (Widevine) refuse `captureStream()`; regular YouTube works.
- If the site blocks pop-ups the icon shows `!`: allow pop-ups for that site and click again.
