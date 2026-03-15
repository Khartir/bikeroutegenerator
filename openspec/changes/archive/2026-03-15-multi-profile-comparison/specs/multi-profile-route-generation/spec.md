## ADDED Requirements

### Requirement: Multiple profile selection
The system SHALL allow the user to select one or more routing profiles simultaneously. At least one profile MUST be selected at all times.

#### Scenario: Select multiple profiles
- **WHEN** the user checks two or more profile checkboxes in the options dialog
- **THEN** all checked profiles are stored in state as the active profiles

#### Scenario: Deselect down to one
- **WHEN** the user attempts to uncheck the last remaining profile
- **THEN** the checkbox is disabled and the profile remains selected

#### Scenario: Migration from single profile
- **WHEN** the app loads with persisted state from a previous version using a single profile string
- **THEN** the profile is migrated to a single-element array

### Requirement: Shared geometry across profiles
The system SHALL generate route geometry (center point, polygon shape) once and reuse it identically for all selected profiles. The random aspects (center position, polygon rotation, shape selection) MUST be identical across all profiles.

#### Scenario: Two profiles produce same geometry
- **WHEN** a route is generated with two profiles selected
- **THEN** both profiles use the same center point, polygon vertices, and shape
- **AND** only the Overpass snapping, waypoint calculation, and BRouter routing differ between profiles

### Requirement: Sequential profile-dependent execution
The system SHALL execute the profile-dependent steps (Overpass snapping, waypoint finding, BRouter routing) sequentially for each selected profile, not in parallel.

#### Scenario: Three profiles selected
- **WHEN** a route is generated with three profiles
- **THEN** profile-dependent steps run for profile 1, then profile 2, then profile 3
- **AND** the status bar shows which profile is currently being processed

### Requirement: Per-profile route results
The system SHALL store route results (route segments, waypoints, distance, elevation, bounds) separately for each profile.

#### Scenario: Route generation completes
- **WHEN** route generation finishes for all selected profiles
- **THEN** state contains a separate route result for each profile
- **AND** each result has its own distance, elevation, and bounds

### Requirement: Step-through mode restricts to single profile
The system SHALL use only the first selected profile when step-through mode is enabled. Multi-profile generation MUST be disabled during step-through mode.

#### Scenario: Step-through with multiple profiles selected
- **WHEN** step-through mode is enabled and two profiles are selected
- **THEN** route generation uses only the first profile
- **AND** step-through interactions (drag center, vertices, waypoints) work as before

### Requirement: Generation progress per profile
The system SHALL display which profile is currently being processed during multi-profile generation.

#### Scenario: Processing second of three profiles
- **WHEN** the second profile's route is being calculated
- **THEN** the status bar shows the current step and indicates "2/3: Profile Name"
