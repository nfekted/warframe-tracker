//Bootstrap's bundle is loaded as a global script (angular.json); only the parts the app calls are typed
declare const bootstrap: {
  Collapse: { getInstance(element: Element): { hide(): void } | null };
  Tab: { getOrCreateInstance(element: Element): { show(): void } };
};

export const Bootstrap = () => bootstrap;
