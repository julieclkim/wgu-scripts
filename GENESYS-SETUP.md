# Genesys setup checklist

1. Upload the files to the root of the GitHub repo.
2. Enable GitHub Pages from `main` and `/root`.
3. Test in the browser:

```text
https://julieclkim.github.io/wgu-scripts/agent-script.html?StudentId=12345
```

4. In Genesys Cloud, create a new script named `WGU Student Support`.
5. Add a string input variable named `StudentId`.
6. Add a Web Page component.
7. Set the Web Page Source to your GitHub Pages URL with `StudentId=` and insert the Genesys variable after the equals sign.
8. Enable Inbound on the script.
9. Publish the script.
10. In Architect, add Set Screen Pop before Transfer to ACD.
11. Map the collected student ID into the `StudentId` script input.

Recommended first test:

```text
StudentId = "12345"
```

After that works, replace the hardcoded value with the flow variable that contains the student ID.
