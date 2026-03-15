## Why

The current Overpass snapping fires one query per polygon vertex in parallel via `Promise.all`. Public Overpass servers limit concurrent queries per IP (typically 2), causing queued queries to time out with `protocol_error` after 40+ seconds. Additionally, Overpass returns HTML error pages instead of JSON on failure, causing JSON parse errors in the client.

## What Changes

- **Batch all vertex snap queries into a single Overpass request** using a union of `(around:...)` clauses per vertex, with client-side nearest-node matching per vertex
- **Add distance validation after matching** to detect vertices with no roads within the search radius, then selectively re-query only failed vertices at a larger radius
- **Add HTML error response detection** to catch Overpass error pages and throw meaningful errors instead of JSON parse failures

## Capabilities

### New Capabilities
- `batched-overpass-snapping`: Single-query snapping for all polygon vertices with per-vertex distance validation and selective fallback for vertices with no nearby roads
- `overpass-error-handling`: Detection and handling of HTML error responses from Overpass API, with meaningful error messages for transient server errors

### Modified Capabilities

## Impact

- `src/routing/imported/overpass.ts` — `snapPolygonToRoad` rewritten to build a single batched query; `snapPosToRoad` signature may change or become internal; new distance validation logic added
- `src/routing/routeAPI.ts` — `overpassFilter` function signature changes to accept multiple positions instead of one
- `src/route/PolygonVertices.tsx` — Still calls single-vertex snap for drag-and-drop (unchanged behavior, but may need to adapt to any `snapPosToRoad` signature changes)
