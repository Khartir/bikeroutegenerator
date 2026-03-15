## 1. State & Migration

- [x] 1.1 Add `RouteResult` type (`route`, `wayPoints`, `distance`, `elevation`, `bounds`) and change `RouteState` to store `profileRoutes: Record<Profile, RouteResult>` instead of flat route fields
- [x] 1.2 Change `options.profile` from `Profile | ""` to `profiles: Profile[]` in state
- [x] 1.3 Add redux-persist migration v11 to convert old single-profile state to new array/record shape
- [x] 1.4 Update all selectors (`selectRoute`, `selectWayPoints`, `selectInfo`, `selectBounds`, `selectProfiles`) to work with the new state shape

## 2. Profile Selection UI

- [x] 2.1 Replace `Profile.tsx` single-select dropdown with multi-select checkboxes (follow `enabledShapes` pattern)
- [x] 2.2 Add `toggleProfile` reducer (mirrors `toggleShape` — at least one must remain selected)
- [x] 2.3 Remove old `setProfile` reducer, update all references

## 3. Route Generation Refactor

- [x] 3.1 Split `makeRandomRoute` in `route.ts`: extract geometry-only function that returns center + polygon (steps 1-2) without profile dependency
- [x] 3.2 Extract profile-dependent function that takes geometry + profile and runs snapping → waypoints → routing (steps 3-5)
- [x] 3.3 Refactor `fetchWayPointsAndRoute` thunk to: run geometry once, then loop over selected profiles calling profile-dependent steps sequentially, storing each result in `profileRoutes`
- [x] 3.4 Add profile progress tracking to generation step state (separate `profileProgress` field with current/total/profileName)

## 4. Multi-Route Display

- [x] 4.1 Define a color palette constant mapping each profile key to a hex color
- [x] 4.2 Update `Route.tsx` to iterate over `profileRoutes` entries, rendering each as a `Polyline` with its profile color
- [x] 4.3 Handle elevation map mode: show hotline for first profile only, hide other routes

## 5. Route Info & Download

- [x] 5.1 Update `RouteInfo.tsx` to display distance/elevation per profile, labeled with profile name and color indicator
- [x] 5.2 Update GPX download to offer per-profile downloads with profile name in filename

## 6. Map Bounds & UX

- [x] 6.1 Update `selectBounds` to compute union bounds across all profile routes
- [x] 6.2 Update `StatusBar.tsx` to show multi-profile progress (which profile is being processed, N/M)
- [x] 6.3 Enforce single-profile behavior when step-through mode is enabled (use first selected profile only)

## 7. Testing

- [ ] 7.1 Write tests for `toggleProfile` reducer (add, remove, prevent removing last)
- [ ] 7.2 Write tests for redux-persist migration v11
- [ ] 7.3 Write tests for geometry extraction (profile-independent steps produce same output)
- [ ] 7.4 Write tests for multi-route selector (bounds union, per-profile info)
