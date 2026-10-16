export const isTestPath = (path = window.location.pathname) =>
  /\/(?:test)\/?$/.test(path);
export const isGuidePath = (path = window.location.pathname) =>
  /\/guide\/?$/.test(path);
export const currentPage = () =>
  isGuidePath() ? "guide" : isTestPath() ? "test" : "home";
export const pagePath = (lang: string, page: boolean | "guide" = false) =>
  `${lang === "en" ? "/en" : ""}/${page === "guide" ? "guide/" : page ? "test/" : ""}`;
export function navigatePage(path: string) {
  if (window.location.pathname !== path) {
    window.history.pushState({}, "", path);
    window.dispatchEvent(new Event("pimx:navigate"));
  }
}
