## ADDED Requirements

### Requirement: HTML error response detection
The system SHALL detect when Overpass returns an HTML error page instead of JSON and throw a descriptive error instead of a JSON parse error.

#### Scenario: Overpass returns HTML error
- **WHEN** Overpass returns an HTML response (content-type `text/html` or body starts with `<?xml` or `<!DOCTYPE`)
- **THEN** the system throws an error with the message extracted from the HTML body
- **THEN** no JSON parse error is surfaced to the user

#### Scenario: Overpass returns valid JSON
- **WHEN** Overpass returns a valid JSON response
- **THEN** the response is parsed and processed normally

### Requirement: Error message extraction from HTML
When an HTML error is detected, the system SHALL attempt to extract the error message text from the HTML body for inclusion in the thrown error.

#### Scenario: Error text extraction
- **WHEN** Overpass returns HTML containing `<strong style="color:#FF0000">Error</strong>: runtime error: ...protocol_error`
- **THEN** the thrown error message includes "runtime error: ...protocol_error"
