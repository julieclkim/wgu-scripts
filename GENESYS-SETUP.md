# Genesys setup

1. Create a Genesys Cloud Script.
2. Add a string input variable named StudentId.
3. Add a Web Page component.
4. Use this URL:

```text
https://julieclkim.github.io/wgu-scripts/agent-script.html?StudentId=<insert Genesys StudentId variable>
```

Do not type curly braces manually. Insert the StudentId variable using the Genesys variable picker.

For a hardcoded test, use:

```text
https://julieclkim.github.io/wgu-scripts/agent-script.html?StudentId=12345
```

Enable Inbound, save, and publish the script. In Architect, use Set Screen Pop before Transfer to ACD and map the collected student ID into StudentId.
