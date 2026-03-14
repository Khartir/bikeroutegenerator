## ADDED Requirements

### Requirement: Four BRouter profile files
Four `.brf` files SHALL be created, each forked from `vm-forum-liegerad-schnell.brf`, named `trike-safe.brf`, `trike-touring.brf`, `trike-gravel.brf`, and `trike-explorer.brf`.

#### Scenario: Profile files exist
- **WHEN** the BRouter server is configured
- **THEN** four files are available: `trike-safe.brf`, `trike-touring.brf`, `trike-gravel.brf`, `trike-explorer.brf`

### Requirement: Common settings across all profiles
All four profiles SHALL share these settings:
- `avoid_cycleways = 0` (prefer bike paths)
- `avoid_main_roads = 8` (strong traffic avoidance)
- `avoid_small_roads = 3` (residential roads are fine)
- `maxSpeed = 32` (trike cruising speed)

#### Scenario: All profiles prefer cycleways
- **WHEN** BRouter calculates a route with any trike profile
- **THEN** cycleways have no avoidance penalty (cost equivalent to `avoid_cycleways = 0`)

#### Scenario: All profiles avoid main roads
- **WHEN** BRouter calculates a route with any trike profile and a primary/trunk road is nearby
- **THEN** the route prefers alternative paths with lower traffic

### Requirement: Graduated surface and track penalties
Each profile SHALL have different cost penalties for surfaces and track grades matching its tier:

**trike-safe:**
- gravel: 10, ground/unpaved: 50, fine_gravel: 4
- grade2+ tracks: 40-50 (near-forbidden)

**trike-touring:**
- gravel: 4, ground/unpaved: 20, fine_gravel: 1
- grade2 tracks: 20, grade3 tracks: 40

**trike-gravel:**
- gravel: 2, ground/unpaved: 10, fine_gravel: 0.5
- grade2 tracks: 3, grade3 tracks: 8

**trike-explorer:**
- gravel: 1, ground/unpaved: 5, fine_gravel: 0.5
- grade2 tracks: 2, grade3 tracks: 4, ungraded tracks: 5

#### Scenario: trike-safe strongly avoids gravel
- **WHEN** BRouter calculates a route with `trike-safe` and a gravel road exists alongside a paved alternative
- **THEN** the paved road is preferred unless the gravel detour is very short

#### Scenario: trike-gravel accepts gravel roads
- **WHEN** BRouter calculates a route with `trike-gravel` and a gravel road provides a more direct path
- **THEN** the gravel road is used with only a slight penalty

#### Scenario: trike-explorer uses ungraded tracks
- **WHEN** BRouter calculates a route with `trike-explorer` and an ungraded track provides a shortcut
- **THEN** the track is considered with moderate penalty (cost 5 per tier table)

### Requirement: Profile files stored in repository
The `.brf` files SHALL be stored in the repository under a `brouter-profiles/` directory for version control and easy deployment to the private BRouter server.

#### Scenario: Profiles are version controlled
- **WHEN** a developer checks out the repository
- **THEN** `brouter-profiles/trike-safe.brf`, `brouter-profiles/trike-touring.brf`, `brouter-profiles/trike-gravel.brf`, and `brouter-profiles/trike-explorer.brf` exist
