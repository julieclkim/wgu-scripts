# WGU Student Support - Minimal Agent Panel

This package contains a minimal WGU student support web script for a live advisor demo.

## Pages

- `agent-script.html` - Main student snapshot page
- `financial-script.html` - Separate financial details page
- `schedule-script.html` - Separate advisor scheduling page
- `data/students.json` - Demo student records
- `assets/wgu-finance-minimal.css` - Main and financial page styling
- `assets/wgu-finance-minimal.js` - Student lookup, financial actions, popups, and payment-plan email
- `assets/wgu-schedule.css` - Scheduling page styling
- `assets/wgu-schedule.js` - Scheduling page lookup, advisor availability, and demo appointment confirmation

## Test URLs

```text
https://YOUR-GITHUB-USERNAME.github.io/YOUR-REPO/agent-script.html?StudentId=12345
https://YOUR-GITHUB-USERNAME.github.io/YOUR-REPO/financial-script.html?StudentId=12345
https://YOUR-GITHUB-USERNAME.github.io/YOUR-REPO/schedule-script.html?StudentId=12345
```

For Julie's repo:

```text
https://julieclkim.github.io/wgu-scripts/agent-script.html?StudentId=12345
https://julieclkim.github.io/wgu-scripts/financial-script.html?StudentId=12345
https://julieclkim.github.io/wgu-scripts/schedule-script.html?StudentId=12345
```

## Web Page URLs for Genesys

Main student profile script:

```text
https://julieclkim.github.io/wgu-scripts/agent-script.html?StudentId=<insert StudentId variable>
```

Financial details script:

```text
https://julieclkim.github.io/wgu-scripts/financial-script.html?StudentId=<insert StudentId variable>
```

Advisor scheduling script:

```text
https://julieclkim.github.io/wgu-scripts/schedule-script.html?StudentId=<insert StudentId variable>
```

Use the variable picker in the script editor. Do not type curly braces manually.

## Main student page

The main page only shows essential student context:

- Student ID
- Status
- Program
- Mentor
- Phone
- Email
- Contact reason
- Course focus
- Student note

## Financial page

The financial page contains the financial details and actions:

- Balance
- Aid status
- Expected aid date
- Due date
- Eligible payment plan
- Aid award summary
- Send payment plan link
- Open student account
- Create Financial Services follow-up
- Transfer to Tier II / Specialist

## Scheduling page

The scheduling page is intentionally separate from the main student page. It loads the same `StudentId`, pulls the assigned advisor from `data/students.json`, shows dummy advisor availability, and pre-fills appointment notes so the agent does not need to type during the demo.

When the agent clicks `Schedule appointment`, the page displays a demo confirmation. It does not create a real calendar event.

## Payment plan email

The `Send Payment Plan Link` action is demo-only in this version.

It opens a preview of the payment plan email, lets the advisor click `Send email`, marks the email as sent on screen, and adds the action to the activity log.

No live delivery is used. This is a visual demo action only.

For the demo student Roy Williams, the displayed recipient email is pulled from `data/students.json`:

```text
julie.genesys.test@gmail.com
```
