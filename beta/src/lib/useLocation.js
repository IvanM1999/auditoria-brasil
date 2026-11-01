import { useCallback, useEffect, useState } from 'react';

const STORAGE_KEY = 'auditoria-brasil-location';
const CHANGE_EVENT = 'auditoria-brasil:location-changed';

function readLocation() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return null;
    const location = JSON.parse(stored);
    return location?.cidade && location?.estado ? location : null;
  } catch {
    return null;
  }
}

export function useLocation() {
  const [location, setCurrentLocation] = useState(readLocation);

  useEffect(() => {
    const refresh = () => setCurrentLocation(readLocation());
    window.addEventListener('storage', refresh);
    window.addEventListener(CHANGE_EVENT, refresh);
    return () => {
      window.removeEventListener('storage', refresh);
      window.removeEventListener(CHANGE_EVENT, refresh);
    };
  }, []);

  const setLocation = useCallback((nextLocation) => {
    if (!nextLocation) {
      localStorage.removeItem(STORAGE_KEY);
    } else {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        cidade: String(nextLocation.cidade).trim(),
        estado: String(nextLocation.estado).trim().toUpperCase(),
      }));
    }
    window.dispatchEvent(new Event(CHANGE_EVENT));
  }, []);

  return { location, setLocation };
}
