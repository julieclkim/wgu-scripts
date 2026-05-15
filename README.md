# WGU Student Support Script

Minimal advisor-facing Genesys Cloud web script for a WGU student support handoff.

## Files

```text
agent-script.html
index.html
assets/wgu-support.css
assets/wgu-support.js
data/students.json
.nojekyll
GENESYS-SETUP-CHECKLIST.md
```

## Test URLs after GitHub Pages is enabled

```text
https://YOUR-GITHUB-USERNAME.github.io/YOUR-REPO/agent-script.html?StudentId=12345
https://YOUR-GITHUB-USERNAME.github.io/YOUR-REPO/agent-script.html?StudentId=941115
```

The script also accepts these aliases:

```text
StudentId
studentId
student_id
studentID
key
id
```

## Recommended Genesys Cloud Web Page Source

Use the Genesys variable picker to insert the StudentId value. Do not type curly braces manually.

```text
https://YOUR-GITHUB-USERNAME.github.io/YOUR-REPO/agent-script.html?StudentId=<insert Genesys StudentId variable>
```

## Optional advisor name

You can pass the advisor name for the opening prompt.

```text
agent-script.html?StudentId=12345&advisorName=Julie
```

## Updating student data

Edit `data/students.json`. The lookup key must match the StudentId value passed by Genesys.

Example:

```json
{
  "12345": {
    "key": "12345",
    "full_name": "Charles Spencer"
  }
}
```

## What this script is designed to do

The page is not a long read-aloud script. It is a side-by-side live support guide that gives the advisor:

- Student context from the virtual agent handoff
- A concise opening prompt
- Financial hold guardrails
- Course momentum routing logic
- Quick action logging
- A suggested wrap-up note

