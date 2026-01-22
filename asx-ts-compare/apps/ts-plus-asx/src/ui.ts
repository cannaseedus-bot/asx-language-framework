export type User = { id: string };

export function renderUser(u: User): string {
  return `User(${u.id})`;
}
