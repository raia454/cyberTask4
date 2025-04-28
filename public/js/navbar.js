window.addEventListener('DOMContentLoaded', async () => {
  const navContainer = document.getElementById('nav-container');
  if (!navContainer) return;

  let navContent = `
    <a href="/">Home</a> |
    <a href="/user-login.html">Login</a> |
    <a href="/adminlogin.html">Admin</a>
  `;

  try {
    const data = await checkAuth();
    if (data.authenticated) {
      navContent = `
        <a href="/">Home</a> |
        ${data.role === 'ADMIN' ? '<a href="/admin.html">Admin Panel</a> |' : ''}
        <a href="/my-account.html">My Account</a> |
        <a href="#" onclick="logout()">Logout</a>
      `;
    }
  } catch (error) {
    console.error('Navigation error:', error);
  }

  navContainer.innerHTML = navContent;
});

async function logout() {
  try {
    const response = await fetch('/logout', { method: 'POST' });
    const data = await response.json();
    if (data.success) {
      window.location.href = '/user-login.html';
    } else {
      alert('Logout failed. Please try again.');
    }
  } catch (error) {
    console.error('Logout error:', error);
    alert('An error occurred during logout.');
  }
}