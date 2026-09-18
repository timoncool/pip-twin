<div align="center">

# PiP Twin

**Chrome-расширение: открывает второе окно с тем же играющим видео. Свой обычный «картинка в картинке» держишь на мониторе, близнеца тащишь на телевизор и разворачиваешь во весь экран.**

[![Install: Load unpacked](https://img.shields.io/badge/⬇_Установка-Load_unpacked-4285F4?style=for-the-badge&logo=googlechrome&logoColor=white)](#установка)
[![How it works](https://img.shields.io/badge/⚙_Как_работает-captureStream-ff0033?style=for-the-badge)](#как-это-работает)
[![Donate](https://img.shields.io/badge/💖_Поддержать-Donate-ff69b4?style=for-the-badge)](https://boosty.to/nerual_dreming)

[![Stars](https://img.shields.io/github/stars/timoncool/pip-twin?style=flat-square&logo=github)](https://github.com/timoncool/pip-twin/stargazers)
[![License](https://img.shields.io/github/license/timoncool/pip-twin?style=flat-square)](LICENSE)
[![Last Commit](https://img.shields.io/github/last-commit/timoncool/pip-twin?style=flat-square)](https://github.com/timoncool/pip-twin/commits/master)
[![Issues](https://img.shields.io/github/issues/timoncool/pip-twin?style=flat-square)](https://github.com/timoncool/pip-twin/issues)
[![Code size](https://img.shields.io/github/languages/code-size/timoncool/pip-twin?style=flat-square)](https://github.com/timoncool/pip-twin)

[![Chrome](https://img.shields.io/badge/Chrome-Manifest_V3-4285F4?style=flat-square&logo=googlechrome&logoColor=white)](#установка)
[![Edge](https://img.shields.io/badge/Edge-Chromium-0078D7?style=flat-square&logo=microsoftedge&logoColor=white)](#установка)
[![No build](https://img.shields.io/badge/Сборка-не_нужна-3fb950?style=flat-square)](#установка)
[![Vanilla JS](https://img.shields.io/badge/JavaScript-vanilla-F7DF1E?style=flat-square&logo=javascript&logoColor=black)](#)

</div>

Chrome разрешает ровно одно окно «картинка в картинке» на весь браузер, поэтому близнец — это обычное окно расширения без адресной строки. Оно получает уже декодированные кадры страничного `<video>` через `captureStream()`: тот же поток, то же время, полное разрешение, без перекодирования. Звук продолжает идти из оригинала, близнец немой.

## Установка

1. Открой `chrome://extensions`, включи **Режим разработчика** справа сверху.
2. **Загрузить распакованное расширение** → выбери папку с этим репозиторием.

Расширение нигде не публикуется, работает локально из папки. Обновление — `git pull` и кнопка «Обновить» на карточке расширения.

## Как пользоваться

- На странице с играющим видео нажми иконку расширения или **`Alt+Shift+P`**. Ещё раз — близнец закрывается.
- Окно запоминает, где ты его оставил: позицию, размер и полный экран. В следующий раз откроется там же.

Клавиши внутри окна близнеца:

| Клавиша | Действие |
| --- | --- |
| `F`, двойной клик | полный экран |
| `Esc` | выйти из полного экрана |
| `Space`, `K` | пауза/плей оригинала |
| `←` / `→` | перемотка на 5 с |
| `J` / `L` | перемотка на 10 с |
| `M` | звук оригинала вкл/выкл |
| `Q` | закрыть близнеца |

## Как это работает

- Клик по иконке инжектит `twin.js` во все фреймы вкладки. Скрипт находит самый большой играющий `<video>`, снимает с него `captureStream()` и открывает окно.
- Окно создаёт страница, но фоновый service worker сразу пересоздаёт его как окно расширения (`chrome.windows.create`, `type: popup`) — у таких окон Chrome не рисует адресную строку.
- Позиция и состояние полного экрана хранятся в `chrome.storage.local` и восстанавливаются при следующем открытии.

## Ограничения

- DRM-потоки (Widevine) запрещают `captureStream()`. Обычный YouTube работает, платные фильмы — нет.
- Если сайт блокирует всплывающие окна, на иконке появится `!`: разреши всплывающие окна для этого сайта и нажми ещё раз.

## Лицензия

MIT. Функция `findLargestPlayingVideo()` заимствована из [GoogleChromeLabs/picture-in-picture-chrome-extension](https://github.com/GoogleChromeLabs/picture-in-picture-chrome-extension) (Apache-2.0).
