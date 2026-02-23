// =====================================
// script.js - UI interactions (no backend)
// =====================================

// Navbar toggle (mobile)
document.addEventListener("DOMContentLoaded", function () {
  const navToggle = document.getElementById("navToggle");
  const navMenu = document.getElementById("navMenu");

  if (navToggle && navMenu) {
    navToggle.addEventListener("click", function () {
      navMenu.classList.toggle("open");
    });
  }

  // Update Login/Register button → Logout when user is logged in
  // Works only if app.js is loaded on the page too
  try {
    if (typeof getUser === "function") {
      const user = getUser();

      const loginLink = document.querySelector('a[href="login.html"]');
      if (loginLink && user) {
        loginLink.textContent = "Logout";
        loginLink.href = "#";
        loginLink.classList.add("btn");
        loginLink.classList.add("btn-primary");

        loginLink.addEventListener("click", function (e) {
          e.preventDefault();
          if (typeof logout === "function") logout();
        });
      }
    }
  } catch (e) {
    // ignore if app.js not loaded
  }
});