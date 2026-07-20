export function greetingForHour(hour: number): string {
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}

export function firstNameFrom(identity: string | null | undefined): string {
  if (!identity) return 'there';

  const raw = identity.includes('@') ? identity.split('@')[0]! : identity;
  const token = raw.split(/[.\s_-]+/).find(Boolean) ?? raw;
  if (!token) return 'there';

  return token.charAt(0).toUpperCase() + token.slice(1).toLowerCase();
}
