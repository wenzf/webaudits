import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigation, useRouteLoaderData } from 'react-router';


// data-attribute="attribute-value"
// used in Sidebar component

export const useIntersectionTracker = (
  dataAttributeName: string,
  options?: IntersectionObserverInit
): string[] => {
  const [inViewIds, setInViewIds] = useState<string[]>([]);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const { state } = useNavigation()
  const rootLoaderData = useRouteLoaderData('root')

  const isMobile = !!rootLoaderData?.ua?.is_mobile

  const handleIntersection = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      if (isMobile) return []
      try {
        setInViewIds((prevIds) => {
          const newInViewIds = new Set<string>(prevIds);
          entries?.forEach(entry => {
            const dataValue = (entry.target as HTMLElement)?.getAttribute(dataAttributeName);
            if (dataValue) {
              if (entry.isIntersecting) {
                // add hash to url
                //if (typeof window === "object" && state === "idle") {
                //  window?.history?.replaceState(null, "", `#${dataValue}`);
                //}
                newInViewIds?.add(dataValue);
              } else {
                newInViewIds?.delete(dataValue);
              }
            }
          });
          const finalIds = Array.from(newInViewIds);
          if (finalIds.length === prevIds.length && finalIds.every((val,
            index) => val === prevIds[index])) {
            return prevIds;
          }
          return finalIds;
        })
      } catch {
        null
      };
    },
    [dataAttributeName]
  );

  useEffect(() => {
    if (isMobile) return
    if (observerRef?.current) {
      observerRef.current?.disconnect();
    }

    if (state === "idle") {
      const selector = `[${dataAttributeName}]`;
      const elements = Array.from(document.querySelectorAll<HTMLElement>(selector));
      observerRef.current = new IntersectionObserver(handleIntersection, options);
      elements.forEach((element) => {
        if (observerRef?.current) observerRef.current.observe(element);
      });
    }
    return () => {
      if (isMobile) return
      if (observerRef?.current) {
        observerRef.current.disconnect();
        //if (typeof window === "object") window.history.replaceState(null, "", "");
      }
    };
  }, [dataAttributeName, options, handleIntersection, state]);

  return isMobile ? [] : inViewIds;
};



type Theme = 'light' | 'dark';

export const useDetectTheme = (): Theme | null => {
  if (typeof window !== "object") return null
  if (typeof document !== "object") return null


  const getTheme = (): Theme => {
    const htmlElement = document.documentElement;
    const hasDarkClass = htmlElement.classList.contains('dark');
    const hasLightClass = htmlElement.classList.contains('light');
    if (hasDarkClass) return 'dark';
    if (hasLightClass) return 'light';

    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    return systemPrefersDark ? 'dark' : 'light';
  };

  const [theme, setTheme] = useState<Theme>(getTheme());

  useEffect(() => {
    const observer = new MutationObserver(() => {
      setTheme(getTheme());
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class'],
    });

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleSystemChange = () => setTheme(getTheme());

    mediaQuery.addEventListener('change', handleSystemChange);

    return () => {
      observer.disconnect();
      mediaQuery.removeEventListener('change', handleSystemChange);
    };
  }, []);

  return theme;
};