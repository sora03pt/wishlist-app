export const isLocalMockMode = process.env.NODE_ENV === "development";

const mockSessionKey = "wishlist-app:mock-session";
const mockRegisteredEmailsKey = "wishlist-app:mock-registered-emails";

type MockSession = {
  email: string;
};

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

function getMockRegisteredEmails() {
  if (typeof window === "undefined") {
    return [];
  }

  const storedEmails = window.localStorage.getItem(mockRegisteredEmailsKey);

  if (!storedEmails) {
    return [];
  }

  try {
    const emails: unknown = JSON.parse(storedEmails);

    return Array.isArray(emails)
      ? emails.filter((email): email is string => typeof email === "string")
      : [];
  } catch {
    window.localStorage.removeItem(mockRegisteredEmailsKey);
    return [];
  }
}

export function getMockSession(): MockSession | null {
  if (typeof window === "undefined") {
    return null;
  }

  const storedSession = window.localStorage.getItem(mockSessionKey);

  if (!storedSession) {
    return null;
  }

  try {
    const session: unknown = JSON.parse(storedSession);

    if (
      typeof session === "object" &&
      session !== null &&
      "email" in session &&
      typeof session.email === "string"
    ) {
      return { email: session.email };
    }
  } catch {
    window.localStorage.removeItem(mockSessionKey);
  }

  return null;
}

export function registerMockEmail(email: string) {
  const normalizedEmail = normalizeEmail(email);
  const registeredEmails = getMockRegisteredEmails();

  if (registeredEmails.includes(normalizedEmail)) {
    return false;
  }

  window.localStorage.setItem(
    mockRegisteredEmailsKey,
    JSON.stringify([...registeredEmails, normalizedEmail]),
  );
  return true;
}

export function setMockSession(email: string) {
  const session: MockSession = { email: normalizeEmail(email) };
  window.localStorage.setItem(mockSessionKey, JSON.stringify(session));
}

export function clearMockSession() {
  window.localStorage.removeItem(mockSessionKey);
}
