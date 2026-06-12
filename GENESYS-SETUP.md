# Genesys setup checklist

1. Host these files in a GitHub Pages repo.
2. Create a Genesys Cloud Script.
3. Add a string input variable named `ApplicantId`.
4. Add a Web Page component.
5. Set the Web Page Source to:

```text
https://YOUR-GITHUB-USERNAME.github.io/YOUR-REPO/agent-script.html?ApplicantId=<insert ApplicantId variable>
```

6. Enable Inbound on the script.
7. Publish the script.
8. In Architect, use Set Screen Pop before Transfer to ACD and map the collected applicant email or ID into `ApplicantId`.

For a hardcoded test, use:

```text
ApplicantId = "maya.chen@example.com"
```
