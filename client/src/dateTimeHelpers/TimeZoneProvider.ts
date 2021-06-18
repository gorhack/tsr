export const defaultTimeZone = (): string => {
    return Intl.DateTimeFormat().resolvedOptions().timeZone;
};
