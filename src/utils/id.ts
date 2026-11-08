/**
 * Generates an RFC-compliant or collision-resistant unique identifier.
 */
export const generateUniqueId = (prefix = ''): string => {
  const uuid =
    typeof crypto !== 'undefined' && 'randomUUID' in crypto
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;

  return prefix ? `${prefix}-${uuid}` : uuid;
};

