# Patronus — Project Context

## Project Name

**Patronus**

## Project Type

A Harry Potter-inspired magical messaging and notification web application.

Patronus is a **demo/prototype web application** designed for couples, friends, and small private groups.

The core idea is:

> **Send a little magic to someone you care about.**

Instead of presenting itself as a conventional messaging application, Patronus uses a magical communication metaphor.

Users create or join private groups called **Circles**, then communicate by sending messages called **Patronuses**.

---

## Target Audience

Patronus is designed primarily for:

- Couples
- Close friends
- Small friend groups
- Small private communities

The experience should feel personal, playful, magical, and lightweight.

This is NOT intended to compete directly with Messenger, Discord, WhatsApp, or similar general-purpose communication platforms.

The differentiating concept is the **magical notification experience**.

---

## Core Concept

A user can:

1. Create a Circle.
2. Invite other people using a join code.
3. Join an existing Circle.
4. View Circle members.
5. Send messages.
6. Receive notifications when someone sends them a message.
7. Eventually customize how certain notifications behave.

The long-term concept is that sending a message feels like:

> **Sending a Patronus to someone.**

---

## Important Technical Concept

Patronus is a **web application**.

The initial frontend stack is:

- React
- Vite

The application should be designed as a **Progressive Web App (PWA)** so it can eventually be installed on mobile devices.

The application should support both:

- Android
- iOS

However, browser and operating-system notification capabilities differ.

### Important

Do NOT assume that a web application can fully control notification vibration behavior on every device.

Android generally provides more flexibility than iOS.

iOS imposes additional restrictions on web push notifications and custom haptic/vibration behavior.

Therefore:

**Custom vibration is an enhancement/experimental feature, NOT a core cross-platform requirement.**

The application must remain functional without custom vibration.

---

## Current Development Stage

This is a new prototype.

Prioritize:

1. Clean architecture
2. Strong UI/UX
3. Mobile responsiveness
4. Core user flows
5. Extensible architecture

Do NOT prematurely implement a complicated backend.

The first stage should be capable of working with mock/local data.

---

## Product Personality

Patronus should feel:

- Magical
- Warm
- Personal
- Playful
- Slightly mysterious
- Elegant
- Cozy

Avoid making it feel:

- Corporate
- Generic
- Like a Discord clone
- Like a basic CRUD dashboard
- Overly childish
- Visually noisy

---

## Development Principle

Build the application incrementally.

Do not attempt to implement the entire product in one task.

Each development task should:

1. Make one meaningful improvement.
2. Preserve existing functionality.
3. Keep the application runnable.
4. Avoid unnecessary dependencies.
5. Avoid unrelated refactoring.
6. Clearly explain what was changed.

---

## IP / Theme Guidance

The project is Harry Potter-inspired.

Use magical/wizarding concepts for the visual and interaction design.

However, avoid unnecessarily copying official Harry Potter artwork, movie assets, logos, or proprietary visual assets.

Prefer an original magical aesthetic inspired by:

- Wizarding schools
- Ancient spellbooks
- Parchment
- Candles
- Stars
- Magical letters
- Wands
- Enchanted objects
- Celestial elements

The application should have its own visual identity.