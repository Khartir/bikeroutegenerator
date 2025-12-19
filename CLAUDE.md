# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

A React web application for generating random cycling routes. Users select a starting point on a map, choose a desired route length and profile, and the app generates a circular bike route using BRouter for routing and Overpass API for road snapping.

Live at: https://khartir.github.io/bikeroutegenerator

## Commands

- `npm run dev` - Start development server (opens browser automatically)
- `npm run build` - TypeScript check and Vite production build (outputs to `build/`)
- `npm run preview` - Preview production build locally

## Architecture

### State Management
Redux Toolkit with redux-persist for local storage persistence. Two slices:
- `routeSlice` (src/route/routeSlice.ts) - Route state: waypoints, start point, center point, route geometry, options (length, profile), elevation/distance info, step-through mode state
- `mapSlice` (src/leaflet/mapSlice.ts) - Map state: center position, zoom level

### Route Generation Flow
The route generation has 5 steps, controlled by `GenerationStep` type in routeSlice.ts:

1. **finding_center** - `findRandomCenterPos()` picks a random point on a circle around the start point to use as the route center
2. **creating_polygon** - `findRandomCheckpointPolygon()` creates a circular polygon (c2) around the center, then `shiftToStartPoint()` rotates it so start point is a vertex
3. **snapping_to_roads** - `snapPolygonToRoad()` (src/routing/imported/overpass.ts) snaps polygon vertices to nearest roads via Overpass API
4. **finding_waypoints** - `getWaypoints()` (src/routing/imported/brouter.ts) calculates intermediate waypoints, fixing dead ends
5. **calculating_route** - `makeRoute()` calls BRouter API to get actual routable path between waypoints

Route displayed on map with elevation-colored hotline.

### Step-Through Mode
When enabled via Options dialog (`stepThroughMode` in state), the route generation pauses at each step, allowing the user to:
- **Step 1 (finding_center)**: See and drag the center point marker to adjust route shape. The c1 circle (possible center positions) is displayed and the center point is displayed with a blue draggable marker
- **Step 2 (creating_polygon)**: The polygon is displayed with blue draggable vertex markers. The c1 circle is hidden. The center point is greyed out and non-movable. When a vertex is dragged and released, it automatically snaps to the nearest road
- **Step 3 (finding_waypoints)**: See and drag waypoint markers to adjust the route. The polygon is hidden, center is hidden

Key files:
- `src/route/stepController.ts` - Promise-based pause/resume mechanism using `waitForNextStep()` and `triggerNextStep()`
- `src/route/CenterPoint.tsx` - Draggable center point marker (visible in step 1, grey non-draggable in step 2)
- `src/route/PolygonVertices.tsx` - Draggable polygon vertex markers with automatic road snapping (visible in step 2)
- `src/route/WayPoints.tsx` - Draggable waypoint markers
- `src/route/StatusBar.tsx` - Shows current step message and "Next Step" button when paused
- `src/route/Debug.tsx` - Shows debug features (polygons, route segments) when step-through mode is enabled

The step controller is configured at the start of `fetchWayPointsAndRoute` thunk with the current `stepThroughMode` value. Debug features are only added when step-through mode is enabled.

Map snapping:
- Step 1: Map snaps to show both center point and start point when found
- Step 2: Map fits to polygon bounds when created
- Step 3: Map fits to waypoint bounds

### External APIs
- **BRouter**: `http://localhost:17777/brouter` (development) - Bicycle routing engine for path calculation
- **Overpass**: `https://overpass.private.coffee/api/interpreter` - OSM query API for snapping points to roads

### Key Directories
- `src/routing/` - Route calculation logic (BRouter, Overpass integration)
  - `src/routing/imported/route.ts` - Main route generation algorithm with 5 steps
  - `src/routing/imported/brouter.ts` - BRouter API calls
  - `src/routing/imported/overpass.ts` - Overpass API for road snapping
  - `src/routing/routeAPI.ts` - Public API exposing `getWaypoints()` and `makeRoute()`
- `src/route/` - Route UI components and Redux slice
  - `src/route/routeSlice.ts` - Redux state, actions, selectors, and `fetchWayPointsAndRoute` thunk
  - `src/route/stepController.ts` - Step-through pause/resume logic
  - `src/route/CenterPoint.tsx` - Draggable center point marker
  - `src/route/StatusBar.tsx` - Status display with step messages
- `src/leaflet/` - Map components using react-leaflet
- `src/types/` - TypeScript declarations for untyped dependencies (togpx, leaflet-hotline, redux-throttle)

### Routing Profiles
Defined in `src/routing/routeAPI.ts`:
- `fastbike-verylowtraffic` - Tertiary/unclassified roads only
- `trekking` - All highways

### Error Handling
Errors during route generation are captured in `RouteError` type with:
- `step` - Which generation step failed
- `source` - Error source: "overpass", "brouter", or "app"
- `message` - Error message

Error source detection includes checking for "java.lang" in error messages (indicates BRouter Java error).

## Code Style

- Prettier: 120 char width, 4-space tabs
- ESLint with React and TypeScript plugins
- Strict TypeScript mode enabled

## Redux Persist Migrations
Store migrations in `src/state/store.ts`:
- Version 2: Reset route state
- Version 3: Added stepThroughMode and waitingForNextStep fields
- Version 4: Removed showIntermediateSteps field (now tied to stepThroughMode)
