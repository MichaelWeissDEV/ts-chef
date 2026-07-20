# Keyboard Shortcuts and Operation History

ts-chef does not claim any keyboard shortcut by default. Instead, it exposes normal commands and an open-ended named registry, leaving every key choice to the user.

## Register operations and pipelines

Add `tschef.shortcuts` to user or workspace settings:

```jsonc
"tschef.shortcuts": {
  "base64": "To Base64",
  "decode-json": "From Base64 | JSON Beautify",
  "decrypt-work": "pipeline:Work decrypt",
  "repeat": "history:last",
  "back": "history:previous",
  "forward": "history:next",
  "aes-again": "history:3"
}
```

Each property registers `tschef.shortcut.<id>` while the extension is active. IDs accept 1–64 letters, numbers, dots, underscores, and hyphens. Up to 1,000 entries are accepted as a safety bound.

Registry values support:

| Value | Meaning |
| --- | --- |
| `To Base64` | One operation with its normal defaults. |
| `From Base64 \| JSON Beautify` | An inline pipeline using standard pipe syntax and arguments. |
| `pipeline:Work decrypt` | The current saved or bundled pipeline with that name. |
| `history:last` | Repeat the newest session-history action. |
| `history:previous` | Move one action older, apply it, and wrap at the end. |
| `history:next` | Move one action newer, apply it, and wrap at the start. |
| `history:3` | Apply the third most recent action directly. |

For operations requiring keys or detailed arguments, configure a saved pipeline and reference it with `pipeline:<name>`, or use pipe argument syntax. Variables such as `{{aes-key}}` can still be resolved in the selected editor input.

## Bind the generated commands

Open **Preferences: Open Keyboard Shortcuts (JSON)** and bind the generated command ID:

```jsonc
[
  {
    "key": "ctrl+alt+b",
    "command": "tschef.shortcut.base64",
    "when": "editorTextFocus",
  },
  {
    "key": "ctrl+alt+left",
    "command": "tschef.shortcut.back",
    "when": "editorTextFocus",
  },
  {
    "key": "ctrl+alt+right",
    "command": "tschef.shortcut.forward",
    "when": "editorTextFocus",
  },
]
```

The **tschef: Configure Keyboard Shortcuts** command opens the relevant JSON files. Registry changes are reloaded without restarting VS Code. `tschef.runShortcut` can also receive an ID as its command argument or show all configured entries in a picker.

## History behavior

Quick Convert, Operations-view actions, recipes, hover conversions, entered pipelines, saved pipelines, and registered shortcuts feed one shared history. The newest original action is offset 1. For example, after AES, DES, then Base64:

- `history:last` and `history:1` apply Base64;
- `history:2` applies DES;
- `history:3` applies AES;
- repeatedly invoking `history:previous` starts before the newest action and cycles DES → AES → Base64 → DES.

Replayed actions are not recorded again. Starting a new original action resets the cycle cursor to the newest entry.

The history is intentionally memory-only and disappears when the extension host stops. This prevents configured arguments such as passwords and encryption keys from being written to storage without explicit consent. Its capacity is controlled by `tschef.shortcutHistorySize` (default 100, maximum 10,000).

## Direct history commands

These commands can be assigned without adding registry aliases:

- `tschef.repeatLastOperation`
- `tschef.cycleOperationHistoryBack`
- `tschef.cycleOperationHistoryForward`
- `tschef.repeatOperationFromHistory`
- `tschef.clearOperationHistory`

Shortcut execution replaces the current selection, or the whole active document when the selection is empty. The source range is snapshotted before asynchronous work; if it changes while the operation runs, replacement is refused.
