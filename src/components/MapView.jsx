import { useState, useEffect, useRef, useMemo } from 'react'

const MapView = ({
  customerLocation = { lat: 40.7128, lng: -74.0060 }, // Default: New York
  mechanicLocation = { lat: 40.7589, lng: -73.9851 }, // Default: NYC area
  className = '',
}) => {
  const [map, setMap] = useState(null)
  const [directionsService, setDirectionsService] = useState(null)
  const [directionsRenderer, setDirectionsRenderer] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [distance, setDistance] = useState(null)
  const [duration, setDuration] = useState(null)
  const mapRef = useRef(null)
  const customerMarkerRef = useRef(null)
  const mechanicMarkerRef = useRef(null)
  const routePolylineRef = useRef(null)
  const customerInfoWindowRef = useRef(null)
  const mechanicInfoWindowRef = useRef(null)

  // Memoize center point
  const centerPoint = useMemo(() => {
    if (!customerLocation || !mechanicLocation) return { lat: 40.7128, lng: -74.0060 }
    return {
      lat: (customerLocation.lat + mechanicLocation.lat) / 2,
      lng: (customerLocation.lng + mechanicLocation.lng) / 2,
    }
  }, [customerLocation, mechanicLocation])

  // Check if Google Maps API is loaded
  useEffect(() => {
    const checkGoogleMaps = () => {
      if (window.google && window.google.maps) {
        return true
      }
      return false
    }

    if (checkGoogleMaps()) {
      setIsLoading(false)
      return
    }

    // Wait for Google Maps to load
    const interval = setInterval(() => {
      if (checkGoogleMaps()) {
        setIsLoading(false)
        clearInterval(interval)
      }
    }, 100)

    // Timeout after 10 seconds
    const timeout = setTimeout(() => {
      if (!checkGoogleMaps()) {
        setError('Google Maps API failed to load. Please check your API key.')
        setIsLoading(false)
        clearInterval(interval)
      }
    }, 10000)

    return () => {
      clearInterval(interval)
      clearTimeout(timeout)
    }
  }, [])

  // Initialize Google Maps
  useEffect(() => {
    if (!window.google || !window.google.maps || !mapRef.current) return

    try {
      // Modern map styles
      const mapStyles = [
        {
          featureType: 'poi',
          elementType: 'labels',
          stylers: [{ visibility: 'off' }],
        },
        {
          featureType: 'transit',
          elementType: 'labels',
          stylers: [{ visibility: 'off' }],
        },
        {
          featureType: 'water',
          elementType: 'geometry',
          stylers: [{ color: '#e9e9e9' }],
        },
        {
          featureType: 'road',
          elementType: 'geometry',
          stylers: [{ color: '#ffffff' }],
        },
        {
          featureType: 'road',
          elementType: 'labels.text.fill',
          stylers: [{ color: '#757575' }],
        },
      ]

      // Initialize map
      const mapInstance = new window.google.maps.Map(mapRef.current, {
        zoom: 12,
        center: centerPoint,
        mapTypeControl: true,
        mapTypeControlOptions: {
          style: window.google.maps.MapTypeControlStyle.HORIZONTAL_BAR,
          position: window.google.maps.ControlPosition.TOP_RIGHT,
        },
        streetViewControl: false,
        fullscreenControl: true,
        fullscreenControlOptions: {
          position: window.google.maps.ControlPosition.RIGHT_TOP,
        },
        zoomControl: true,
        zoomControlOptions: {
          position: window.google.maps.ControlPosition.RIGHT_CENTER,
        },
        styles: mapStyles,
        disableDefaultUI: false,
      })

      setMap(mapInstance)

      // Initialize directions service and renderer
      const directionsServiceInstance = new window.google.maps.DirectionsService()
      const directionsRendererInstance = new window.google.maps.DirectionsRenderer({
        map: mapInstance,
        suppressMarkers: true, // We'll use custom markers
        polylineOptions: {
          strokeColor: '#6366f1', // Indigo color
          strokeWeight: 5,
          strokeOpacity: 0.8,
          icons: [
            {
              icon: {
                path: window.google.maps.SymbolPath.FORWARD_CLOSED_ARROW,
                scale: 4,
                strokeColor: '#6366f1',
                fillColor: '#6366f1',
                fillOpacity: 1,
              },
              offset: '50%',
              repeat: '100px',
            },
          ],
        },
      })

      setDirectionsService(directionsServiceInstance)
      setDirectionsRenderer(directionsRendererInstance)
      setError(null)
    } catch (err) {
      console.error('Error initializing map:', err)
      setError('Error initializing map: ' + err.message)
      setIsLoading(false)
    }
  }, [centerPoint])

  // Update markers and route when locations change
  useEffect(() => {
    if (!map || !customerLocation || !mechanicLocation) return

    // Clean up existing markers
    if (customerMarkerRef.current) {
      customerMarkerRef.current.setMap(null)
    }
    if (mechanicMarkerRef.current) {
      mechanicMarkerRef.current.setMap(null)
    }
    if (routePolylineRef.current) {
      routePolylineRef.current.setMap(null)
    }

    // Create customer marker with custom icon
    customerMarkerRef.current = new window.google.maps.Marker({
      position: customerLocation,
      map: map,
      title: 'Customer Location',
      icon: {
        path: window.google.maps.SymbolPath.CIRCLE,
        scale: 12,
        fillColor: '#3b82f6', // Blue
        fillOpacity: 1,
        strokeColor: '#ffffff',
        strokeWeight: 3,
      },
      label: {
        text: 'C',
        color: '#ffffff',
        fontSize: '14px',
        fontWeight: 'bold',
      },
      zIndex: 1000,
      animation: window.google.maps.Animation.DROP,
    })

    // Create mechanic marker with custom icon
    mechanicMarkerRef.current = new window.google.maps.Marker({
      position: mechanicLocation,
      map: map,
      title: 'Mechanic Location',
      icon: {
        path: window.google.maps.SymbolPath.CIRCLE,
        scale: 12,
        fillColor: '#ef4444', // Red
        fillOpacity: 1,
        strokeColor: '#ffffff',
        strokeWeight: 3,
      },
      label: {
        text: 'M',
        color: '#ffffff',
        fontSize: '14px',
        fontWeight: 'bold',
      },
      zIndex: 1000,
      animation: window.google.maps.Animation.DROP,
    })

    // Create info windows
    if (customerInfoWindowRef.current) {
      customerInfoWindowRef.current.close()
    }
    customerInfoWindowRef.current = new window.google.maps.InfoWindow({
      content: `
        <div class="p-2">
          <h3 class="font-bold text-blue-600 mb-1">Customer Location</h3>
          <p class="text-sm text-gray-700">Lat: ${customerLocation.lat.toFixed(4)}</p>
          <p class="text-sm text-gray-700">Lng: ${customerLocation.lng.toFixed(4)}</p>
        </div>
      `,
    })

    if (mechanicInfoWindowRef.current) {
      mechanicInfoWindowRef.current.close()
    }
    mechanicInfoWindowRef.current = new window.google.maps.InfoWindow({
      content: `
        <div class="p-2">
          <h3 class="font-bold text-red-600 mb-1">Mechanic Location</h3>
          <p class="text-sm text-gray-700">Lat: ${mechanicLocation.lat.toFixed(4)}</p>
          <p class="text-sm text-gray-700">Lng: ${mechanicLocation.lng.toFixed(4)}</p>
        </div>
      `,
    })

    // Add click listeners to markers
    customerMarkerRef.current.addListener('click', () => {
      customerInfoWindowRef.current.open(map, customerMarkerRef.current)
    })

    mechanicMarkerRef.current.addListener('click', () => {
      mechanicInfoWindowRef.current.open(map, mechanicMarkerRef.current)
    })

    // Draw route using Directions Service
    if (directionsService && directionsRenderer) {
      directionsService.route(
        {
          origin: customerLocation,
          destination: mechanicLocation,
          travelMode: window.google.maps.TravelMode.DRIVING,
          optimizeWaypoints: false,
        },
        (result, status) => {
          if (status === 'OK' && result) {
            directionsRenderer.setDirections(result)
            
            // Extract distance and duration
            const route = result.routes[0]
            if (route && route.legs && route.legs[0]) {
              setDistance(route.legs[0].distance?.text || null)
              setDuration(route.legs[0].duration?.text || null)
            }
          } else {
            // Fallback: draw straight line if directions fail
            if (routePolylineRef.current) {
              routePolylineRef.current.setMap(null)
            }

            routePolylineRef.current = new window.google.maps.Polyline({
              path: [customerLocation, mechanicLocation],
              geodesic: true,
              strokeColor: '#6366f1',
              strokeOpacity: 0.8,
              strokeWeight: 5,
              map: map,
            })
            setDistance(null)
            setDuration(null)
          }
        }
      )
    } else {
      // Fallback: draw straight line
      if (routePolylineRef.current) {
        routePolylineRef.current.setMap(null)
      }

      routePolylineRef.current = new window.google.maps.Polyline({
        path: [customerLocation, mechanicLocation],
        geodesic: true,
        strokeColor: '#6366f1',
        strokeOpacity: 0.8,
        strokeWeight: 5,
        map: map,
      })
    }

    // Fit bounds to show both markers with padding
    const bounds = new window.google.maps.LatLngBounds()
    bounds.extend(customerLocation)
    bounds.extend(mechanicLocation)
    map.fitBounds(bounds, { padding: 50 })

    // Cleanup function
    return () => {
      if (customerMarkerRef.current) {
        customerMarkerRef.current.setMap(null)
      }
      if (mechanicMarkerRef.current) {
        mechanicMarkerRef.current.setMap(null)
      }
      if (routePolylineRef.current) {
        routePolylineRef.current.setMap(null)
      }
      if (customerInfoWindowRef.current) {
        customerInfoWindowRef.current.close()
      }
      if (mechanicInfoWindowRef.current) {
        mechanicInfoWindowRef.current.close()
      }
    }
  }, [map, customerLocation, mechanicLocation, directionsService, directionsRenderer])

  if (error) {
    return (
      <div
        className={`
          bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl border border-red-200 p-6 md:p-8 text-center
          ${className}
        `}
        role="alert"
        aria-live="assertive"
      >
        <div className="mb-4">
          <svg
            className="w-12 h-12 text-red-500 mx-auto"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
        </div>
        <p className="text-red-800 font-bold text-lg mb-2">Map Error</p>
        <p className="text-red-600 text-sm mb-2">{error}</p>
        <p className="text-red-500 text-xs">
          Please ensure Google Maps API is loaded and your API key is valid.
        </p>
      </div>
    )
  }

  return (
    <div className={`relative ${className}`}>
      {/* Map Container */}
      <div
        ref={mapRef}
        className="w-full h-[400px] md:h-[500px] lg:h-[600px] rounded-2xl overflow-hidden shadow-2xl border-2 border-white/20 bg-gray-100"
        role="application"
        aria-label="Interactive map showing customer and mechanic locations with route"
        aria-live="polite"
      />

      {/* Loading Overlay */}
      {isLoading && (
        <div
          className="absolute inset-0 bg-white/90 backdrop-blur-sm flex items-center justify-center rounded-2xl z-20"
          role="status"
          aria-label="Loading map"
        >
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-indigo-200 border-t-indigo-600 mx-auto mb-4"></div>
            <p className="text-gray-700 text-sm font-medium">Loading map...</p>
            <p className="text-gray-500 text-xs mt-1">Please wait</p>
          </div>
        </div>
      )}

      {/* Route Information Card */}
      {(distance || duration) && (
        <div
          className="absolute top-4 left-4 bg-white/90 backdrop-blur-lg rounded-xl shadow-lg p-3 md:p-4 border border-gray-200 z-10 max-w-[200px] md:max-w-[250px]"
          role="region"
          aria-label="Route information"
        >
          <div className="space-y-2">
            {distance && (
              <div className="flex items-center gap-2">
                <svg
                  className="w-4 h-4 text-indigo-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
                <span className="text-sm font-semibold text-gray-700">{distance}</span>
              </div>
            )}
            {duration && (
              <div className="flex items-center gap-2">
                <svg
                  className="w-4 h-4 text-indigo-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <span className="text-sm font-semibold text-gray-700">{duration}</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Legend */}
      <div
        className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-lg rounded-xl shadow-lg p-3 md:p-4 border border-gray-200 z-10"
        role="region"
        aria-label="Map legend"
      >
        <h4 className="text-xs font-bold text-gray-700 mb-2 uppercase tracking-wide">
          Legend
        </h4>
        <div className="space-y-2 text-sm">
          <div className="flex items-center gap-2">
            <div
              className="w-5 h-5 rounded-full bg-blue-500 border-2 border-white shadow-md"
              aria-label="Customer location marker"
              role="img"
            />
            <span className="text-gray-700 font-medium">Customer</span>
          </div>
          <div className="flex items-center gap-2">
            <div
              className="w-5 h-5 rounded-full bg-red-500 border-2 border-white shadow-md"
              aria-label="Mechanic location marker"
              role="img"
            />
            <span className="text-gray-700 font-medium">Mechanic</span>
          </div>
          <div className="flex items-center gap-2 pt-2 border-t border-gray-200">
            <div
              className="w-8 h-1 bg-indigo-500 rounded"
              aria-label="Route line"
              role="img"
            />
            <span className="text-gray-700 font-medium text-xs">Route</span>
          </div>
        </div>
      </div>

      {/* Hidden accessibility information */}
      <div className="sr-only" aria-live="polite">
        <p>
          Customer location: {customerLocation?.lat?.toFixed(4) || 'N/A'},{' '}
          {customerLocation?.lng?.toFixed(4) || 'N/A'}
        </p>
        <p>
          Mechanic location: {mechanicLocation?.lat?.toFixed(4) || 'N/A'},{' '}
          {mechanicLocation?.lng?.toFixed(4) || 'N/A'}
        </p>
        {distance && <p>Distance: {distance}</p>}
        {duration && <p>Estimated travel time: {duration}</p>}
      </div>
    </div>
  )
}

export default MapView
