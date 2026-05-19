# Payment Plan Email Setup

The `Send Payment Plan Link` button uses FormSubmit from the browser so the demo can send an actual email without a custom backend.

## Recipient

The email is sent to the student's `email` value from `data/students.json`.

For Roy Williams:

```text
julie.genesys.test@gmail.com
```

## First-time activation

FormSubmit requires the recipient email address to be confirmed the first time submissions are sent to that address.

Demo setup:

1. Open the live financial page URL.
2. Click `Send Payment Plan Link`.
3. Click `Send email`.
4. Check `julie.genesys.test@gmail.com` for a FormSubmit activation email.
5. Confirm the activation.
6. Repeat the Send email action.

## Current sender settings

```text
Displayed sender name: WGU Student Financial Services
Reply-to email: julie-uni@genesyssc12.mypurecloud.com
Reference sender email in content: info@mail.gcgovsc12.org
```

Because this is a static GitHub Pages demo, there is no private server-side credential store. Do not place private SMTP credentials, API secrets, or bearer tokens in this repo.
