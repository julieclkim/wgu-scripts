# Advisor Scheduling Page

## Purpose

`schedule-script.html` is a separate script page for demo-only appointment scheduling. It is not a tab in the main student profile. It can be opened directly from Genesys, or from the `Schedule Advisor Call` quick action in the main page.

## URL

```text
https://julieclkim.github.io/wgu-scripts/schedule-script.html?StudentId=<insert Genesys StudentId variable>
```

For hardcoded testing:

```text
https://julieclkim.github.io/wgu-scripts/schedule-script.html?StudentId=12345
```

## What it does

- Loads the same student record from `data/students.json`
- Displays the assigned advisor from `assigned_program_mentor`
- Shows dummy advisor availability
- Prefills owner, channel, duration, selected time, and appointment notes
- Lets the agent select a slot and click `Schedule appointment`
- Displays a demo-only success message
- Emits a `WGU_SCHEDULE_ADVISOR_CALL` event to the parent iframe

## Demo-only boundary

This page does not create a real calendar event. It is designed to show the agent experience without requiring Outlook, Genesys scheduling, or a backend service.

## Parent iframe event payload

```json
{
  "eventType": "WGU_SCHEDULE_ADVISOR_CALL",
  "studentId": "12345",
  "studentName": "Rory Williams",
  "advisorName": "Carla Espinosa",
  "appointment": {
    "topic": "Advisor follow-up",
    "channel": "Phone call",
    "duration": "30 minutes",
    "day": "Mon, May 25, 2026",
    "time": "2:30 PM MT",
    "callbackNumber": "+16054311804",
    "notes": "Prefilled appointment notes"
  }
}
```
