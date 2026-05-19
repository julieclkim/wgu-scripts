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

The `Send Payment Plan Link` action sends the payment plan details to the student's email address from `data/students.json`.

For the demo student Roy Williams, that email is:

```text
julie.genesys.test@gmail.com
```

The page uses FormSubmit as a lightweight browser-based email endpoint. First-time use for the recipient address may trigger an activation email. Confirm that activation email once, then retry the send button.

The sender values used in the email content are:

```text
From: info@mail.gcgovsc12.org
Reply-to: julie-uni@genesyssc12.mypurecloud.com
```

Important: FormSubmit controls the actual mail transport envelope. Those sender details are included in the submitted email content and reply-to metadata, but the message may still appear as delivered by FormSubmit or its mail service.
