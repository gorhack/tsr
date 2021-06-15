export const defaultTimeZone = () => {
  return Intl.DateTimeFormat().resolvedOptions().timeZone;
};
