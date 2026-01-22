export async function fetchUser(id: string): Promise<{ id: string }> {
  // Intentionally uses fetch() (net.read)
  const res = await fetch(`https://example.com/users/${encodeURIComponent(id)}`);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return (await res.json()) as { id: string };
}
