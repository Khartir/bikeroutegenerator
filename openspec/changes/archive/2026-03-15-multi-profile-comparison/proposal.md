## Why

When experimenting with different routing profiles, there's no way to compare how they handle the same route geometry. Currently you must generate a route, note the result, switch profiles, and generate again — but different random seeds produce different shapes, making comparison meaningless. Multi-profile comparison lets you run the same geometric route through multiple profiles simultaneously and see the results side by side on the map.

## What Changes

- Profile selection changes from single-select dropdown to multi-select checkboxes (similar to shape selection)
- When multiple profiles are selected, route generation runs the profile-dependent steps (Overpass snapping + BRouter routing) once per profile, reusing the same random geometry (center, polygon, shape)
- Each profile's resulting route is displayed simultaneously on the map in a distinct color
- Route info (distance, elevation) shows per-profile results
- GPX download offers per-profile exports

## Capabilities

### New Capabilities
- `multi-profile-route-generation`: Running the same route geometry through multiple profiles in parallel, producing separate route results per profile
- `multi-route-display`: Displaying multiple route results simultaneously on the map with distinct colors and per-route info/download

### Modified Capabilities

## Impact

- `src/route/routeSlice.ts` — State changes: single profile → profile array, single route → route map keyed by profile
- `src/route/options/profile/Profile.tsx` — UI changes: dropdown → multi-select checkboxes
- `src/routing/routeAPI.ts` — API changes: `getWaypoints` and `makeRoute` called per profile
- `src/routing/imported/route.ts` — Split: geometry generation (profile-independent) vs road snapping (profile-dependent)
- `src/route/Route.tsx` — Render multiple colored routes
- `src/route/RouteInfo.tsx` — Show info per profile
- `src/route/download/` — Download per profile
