import { LatLng, LeafletMouseEvent } from "leaflet";
import { useState } from "react"
import { Marker, Popup, useMapEvents } from "react-leaflet"
import { Router } from "../routing/Router";

export function MapInteraction() {
    const [position, setPosition] = useState<LatLng|null>(null);
  const map = useMapEvents({
    click(e: LeafletMouseEvent) {
        setPosition(e.latlng)
    },
  })

  return position === null ? null : (
    <>
    <Router start={position}/>
    </>
  )
}