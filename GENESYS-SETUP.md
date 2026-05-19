# Genesys Cloud Setup

## 1. Host files on GitHub Pages

Upload the contents of this folder to the root of the GitHub repo and enable Pages from `main` and `/root`.

## 2. Create script variable

Create a Genesys Cloud Script input variable:

```text
Name: StudentId
Type: String
Input: Yes
Output: No
```

## 3. Add Web Page component

Use this URL:

```text
https://julieclkim.github.io/wgu-scripts/agent-script.html?StudentId=<insert Genesys StudentId variable>
```

## 4. Publish script and enable inbound

Make sure the script is published and inbound-enabled before selecting it in Architect.

## 5. Architect mapping

In Set Screen Pop, map the collected virtual agent student ID to the script input variable:

```text
StudentId = Flow.StudentId
```

For a hardcoded test:

```text
StudentId = "12345"
```
