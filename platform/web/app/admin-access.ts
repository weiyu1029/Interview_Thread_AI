function configuredAdminEmails(value: string | undefined) {
  return new Set(
    (value || "")
      .split(",")
      .map((email) => email.trim().toLowerCase())
      .filter((email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)),
  );
}

export function isAdminEmail(
  email: string | null | undefined,
  configured = process.env.ADMIN_EMAILS,
) {
  if (!email) return false;
  return configuredAdminEmails(configured).has(email.trim().toLowerCase());
}

