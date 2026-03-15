## ADDED Requirements

### Requirement: Simultaneous route display
The system SHALL display all generated profile routes on the map simultaneously. Each profile's route MUST be rendered as a separate polyline layer.

#### Scenario: Two profile routes on map
- **WHEN** routes for two profiles have been generated
- **THEN** both routes are visible on the map at the same time
- **AND** each route is drawn as a distinct polyline

### Requirement: Distinct route colors per profile
The system SHALL assign a fixed, distinct color to each routing profile. The color MUST remain consistent across route generations (i.e., the same profile always has the same color).

#### Scenario: Profile color consistency
- **WHEN** a route is generated for "Trike Safe"
- **THEN** the route is always rendered in the color assigned to "Trike Safe", regardless of how many other profiles are selected

#### Scenario: Visual distinction
- **WHEN** multiple profile routes overlap on the map
- **THEN** the routes are distinguishable by their different colors

### Requirement: Per-profile route info
The system SHALL display route information (distance, elevation) for each generated profile route separately.

#### Scenario: Route info with two profiles
- **WHEN** routes for two profiles are displayed
- **THEN** the route info section shows distance and elevation for each profile, labeled by profile name

### Requirement: Per-profile GPX download
The system SHALL allow downloading GPX files for each profile's route individually.

#### Scenario: Download specific profile route
- **WHEN** the user clicks download for a specific profile
- **THEN** only that profile's route is exported as a GPX file
- **AND** the filename includes the profile name

### Requirement: Elevation map single-profile restriction
The system SHALL show the elevation-colored hotline for only one route at a time when elevation map view is enabled. The system SHALL use the first selected profile's route for elevation display.

#### Scenario: Elevation map with multiple profiles
- **WHEN** elevation map view is toggled on with multiple profile routes generated
- **THEN** only the first profile's route is shown with elevation coloring
- **AND** the other profile routes are hidden

### Requirement: Map bounds fit all routes
The system SHALL fit the map bounds to encompass all generated profile routes, not just one.

#### Scenario: Fit bounds with divergent routes
- **WHEN** routes are generated for two profiles that diverge significantly
- **THEN** the map zooms to fit both routes within the visible area
