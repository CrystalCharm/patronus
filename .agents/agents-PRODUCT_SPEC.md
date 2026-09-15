# Patronus — Product Specification

## 1. Product Overview

Patronus is a magical messaging and notification web application for couples and friends.

Users communicate inside private **Circles**.

A Circle is essentially a private group.

Inside a Circle, members can send messages to each other.

The magical metaphor is:

> **Messages are Patronuses.**

---

# 2. Terminology

Use the following terminology consistently.

| Conventional Term | Patronus Term |
|---|---|
| Group | Circle |
| Create Group | Create Circle |
| Join Group | Join Circle |
| Group Code | Circle Code |
| Member | Circle Member |
| Message | Patronus |
| Send Message | Send Patronus |
| Notification | Patronus Alert |
| Profile | Wizard Profile |
| Settings | Spellbook |
| Group Owner/Admin | Circle Keeper |

Do not force magical terminology where it hurts usability.

For example:

> "Enter Circle Code"

is preferable to an obscure phrase that users cannot understand.

---

# 3. Primary User Flow

## New User

```text
Landing Page
    ↓
Create / Join Circle
    ↓
Create Wizard Profile
    ↓
Circle
    ↓
Send / Receive Patronuses
```

---

# 4. Landing Page

The landing page should immediately communicate:

### Patronus

> Send a little magic to someone you care about.

Primary actions:

- Create a Circle
- Join a Circle

The page should be visually impressive but lightweight.

---

# 5. Create Circle

The user provides:

- Circle name
- Display name

Optional:

- Circle description
- Magical theme

After creation, generate a unique Circle Code.

Example:

```text
PATR-7X2K
```

The creator becomes the Circle Keeper.

---

# 6. Join Circle

The user enters a Circle Code.

Example:

```text
Enter Circle Code

PATR-7X2K

[JOIN CIRCLE]
```

After joining, the user becomes a Circle Member.

---

# 7. Circle Dashboard

The Circle page should display:

- Circle name
- Circle members
- Recent Patronuses
- Message composer
- Circle information

Example:

```text
THE MARAUDERS

4 Circle Members

────────────────────

Hermione
Are we still meeting at 7?

Harry
Of course!

Ron
I'll bring food.

────────────────────

Write a Patronus...

[CAST ✨]
```

---

# 8. Messaging

The initial messaging experience should support:

- Text messages
- Sender name
- Timestamp
- Message history
- Sending messages
- Receiving messages

Do not initially implement:

- Voice messages
- Video calls
- File sharing
- Reactions
- Threads
- Complex messaging features

Keep the prototype focused.

---

# 9. Patronus Message Types

The architecture should leave room for different message types.

Initially implement:

### Standard Patronus

A normal text message.

Future possibilities:

### Howler

An attention-grabbing message.

### Patronus

A special affectionate message.

### Whisper

A private or subtle message.

### Spell

A message accompanied by a magical visual effect.

These can be added later.

---

# 10. Notifications

Notifications are an important part of Patronus.

A future notification could look conceptually like:

```text
✨ PATRONUS ALERT

Harry sent you a Patronus.

"Are you free tonight?"
```

The exact browser/OS notification appearance will depend on the device.

Do not attempt to fake OS-level notification capabilities inside the application.

---

# 11. Custom Vibration

The product may eventually support notification patterns.

Concept:

### Normal

Short vibration.

### Important

Double vibration.

### Special

Distinct vibration pattern.

However:

**This must be treated as device/browser dependent.**

Never promise identical behavior on Android and iOS.

If unsupported, silently fall back to normal notification behavior.

---

# 12. Mobile Experience

Mobile is a first-class platform.

The interface must work well on:

- Mobile portrait
- Mobile landscape
- Tablet
- Desktop

The chat interface should be comfortable for thumb interaction.

Buttons should have sufficient touch targets.

Avoid desktop-only interactions such as hover being required for important functionality.

---

# 13. Future Features

Potential future features:

- Authentication
- Real-time messaging
- Push notifications
- PWA installation
- Notification preferences
- Custom message types
- Magical animations
- Circle themes
- Wizard profiles
- Patronus customization
- Read receipts
- Online presence
- Direct messages
- Message reactions

These are NOT required in the initial prototype.

---

# 14. MVP Definition

The initial MVP should demonstrate:

### Required

- Landing page
- Create Circle
- Join Circle
- Circle dashboard
- Members
- Send messages
- Message history
- Responsive mobile UI
- Magical visual identity

### Not Required Yet

- Production authentication
- Real push notifications
- Custom vibration
- Complex backend
- Payments
- Social discovery
- Public groups
- Advanced moderation