# Changelog

## [1.4.0] - 2025-11-08
### Added
#### Persistent settings: 
- The translator now remembers the selected language and whether the panel is visible (collapsed) or expanded, even when switching streams.

#### New languages: 
- Added Chinese (zh) and Arabic (ar) to the language selector.

### Changed
#### UI persistence: 
- The visibility state of the panel is now saved and restored automatically.

#### Improved usability:
- Users no longer need to reselect their language or toggle visibility each time they open a new stream.

### Fixed
- Minor adjustments to ensure smooth toggle animations when restoring the collapsed/expanded state.

## [1.3.0] - 2025-11-07
### Added
#### Collapsible UI panel:
- Added a toggle arrow on the left side to show or hide the language selector and action buttons.
- By default, the panel is expanded and fully visible.
- Users can click the arrow to collapse the interface for a cleaner look.

### Changed
#### Transparent background:
- The translator panel background is now fully transparent, blending naturally with Twitch’s chat area.

#### Layout improvements:
- All UI elements are now left-aligned for a cleaner and more compact appearance.
- Removed extra spacing and visual artifacts below the language selector and buttons.

---

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
