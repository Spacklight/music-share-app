// All "backend" calls now go through Apps Script, which internally
// talks to GitHub using a token that never reaches the browser.

const GitHubAPI = {

  // Public: fetch all tracks (no login required)
  async getTracks() {
    const res = await fetch(CONFIG.APPS_SCRIPT_URL, {
      method: "POST",
      body: JSON.stringify({ action: "getTracks" })
    });
    const data = await res.json();
    return data;
  },

  // Requires login: upload an MP3 + register it in tracks.json
  async uploadTrack(file, title, artist) {
    if (!AUTH.isLoggedIn()) {
      throw new Error("You must be logged in to upload.");
    }

    const base64Content = await this.fileToBase64(file);

    const res = await fetch(CONFIG.APPS_SCRIPT_URL, {
      method: "POST",
      body: JSON.stringify({
        action: "uploadTrack",
        sessionToken: AUTH.getSessionToken(),
        fileName: `${Date.now()}_${file.name}`,
        base64Content,
        title,
        artist
      })
    });

    const data = await res.json();
    if (!data.success) throw new Error(data.message || "Upload failed");
    return data;
  },

  // Convert a File object to raw base64 (no data: prefix)
  fileToBase64(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const base64 = reader.result.split(",")[1];
        resolve(base64);
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }
};
