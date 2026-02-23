// ===============================
// app.js - Backend + Auth helpers
// ===============================

// If your folder name is different, change this one line only:
const BASE = "";

const API = (file) => `${BASE}/backend/${file}`;

function roleKey(role){return role==="worker"?"failjob_user_worker":(role==="recruiter"?"failjob_user_recruiter":"failjob_user")}
function pathRole(){const p=(location.pathname||"").toLowerCase();if(p.indexOf("/worker/")!==-1)return"worker";if(p.indexOf("/recruiter/")!==-1)return"recruiter";return null}
function setUser(user){try{localStorage.setItem("failjob_user",JSON.stringify(user));const k=roleKey(user&&user.role);if(k)localStorage.setItem(k,JSON.stringify(user))}catch(e){}}
function getUser(){try{const r=pathRole();if(r){const rk=roleKey(r);const v=localStorage.getItem(rk);if(v)return JSON.parse(v);const d=localStorage.getItem("failjob_user");if(!d)return null;const obj=JSON.parse(d);if(obj&&obj.role===r){localStorage.setItem(rk,JSON.stringify(obj));return obj}return null}const d=localStorage.getItem("failjob_user");if(!d)return null;return JSON.parse(d)}catch(e){return null}}
function clearUser(){try{const r=pathRole();if(r)localStorage.removeItem(roleKey(r));localStorage.removeItem("failjob_user")}catch(e){}}
function logout(){try{const r=pathRole();if(r)localStorage.removeItem(roleKey(r));localStorage.removeItem("failjob_user")}catch(e){}alert("Logged out successfully ✅");window.location.href="../index.html"}

// ---- Role guards ----
function requireLogin(redirectTo = "index.html") {
  const u = getUser();
  if (!u) {
    alert("Please login first.");
    window.location.href = `login.html?redirect=${encodeURIComponent(redirectTo)}`;
    return null;
  }
  return u;
}

function requireEmployer(redirectTo = "post-job.html") {
  const u = requireLogin(redirectTo);
  if (!u) return null;

  if (u.role !== "employer" && u.role !== "recruiter") {
    alert("Only employers/recruiters can post jobs. Please login as Employer or Recruiter.");
    window.location.href = `login.html?redirect=${encodeURIComponent(redirectTo)}`;
    return null;
  }
  return u;
}

function requireRecruiter(redirectTo = "dashboard.html") {
  const u = requireLogin(redirectTo);
  if (!u) return null;

  if (u.role !== "recruiter") {
    alert("Only recruiters can access this page. Please login as Recruiter.");
    window.location.href = `login.html?redirect=${encodeURIComponent(redirectTo)}`;
    return null;
  }
  return u;
}

// ---- Small fetch helper ----
async function postJSON(endpoint, payload) {
  const res = await fetch(API(endpoint), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  // if PHP prints warnings, it may break JSON. This helps debugging.
  const text = await res.text();
  try {
    return JSON.parse(text);
  } catch (e) {
    console.error("Invalid JSON from server:", text);
    return { ok: false, message: "Server returned invalid response. Check PHP errors." };
  }
}
