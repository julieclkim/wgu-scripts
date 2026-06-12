# WGU Applicant Correction Demo Script

Minimal GitHub Pages script for a WGU-style applicant transfer scenario.

Scenario: an applicant made a mistake on their application and is transferred to a live enrollment counselor.

## Files

```text
agent-script.html
index.html
assets/applicant-support.css
assets/applicant-support.js
data/applicants.json
.nojekyll
```

## Test URLs

```text
https://YOUR-GITHUB-USERNAME.github.io/YOUR-REPO/agent-script.html?ApplicantId=maya.chen@example.com
https://YOUR-GITHUB-USERNAME.github.io/YOUR-REPO/agent-script.html?ApplicantId=jordan.brooks@example.com
https://YOUR-GITHUB-USERNAME.github.io/YOUR-REPO/agent-script.html?ApplicantId=sofia.martinez@example.com
```

The page accepts these URL parameters:

```text
ApplicantId
applicantId
applicant_id
key
email
id
```

## Suggested Genesys Web Page URL

```text
https://YOUR-GITHUB-USERNAME.github.io/YOUR-REPO/agent-script.html?ApplicantId=<insert ApplicantId variable>
```

Do not type curly braces manually. Insert the script variable through the Genesys variable picker.

## Demo actions

All action buttons are dummy demo-only actions. They update the on-screen activity log and show a short confirmation, but they do not write to a live system.
