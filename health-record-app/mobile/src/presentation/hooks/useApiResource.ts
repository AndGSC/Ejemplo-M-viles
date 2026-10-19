import { useCallback, useEffect, useState } from 'react';
import { getErrorMessage } from '../../data/api/ApiError';

interface ApiResource<T> {
  data: T | null;
  error: string | null;
  isLoading: boolean; // Primera carga (muestra indicador de pantalla completa)
  isRefreshing: boolean; // "Deslizar para actualizar"
  refresh: () => void;
  retry: () => void;
}

/**
 * Hook reutilizable para cargar datos de la API con estados de carga, error y actualización.
 * `fetcher` debe ser una función estable (definida fuera del componente) para no
 * repetir la petición en cada render.
 */
export function useApiResource<T>(fetcher: () => Promise<T>): ApiResource<T> {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true); // La primera carga empieza de inmediato
  const [isRefreshing, setIsRefreshing] = useState(false);
  // Cada cambio de este contador vuelve a ejecutar la petición
  const [requestId, setRequestId] = useState(0);

  useEffect(() => {
    let active = true; // Evita actualizar el estado si la pantalla se desmontó

    fetcher()
      .then((result) => {
        if (!active) return;
        setData(result);
        setError(null);
      })
      .catch((loadError: unknown) => {
        if (active) setError(getErrorMessage(loadError));
      })
      .finally(() => {
        if (!active) return;
        setIsLoading(false);
        setIsRefreshing(false);
      });

    return () => {
      active = false;
    };
  }, [fetcher, requestId]);

  // Deslizar hacia abajo: conserva los datos actuales mientras recarga
  const refresh = useCallback(() => {
    setIsRefreshing(true);
    setRequestId((id) => id + 1);
  }, []);

  // Reintentar después de un error: vuelve a mostrar el indicador de carga
  const retry = useCallback(() => {
    setIsLoading(true);
    setError(null);
    setRequestId((id) => id + 1);
  }, []);

  return { data, error, isLoading, isRefreshing, refresh, retry };
}
