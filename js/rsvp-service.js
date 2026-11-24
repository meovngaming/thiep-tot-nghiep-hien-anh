/**
 * RSVP & Guestbook Storage Service (2-Way Live Sync)
 * Supports:
 * 1. Google Sheets Web App (`backendMode: "google-sheets"` + `googleSheetsWebhookUrl`)
 * 2. Firebase Realtime Database REST (`backendMode: "firebase"` + `firebaseDatabaseUrl`)
 * 3. Local Persistent JSON API (`/api/wishes` via `server.ps1` -> `data/wishes.json`)
 * 4. Automatic `localStorage` fallback & offline cache (works even via file://)
 */
window.RsvpService = (function () {
  let activeSource = "local";

  function getConfig() {
    return (window.INVITATION_CONFIG && window.INVITATION_CONFIG.rsvp) || {};
  }

  function getStorageKey() {
    return getConfig().storageKey || "graduation_rsvp_entries";
  }

  function getLikedKey() {
    return getStorageKey() + "_liked_ids";
  }

  function readLocal() {
    try {
      const raw = window.localStorage.getItem(getStorageKey());
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }

  function writeLocal(entries) {
    try {
      window.localStorage.setItem(getStorageKey(), JSON.stringify(entries));
    } catch {
      // Ignore storage quota errors in restricted webviews
    }
  }

  function getLikedSet() {
    try {
      const raw = window.localStorage.getItem(getLikedKey());
      const arr = raw ? JSON.parse(raw) : [];
      return new Set(Array.isArray(arr) ? arr : []);
    } catch {
      return new Set();
    }
  }

  function markLiked(id) {
    const set = getLikedSet();
    set.add(id);
    try {
      window.localStorage.setItem(getLikedKey(), JSON.stringify([...set]));
    } catch {
      // Ignore
    }
  }

  function normalizeEntry(item, fallbackIdx) {
    return {
      id: String(item.id || "wish-" + fallbackIdx),
      name: String(item.name || "Khách mời").trim(),
      relationship: String(item.relationship || "Bạn bè"),
      attendance: item.attendance === "declined" ? "declined" : "attending",
      message: String(item.message || "").trim(),
      likes: Number(item.likes || 0),
      createdAt: String(item.createdAt || new Date().toISOString()),
    };
  }

  function mergeAndSort(primaryList, fallbackSeeds) {
    const map = new Map();
    primaryList.forEach((item, idx) => {
      const norm = normalizeEntry(item, idx);
      if (norm.name && norm.message) map.set(norm.id, norm);
    });
    if (Array.isArray(fallbackSeeds)) {
      fallbackSeeds.forEach((seed, idx) => {
        const norm = normalizeEntry(seed, "seed-" + idx);
        if (!map.has(norm.id)) map.set(norm.id, norm);
      });
    }
    return [...map.values()].sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  function isHttpOrigin() {
    return (
      window.location &&
      (window.location.protocol === "http:" ||
        window.location.protocol === "https:")
    );
  }

  async function listWishes() {
    const cfg = getConfig();
    const seeds = Array.isArray(cfg.seedWishes) ? cfg.seedWishes : [];

    // 1. Google Sheets (2-way GET)
    if (
      (cfg.backendMode === "google-sheets" ||
        (cfg.backendMode === "auto" && cfg.googleSheetsWebhookUrl)) &&
      cfg.googleSheetsWebhookUrl
    ) {
      try {
        const res = await fetch(cfg.googleSheetsWebhookUrl, {
          method: "GET",
          cache: "no-store",
        });
        if (res.ok) {
          const data = await res.json();
          const remote = Array.isArray(data.wishes)
            ? data.wishes
            : Array.isArray(data)
            ? data
            : [];
          activeSource = "google-sheets";
          const merged = mergeAndSort(remote, remote.length ? [] : seeds);
          writeLocal(merged);
          return merged;
        }
      } catch (err) {
        console.warn("[RsvpService] Google Sheets GET failed, using cache:", err);
      }
    }

    // 2. Firebase Realtime Database REST (2-way GET)
    if (
      (cfg.backendMode === "firebase" ||
        (cfg.backendMode === "auto" && cfg.firebaseDatabaseUrl)) &&
      cfg.firebaseDatabaseUrl
    ) {
      try {
        const baseUrl = cfg.firebaseDatabaseUrl.replace(/\/+$/, "");
        const res = await fetch(baseUrl + "/wishes.json", {
          cache: "no-store",
        });
        if (res.ok) {
          const data = await res.json();
          const remote = data ? Object.values(data) : [];
          activeSource = "firebase";
          const merged = mergeAndSort(remote, remote.length ? [] : seeds);
          writeLocal(merged);
          return merged;
        }
      } catch (err) {
        console.warn("[RsvpService] Firebase GET failed, using cache:", err);
      }
    }

    // 3. Local Server Persistent JSON API (/api/wishes -> data/wishes.json)
    if (
      (cfg.backendMode === "auto" || cfg.backendMode === "local-api") &&
      isHttpOrigin()
    ) {
      try {
        const res = await fetch("/api/wishes", { cache: "no-store" });
        if (res.ok) {
          const data = await res.json();
          if (data && Array.isArray(data.wishes)) {
            activeSource = "server";
            const merged = mergeAndSort(data.wishes, []);
            writeLocal(merged);
            return merged;
          }
        }
      } catch {
        // Not running server.ps1 — fall back silently to localStorage
      }
    }

    // 4. LocalStorage Fallback
    activeSource = "local";
    return mergeAndSort(readLocal(), seeds);
  }

  async function submitWish(payload) {
    const cfg = getConfig();
    const entry = normalizeEntry(
      {
        id:
          "wish-" +
          Date.now() +
          "-" +
          Math.random().toString(36).slice(2, 7),
        name: payload.name,
        relationship: payload.relationship,
        attendance: payload.attendance,
        message: payload.message,
        likes: 0,
        createdAt: new Date().toISOString(),
      },
      0
    );

    // 1. Google Sheets POST (text/plain avoids CORS preflight on Apps Script)
    if (
      (cfg.backendMode === "google-sheets" ||
        (cfg.backendMode === "auto" && cfg.googleSheetsWebhookUrl)) &&
      cfg.googleSheetsWebhookUrl
    ) {
      try {
        await fetch(cfg.googleSheetsWebhookUrl, {
          method: "POST",
          headers: { "Content-Type": "text/plain;charset=utf-8" },
          body: JSON.stringify(entry),
        });
        activeSource = "google-sheets";
      } catch (err) {
        console.warn("[RsvpService] Google Sheets POST failed:", err);
      }
    }

    // 2. Firebase Realtime Database REST PUT
    else if (
      (cfg.backendMode === "firebase" ||
        (cfg.backendMode === "auto" && cfg.firebaseDatabaseUrl)) &&
      cfg.firebaseDatabaseUrl
    ) {
      try {
        const baseUrl = cfg.firebaseDatabaseUrl.replace(/\/+$/, "");
        await fetch(
          baseUrl + "/wishes/" + encodeURIComponent(entry.id) + ".json",
          {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(entry),
          }
        );
        activeSource = "firebase";
      } catch (err) {
        console.warn("[RsvpService] Firebase PUT failed:", err);
      }
    }

    // 3. Local Persistent Server API (/api/wishes -> data/wishes.json)
    else if (
      (cfg.backendMode === "auto" || cfg.backendMode === "local-api") &&
      isHttpOrigin()
    ) {
      try {
        const res = await fetch("/api/wishes", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(entry),
        });
        if (res.ok) {
          activeSource = "server";
        }
      } catch {
        // Offline/static fallback
      }
    }

    // Always update local cache immediately for instant UI responsiveness
    const current = readLocal();
    const updated = mergeAndSort([entry, ...current], []);
    writeLocal(updated);

    return entry;
  }

  async function likeWish(id) {
    const cfg = getConfig();
    if (getLikedSet().has(id)) {
      return { alreadyLiked: true };
    }
    markLiked(id);

    // Update local cache optimistically
    const current = readLocal();
    let nextLikes = 1;
    const updated = current.map((item) => {
      if (item.id === id) {
        nextLikes = Number(item.likes || 0) + 1;
        return { ...item, likes: nextLikes };
      }
      return item;
    });
    writeLocal(updated);

    // Sync heart reaction to active backend
    if (
      (cfg.backendMode === "google-sheets" ||
        (cfg.backendMode === "auto" && cfg.googleSheetsWebhookUrl)) &&
      cfg.googleSheetsWebhookUrl
    ) {
      fetch(cfg.googleSheetsWebhookUrl, {
        method: "POST",
        headers: { "Content-Type": "text/plain;charset=utf-8" },
        body: JSON.stringify({ action: "like", id }),
      }).catch(() => {});
    } else if (
      (cfg.backendMode === "firebase" ||
        (cfg.backendMode === "auto" && cfg.firebaseDatabaseUrl)) &&
      cfg.firebaseDatabaseUrl
    ) {
      const baseUrl = cfg.firebaseDatabaseUrl.replace(/\/+$/, "");
      fetch(baseUrl + "/wishes/" + encodeURIComponent(id) + ".json", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ likes: nextLikes }),
      }).catch(() => {});
    } else if (isHttpOrigin()) {
      try {
        const res = await fetch("/api/wishes/like", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id }),
        });
        if (res.ok) {
          const data = await res.json();
          if (typeof data.likes === "number") nextLikes = data.likes;
        }
      } catch {
        // Ignore if static hosting without local server
      }
    }

    return { alreadyLiked: false, likes: nextLikes };
  }

  return {
    listWishes,
    submitWish,
    likeWish,
    isLiked: (id) => getLikedSet().has(id),
    getSource: () => activeSource,
  };
})();
