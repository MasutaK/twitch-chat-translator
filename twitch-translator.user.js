// ==UserScript==
// @name         Twitch Chat Translator
// @namespace    http://tampermonkey.net/
// @version      1.1
// @description  Translate chat message, copy to clipboard without modifying chat, with preview, clipboard notice, resets on send
// @match        https://www.twitch.tv/*
// @author       Masuta
// ==/UserScript==

(() => {
    'use strict';

    let targetLang = 'en';
    let lastTranslation = '';

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
        navigator.clipboard.writeText(text).then(() => {
            console.log('[Translator] Copied to clipboard:', text);
        }).catch(err => console.error('[Translator] Clipboard error:', err));
    }

    function createUI() {
        const container = document.createElement('div');
        container.style.cssText = 'display:flex;gap:4px;align-items:center;margin:4px 0;padding:2px 4px;border-radius:4px;background:rgba(0,0,0,0.35);color:#fff;font-size:11px;flex-wrap:wrap;';

        // Language
        const select = document.createElement('select');
        select.style.height='22px'; select.style.fontSize='11px';
        [['English','en'],['Français','fr'],['Español','es'],['Deutsch','de'],['Português','pt'],['日本語','ja'],['한국어','ko'],['Русский','ru']]
            .forEach(([n,c]) => { const o=document.createElement('option'); o.value=c; o.textContent=n; select.appendChild(o); });
        select.value = targetLang;
        select.onchange = e => targetLang = e.target.value;

        // Translate button
        const translateBtn = document.createElement('button');
        translateBtn.type='button';
        translateBtn.textContent='Translate';
        translateBtn.style.height='22px';
        translateBtn.style.fontSize='11px';

        // Preview button
        const previewBtn = document.createElement('button');
        previewBtn.type='button';
        previewBtn.textContent='Preview';
        previewBtn.style.height='22px';
        previewBtn.style.fontSize='11px';

        // Field for preview
        const previewField = document.createElement('div');
        previewField.style.cssText = 'margin-top:2px;padding:2px 4px;background:rgba(255,255,255,0.1);border-radius:4px;font-size:11px;color:#fff;max-width:100%;white-space:pre-wrap;word-break:break-word;';

        // Field for notifications (clipboard or error)
        const notice = document.createElement('div');
        notice.style.cssText = 'margin-top:2px;font-size:11px;font-weight:bold;display:none;';
        notice.textContent = '';

        function showNotice(text, color='#0f0') {
            notice.textContent = text;
            notice.style.color = color;
            notice.style.display = 'block';
            setTimeout(() => { notice.style.display = 'none'; }, 2000);
        }

        // Translate: copy to clipboard, do NOT touch chat field
        translateBtn.onclick = async () => {
            const input = document.querySelector('textarea[data-a-target="chat-input"], div[contenteditable][data-a-target="chat-input"]');
            const text = input?.value || input?.textContent || '';
            if (!text.trim()) {
                showNotice('⚠️ No text detected', '#ff0');
                return;
            }

            const translated = await translateText(text, targetLang);
            lastTranslation = translated;

            copyToClipboard(translated);
            showNotice('✅ Text copied to clipboard', '#0f0');
            previewField.textContent = translated;
        };

        // Preview: show translation without copying
        previewBtn.onclick = async () => {
            const input = document.querySelector('textarea[data-a-target="chat-input"], div[contenteditable][data-a-target="chat-input"]');
            const text = input?.value || input?.textContent || '';
            if (!text.trim()) {
                showNotice('⚠️ No text detected', '#ff0');
                return;
            }

            previewField.textContent = 'Translating...';
            const translated = await translateText(text, targetLang);
            previewField.textContent = translated;
        };

        // Reset preview and notice when message is sent
        function resetOnSend(inputField) {
            const reset = () => {
                previewField.textContent = '';
                notice.style.display = 'none';
                lastTranslation = '';
            };

            inputField.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' && !e.shiftKey) reset();
            });

            const sendBtn = inputField.closest('form')?.querySelector('button[data-a-target="chat-send-button"]');
            if (sendBtn) sendBtn.addEventListener('click', reset);
        }

        container.append(select, translateBtn, previewBtn, previewField, notice);

        setTimeout(() => {
            const inputField = document.querySelector('textarea[data-a-target="chat-input"], div[contenteditable][data-a-target="chat-input"]');
            if (inputField) resetOnSend(inputField);
        }, 500);

        return container;
    }

    function attachUI() {
        const input = document.querySelector('textarea[data-a-target="chat-input"], div[contenteditable][data-a-target="chat-input"]');
        if (!input) return;
        const parent = input.closest('form')?.parentElement || input.parentElement;
        if (!parent || document.getElementById('twitch-translator-ui')) return;

        const ui = createUI();
        ui.id='twitch-translator-ui';
        parent.insertBefore(ui, input);
    }

    const mo = new MutationObserver(attachUI);
    mo.observe(document.body, {childList:true, subtree:true});
    setInterval(attachUI, 3000);

    console.log('[TwitchTranslator v1.1] Loaded');
})();
