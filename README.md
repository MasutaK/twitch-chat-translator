# Twitch Chat Translator Clipboard

**Version:** 1.0
**Author:** Masuta  
**License:** CC BY-NC 4.0  

A **Tampermonkey / Greasemonkey** userscript for Twitch chat that allows you to translate your chat messages into another language, copy the translation to your clipboard, and optionally preview it before sending. The script does **not modify the message in the chat**, keeping your original text intact.  

---

## Features

- Translate your Twitch chat messages into multiple languages.
- Copy translated text directly to the clipboard.
- Optional preview of the translated message.
- Shows a temporary notification when the translation is copied.
- Automatically resets preview and clipboard notice when a message is sent.
- Supports multiple languages including English, French, Spanish, German, Portuguese, Japanese, Korean, and Russian.

---

## Installation

1. Install [Tampermonkey](https://www.tampermonkey.net/) or [Greasemonkey](https://www.greasespot.net/) in your browser.
2. Go to the [Raw GitHub URL](https://raw.githubusercontent.com/YOUR_USERNAME/twitch-chat-translator/main/twitch-translator.user.js) of the script.
3. Click **Install** when prompted by Tampermonkey.

> Make sure the script is enabled in your Tampermonkey dashboard.

---

## Usage

1. Open Twitch and navigate to a channel chat.  
2. The translator UI will appear above your chat input box.  
3. Select your target language from the dropdown.  
4. Type your message in the chat input.  
5. Click **Translate** to copy the translation to your clipboard.  
6. Click **Preview** to see the translation without copying.  
7. Use the checkbox **Show Preview** to toggle preview visibility.  
8. Once you send a message, the preview and clipboard notification will automatically reset.

---

## Supported Languages

| Language      | Code |
|---------------|------|
| English       | en   |
| Français      | fr   |
| Español       | es   |
| Deutsch       | de   |
| Português     | pt   |
| 日本語        | ja   |
| 한국어        | ko   |
| Русский       | ru   |

---

## Attribution & License

This project is licensed under the **Creative Commons Attribution-NonCommercial 4.0 International (CC BY-NC 4.0)**.  

### You must:

- Give credit to the original author: `Masuta` and/or `[Your Name]`.  
- Not use the script for commercial purposes.  
- Include a link to the license if redistributing.

**License link:** [https://creativecommons.org/licenses/by-nc/4.0/](https://creativecommons.org/licenses/by-nc/4.0/)

---

## Contributing

Feel free to fork the repository, suggest improvements, or submit pull requests.  
Please keep clear commit messages and respect the non-commercial requirement.

---

**Note:** This script relies on the free Google Translate API endpoint, which may have usage limits.
