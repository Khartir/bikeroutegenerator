## Context

The app generates random circular bike routes by:
1. Creating a polygon around a center point
2. Snapping polygon vertices to nearby roads via Overpass API
3. Routing between snapped points via BRouter

Currently, the `profiles` object in `routeAPI.ts` maps a BRouter profile name directly to an Overpass highway filter string. This tight coupling means the profile key must be a valid BRouter profile name, and each profile has exactly one Overpass filter. The two existing profiles (`trekking` with `[highway]` and `fastbike-verylowtraffic` with `[highway~'tertiary|unclassified']`) are poorly suited for recumbent trike riding.

The user runs private BRouter and Overpass servers, so custom `.brf` profiles can be installed.

## Goals / Non-Goals

**Goals:**
- Four tiered profiles tuned for recumbent trike riding, from conservative to adventurous
- Overpass queries that only find roads the BRouter profile can actually route well on
- Faster, more reliable Overpass queries through specific filters and efficient node retrieval
- Profile system that cleanly separates BRouter profile name from Overpass filter

**Non-Goals:**
- Generic profile customization UI (this is for one user's trike)
- Modifying BRouter server configuration beyond installing `.brf` files
- Changing the route generation algorithm (polygon shapes, center finding, dead-end fixing)
- Supporting profiles from third-party sources (Poutnikl etc.) — may revisit later

## Decisions

### 1. Profile data structure

Change from:
```typescript
const profiles = {
    "fastbike-verylowtraffic": "[highway~'tertiary|unclassified']",
    trekking: "[highway]",
};
type Profile = keyof typeof profiles;
```

To:
```typescript
interface ProfileConfig {
    brouterProfile: string;
    overpassFilter: string;
    label: string;
}
const profiles: Record<string, ProfileConfig> = { ... };
type Profile = keyof typeof profiles;
```

**Rationale**: Decoupling lets us name profiles meaningfully (`trike-safe`) while pointing to any BRouter profile name and any Overpass filter. The `label` field supports the UI dropdown.

**Alternative considered**: Keep the flat string map and encode the Overpass filter differently. Rejected because it doesn't solve the naming problem and adds complexity.

### 2. Fork `vm-forum-liegerad-schnell.brf` as base for all four profiles

**Rationale**: This is the official BRouter recumbent bike profile. It already handles:
- Surface quality penalties appropriate for wider vehicles
- Dismount avoidance (high cost — trikes can't easily dismount)
- Configurable `avoid_*` parameters we can tune per tier

**Alternative considered**: Fork `trekking.brf`. Rejected because it lacks recumbent-specific concerns (dismount costs, width-aware penalties) and we'd have to add them from scratch.

### 3. Overpass query restructure

Replace:
```overpass
[out:json];
(way ${filter} (around:${radius}, lat, lon); >;);
out;
```

With:
```overpass
[out:json];
(
  way[highway~'...'] (around:2000, lat, lon);
  way[highway=track][tracktype=grade1] (around:2000, lat, lon);
);
node(w)(around:2000, lat, lon);
out;
```

Key changes:
- **Profile-specific highway filter** instead of generic `[highway]`
- **`node(w)(around:R)` instead of `>;`** — only returns nodes within the search radius, not all nodes of every matched way (which could extend far outside the area)
- **Single 2000m radius with 5000m fallback** instead of 1000→2000→5000 escalation — reduces from up to 3 API calls to at most 2
- **Compound queries for track grades** where needed (Overpass can filter `tracktype` as a separate tag)

**Rationale**: The `>;` recurse is the main performance killer — it downloads every node of every way that even partially intersects the radius. For a `[highway]` query in a city at 2000m, that's potentially thousands of nodes from hundreds of ways. The `node(w)(around:R)` approach limits returned nodes to those actually within the search area.

### 4. Store migration for profile rename

Add migration version 5 that maps old profile values to new defaults:
- `"trekking"` → `"trike-touring"`
- `"fastbike-verylowtraffic"` → `"trike-safe"`
- `""` (empty/unset) → `""` (unchanged)

**Rationale**: Users with persisted state shouldn't see a broken profile selector after update.

### 5. Overpass filter as a function, not a string

The Overpass filter per profile will be a function `(radius: number, lat: number, lon: number) => string` rather than a simple tag filter string, because some profiles need compound queries (e.g., `trike-touring` needs both `highway~'...'` and `highway=track][tracktype=grade1]` as separate union members).

**Alternative considered**: Template string with `${radius}`, `${lat}`, `${lon}` placeholders. Rejected because compound queries with multiple `(around:...)` clauses make template interpolation messy and error-prone.

## Risks / Trade-offs

**[Risk] 2000m starting radius may be too small in very rural areas** → Mitigation: 5000m fallback remains. Can increase default if testing shows frequent fallbacks.

**[Risk] Excluding `service` roads from lower tiers may miss useful connections** → Mitigation: `trike-explorer` includes them. User will test progressively.

**[Risk] BRouter may still route through road types not in the Overpass filter** → This is expected and acceptable. The Overpass filter controls snap targets (where the polygon vertices land), but BRouter routes freely between them. The BRouter profile's own cost penalties handle the rest.

**[Risk] Untagged tracks in `trike-explorer` may produce bad snaps** → Mitigation: BRouter's surface penalties will still penalize truly bad surfaces. The snap just gets you "in the neighborhood."

**[Trade-off] Four `.brf` files to maintain** → Acceptable since they share 95% of their content (only `avoid_*` params and surface costs differ). Could later consolidate into one parameterized profile if BRouter supports it.
