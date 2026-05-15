# Genesys Cloud setup checklist

## 1. Host files on GitHub Pages

Upload the contents of this folder into the root of a new GitHub repo.

Correct:

```text
repo-root/
  agent-script.html
  index.html
  assets/
  data/
```

Incorrect:

```text
repo-root/
  wgu-student-support-script/
    agent-script.html
```

Enable GitHub Pages from the main branch and root folder.

## 2. Create the Genesys script variable

In the Genesys Cloud Script:

```text
Variable name: StudentId
Type: String
Input: Yes
Output: No
```

## 3. Add a Web Page component

Use this as the Web Page Source:

```text
https://YOUR-GITHUB-USERNAME.github.io/YOUR-REPO/agent-script.html?StudentId=<insert Genesys StudentId variable>
```

Use the variable picker for the value after `StudentId=`.

Do not type:

```text
{{StudentId}}
```

## 4. Enable inbound and publish

In Script Properties:

```text
Inbound: Enabled
```

Then publish the script.

## 5. Architect Set Screen Pop

In the inbound call flow, add Set Screen Pop before Transfer to ACD.

Map the virtual agent collected student ID into the script input variable:

```text
StudentId = Flow.StudentId
```

Use expression mode for the right side. Do not put the flow variable name in quotes.

## 6. Test

Browser test:

```text
https://YOUR-GITHUB-USERNAME.github.io/YOUR-REPO/agent-script.html?StudentId=12345
```

Runtime success looks like:

```text
Student ID 12345
Charles Spencer
Balance due $1,600
Risk flag Registration Delay Risk
```

If the page shows a setup warning, the student ID is either missing, unresolved, or not present in `data/students.json`.
