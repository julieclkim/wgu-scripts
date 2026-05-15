# WGU Student Support demo script

This package contains a single advisor-facing Genesys Cloud demo page for the WGU student support scenario.

## Files

```text
agent-script.html
index.html
assets/wgu-demo.css
assets/wgu-demo.js
data/students.json
.nojekyll
```

## What the page does

The page is a minimal live advisor script for Charles Spencer. It gives the advisor three side-by-side areas:

1. Student context
2. Live call guide
3. Quick tools and activity log

The buttons open demo popups inside the page. They do not call Genesys or external systems. They are designed for a live demo where the advisor can show process completion without needing backend configuration.

## Demo actions

| Button | Demo behavior | Log entry |
| --- | --- | --- |
| Open profile | Opens a full student snapshot | Student profile viewed |
| History | Opens the Sage handoff history | Handoff history viewed |
| Payment portal | Opens a simulated payment portal panel | Payment portal opened |
| Create SFS ref | Opens a Student Financial Services referral form | Student Financial Services referral created |
| Course progress | Opens a course progress snapshot | Course progress viewed |
| Mentor note | Opens a prefilled Program Mentor note | Program Mentor note added |
| Schedule | Opens a follow-up scheduling form | Follow-up scheduled |
| Send recap | Opens a prewritten student recap email | Recap email sent |
| Complete wrap | Opens wrap-up fields and disposition | Interaction wrapped |

## GitHub Pages URL

After publishing this repo with GitHub Pages, open:

```text
https://YOUR-GITHUB-USERNAME.github.io/YOUR-REPO/agent-script.html?StudentId=12345
```

For Julie's repo example:

```text
https://julieclkim.github.io/wgu-scripts/agent-script.html?StudentId=12345
```

## Genesys Cloud Web Page component URL

Use this in the Genesys Cloud Script Web Page component:

```text
https://YOUR-GITHUB-USERNAME.github.io/YOUR-REPO/agent-script.html?StudentId=<insert Genesys StudentId variable>
```

The page accepts these query parameter names:

```text
StudentId
studentId
student_id
studentID
key
id
```

For this demo, the included student record is `12345`.

## Important

Upload the contents of this folder to the root of the repo.

Correct:

```text
repo/
  agent-script.html
  index.html
  assets/
  data/
```

Wrong:

```text
repo/
  wgu-live-advisor-demo/
    agent-script.html
    assets/
    data/
```
