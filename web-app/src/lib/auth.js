// LocalStorage-based auth module

const USERS_KEY = 'ev_finder_users';
const SESSION_KEY = 'ev_finder_session';

function getUsers() {
  try {
    return JSON.parse(localStorage.getItem(USERS_KEY)) || [];
  } catch {
    return [];
  }
}

function saveUsers(users) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

export function createUser(email, password, username) {
  const users = getUsers();

  if (users.find(u => u.email === email)) {
    throw new Error('An account with this email already exists');
  }

  const newUser = {
    $id: 'user_' + Date.now() + '_' + Math.random().toString(36).slice(2, 8),
    email,
    username,
    password, // In production, NEVER store plaintext passwords
    avatar: null,
    createdAt: new Date().toISOString(),
  };

  users.push(newUser);
  saveUsers(users);

  // Auto sign in
  const session = { ...newUser };
  delete session.password;
  localStorage.setItem(SESSION_KEY, JSON.stringify(session));

  return session;
}

export function signIn(email, password) {
  const users = getUsers();
  const user = users.find(u => u.email === email && u.password === password);

  if (!user) {
    throw new Error('Invalid email or password');
  }

  const session = { ...user };
  delete session.password;
  localStorage.setItem(SESSION_KEY, JSON.stringify(session));

  return session;
}

export function getCurrentUser() {
  try {
    const session = JSON.parse(localStorage.getItem(SESSION_KEY));
    return session || null;
  } catch {
    return null;
  }
}

export function signOut() {
  localStorage.removeItem(SESSION_KEY);
}
