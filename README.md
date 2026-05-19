# WGU Student Support - Minimal Agent Panel

This package contains a stripped-down Genesys Cloud web script for a WGU student support demo.

## Pages

- `agent-script.html` - Main embedded student profile and financial support page
- `schedule-script.html` - Separate advisor scheduling page, not shown as a tab in the main script
- `data/students.json` - Demo student records
- `assets/wgu-finance-minimal.css` - Main script styling
- `assets/wgu-finance-minimal.js` - Main script data lookup, tabs, popups, and Data Action payload builder
- `assets/wgu-schedule.css` - Scheduling page styling
- `assets/wgu-schedule.js` - Scheduling page data lookup, advisor availability, and demo appointment confirmation

## Test URLs

```text
https://YOUR-GITHUB-USERNAME.github.io/YOUR-REPO/agent-script.html?StudentId=12345
https://YOUR-GITHUB-USERNAME.github.io/YOUR-REPO/schedule-script.html?StudentId=12345
```

For Julie's repo:

```text
https://julieclkim.github.io/wgu-scripts/agent-script.html?StudentId=12345
https://julieclkim.github.io/wgu-scripts/schedule-script.html?StudentId=12345
```

## Genesys Web Page URLs

Main student profile script:

```text
https://julieclkim.github.io/wgu-scripts/agent-script.html?StudentId=<insert Genesys StudentId variable>
```

Advisor scheduling script:

```text
https://julieclkim.github.io/wgu-scripts/schedule-script.html?StudentId=<insert Genesys StudentId variable>
```

Use the Genesys variable picker. Do not type curly braces manually.

## Main script tabs

- Student: compact student snapshot and contact context
- Financial: essential balance, aid, due date, and eligible payment plan summary

## Main script quick actions

- Send Payment Plan Link
- Open Student Account
- Create Financial Services Follow-Up
- Schedule Advisor Call
- Transfer to Tier II / Specialist

## Scheduling page

The scheduling page is intentionally separate from the tabs. It loads the same `StudentId`, pulls the assigned advisor from `data/students.json`, shows dummy advisor availability, and pre-fills appointment notes so the agent does not need to type during the demo.

When the agent clicks `Schedule appointment`, the page displays a demo confirmation and emits this event to the parent iframe:

```text
WGU_SCHEDULE_ADVISOR_CALL
```

This does not create a real calendar event. It is demo-only.

## Payment plan link Data Action

The `Send Payment Plan Link` button builds the input payload for this Genesys Cloud Data Action:

```text
julie - Send Agentless Email v3
```

Expected input contract:

```json
{
  "fromAddress_email": "info@mail.gcgovsc12.org",
  "fromAddress_name": "WGU Student Financial Services",
  "toAddress_email": "student email",
  "toAddress_name": "student name",
  "replyToAddress_email": "julie-uni@genesyssc12.mypurecloud.com",
  "replyToAddress_name": "WGU Student Financial Services",
  "subject": "email subject",
  "htmlBody": "full branded HTML email"
}
```

The page dispatches this browser event and also sends it to the parent iframe frame:

```text
WGU_SEND_PAYMENT_PLAN_EMAIL
```

The page cannot authenticate to Genesys Cloud by itself from GitHub Pages. To send a real email, connect this event to a Genesys-side action bridge, a native Genesys Script Data Action step, or a middleware endpoint that calls the Data Action.
