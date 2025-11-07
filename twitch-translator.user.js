// ==UserScript==
// @name         Twitch Chat Translator
// @namespace    http://tampermonkey.net/
// @version      1.2
// @description  Translate chat messages, copy to clipboard without modifying chat, integrated below chat input
// @match        https://www.twitch.tv/*
// @author       Masuta
// ==/UserScript==

(() => {
    'use strict';

    let targetLang = 'en';
    let lastTranslation = '';
    let previewTimeout = null;

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

    function createUI() {
        const container = document.createElement('div');
        container.id = 'twitch-translator-ui';
        container.style.cssText = `
            display: flex;
            flex-direction: column;
            gap: 4px;
            align-items: stretch;
            margin-top: 4px;
            padding: 4px;
            background: var(--color-background-base, rgba(0,0,0,0.25));
            border-radius: 6px;
            font-size: 11px;
            color: var(--color-text-base, #fff);
        `;

        // Language select
        const select = document.createElement('select');
        select.style.cssText = 'height:22px;font-size:11px;border-radius:4px;background:#18181b;color:#fff;border:1px solid #444;';
        [
            ['English', 'en'], ['Français', 'fr'], ['Español', 'es'], ['Deutsch', 'de'],
            ['Português', 'pt'], ['日本語', 'ja'], ['한국어', 'ko'], ['Русский', 'ru']
        ].forEach(([n, c]) => {
            const o = document.createElement('option');
            o.value = c;
            o.textContent = n;
            select.appendChild(o);
        });
        select.value = targetLang;
        select.onchange = e => targetLang = e.target.value;

        // Buttons line
        const buttons = document.createElement('div');
        buttons.style.cssText = 'display:flex;gap:4px;align-items:center;';

        const translateBtn = document.createElement('button');
        translateBtn.textContent = 'Translate';
        translateBtn.style.cssText = 'height:22px;font-size:11px;background:#9147ff;color:#fff;border:none;border-radius:4px;cursor:pointer;padding:0 6px;';
        translateBtn.onmouseenter = () => translateBtn.style.background = '#772ce8';
        translateBtn.onmouseleave = () => translateBtn.style.background = '#9147ff';

        const previewBtn = document.createElement('button');
        previewBtn.textContent = 'Preview';
        previewBtn.style.cssText = 'height:22px;font-size:11px;background:#2f2f35;color:#fff;border:none;border-radius:4px;cursor:pointer;padding:0 6px;';
        previewBtn.onmouseenter = () => previewBtn.style.background = '#3b3b44';
        previewBtn.onmouseleave = () => previewBtn.style.background = '#2f2f35';

        // Preview field
        const previewField = document.createElement('div');
        previewField.style.cssText = `
            padding: 2px 4px;
            background: rgba(255,255,255,0.1);
            border-radius: 4px;
            font-size: 11px;
            color: #fff;
            white-space: pre-wrap;
            word-break: break-word;
            transition: opacity 0.4s ease;
        `;

        // Notice field
        const notice = document.createElement('div');
        notice.style.cssText = 'font-size:11px;font-weight:bold;display:none;';
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

            // Display preview for adaptive time
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

            // Display preview for adaptive time
            adaptivePreviewTimeout(translated, previewField);
        };

        // Adaptive timeout function
        function adaptivePreviewTimeout(text, field) {
            clearTimeout(previewTimeout);
            const time = Math.min(Math.max(3000, (text.length / 40) * 1000), 10000); // 3s–10s
            field.style.opacity = '1';
            previewTimeout = setTimeout(() => {
                field.style.opacity = '0';
                setTimeout(() => field.textContent = '', 400);
            }, time);
        }

        buttons.append(select, translateBtn, previewBtn);
        container.append(buttons, previewField, notice);
        return container;
    }

    function attachUI() {
        const input = document.querySelector('textarea[data-a-target="chat-input"], div[contenteditable][data-a-target="chat-input"]');
        if (!input) return;
        const parent = input.closest('form')?.parentElement || input.parentElement;
        if (!parent) return;
        if (document.getElementById('twitch-translator-ui')) return;

        const ui = createUI();
        // place below the chat field
        if (input.nextSibling) parent.insertBefore(ui, input.nextSibling);
        else parent.appendChild(ui);
    }

    const mo = new MutationObserver(attachUI);
    mo.observe(document.body, { childList: true, subtree: true });
    setInterval(attachUI, 3000);

    console.log('[TwitchTranslator v1.2] Loaded');
})();
