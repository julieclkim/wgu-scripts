# Genesys Data Action Wiring

The embedded GitHub page prepares the payload for the uploaded Genesys Cloud Data Action, but the actual send must be executed by Genesys Cloud or a trusted middleware service.

## Uploaded Data Action

Name:

```text
julie - Send Agentless Email v3
```

Endpoint:

```text
/api/v2/conversations/emails/agentless
```

Required inputs:

```text
fromAddress_email
toAddress_email
replyToAddress_email
subject
htmlBody
```

Optional inputs used by this package:

```text
fromAddress_name
toAddress_name
replyToAddress_name
```

## Iframe event emitted by the page

When the advisor clicks `Send through Genesys Data Action`, the page emits:

```js
window.parent.postMessage({
  eventType: "WGU_SEND_PAYMENT_PLAN_EMAIL",
  dataAction: {
    name: "julie - Send Agentless Email v3",
    endpoint: "/api/v2/conversations/emails/agentless",
    integrationType: "purecloud-data-actions"
  },
  inputs: {
    fromAddress_email: "info@mail.gcgovsc12.org",
    fromAddress_name: "WGU Student Financial Services",
    toAddress_email: "student email from data/students.json",
    toAddress_name: "student name from data/students.json",
    replyToAddress_email: "julie-uni@genesyssc12.mypurecloud.com",
    replyToAddress_name: "WGU Student Financial Services",
    subject: "...",
    htmlBody: "..."
  }
}, "*");
```

It also dispatches a browser CustomEvent:

```js
window.dispatchEvent(new CustomEvent("wgu:sendPaymentPlanEmail", { detail: request }));
```

## Production-safe pattern

1. Keep the student profile page hosted on GitHub Pages.
2. Let the page build the branded email body and Data Action input payload.
3. Use a Genesys-side bridge, native script action, or secure middleware to call the Data Action.
4. Do not expose OAuth secrets or client credentials inside GitHub Pages.

## Demo fallback

If no bridge is present, the page logs that the Data Action request was generated but not delivered. This avoids falsely showing a successful email send when Genesys has not actually executed the Data Action.
