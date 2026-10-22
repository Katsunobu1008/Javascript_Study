# ZOKUZOKU / Living Worlds — Interactive Prototypes

Two independent interactive UI/UX prototypes for remix-driven merchandise creation.

## Experiences

| Demo | Main interaction |
|------|------------------|
| [01 — Living Cosmos](01-living-cosmos.html) | Organic branching network + nonlinear varied camera fly-ins, real-time birth pulses, size as a function of likes, fusion of two creations. Not generational depth. |
| [02 — Gravity Jam](02-gravity-jam.html) | Pull and rearrange the network, attract creations with a local field, send reaction waves, fuse any two designs. |

Both share the same creation and like event schema, so both views can be opened at once against the same server.

### Demo mode (no setup)

Open `index.html`, or either `.html` file, in a browser. Supports local artwork creation and cross-tab messages (BroadcastChannel). A separate **DEMO · ローカル** badge distinguishes this mode. A toggle controls fictional automated creations; those are **not** real users and **not** server events.

### Multi-user realtime mode

Node.js 18+ required. No npm install, external services or API keys.

```bash
node server.js
# http://localhost:4173
```

Open the above URL from two browser windows or clients connecting to the same publicly reachable server. Creation and "like" events are delivered to all clients by Server-Sent Events (SSE); a new browser replays the in-memory event log from `/api/state`.

To change the port:

```bash
PORT=8080 node server.js
```

### Important limitations

- Demo illustrations are drawn using Canvas; **no generative-image AI** is connected.
- The server stores data **in memory**; restarting it clears user-created works and resets votes.
- Like requests are not authenticated and there are no per-user anti-abuse controls; **not production ready**.
- Automated DEMO events are explicitly labeled and are **not broadcast** as real creation events.
- Generated items, art and other data are sample content; this demo has no IP/commercial authorization workflow.
- Productionization requires persistent storage, user identity, authorization, rate limiting, asset storage, moderation, and IP approval.

### Controls

**Living Cosmos:** tap a node to open its detail, scroll to zoom, drag to pan, submit a remix or fuse another node, toggle new-creation auto-follow. Each camera flight randomly chooses one of five trajectories (`spiral`, `swoop`, `whip`, `arc`, `glide`).

**Gravity Jam:** drag nodes to rearrange, tap empty space to send an influence wave, switch to fusion mode to select two creations, choose explore mode to fly toward one, and like to enlarge the corresponding creation.

Both follow OS `prefers-reduced-motion` preferences for minimized animation.

## Code layout

- `index.html` — choice page
- `01-living-cosmos.html` — organic network + camera
- `02-gravity-jam.html` — physical playground
- `shared/model.js` — shared model, seed data and Canvas merch drawings
- `shared/live.js` — transport adapter: SSE/REST or local fallback
- `shared/theme.css` — UI styling and responsive layouts
- `server.js` — zero-dependency, ephemeral HTTP/SSE backend

License: Prototype demonstration only. Product and IP rights require separate confirmation.
