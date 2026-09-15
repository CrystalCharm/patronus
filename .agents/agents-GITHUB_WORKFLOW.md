# Patronus — GitHub Workflow

## 1. Git Responsibility

The AI agent is allowed to:

- Inspect Git status
- Inspect Git history
- Create branches when explicitly requested
- Stage files
- Create commits
- Review diffs
- Check commit history

The AI agent is **NOT allowed to push to GitHub**.

### Critical Rule

**The human developer performs all pushes.**

Never run:

```bash
git push
```

or:

```bash
git push origin <branch>
```

or any equivalent command.

Do not push using GitHub CLI, APIs, or other mechanisms either.

---

# 2. Before Making Changes

Check the repository state:

```bash
git status
```

Review the current branch:

```bash
git branch --show-current
```

If there are existing uncommitted changes, do not blindly overwrite or discard them.

Preserve the developer's existing work.

---

# 3. Before Committing

Review what changed:

```bash
git status
```

Then inspect the diff:

```bash
git diff
```

Make sure:

- Only relevant files are included.
- No secrets are included.
- No `.env` files containing credentials are committed.
- No generated junk files are committed.
- No unrelated changes are included.

---

# 4. Secrets

NEVER commit:

```text
.env
.env.local
.env.production
API keys
Supabase service-role keys
private keys
access tokens
passwords
credentials
```

If environment variables are required, use an example file such as:

```text
.env.example
```

with placeholder values only.

Example:

```text
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
```

Never place real credentials inside `.env.example`.

---

# 5. Commit Guidelines

Create focused commits.

A commit should represent one logical change.

Good:

```text
feat: add Circle creation flow
```

```text
feat: add messaging interface
```

```text
style: improve mobile Circle layout
```

```text
fix: prevent message composer overflow
```

Avoid vague commits such as:

```text
update
```

```text
changes
```

```text
fix stuff
```

```text
work
```

---

# 6. Conventional Commit Format

Prefer:

```text
<type>: <short description>
```

Common types:

```text
feat:     New functionality
fix:      Bug fix
style:    Visual/UI changes
refactor: Code restructuring without behavior change
docs:     Documentation
test:     Tests
chore:    Maintenance/configuration
```

Examples:

```text
feat: add Circle join flow
feat: add Patronus message composer
style: add magical landing page design
fix: resolve mobile chat overflow
refactor: separate message service
docs: update project architecture
```

---

# 7. Commit Size

Prefer several small, meaningful commits over one enormous commit.

For example:

```text
feat: add landing page
feat: add Circle creation modal
feat: add Circle dashboard
feat: add message composer
```

is preferable to:

```text
feat: build entire Patronus application
```

when the changes are substantial.

---

# 8. Never Rewrite Developer History

Do not use destructive Git commands unless explicitly instructed.

Do NOT run:

```bash
git reset --hard
```

```bash
git clean -fd
```

```bash
git checkout .
```

```bash
git restore .
```

Do not discard the developer's changes.

Do not amend an existing commit unless explicitly requested.

Do not force-push under any circumstances.

---

# 9. Existing Changes

If `git status` shows changes that were not created by the current task:

**Do not automatically commit them.**

Determine which files belong to the current task.

Only stage and commit the changes that belong to the work being performed.

If it is unclear which changes belong to the current task, stop and ask the developer.

---

# 10. Before Commit

Perform the appropriate validation for the task.

For frontend changes, preferably run:

```bash
npm run build
```

If a build script does not exist, use the project's available validation command.

Fix obvious errors before committing.

---

# 11. Commit Process

The preferred process is:

```bash
git status
git diff
npm run build
git add <relevant-files>
git diff --cached
git commit -m "type: description"
git status
```

After committing, verify the commit exists:

```bash
git log -1 --oneline
```

---

# 12. After Commit

Tell the developer:

### Commit Created

```text
<commit hash> <commit message>
```

### Files Changed

List the relevant files.

### Validation

State what was tested.

### Push Status

Explicitly state:

> **Not pushed. The developer must push this commit manually.**

---

# 13. Push Reminder

After every commit, remind the developer that the commit is local and still needs to be pushed.

Example:

> Commit created successfully. I did not push it. Please push the commit to GitHub when you're ready.

---

# 14. Absolute Rule

## NEVER PUSH

The AI agent must never execute any command that sends commits to a remote repository.

The developer controls GitHub pushes.

The agent's Git workflow ends at:

```text
COMMIT
  ↓
STOP
  ↓
INFORM DEVELOPER
  ↓
DEVELOPER PUSHES
```