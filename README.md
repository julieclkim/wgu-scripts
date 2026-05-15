# WGU Student Support Demo

This is a minimal Genesys Cloud web script for a live advisor demo. It is designed to stay lightweight in an agent iframe during a call.

## Primary demo URL

```text
https://YOUR-GITHUB-USERNAME.github.io/YOUR-REPO/agent-script.html?StudentId=12345
```

For Julie's repo:

```text
https://julieclkim.github.io/wgu-scripts/agent-script.html?StudentId=12345
```

## Student lookup

The page reads the student ID from any of these URL parameters:

```text
StudentId
studentId
student_id
studentID
key
id
```

The student records are in:

```text
data/students.json
```

## Genesys Cloud setup

Create a Genesys script input variable:

```text
Name: StudentId
Type: String
Input: Yes
Output: No
```

Add a Web Page component and set the URL to:

```text
https://julieclkim.github.io/wgu-scripts/agent-script.html?StudentId=<insert Genesys StudentId variable>
```

Use the Genesys variable picker for the value after `StudentId=`. Do not type curly braces manually.

## What the page includes

- Student context
- Financial hold guide
- Academic momentum guide
- Quick tools
- Dummy popups for profile, handoff history, payment info, SFS referral, course progress, mentor note, and follow-up scheduling
- On-screen activity log

## What is intentionally removed

- Wrap-up page
- Wrap-up disposition
- Recap email
- Long advisor scripts
- Backend writes to Genesys

All button actions are demo-only and update the page UI only.
