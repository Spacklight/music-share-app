// Main app logic: modals, auth flow, upload flow, and (later) rendering tracks.

document.addEventListener("DOMContentLoaded", () => {
  initAuthUI();
  initUploadUI();
  refreshAuthStatus();
});

/* ================= AUTH UI ================= */

let authMode = "login"; // or "register"

function initAuthUI() {
  const overlay = document.getElementById("authModalOverlay");
  const avatar = document.getElementById("userAvatar");
  const authStatus = document.getElementById("authStatus");
  const closeBtn = document.getElementById("authModalClose");
  const loginTab = document.getElementById("loginTab");
  const registerTab = document.getElementById("registerTab");
  const submitBtn = document.getElementById("authSubmitBtn");
  const errorEl = document.getElementById("authError");

  function openModal() {
    errorEl.textContent = "";
    document.getElementById("authUsername").value = "";
    document.getElementById("authPassword").value = "";
    overlay.classList.add("open");
  }
  function closeModal() {
    overlay.classList.remove("open");
  }

  avatar.addEventListener("click", () => {
    if (AUTH.isLoggedIn()) {
      if (confirm(`Logged in as ${AUTH.getUsername()}. Log out?`)) {
        AUTH.logout();
        refreshAuthStatus();
      }
    } else {
      openModal();
    }
  });
  authStatus.addEventListener("click", () => {
    if (!AUTH.isLoggedIn()) openModal();
  });

  closeBtn.addEventListener("click", closeModal);
  overlay.addEventListener("click", (e) => {
    if (e.target === overlay) closeModal();
  });

  loginTab.addEventListener("click", () => {
    authMode = "login";
    loginTab.classList.add("active");
    registerTab.classList.remove("active");
    submitBtn.textContent = "Login";
    errorEl.textContent = "";
  });

  registerTab.addEventListener("click", () => {
    authMode = "register";
    registerTab.classList.add("active");
    loginTab.classList.remove("active");
    submitBtn.textContent = "Create Account";
    errorEl.textContent = "";
  });

  submitBtn.addEventListener("click", async () => {
    const username = document.getElementById("authUsername").value.trim();
    const password = document.getElementById("authPassword").value;
    errorEl.textContent = "";

    if (!username || !password) {
      errorEl.textContent = "Please fill in both fields.";
      return;
    }

    submitBtn.disabled = true;
    submitBtn.textContent = "Please wait...";

    try {
      if (authMode === "login") {
        await AUTH.login(username, password);
        closeModal();
        refreshAuthStatus();
      } else {
        await AUTH.register(username, password);
        errorEl.style.color = "#4ade80";
        errorEl.textContent = "Account created! You can now log in.";
        loginTab.click();
      }
    } catch (err) {
      errorEl.style.color = "#f87171";
      errorEl.textContent = err.message;
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = authMode === "login" ? "Login" : "Create Account";
    }
  });
}

function refreshAuthStatus() {
  const authStatus = document.getElementById("authStatus");
  if (AUTH.isLoggedIn()) {
    authStatus.textContent = `👤 ${AUTH.getUsername()}`;
  } else {
    authStatus.textContent = "Not logged in";
  }
}

/* ================= UPLOAD UI ================= */

let pendingFile = null;

function initUploadUI() {
  const uploadBtn = document.getElementById("uploadBtn");
  const fileInput = document.getElementById("fileInput");
  const overlay = document.getElementById("uploadModalOverlay");
  const closeBtn = document.getElementById("uploadModalClose");
  const submitBtn = document.getElementById("uploadSubmitBtn");
  const errorEl = document.getElementById("uploadError");

  uploadBtn.addEventListener("click", () => {
    if (!AUTH.isLoggedIn()) {
      alert("Please log in first to upload a track.");
      document.getElementById("authModalOverlay").classList.add("open");
      return;
    }
    fileInput.click();
  });

  fileInput.addEventListener("change", () => {
    if (fileInput.files.length === 0) return;
    pendingFile = fileInput.files[0];

    if (!pendingFile.name.toLowerCase().endsWith(".mp3")) {
      alert("Please select an MP3 file.");
      pendingFile = null;
      fileInput.value = "";
      return;
    }

    document.getElementById("uploadTitle").value = pendingFile.name.replace(/\.mp3$/i, "");
    document.getElementById("uploadArtist").value = "";
    errorEl.textContent = "";
    overlay.classList.add("open");
  });

  closeBtn.addEventListener("click", () => overlay.classList.remove("open"));
  overlay.addEventListener("click", (e) => {
    if (e.target === overlay) overlay.classList.remove("open");
  });

  submitBtn.addEventListener("click", async () => {
    const title = document.getElementById("uploadTitle").value.trim();
    const artist = document.getElementById("uploadArtist").value.trim();
    errorEl.textContent = "";

    if (!title || !artist) {
      errorEl.textContent = "Please fill in both title and artist.";
      return;
    }
    if (!pendingFile) {
      errorEl.textContent = "No file selected.";
      return;
    }

    submitBtn.disabled = true;
    submitBtn.textContent = "Uploading...";

    try {
      await GitHubAPI.uploadTrack(pendingFile, title, artist);
      alert("Track uploaded successfully!");
      overlay.classList.remove("open");
      pendingFile = null;
      document.getElementById("fileInput").value = "";
      // We'll call a re-render function here once Step 10 adds track rendering
    } catch (err) {
      errorEl.textContent = err.message;
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = "Upload";
    }
  });
}
