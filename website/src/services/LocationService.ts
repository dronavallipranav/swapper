export type Location = {
  latitude: number;
  longitude: number;
  override: boolean;
};

class LocationService {
  static getLocationKey() {
    return "userLocation";
  }

  static async requestCurrentLocation() {
    if (!navigator.geolocation) {
      throw new Error("Geolocation is not supported by your browser.");
    }

    return new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          const location = { latitude, longitude, override: false };
          localStorage.setItem(this.getLocationKey(), JSON.stringify(location));
          resolve(location);
        },
        () => reject(new Error("Unable to retrieve your location."))
      );
    });
  }

  static overrideLocation(latitude: number, longitude: number) {
    const location = { latitude, longitude, override: true };
    console.log("Overriding location:", location);
    localStorage.setItem(this.getLocationKey(), JSON.stringify(location));
  }

  static clearLocationOverride() {
    const location = this.getStoredLocation();
    if (location && location.override) {
      this.requestCurrentLocation().catch((error) => console.error(error));
    }
  }

  static getStoredLocation(): Location | null {
    const locationString = localStorage.getItem(this.getLocationKey());
    if (!locationString) {
      return null;
    }
    return JSON.parse(locationString);
  }
}

export default LocationService;
