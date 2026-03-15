## 1. Refactor overpassFilter to return way clauses only

- [x] 1.1 Update `overpassFilter` in all four profile configs in `src/routing/routeAPI.ts` to return only the `(way...;)` union block without `node(w)` or `out;`
- [x] 1.2 Update `snapPosToRoad` in `src/routing/imported/overpass.ts` to wrap the way clauses with `[out:json];`, `node(w)(around:R, lat, lon);`, and `out;`

## 2. Batched polygon snapping

- [x] 2.1 Create `snapAllVerticesToRoad` function in `overpass.ts` that accepts an array of positions and a `ProfileConfig`, builds a single batched Overpass query by combining way clauses for all positions
- [x] 2.2 Add distance validation: after matching nearest node per vertex, check each is within the search radius using `@turf/distance`
- [x] 2.3 Implement selective fallback: collect unmatched vertices, re-query at 5000m (as a batch or individually), merge results
- [x] 2.4 Update `snapPolygonToRoad` to call `snapAllVerticesToRoad` instead of `Promise.all` of `snapPosToRoad`

## 3. HTML error handling

- [x] 3.1 Add `fetchOverpassJson` helper that uses `fetch` directly, checks response content-type/body for HTML, extracts error message from HTML if present, and throws descriptive error
- [x] 3.2 Use `fetchOverpassJson` in both `snapPosToRoad` and `snapAllVerticesToRoad` instead of `overpassJson` from `overpass-ts`
- [x] 3.3 Update error source detection in `routeSlice.ts` if needed for new error message patterns (no changes needed — existing detection matches "overpass" in message)

## 4. Verification

- [x] 4.1 Build passes (`npm run build`)
- [x] 4.2 Manual test: generate route with trike-touring profile, verify only 1-2 Overpass queries are sent (check network tab)
