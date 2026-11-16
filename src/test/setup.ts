import "@testing-library/jest-dom";

// Stub for IntersectionObserver, which jsdom doesn't implement. Kept as
// a general test-environment safety net even after the framer-motion
// components that first needed it (Fase 3) were removed (Fase 4).
class IntersectionObserverStub {
  observe() {}
  unobserve() {}
  disconnect() {}
  takeRecords() {
    return [];
  }
}
// @ts-expect-error jsdom doesn't implement IntersectionObserver
window.IntersectionObserver = IntersectionObserverStub;

Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => {},
  }),
});
