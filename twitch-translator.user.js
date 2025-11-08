// ==UserScript==
// @name         Twitch Chat Translator
// @namespace    http://tampermonkey.net/
// @version      1.4
// @description  Translate chat messages, copy to clipboard without modifying chat, integrated below chat input + collapsible UI + persistent settings
// @match        https://www.twitch.tv/*
// @author       Masuta
// @homepage     https://github.com/MasutaK/twitch-chat-translator
// @source       https://github.com/MasutaK/twitch-chat-translator
// @supportURL   https://github.com/MasutaK/twitch-chat-translator/issues
// ==/UserScript==

(() => {
    'use strict';

    const STORAGE_KEY = 'twitch_translator_settings';
    let settings = loadSettings();

    let targetLang = settings.language || 'en';
    let lastTranslation = '';
    let previewTimeout = null;
    let collapsed = settings.collapsed ?? false;

    /*** === SETTINGS HANDLER === ***/
    function loadSettings() {
        try {
            return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};
        } catch {
            return {};
        }
    }

    function saveSettings() {
        localStorage.setItem(STORAGE_KEY, JSON.stringify({
            language: targetLang,
            collapsed: collapsed
        }));
    }

    /*** === TRANSLATION === ***/
    async function translateText(text, target = targetLang) {
        if (!text || !text.trim()) return '';
        try {
            const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=${target}&dt=t&q=${encodeURIComponent(text)}`;
            const res = await fetch(url);
            const data = await res.json();
            return data[0].map(item => item[0]).join('') || text;
        } catch (err) {
            console.error('[Translator] error', err);
            return text;
        }
    }

    function copyToClipboard(text) {
        navigator.clipboard.writeText(text)
            .then(() => console.log('[Translator] Copied to clipboard:', text))
            .catch(err => console.error('[Translator] Clipboard error:', err));
    }

    /*** === UI === ***/
    function createUI() {
        const container = document.createElement('div');
        container.id = 'twitch-translator-ui';
        container.style.cssText = `
            display: flex;
            flex-direction: column;
            align-items: flex-start;
            justify-content: flex-start;
            margin-top: 2px;
            padding: 0;
            background: transparent !important;
            border-radius: 6px;
            font-size: 11px;
            color: var(--color-text-base, #fff);
            overflow: hidden;
        `;

        // Toggle row (arrow)
        const toggleRow = document.createElement('div');
        toggleRow.style.cssText = `
            display: flex;
            align-items: center;
            cursor: pointer;
            padding: 2px 4px;
            user-select: none;
        `;

        const arrow = document.createElement('span');
        arrow.textContent = collapsed ? '▶' : '▼';
        arrow.style.cssText = 'margin-right: 4px; font-size: 12px; transition: transform 0.2s ease; color: #ccc;';
        arrow.onmouseenter = () => (arrow.style.color = '#fff');
        arrow.onmouseleave = () => (arrow.style.color = '#ccc');

        const title = document.createElement('span');
        title.textContent = 'Translator';
        title.style.cssText = 'font-size: 11px; opacity: 0.8;';

        toggleRow.append(arrow, title);

        // Language select
        const select = document.createElement('select');
        select.style.cssText = `
            height:22px;
            font-size:11px;
            border-radius:4px;
            background:#18181b;
            color:#fff;
            border:1px solid #444;
        `;
        [
            ['English', 'en'], ['Français', 'fr'], ['Español', 'es'], ['Deutsch', 'de'],
            ['Português', 'pt'], ['日本語', 'ja'], ['한국어', 'ko'], ['Русский', 'ru'],
            ['中文', 'zh'], ['العربية', 'ar']
        ].forEach(([n, c]) => {
            const o = document.createElement('option');
            o.value = c;
            o.textContent = n;
            select.appendChild(o);
        });
        select.value = targetLang;
        select.onchange = e => {
            targetLang = e.target.value;
            saveSettings(); // Save language choice
        };

        // Buttons line
        const buttons = document.createElement('div');
        buttons.style.cssText = `
            display: flex;
            align-items: center;
            justify-content: flex-start;
            gap: 4px;
            width: 100%;
            margin: 0;
            padding: 2px 4px;
            background: transparent !important;
        `;

        const translateBtn = document.createElement('button');
        translateBtn.textContent = 'Translate';
        translateBtn.style.cssText = `
            height:22px;
            font-size:11px;
            background:#9147ff;
            color:#fff;
            border:none;
            border-radius:4px;
            cursor:pointer;
            padding:0 6px;
        `;
        translateBtn.onmouseenter = () => (translateBtn.style.background = '#772ce8');
        translateBtn.onmouseleave = () => (translateBtn.style.background = '#9147ff');

        const previewBtn = document.createElement('button');
        previewBtn.textContent = 'Preview';
        previewBtn.style.cssText = `
            height:22px;
            font-size:11px;
            background:#2f2f35;
            color:#fff;
            border:none;
            border-radius:4px;
            cursor:pointer;
            padding:0 6px;
        `;
        previewBtn.onmouseenter = () => (previewBtn.style.background = '#3b3b44');
        previewBtn.onmouseleave = () => (previewBtn.style.background = '#2f2f35');

        buttons.append(select, translateBtn, previewBtn);

        // Content area
        const content = document.createElement('div');
        content.style.cssText = `
            display: flex;
            flex-direction: column;
            align-items: flex-start;
            justify-content: flex-start;
            width: 100%;
            transition: max-height 0.25s ease, opacity 0.25s ease;
            overflow: hidden;
            background: transparent !important;
        `;
        content.append(buttons);

        // Preview field
        const previewField = document.createElement('div');
        previewField.style.cssText = `
            padding: 2px 4px;
            background: rgba(255,255,255,0.05);
            border-radius: 4px;
            font-size: 11px;
            color: #fff;
            white-space: pre-wrap;
            word-break: break-word;
            transition: opacity 0.4s ease;
            width: 100%;
        `;
        content.append(previewField);

        // Notice field
        const notice = document.createElement('div');
        notice.style.cssText = 'font-size:11px;font-weight:bold;display:none;';
        content.append(notice);

        function showNotice(text, color = '#0f0', duration = 3000) {
            notice.textContent = text;
            notice.style.color = color;
            notice.style.display = 'block';
            clearTimeout(notice._timer);
            notice._timer = setTimeout(() => {
                notice.style.display = 'none';
            }, duration);
        }

        // Translate action
        translateBtn.onclick = async () => {
            const input = document.querySelector('textarea[data-a-target="chat-input"], div[contenteditable][data-a-target="chat-input"]');
            const text = input?.value || input?.textContent || '';
            if (!text.trim()) return showNotice('⚠️ No text detected', '#ff0', 3000);

            const translated = await translateText(text, targetLang);
            lastTranslation = translated;
            copyToClipboard(translated);
            showNotice('✅ Text copied to clipboard', '#0f0', 3000);
            previewField.textContent = translated;
            adaptivePreviewTimeout(translated, previewField);
        };

        // Preview action
        previewBtn.onclick = async () => {
            const input = document.querySelector('textarea[data-a-target="chat-input"], div[contenteditable][data-a-target="chat-input"]');
            const text = input?.value || input?.textContent || '';
            if (!text.trim()) return showNotice('⚠️ No text detected', '#ff0', 3000);

            previewField.textContent = 'Translating...';
            const translated = await translateText(text, targetLang);
            previewField.textContent = translated;
            adaptivePreviewTimeout(translated, previewField);
        };

        // Adaptive timeout
        function adaptivePreviewTimeout(text, field) {
            clearTimeout(previewTimeout);
            const time = Math.min(Math.max(3000, (text.length / 40) * 1000), 10000);
            field.style.opacity = '1';
            previewTimeout = setTimeout(() => {
                field.style.opacity = '0';
                setTimeout(() => field.textContent = '', 400);
            }, time);
        }

        // Toggle visibility
        toggleRow.onclick = () => {
            collapsed = !collapsed;
            if (collapsed) {
                content.style.maxHeight = '0';
                content.style.opacity = '0';
                arrow.textContent = '▶';
            } else {
                content.style.maxHeight = '200px';
                content.style.opacity = '1';
                arrow.textContent = '▼';
            }
            saveSettings(); // Save the state (open/closed)
        };

        // Init expanded/collapsed
        if (collapsed) {
            content.style.maxHeight = '0';
            content.style.opacity = '0';
        } else {
            content.style.maxHeight = '200px';
            content.style.opacity = '1';
        }

        container.append(toggleRow, content);
        return container;
    }

    /*** === ATTACH UI === ***/
    function attachUI() {
        const input = document.querySelector('textarea[data-a-target="chat-input"], div[contenteditable][data-a-target="chat-input"]');
        if (!input) return;
        const parent = input.closest('form')?.parentElement || input.parentElement;
        if (!parent) return;
        if (document.getElementById('twitch-translator-ui')) return;

        const ui = createUI();
        if (input.nextSibling) parent.insertBefore(ui, input.nextSibling);
        else parent.appendChild(ui);
    }

    const mo = new MutationObserver(attachUI);
    mo.observe(document.body, { childList: true, subtree: true });
    setInterval(attachUI, 3000);

    console.log('[TwitchTranslator v1.4] Loaded');
})();
