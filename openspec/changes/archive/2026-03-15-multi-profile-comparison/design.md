## Context

Currently, route generation is a single-pipeline process: one profile is selected, and the entire flow (geometry → snap → route) runs once, producing one route. The route state holds a single `route`, `wayPoints`, `distance`, and `elevation`. The profile is stored as a single string in `options.profile`.

The key insight for multi-profile comparison is that the route generation algorithm has a natural split point: steps 1-2 (finding center, creating polygon) are profile-independent geometry, while steps 3-5 (snapping, waypoints, routing) depend on the profile's Overpass filter and BRouter profile.

## Goals / Non-Goals

**Goals:**
- Allow selecting multiple profiles simultaneously
- Generate the same geometric route shape with each selected profile
- Display all resulting routes on the map at the same time in distinct colors
- Show per-profile route info (distance, elevation)
- Allow per-profile GPX download

**Non-Goals:**
- Comparing routes quantitatively (e.g., overlap percentage, difficulty scoring)
- Saving comparison results or history
- Running more than ~4 profiles simultaneously (practical limit from API load)
- Step-through mode support for multi-profile (single profile only when step-through is enabled)

## Decisions

### 1. State shape: keyed route results

Store route results as `Record<Profile, RouteResult>` instead of flat fields. Each `RouteResult` contains the route segments, waypoints, distance, elevation, and bounds for that profile.

**Rationale**: Clean separation per profile. The map component can iterate over entries. The single-profile case is just a record with one entry.

**Alternative considered**: Array of results — rejected because profile-keyed lookup is needed for downloads and info display.

### 2. Profile selection: array in state

Change `options.profile` from `Profile | ""` to `Profile[]`. The UI switches from a single-select dropdown to checkboxes (consistent with shape selection pattern already in the codebase).

**Rationale**: Mirrors the existing `enabledShapes` pattern. Users are already familiar with this interaction.

### 3. Route generation: split geometry from profile-dependent steps

Refactor `fetchWayPointsAndRoute` to:
1. Run geometry steps once (find center, create polygon) — profile-independent
2. For each selected profile, run snapping + waypoint + routing steps sequentially

Sequential per-profile execution (not parallel) to avoid overloading Overpass/BRouter.

**Rationale**: Parallel requests would be faster but risks rate limiting on public Overpass API. Sequential is safer and simpler. Can be parallelized later if needed.

**Alternative considered**: Parallel execution per profile — rejected due to API rate limiting concerns with public Overpass.

### 4. Route colors: fixed color palette per profile index

Assign each profile a fixed color from a palette. The first selected profile gets the primary color, second gets secondary, etc. Colors are defined in a constant map from profile key to hex color.

**Rationale**: Fixed colors per profile (not per index) means the same profile always has the same color across generations, making it easier to build mental associations.

### 5. Step-through mode: single profile only

When step-through mode is enabled, only the first selected profile is used. Multi-profile comparison is disabled during step-through.

**Rationale**: Step-through mode involves interactive vertex dragging and per-step pausing. Supporting this for multiple profiles simultaneously would be very complex and confusing UX-wise.

## Risks / Trade-offs

- **API load multiplied by profile count** → Mitigate by running profiles sequentially, not in parallel. Consider adding a visible warning when selecting 3+ profiles.
- **Generation time increases linearly** → Show per-profile progress in the status bar (e.g., "Calculating route (2/3: Trike Touring)")
- **Redux persist migration needed** → Add migration v5 to convert `profile: string` to `profiles: string[]` and `route: Feature[]` to `profileRoutes: Record<string, RouteResult>`
- **Elevation map with multiple routes** → Only show elevation coloring for one route at a time (could add a profile selector for elevation view later)
