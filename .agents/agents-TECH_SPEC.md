# Patronus — Technical Specification

## 1. Frontend

Use:

- React
- Vite

Prefer:

- Functional components
- React hooks
- Small reusable components
- Clear component responsibilities

Avoid unnecessarily complicated state-management libraries unless the project actually requires one.

---

# 2. Suggested Structure

Use a structure similar to:

```text
src/
├── components/
│   ├── common/
│   ├── circles/
│   ├── messaging/
│   └── layout/
│
├── pages/
│   ├── Home/
│   ├── CreateCircle/
│   ├── JoinCircle/
│   └── Circle/
│
├── data/
│   └── mock/
│
├── services/
│
├── hooks/
│
├── utils/
│
├── assets/
│
├── styles/
│
├── App.jsx
└── main.jsx
```

The exact structure may change if a better architecture becomes apparent.

Do not create unnecessary folders simply to follow this example.

---

# 3. Component Philosophy

Components should have one clear responsibility.

For example:

```text
CircleCard
MemberList
MessageBubble
MessageComposer
CircleHeader
PatronusButton
```

Avoid creating a single extremely large component containing the entire application.

---

# 4. Data Layer

Initially, mock data is acceptable.

Keep application logic separated from UI components where practical.

For example:

```text
services/
    circleService.js
    messageService.js
```

This makes it easier to replace mock/local data with Supabase later.

---

# 5. Future Backend

The intended future backend may use Supabase.

Potential responsibilities:

- Authentication
- PostgreSQL database
- Real-time messaging
- Circle membership
- Push notification data
- User profiles

Do not implement Supabase merely because it is planned.

The prototype should first establish a good frontend experience.

---

# 6. State

Local React state is sufficient for simple prototype functionality.

Potential state categories:

### UI State

- Modal open/closed
- Current screen
- Input fields
- Animation state

### Application State

- Current user
- Current Circle
- Messages
- Circle members

Avoid global state until there is a demonstrated need.

---

# 7. PWA

The application should eventually support:

- Web app manifest
- Service worker
- Installability
- Mobile home-screen installation
- Push notifications

PWA implementation should be introduced deliberately rather than adding unnecessary complexity during the first UI prototype.

---

# 8. Notifications

The architecture should allow a notification service to be added later.

Potential abstraction:

```text
notificationService
```

Responsibilities could eventually include:

- Request notification permission
- Register push subscription
- Handle notification events
- Send notification requests to backend
- Device capability detection

Do not put notification-specific logic throughout unrelated React components.

---

# 9. Device Capability

The application must assume that capabilities differ between:

- Desktop browsers
- Android browsers
- Android installed PWAs
- iOS Safari
- iOS installed PWAs

Never assume a browser API is universally supported.

Feature detection should be preferred over user-agent assumptions where possible.

---

# 10. Vibration

Browser vibration APIs must not be treated as equivalent to OS push notification vibration.

If vibration functionality is experimented with:

1. Detect support.
2. Use it only where appropriate.
3. Provide fallback behavior.
4. Never make it required for sending/receiving messages.

---

# 11. Security

Even in a demo:

- Never hardcode secrets.
- Never commit API keys.
- Never expose private credentials in frontend source code.
- Do not implement authentication using insecure fake password storage.
- Treat mock authentication as prototype-only.

---

# 12. Dependencies

Prefer the smallest reasonable dependency set.

Before installing a package, determine whether:

- The feature can reasonably be implemented with existing APIs.
- The dependency is actually necessary.
- It introduces unnecessary complexity.

Avoid dependency bloat.

---

# 13. Code Quality

Code should be:

- Readable
- Consistent
- Modular
- Maintainable
- Easy for another developer to understand

Avoid clever code when straightforward code is clearer.