import React from "react";
import GoogleMapReact from 'google-map-react';
import { MapPin } from 'lucide-react';

interface LocationMarkerProps {
  lat: number;
  lng: number;
}

const LocationMarker: React.FC<LocationMarkerProps> = () => (
  <div className="relative -translate-x-1/2 -translate-y-1/2">
    <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-lg shadow-lg">
      <div className="bg-primary p-1 rounded-full">
        <MapPin className="w-4 h-4 text-white" />
      </div>
      <span className="text-sm font-medium whitespace-nowrap">ROMAna Ebanistería</span>
      <a 
        href="https://maps.google.com/?q=Calle+4,+No.+7,+Sector+Reparto+Torres,+La+Romana,+República+Dominicana" 
        target="_blank" 
        rel="noopener noreferrer"
        className="text-xs text-primary hover:underline"
      >
        Open Google Maps →
      </a>
    </div>
  </div>
);

export default function LocationSection() {
  const defaultProps = {
    center: {
      lat: 18.428,
      lng: -68.972
    },
    zoom: 15
  };

  return (
    <section className="py-24 lg:py-32">
      <div className="grid lg:grid-cols-2 gap-12 items-start">
        <div className="bg-gray-100 rounded-lg overflow-hidden shadow-lg" style={{ height: '400px' }}>
          <GoogleMapReact
            bootstrapURLKeys={{ key: "AIzaSyBzThRkDOyyClUmtYw8NNtOmWkUk4A8Kew" }}
            defaultCenter={defaultProps.center}
            defaultZoom={defaultProps.zoom}
            options={{
              styles: [
                {
                  featureType: "all",
                  elementType: "geometry",
                  stylers: [{ lightness: 50 }]
                },
                {
                  featureType: "all",
                  elementType: "labels",
                  stylers: [{ lightness: 20 }]
                }
              ]
            }}
          >
            <LocationMarker
              lat={18.428}
              lng={-68.972}
            />
          </GoogleMapReact>
        </div>

        <div className="space-y-6">
          <div>
            <h3 className="text-sm font-medium text-gray-500 mb-1">Nuestra Ubicación</h3>
          </div>

          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-gray-900">Sede Principal</h4>
            <div className="space-y-2 text-gray-600">
              <p className="font-medium">ROMAna Ebanistería</p>
              <p>Calle 4, No. 7</p>
              <p>Sector Reparto Torres</p>
              <p>La Romana, República Dominicana</p>
            </div>
          </div>

          <div className="pt-6 border-t border-gray-200">
            <p className="text-sm text-gray-500">
              Visítanos para conocer nuestro showroom y discutir tu próximo proyecto de ebanistería.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

