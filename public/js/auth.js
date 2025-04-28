async function checkAuth() {
  try {
    const response = await fetch('/api/user');
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error checking authentication:', error);
    return { authenticated: false };
  }
}