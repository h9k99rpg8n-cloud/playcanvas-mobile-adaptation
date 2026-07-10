# Atlas Engine repository guidance

## Project identity

- Atlas Engine is a mobile-first web 3D editor.
- Atlas is separate from Jumbo, Studio Lite, Sentrix Studio and Roblox projects.
- The active renderer is Three.js, not PlayCanvas.
- The public target is GitHub Pages and the primary real-device target is iPhone.

## Active entry points

- `index.html`: launcher.
- `scene-editor.html`: 3D editor.
- `projects.html`: compatibility redirect.
- `audio.html`: isolated experiment, not part of the active editor.

## Development rules

- Preserve IndexedDB project data and scene compatibility.
- Keep new behavior modular; do not create a monolithic HTML or JavaScript file.
- Do not update Three.js during unrelated work.
- Do not mix cleanup, redesign and new editor features in one change.
- Treat mobile touch behavior and safe areas as required, not optional.
- Run syntax, import and link checks before committing.
- Test create, open, save, reload and hierarchy behavior before merging.
- Do not merge a cleanup if active behavior changes unexpectedly.

## Current priority

Finish hierarchy and parent-child persistence before implementing an editable inspector.
