## ADDED Requirements

### Requirement: Profile-specific highway filtering
The Overpass query SHALL use the profile's specific highway filter instead of a generic `[highway]` tag. The query MUST NOT match highway types excluded by the profile tier.

#### Scenario: Generic highway filter is not used
- **WHEN** any profile performs a road snap
- **THEN** the Overpass query never contains a bare `[highway]` filter without value restriction

#### Scenario: Compound query for track grades
- **WHEN** a profile includes specific track grades (e.g., grade1 only)
- **THEN** the Overpass query uses a union with `way[highway=track][tracktype=grade1]` as a separate clause

### Requirement: Efficient node retrieval
The Overpass query SHALL use `node(w)(around:R, lat, lon)` to retrieve only nodes within the search radius, instead of `>;` which recursively expands all nodes of matched ways.

#### Scenario: Node retrieval is bounded by radius
- **WHEN** a road snap query is executed
- **THEN** the query uses `node(w)(around:R, lat, lon)` pattern
- **THEN** the query does NOT use the `>;` recurse-down operator

### Requirement: Simplified radius strategy
The road snap SHALL use a single initial radius of 2000m with one fallback to 5000m, instead of the current three-step escalation (1000→2000→5000).

#### Scenario: First attempt at 2000m
- **WHEN** a road snap is performed for a position
- **THEN** the first Overpass query uses a 2000m radius

#### Scenario: Fallback to 5000m on empty result
- **WHEN** the 2000m query returns no results
- **THEN** a second query is made with 5000m radius

#### Scenario: Failure after both radii
- **WHEN** both the 2000m and 5000m queries return no results
- **THEN** an error is thrown

### Requirement: Overpass filter receives position and radius
The profile's `overpassFilter` function SHALL accept `radius`, `lat`, and `lon` parameters and return the complete Overpass query body (everything between `[out:json];` and `out;`).

#### Scenario: Filter function generates valid query
- **WHEN** `overpassFilter(2000, 48.5, 9.2)` is called for `trike-touring`
- **THEN** it returns a string containing `way[highway~'cycleway|residential|tertiary|unclassified|secondary|living_street'](around:2000,48.5,9.2);` and `way[highway=track][tracktype=grade1](around:2000,48.5,9.2);`
