export async function go() {
  const r = await fetch("https://example.com");
  return r.status;
}
