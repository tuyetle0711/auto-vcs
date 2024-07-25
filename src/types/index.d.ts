export * from "./fixture";
export * from "./pages";

declare global {
  interface Window {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    router: any;
  }
}
