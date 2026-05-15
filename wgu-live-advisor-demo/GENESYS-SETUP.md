# Genesys setup

1. Create a Genesys Cloud Script.
2. Add a string input variable named `StudentId`.
3. Add a Web Page component.
4. Set the Web Page Source to your GitHub Pages URL:

```text
https://YOUR-GITHUB-USERNAME.github.io/YOUR-REPO/agent-script.html?StudentId=<insert Genesys StudentId variable>
```

5. Enable the script for inbound.
6. Publish the script.
7. In Architect, add Set Screen Pop before Transfer to ACD.
8. Select the published script.
9. Map the virtual agent's collected student ID into the script input:

```text
StudentId = Flow.StudentId
```

Test first with a hardcoded value:

```text
StudentId = "12345"
```

If Charles appears, the GitHub page and Genesys Script are configured correctly. Then replace the hardcoded value with the actual flow variable.
