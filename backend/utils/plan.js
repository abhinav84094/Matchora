export function isProActive(user) {
  if (!user || user.plan !== "pro") return false;

  if (!user.planExpiresAt) return true;

  return new Date(user.planExpiresAt) > new Date();
}