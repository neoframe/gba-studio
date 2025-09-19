import { useContext, useEffect, useState } from 'react';

import { AppContext } from './contexts';

export const useQuery = <T = Record<string, string>>(init: T = {} as T) => {
  const [query, setQuery] = useState<T>(init);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const q: T = {} as T;
    params.forEach((value, key) => {
      q[key as keyof T] = value as T[keyof T];
    });

    setQuery(old => ({ ...old, ...q }));
  }, []);

  return query;
};

export const useApp = () => useContext(AppContext);
