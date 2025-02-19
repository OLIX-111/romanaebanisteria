declare namespace google.maps {
    interface MapsLibrary {
      Map: typeof google.maps.Map
    }
  
    interface MarkerLibrary {
      Marker: typeof google.maps.Marker
    }
  
    function importLibrary(library: string): Promise<MapsLibrary | MarkerLibrary>
  }
  
  