import { useEffect, useState } from 'react';
import type { Catalog } from '../types/content';
import { githubService } from '../services/githubService';

export function useCatalog() {
  const [catalog, setCatalog] = useState<Catalog | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadCatalog() {
      try {
        setLoading(true);
        const nextCatalog = await githubService.getCatalog();
        if (!cancelled) {
          setCatalog(nextCatalog);
          setError(null);
        }
      } catch (loadError) {
        if (!cancelled) {
          setError(loadError instanceof Error ? loadError.message : 'Failed to load catalog.');
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void loadCatalog();

    return () => {
      cancelled = true;
    };
  }, []);

  return { catalog, loading, error };
}
