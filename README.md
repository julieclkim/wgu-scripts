# WGU Student Support, Minimal Live Agent Panel

This is a compact Genesys Cloud iframe page for a WGU live advisor demo.

It is intentionally minimal and designed for an agent on a live call. It contains:

- Student snapshot
- Financial hold cues
- Academic momentum cues
- Quick action popups
- Activity log

It does not include wrap-up, recap email, or long script text.

## Test URLs

```text
https://julieclkim.github.io/wgu-scripts/agent-script.html?StudentId=12345
```

```text
https://julieclkim.github.io/wgu-scripts/agent-script.html?StudentId=941115
```

## GitHub Pages

Upload these files to the root of the repo:

```text
agent-script.html
index.html
assets/wgu-call-panel.css
assets/wgu-call-panel.js
data/students.json
README.md
GENESYS-SETUP.md
.nojekyll
```

Then enable GitHub Pages from Settings, Pages, Deploy from branch, main, root.
