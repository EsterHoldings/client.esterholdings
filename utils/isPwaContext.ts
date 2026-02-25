export const isPwaContext = (): boolean => {
  if (!process.client) {
    return false;
  }

  const displayModes = ["standalone", "fullscreen", "minimal-ui"];
  const hasStandaloneDisplayMode = displayModes.some((mode) =>
    window.matchMedia?.(`(display-mode: ${mode})`)?.matches,
  );
  const isIosStandalone = Boolean((window.navigator as Navigator & { standalone?: boolean }).standalone);

  return hasStandaloneDisplayMode || isIosStandalone;
};

export default isPwaContext;
