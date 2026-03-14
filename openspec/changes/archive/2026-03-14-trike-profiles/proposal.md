## Why

The current profile system has two profiles (`trekking` and `fastbike-verylowtraffic`) that don't serve the primary use case: riding a recumbent trike on bike paths and quiet roads with good surfaces. The `trekking` profile's Overpass filter (`[highway]`) matches every road type including motorways and footways, causing frequent snap failures and slow queries. The `fastbike-verylowtraffic` filter is too restrictive, often finding no roads at all. Both BRouter profiles lack recumbent-specific tuning.

## What Changes

- **Replace the two existing profiles with four tiered trike-oriented profiles** (`trike-safe`, `trike-touring`, `trike-gravel`, `trike-explorer`), each with progressively wider road inclusion
- **Create four custom BRouter `.brf` profile files** forked from `vm-forum-liegerad-schnell.brf` (recumbent bike profile), with trike-specific tuning: `avoid_cycleways=0`, `avoid_main_roads=8`, `maxSpeed=32`, and graduated surface/track penalties per tier
- **Refactor the Overpass snapping queries** to use profile-specific highway filters instead of generic `[highway]`, use `node(w)(around:R)` instead of `>;` for efficient node retrieval, and use a single 2000m radius with one 5000m fallback
- **Decouple the profile system** so each profile is an object with a BRouter profile name, an Overpass filter query, and a display label (instead of the BRouter profile name doubling as the Overpass filter key)

## Capabilities

### New Capabilities
- `trike-profile-system`: The tiered profile definitions (safe/touring/gravel/explorer), their BRouter profile names, Overpass filters, and display labels
- `overpass-query-optimization`: Improved Overpass query construction with profile-specific highway filters and efficient node retrieval
- `brouter-trike-profiles`: The four custom `.brf` BRouter profile files for installation on a private BRouter server

### Modified Capabilities

## Impact

- `src/routing/routeAPI.ts` — Profile type and `profiles` object restructured from simple string map to profile objects
- `src/routing/imported/overpass.ts` — Query construction rewritten for per-profile filters and optimized node retrieval
- `src/routing/imported/brouter.ts` — No changes expected (already uses profile name string)
- `src/route/routeSlice.ts` — Profile type reference updated
- UI components showing profile selector — Updated for new profile names/labels
- Private BRouter server — Four new `.brf` files need to be installed
- **Breaking**: Existing persisted profile selection (`trekking` or `fastbike-verylowtraffic`) will not match new profile keys; needs a store migration
