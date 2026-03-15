## Context

`snapPolygonToRoad` currently calls `snapPosToRoad` per vertex via `Promise.all`, producing N parallel Overpass queries. Public servers rate-limit to ~2 concurrent queries per IP, causing timeouts on polygons with 4+ non-start vertices. The `overpassFilter` function on each `ProfileConfig` generates a query body for a single `(around:R, lat, lon)` clause.

Additionally, `overpass-ts`'s `overpassJson` does not handle non-JSON responses — when Overpass returns HTML error pages, the JSON parser throws an uninformative syntax error.

## Goals / Non-Goals

**Goals:**
- Reduce Overpass queries from N (one per vertex) to 1 (batched) for the polygon snapping step
- Selective fallback: only re-query vertices that had no road within the initial radius
- Detect HTML error responses and throw meaningful errors
- Keep `snapPosToRoad` working for single-vertex use (drag-and-drop in `PolygonVertices.tsx`)

**Non-Goals:**
- Retry logic for transient server errors (separate concern, can be added later)
- Changing the BRouter query pattern (already sequential pair-wise)
- Batching the step-through mode's individual vertex drag-snap calls

## Decisions

### 1. Batched query construction

Add a new function to build a batched Overpass query from multiple positions. Instead of modifying `overpassFilter` per profile (which is designed for single-position use), build the batched query at the `snapPolygonToRoad` level by calling `overpassFilter` once per vertex and combining the way-union clauses, sharing a single `node(w)(around:...)` section.

Concretely, the current per-profile filter returns:
```
(
  way[highway~'...'](around:2000, lat, lon);
);
node(w)(around:2000, lat, lon);
```

For a batch, we want:
```
(
  way[highway~'...'](around:2000, lat1, lon1);
  way[highway~'...'](around:2000, lat2, lon2);
  way[highway~'...'](around:2000, lat3, lon3);
);
out;
```

This means we need a way to get just the `way` clauses without the `node(w)` wrapper. Two options:
- (a) Add a second function `overpassWayClauses(radius, lat, lon)` per profile
- (b) Refactor `overpassFilter` to return just way clauses, and wrap with `node(w)` at call site

**Decision: Option (b)** — refactor `overpassFilter` to return only the way union body (the `(way...;)` block). Both `snapPosToRoad` and the new batched function wrap this with `[out:json];` prefix and `node(w)` + `out;` suffix as needed. This avoids duplicating filter logic.

**Rationale**: The `node(w)` in the batch case should NOT be per-vertex — we want all nodes from all matched ways, then match client-side. Splitting the filter this way is cleaner.

### 2. Client-side vertex-to-node matching with distance validation

After the batched query returns all nodes, for each vertex:
1. Find the nearest node using existing `findMinDistancePosIndex`
2. Compute distance to that node (using `@turf/distance`)
3. If distance > search radius → mark vertex as "unmatched"

Unmatched vertices get a second-pass query at 5000m radius (either individually or as a smaller batch).

**Alternative considered**: Using separate `(around:...)` per vertex in the output (via Overpass `out` per union member). Rejected because Overpass unions merge results — there's no way to get per-member output.

### 3. HTML error detection

Check the response content-type or body before JSON parsing. The `overpass-ts` library's `overpassJson` calls `fetch` internally. We can either:
- (a) Replace `overpassJson` with our own `fetch` + JSON parse with error detection
- (b) Wrap `overpassJson` in a try/catch and detect HTML in the error

**Decision: Option (a)** — use `fetch` directly for the batched query. This gives us full control over response handling. Keep `overpassJson` for the single-vertex `snapPosToRoad` (used in drag-and-drop) but wrap it with HTML detection.

### 4. Keep `snapPosToRoad` for single-vertex use

`PolygonVertices.tsx` calls `snapPosToRoad` directly when a user drags a vertex. This is a single query and won't hit rate limits. Keep it as-is but add HTML error handling.

## Risks / Trade-offs

**[Risk] Batched query returns too many nodes in dense areas** → Mitigation: The `node(w)` without `(around:...)` returns ALL nodes of matched ways, not just those within radius. For a batch of 4 vertices across a 15km route, this could be significant. Consider keeping `node(w)(around:R, lat, lon)` per vertex as separate output statements, or use a bounding box that encompasses all vertices.

**[Trade-off] `overpassFilter` signature change** → All four profile configs need updating. Minor but touches the recently-added code. The change is mechanical (remove the `node(w)` line from each filter).

**[Risk] `@turf/distance` dependency for validation** → Already in the project's dependency tree via `@turf/circle`. No new dependency needed.
