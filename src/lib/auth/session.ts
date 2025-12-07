export async function getSession() {
  // MUST include credentials so browser sends asp_session cookie to backend
  const res = await fetch("http://localhost:8080/auth/session/me", {
    method: "GET",
    credentials: "include",
  });

  if (!res.ok) {
    return null;
  }

  return res.json();
}

