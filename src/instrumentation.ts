export async function register() {
  // Bun passes --localstorage-file to the Node.js subprocess it spawns for Next.js.
  // When no valid path is provided, Node.js creates a localStorage stub without
  // the standard Storage methods. Next.js internals guard with typeof checks, but
  // they don't verify that getItem/setItem are callable — causing a runtime crash.
  // Setting it to undefined restores the expected server-side behaviour.
  if (
    typeof globalThis.localStorage !== "undefined" &&
    typeof (globalThis.localStorage as Storage).getItem !== "function"
  ) {
    Object.defineProperty(globalThis, "localStorage", {
      value: undefined,
      writable: true,
      configurable: true,
    });
  }
}
