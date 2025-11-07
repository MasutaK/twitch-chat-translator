# Changelog

## [1.2.0] - 2025-11-07
### Changed

#### Clipboard notification auto-hide:
- The “Text copied to clipboard” message now automatically disappears after 3 seconds.

#### Dynamic preview duration:
- The translated text preview now remains visible for a duration proportional to its length.
- Short messages disappear quickly.
- Longer translations stay visible longer, using a smart timing algorithm with min/max limits.

#### Improved user experience:
- Both clipboard and preview feedback are now smoother and less intrusive.

---

## [1.1.0] - 2025-11-06
### Changed
- Removed all `alert()` popups.
- Added a `showNotice(text, color)` function to display inline messages below the buttons.
  - ✅ Green for success (text copied).
  - ⚠️ Yellow for warning (no text detected).
- Messages automatically disappear after 2 seconds, consistent with the clipboard notification style.

---

## [1.0.0] - 2025-11-06
### Added
- Initial public release of **Twitch Chat Translator**.
- Translate Twitch chat messages and copy the result to clipboard.
- Optional preview of the translated text before sending.
- Language selection (English, French, Spanish, German, Portuguese, Japanese, Korean, Russian).
- **CC BY-NC 4.0** license (non-commercial use with attribution).

### Author
- **Masuta** (original idea)
