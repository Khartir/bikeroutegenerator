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
- `routeSlice` (src/route/routeSlice.ts) - Route state: waypoints, start point, route geometry, options (length, profile), elevation/distance info
- `mapSlice` (src/leaflet/mapSlice.ts) - Map state: center position, zoom level

### Route Generation Flow
1. User sets start point on Leaflet map
2. `fetchWayPointsAndRoute` async thunk triggered with start point, length, profile
3. `makeRandomRoute` (src/routing/imported/route.ts) creates a circular polygon around start point
4. `snapPolygonToRoad` (src/routing/imported/overpass.ts) snaps polygon vertices to nearest roads via Overpass API
5. `makeRoute` (src/routing/imported/brouter.ts) calls BRouter API to get actual routable path between waypoints
6. Route displayed on map with elevation-colored hotline

### External APIs
- **BRouter**: `https://brouter-api.brokenpipe.de/brouter` - Bicycle routing engine for path calculation
- **Overpass**: `https://overpass.private.coffee/api/interpreter` - OSM query API for snapping points to roads

### Key Directories
- `src/routing/` - Route calculation logic (BRouter, Overpass integration)
- `src/route/` - Route UI components and Redux slice
- `src/leaflet/` - Map components using react-leaflet
- `src/types/` - TypeScript declarations for untyped dependencies (togpx, leaflet-hotline, redux-throttle)

### Routing Profiles
Defined in `src/routing/routeAPI.ts`:
- `fastbike-verylowtraffic` - Tertiary/unclassified roads only
- `trekking` - All highways

## Code Style

- Prettier: 120 char width, 4-space tabs
- ESLint with React and TypeScript plugins
- Strict TypeScript mode enabled
