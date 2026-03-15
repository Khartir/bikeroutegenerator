## ADDED Requirements

### Requirement: Batched polygon snapping query
`snapPolygonToRoad` SHALL send a single Overpass query containing way-union clauses for all non-start vertices, instead of one query per vertex.

#### Scenario: All vertices have nearby roads
- **WHEN** a polygon with 5 vertices (4 non-start) is snapped with `trike-touring` profile
- **THEN** exactly 1 Overpass query is sent containing way clauses for all 4 vertices
- **THEN** each vertex is matched to the nearest node within the search radius

#### Scenario: No parallel queries for polygon snapping
- **WHEN** `snapPolygonToRoad` is called
- **THEN** at most 2 Overpass queries are sent (initial batch + optional fallback batch)

### Requirement: Per-vertex distance validation
After matching nodes from the batched query, the system SHALL validate that each vertex's nearest node is within the search radius. Vertices whose nearest node exceeds the search radius SHALL be treated as unmatched.

#### Scenario: Node beyond search radius is rejected
- **WHEN** a batched query returns nodes and vertex A's nearest node is 3500m away (search radius 2000m)
- **THEN** vertex A is marked as unmatched
- **THEN** other vertices with nodes within 2000m are accepted

### Requirement: Selective fallback for unmatched vertices
Unmatched vertices from the initial batch SHALL be re-queried at a larger radius (5000m), either individually or as a smaller batch. Already-matched vertices SHALL NOT be re-queried.

#### Scenario: Fallback for single unmatched vertex
- **WHEN** the initial 2000m batch leaves 1 vertex unmatched
- **THEN** a second query is sent for only that vertex at 5000m radius
- **THEN** previously matched vertices keep their results

#### Scenario: All vertices matched on first attempt
- **WHEN** all vertices have roads within 2000m
- **THEN** no fallback query is sent

#### Scenario: Fallback also fails
- **WHEN** the 5000m fallback returns no roads for a vertex
- **THEN** an error is thrown

### Requirement: overpassFilter returns way clauses only
Each profile's `overpassFilter` function SHALL return only the way union body (the `(way...;)` block) without `node(w)` or `out;` statements. The caller is responsible for wrapping with query prefix, node retrieval, and output statements.

#### Scenario: Filter output structure
- **WHEN** `overpassFilter(2000, 48.5, 9.2)` is called for any profile
- **THEN** the returned string contains `way[highway` clauses with `(around:...)`
- **THEN** the returned string does NOT contain `node(w)` or `out;`

### Requirement: Single-vertex snap preserved
`snapPosToRoad` SHALL continue to work for single-vertex use (drag-and-drop in step-through mode), constructing a complete query from the profile's way clauses.

#### Scenario: Drag-and-drop vertex snap
- **WHEN** a user drags a polygon vertex in step-through mode
- **THEN** `snapPosToRoad` sends a single Overpass query for that vertex
- **THEN** the nearest road node is returned
