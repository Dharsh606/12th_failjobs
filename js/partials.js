document.addEventListener('DOMContentLoaded', () => {
  const tryPaths = (name) => [
    `../recruiter/partials/${name}.html`,    // Try recruiter subdirectory first
    `../partials/${name}.html`,    // Then try parent directory
    `../../partials/${name}.html`,   // Then try grandparent
    `partials/${name}.html`        // Then try current directory
  ];

  const includes = document.querySelectorAll('[data-include]');
  includes.forEach(async (el) => {
    const name = el.getAttribute('data-include');
    const paths = tryPaths(name);
    for (const p of paths) {
      try {
        const res = await fetch(p);
        if (res.ok) {
          el.innerHTML = await res.text();
          console.log(`Loaded ${name} from ${p}`);
          break;
        }
      } catch (err) {
        console.log(`Failed to load ${name} from ${p}:`, err);
        // try next path
      }
    }
  });

  // simple mobile nav toggle
  document.addEventListener('click', (e) => {
    if (e.target && e.target.id === 'navToggle') {
      const menu = document.getElementById('navMenu');
      if (menu) menu.classList.toggle('open');
    }
  });
});