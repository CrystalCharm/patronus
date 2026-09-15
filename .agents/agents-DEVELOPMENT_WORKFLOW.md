# Patronus — Development Workflow

## 1. General Rule

Work incrementally.

Do not attempt to build the entire application in one pass.

Before making a major change:

1. Inspect the existing project.
2. Understand the current architecture.
3. Identify the smallest useful implementation.
4. Implement it.
5. Test it.
6. Fix obvious issues.
7. Report what changed.

---

# 2. Before Coding

Always inspect:

- Existing files
- package.json
- Existing components
- Existing routes
- Existing styles
- Existing configuration

Do not overwrite existing work without understanding it.

---

# 3. Task Scope

When given a task:

### First

Determine exactly what the task requires.

### Then

Identify which files actually need modification.

### Finally

Implement only the necessary changes.

Do not refactor unrelated code.

---

# 4. Visual Tasks

For UI tasks:

1. Inspect the current UI.
2. Preserve working functionality.
3. Implement the requested visual/UX change.
4. Check desktop layout.
5. Check mobile layout.
6. Check for overflow or broken spacing.

---

# 5. Testing

After meaningful changes:

- Run the development server/build.
- Check for compilation errors.
- Check browser console errors where applicable.
- Verify the affected user flow.

At minimum, confirm:

```text
npm run build
```

works when a production build is configured.

---

# 6. Mobile Testing

Because Patronus is intended for phones, always consider:

### Mobile

- 360px width
- 390px width
- 430px width

### Desktop

- 1280px+
 
Do not assume a desktop layout will automatically work on mobile.

---

# 7. Dependencies

Do not install packages without a reason.

If a package is necessary:

- Explain why it is needed.
- Prefer established packages.
- Avoid multiple packages solving the same problem.

---

# 8. Backend

Do not introduce Supabase or another backend unless the current task requires it.

The project can initially use mock/local data.

When the backend is introduced, keep it behind service abstractions where practical.

---

# 9. Git

Make focused commits when requested.

Commit messages should describe the actual change.

Examples:

```text
feat: add circle creation flow
feat: add messaging interface
style: improve mobile chat layout
fix: prevent message composer overflow
```

Do not create commits containing unrelated changes.

---

# 10. Agent Communication

When finishing a task, report:

### Changed

List the major files/features changed.

### Tested

Explain what was tested.

### Notes

Mention limitations, assumptions, or follow-up work.

Keep the report concise.

---

# 11. Do Not Overengineer

This is a demo application.

Prefer:

```text
Simple + working + maintainable
```

over:

```text
Complex + theoretically scalable + unfinished
```

Build the experience first.

Scale the architecture when the requirements justify it.

---

# 12. Current Priority Order

When deciding what to build next, prioritize:

1. Core user experience
2. Mobile experience
3. Visual identity
4. Circle creation/joining
5. Messaging
6. PWA
7. Notifications
8. Backend
9. Advanced notification behavior
10. Experimental features

---

# 13. Current Development Instruction

The current goal is to create a polished **frontend prototype** of Patronus.

Do not jump directly into:

- Authentication
- Supabase
- Push notification infrastructure
- Custom vibration
- Production deployment

unless explicitly requested.

First make the core experience feel excellent.