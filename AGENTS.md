# Agent Instructions

This repository is a Deputies demo workspace. In addition to normal coding, testing, and GitHub work, use Deputies session capabilities to make work easy for a human to inspect.

## Deputies Capabilities

When available, use Deputies tools for user-visible outputs:

- Publish preview apps and other HTTP services with the `service` tool.
- Delegate focused research, planning, review, or implementation work with the `subagent` tool.
- Use the integrated VS Code workspace tool when the user wants interactive file inspection or editing.
- Attach durable artifacts with the `artifact` tool for screenshots, reports, logs, generated files, videos, and other review material.
- Use repository-aware GitHub tools to create issues, push branches, and open or edit pull requests.
- Let Deputies post final Slack/GitHub callback replies through the normal session response; do not post duplicate final comments directly.

### Subagents

The public Deputies instance uses the Pi runner, which provides a native `subagent` tool. Use it for focused work that benefits from an isolated context window.

Available profiles:

- `explore`: read-only codebase reconnaissance and context gathering.
- `planner`: grounded implementation planning without edits.
- `reviewer`: independent review for bugs, regressions, missing tests, and security issues.
- `general`: delegated implementation or investigation work.

Example:

```js
subagent({
  agent: "explore",
  task: "Inspect the repository structure and identify how to run the app locally."
})
```

Rules:
- Keep each subagent task focused and specify the expected output.
- Prefer explore, planner, or reviewer when edits are not needed.
- Use general only for delegated implementation or deeper investigation.
- The parent agent owns final decisions, user communication, PRs, issues, previews, and artifacts.
- Avoid subagents for quick lookups, tiny edits, or latency-sensitive one-step work.
- Coordinate edits carefully; Pi subagents run inside the same Deputies sandbox/workspace.
- Nested subagent delegation may be available but should be rare.

### Preview Apps:

If you build or change something visual, try to provide a live preview.

Start the app inside the sandbox on a real port and bind to 0.0.0.0 when the framework supports it. For Vite-style apps, avoid hard-coding HMR to localhost; let the browser URL drive HMR.

After the service is reachable, publish it:

```
service({
  action: "publish",
  port: 5173,
  label: "Web preview",
  path: "/"
})
```
Use clear labels such as Web preview, API docs, Storybook, Dashboard, or Jupyter.
If the user needs more time with a preview, extend the keepalive:

```
service({
  action: "extend",
  port: 5173,
  ttlSeconds: 1800
})
```

Unpublish stale services when they no longer point at the current work:
```
service({
  action: "unpublish",
  port: 5173
})
```

Do not create public tunnels. Deputies preview links are the intended authenticated access path.

### Integrated VS Code

Deputies can expose an integrated VS Code server for the sandbox workspace. If the user asks to inspect or edit interactively, direct them to open the VS Code workspace tool in the Deputies session.
If you need to start a code-server service yourself and code-server is installed, bind it to port 8080 and publish it as VS Code. Do not add separate code-server passwords; Deputies preview auth protects the published link.

### Artifacts

Use artifacts when the output is useful beyond the final text response:
```
artifact({
  action: "create",
  path: "/workspace/result.png",
  type: "image",
  title: "Generated image",
  contentType: "image/png",
  fileName: "generated-image.png"
})
```

Good artifact candidates:
- Screenshots of UI changes.
- Test reports or coverage reports.
- Long logs that would clutter the final response.
- Generated data files.
- Browser-playable MP4 videos.
- Design mockups or exported images.

Use the returned markdownLink when referencing an artifact. Do not attach secrets, private keys, tokens, .env files, or credential-bearing logs.

### GitHub Work
When repository tools are available, use them before GitHub operations:
```
repository({ action: "status" })
repository({ action: "list" })
repository({ action: "set", owner: "sidpalas", repo: "deputies-demo", reason: "demo task" })
repository({ action: "prepare" })
```

For authenticated git network operations, use the git tool and omit the git executable name:
```
git({ args: ["push", "origin", "sp/demo-change"] })
```

Do not force-push, delete remote branches, mirror-push, or use destructive refspecs unless explicitly requested and approved.

For GitHub issues and PRs, use the gh tool and omit the gh executable name:
```
gh({ args: ["issue", "create", "--title", "Demo follow-up", "--body", "Details..."] })
gh({ args: ["pr", "create", "--title", "Demo change", "--body", "Summary and tests...", "--head", "sp/demo-change", "--base", "main"] })
```
Do not post final issue or PR comments directly through gh; Deputies callbacks handle final replies. Include PR URLs, issue URLs, preview links, and artifact links in the final response.

### Security
Never commit, print, artifact, or preview secrets. Treat private keys, tokens, cookies, .env files, and credentials as sensitive even if they appear in the workspace or prompt context.

Prefer small, reversible changes. Before creating a PR, verify the work with the relevant tests or explain exactly what could not be run.
