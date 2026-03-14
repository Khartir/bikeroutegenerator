## ADDED Requirements

### Requirement: Profile data structure
Each profile SHALL be defined as an object with `brouterProfile` (string), `overpassFilter` (function returning an Overpass query body), and `label` (display name). The `Profile` type SHALL be the union of all profile keys.

#### Scenario: Profile object shape
- **WHEN** a profile key is looked up in the profiles record
- **THEN** it returns an object with `brouterProfile`, `overpassFilter`, and `label` fields

#### Scenario: BRouter receives correct profile name
- **WHEN** a route is calculated with profile `trike-touring`
- **THEN** the BRouter API is called with `profile=trike-touring`

#### Scenario: Overpass receives profile-specific filter
- **WHEN** a road snap is performed with profile `trike-safe`
- **THEN** the Overpass query uses only the highway types defined for `trike-safe`

### Requirement: Four tiered profiles
The system SHALL define exactly four profiles with these keys and highway inclusions:

| Key | Label | Highway types | Track grades |
|-----|-------|--------------|-------------|
| `trike-safe` | Trike Safe | cycleway, living_street, residential, tertiary, unclassified | none |
| `trike-touring` | Trike Touring | + secondary | grade1 |
| `trike-gravel` | Trike Gravel | + (same as touring) | grade1, grade2, grade3 |
| `trike-explorer` | Trike Explorer | + service, track (all) | all (including untagged) |

Each tier includes all highway types from the previous tier.

#### Scenario: trike-safe excludes secondary roads
- **WHEN** a road snap is performed with profile `trike-safe`
- **THEN** the Overpass query does NOT match `highway=secondary`

#### Scenario: trike-touring includes secondary and grade1 tracks
- **WHEN** a road snap is performed with profile `trike-touring`
- **THEN** the Overpass query matches `highway=secondary` and `highway=track` with `tracktype=grade1`

#### Scenario: trike-gravel includes grade2 and grade3 tracks
- **WHEN** a road snap is performed with profile `trike-gravel`
- **THEN** the Overpass query matches `highway=track` with `tracktype=grade1`, `tracktype=grade2`, and `tracktype=grade3`

#### Scenario: trike-explorer includes all tracks and service roads
- **WHEN** a road snap is performed with profile `trike-explorer`
- **THEN** the Overpass query matches `highway=service` and `highway=track` without tracktype restriction

### Requirement: Store migration for profile rename
A store migration (version 5) SHALL map persisted profile values to new defaults: `"trekking"` to `"trike-touring"`, `"fastbike-verylowtraffic"` to `"trike-safe"`, and empty string unchanged.

#### Scenario: Existing trekking selection migrates
- **WHEN** a user has `profile: "trekking"` in persisted state
- **THEN** after migration it becomes `profile: "trike-touring"`

#### Scenario: Existing fastbike selection migrates
- **WHEN** a user has `profile: "fastbike-verylowtraffic"` in persisted state
- **THEN** after migration it becomes `profile: "trike-safe"`

#### Scenario: Empty profile stays empty
- **WHEN** a user has `profile: ""` in persisted state
- **THEN** after migration it remains `profile: ""`
