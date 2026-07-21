export function createUrl(
  pathname: string,
  params: URLSearchParams,
  updates?: Record<string, string | null>
) {
  const newParams = new URLSearchParams(params.toString());
  
  if (updates) {
    Object.entries(updates).forEach(([key, value]) => {
      if (value === null) {
        newParams.delete(key);
      } else {
        newParams.set(key, value);
      }
    });
  }

  const newParamsString = newParams.toString();
  return `${pathname}${newParamsString.length ? '?' : ''}${newParamsString}`;
}
