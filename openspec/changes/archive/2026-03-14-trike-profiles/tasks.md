## 1. BRouter Profile Files

- [x] 1.1 Create `brouter-profiles/` directory in repo root
- [x] 1.2 Download `vm-forum-liegerad-schnell.brf` as base template
- [x] 1.3 Create `trike-safe.brf` — fork base with `avoid_cycleways=0`, `avoid_main_roads=8`, `avoid_small_roads=3`, `maxSpeed=32`, conservative surface/track penalties (gravel:10, unpaved:50, grade2+:40-50)
- [x] 1.4 Create `trike-touring.brf` — fork base with same common settings, moderate penalties (gravel:4, unpaved:20, fine_gravel:1, grade2:20, grade3:40)
- [x] 1.5 Create `trike-gravel.brf` — fork base with relaxed penalties (gravel:2, unpaved:10, fine_gravel:0.5, grade2:3, grade3:8)
- [x] 1.6 Create `trike-explorer.brf` — fork base with most relaxed penalties (gravel:1, unpaved:5, fine_gravel:0.5, grade2:2, grade3:4, ungraded:5)

## 2. Profile Data Structure

- [x] 2.1 Define `ProfileConfig` interface in `src/routing/routeAPI.ts` with `brouterProfile`, `overpassFilter` (function), and `label` fields
- [x] 2.2 Replace `profiles` object with four `ProfileConfig` entries (`trike-safe`, `trike-touring`, `trike-gravel`, `trike-explorer`)
- [x] 2.3 Update `Profile` type to be `keyof typeof profiles`
- [x] 2.4 Update all imports/usages of the old `profiles` object and `Profile` type across the codebase

## 3. Overpass Query Optimization

- [x] 3.1 Create `overpassFilter` functions for each profile with correct highway types and track grade filters
- [x] 3.2 Refactor `snapPosToRoad()` in `overpass.ts` to use profile's `overpassFilter` function instead of looking up `profiles[profile]`
- [x] 3.3 Replace `>;` with `node(w)(around:R, lat, lon)` in query construction
- [x] 3.4 Change radius strategy from `[1000, 2000, 5000]` to `[2000, 5000]`
- [x] 3.5 Update `snapPolygonToRoad()` to pass the full profile config (or the filter function) instead of just the profile key

## 4. Store Migration

- [x] 4.1 Add version 10 migration in `src/state/store.ts` mapping `"trekking"` → `"trike-touring"` and `"fastbike-verylowtraffic"` → `"trike-safe"`
- [x] 4.2 Update persist version number to 10

## 5. UI Updates

- [x] 5.1 Update profile selector component to use new profile keys and `label` field for display
- [x] 5.2 Verify build passes with all four profiles (verified via `npm run build`)
