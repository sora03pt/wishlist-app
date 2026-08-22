export const isLocalMockMode = process.env.NODE_ENV === "development";

const mockSessionKey = "wishlist-app:mock-session";

type MockSession = {
  email: string;
};

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

export function setMockSession(email: string) {
  const session: MockSession = { email: email.trim().toLowerCase() };
  window.localStorage.setItem(mockSessionKey, JSON.stringify(session));
}

export function clearMockSession() {
  window.localStorage.removeItem(mockSessionKey);
}
