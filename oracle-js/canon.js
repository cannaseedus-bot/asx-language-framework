function sortValue(value) {
  if (Array.isArray(value)) {
    return value.map(sortValue);
  }
  if (value && typeof value === "object") {
    const entries = Object.keys(value)
      .sort()
      .map((key) => [key, sortValue(value[key])]);
    return Object.fromEntries(entries);
  }
  return value;
}

export function canonJsonBytesV1(obj) {
  const sorted = sortValue(obj);
  const json = JSON.stringify(sorted, null, 0);
  return new TextEncoder().encode(json);
}
