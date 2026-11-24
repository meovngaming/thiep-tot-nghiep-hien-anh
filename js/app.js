/**
 * Main SPA Controller for HCMUT Graduation Invitation
 */
(function () {
  const cfg = window.INVITATION_CONFIG;
  if (!cfg) {
    console.error("Missing window.INVITATION_CONFIG in config.js");
    return;
  }

  /* ------------------------------------------------------------------------
   * 1. Hydrate Config Bindings
   * ------------------------------------------------------------------------ */
  function getByPath(obj, path) {
    return path.split(".").reduce((acc, key) => (acc ? acc[key] : ""), obj);
  }

  function hydrateBindings() {
    document.querySelectorAll("[data-bind]").forEach((el) => {
      const value = getByPath(cfg, el.getAttribute("data-bind"));
      if (typeof value === "string" && value.length > 0) {
        el.textContent = value;
      }
    });

    document.querySelectorAll("[data-bind-src]").forEach((el) => {
      const value = getByPath(cfg, el.getAttribute("data-bind-src"));
      if (typeof value === "string" && value.length > 0) {
        el.src = value;
      }
    });

    const mapsBtn = document.getElementById("google-maps-btn");
    if (mapsBtn && cfg.event.googleMapsUrl) {
      mapsBtn.href = cfg.event.googleMapsUrl;
    }

    const phoneBtn = document.getElementById("contact-phone-btn");
    if (phoneBtn && cfg.contact.phone) {
      phoneBtn.href = "tel:" + cfg.contact.phone.replace(/\s+/g, "");
    }

    const zaloBtn = document.getElementById("contact-zalo-btn");
    if (zaloBtn && cfg.contact.zaloUrl) {
      zaloBtn.href = cfg.contact.zaloUrl;
    }

    const fbBtn = document.getElementById("contact-fb-btn");
    if (fbBtn && cfg.contact.facebookUrl) {
      fbBtn.href = cfg.contact.facebookUrl;
    }

    renderPeriodicName("periodic-name-hero", false);
  }

  let openElementModalAt = null;

  function renderPeriodicName(containerId) {
    const container = document.getElementById(containerId);
    const tiles =
      cfg.graduate && Array.isArray(cfg.graduate.periodicTiles)
        ? cfg.graduate.periodicTiles
        : [];
    if (!container || tiles.length === 0) return;

    container.innerHTML = "";
    tiles.forEach((tile, index) => {
      const box = document.createElement("button");
      box.type = "button";
      box.className = "pt-tile pt-tile--" + (tile.accent || "navy");
      box.setAttribute(
        "aria-label",
        "Xem giải mã nguyên tố " +
          (tile.symbol || "") +
          " – " +
          (tile.realElement || tile.elementName || "")
      );

      const topRow = document.createElement("div");
      topRow.className = "pt-top";

      const num = document.createElement("span");
      num.className = "pt-num";
      num.textContent = tile.atomicNumber || "";

      const mass = document.createElement("span");
      mass.className = "pt-mass";
      mass.textContent = tile.mass || "";

      topRow.append(num, mass);

      const sym = document.createElement("div");
      sym.className = "pt-symbol";
      sym.textContent = tile.symbol || "";

      const name = document.createElement("div");
      name.className = "pt-name";
      name.textContent = tile.elementName || "";

      box.append(topRow, sym, name);
      box.addEventListener("click", () => {
        if (typeof openElementModalAt === "function") {
          openElementModalAt(index);
        }
      });
      container.appendChild(box);
    });
  }

  function initElementModal() {
    const modal = document.getElementById("element-modal");
    const closeBtn = document.getElementById("em-close");
    const tabsEl = document.getElementById("em-tabs");
    const specimenEl = document.getElementById("em-specimen");
    const numEl = document.getElementById("em-num");
    const massEl = document.getElementById("em-mass");
    const symEl = document.getElementById("em-sym");
    const elemEl = document.getElementById("em-elem");
    const catEl = document.getElementById("em-category");
    const titleEl = document.getElementById("em-title");
    const configEl = document.getElementById("em-config");
    const chemTextEl = document.getElementById("em-chem-text");
    const personHeadingEl = document.getElementById("em-person-heading");
    const personTextEl = document.getElementById("em-person-text");
    const prevBtn = document.getElementById("em-prev-btn");
    const nextBtn = document.getElementById("em-next-btn");

    const tiles =
      cfg.graduate && Array.isArray(cfg.graduate.periodicTiles)
        ? cfg.graduate.periodicTiles
        : [];
    if (!modal || tiles.length === 0) return;

    let activeIdx = 0;

    // Build quick switcher tabs
    if (tabsEl) {
      tabsEl.innerHTML = "";
      tiles.forEach((t, idx) => {
        const tab = document.createElement("button");
        tab.type = "button";
        tab.className = "em-tab";
        tab.setAttribute("role", "tab");
        tab.innerHTML =
          '<span class="em-tab-num">' +
          (t.atomicNumber || "") +
          "</span><strong>" +
          (t.symbol || "") +
          "</strong>";
        tab.addEventListener("click", () => showElement(idx));
        tabsEl.appendChild(tab);
      });
    }

    function showElement(idx) {
      activeIdx = (idx + tiles.length) % tiles.length;
      const item = tiles[activeIdx];

      if (specimenEl) {
        specimenEl.className =
          "em-specimen em-specimen--" + (item.accent || "navy");
      }
      if (numEl) numEl.textContent = item.atomicNumber || "";
      if (massEl) massEl.textContent = item.mass || "";
      if (symEl) symEl.textContent = item.symbol || "";
      if (elemEl) elemEl.textContent = item.elementName || "";
      if (catEl) catEl.textContent = item.category || "";
      if (titleEl) {
        titleEl.textContent =
          (item.symbol || "") +
          " — " +
          (item.realElement || item.elementName || "");
      }
      if (configEl) configEl.textContent = item.electronConfig || "";
      if (chemTextEl) chemTextEl.textContent = item.chemicalProperty || "";
      if (personHeadingEl) {
        personHeadingEl.textContent =
          'Giải mã mảnh ghép "' +
          (item.symbol || "") +
          '" của ' +
          (cfg.graduate.shortName || "Hiền Anh");
      }
      if (personTextEl) personTextEl.textContent = item.personalityTrait || "";

      if (tabsEl) {
        tabsEl.querySelectorAll(".em-tab").forEach((btn, i) => {
          const isCurrent = i === activeIdx;
          btn.classList.toggle("is-active", isCurrent);
          btn.setAttribute("aria-selected", String(isCurrent));
        });
      }
    }

    openElementModalAt = function (idx) {
      showElement(idx);
      modal.hidden = false;
      document.body.style.overflow = "hidden";
    };

    function closeModal() {
      modal.hidden = true;
      document.body.style.overflow = "";
    }

    if (closeBtn) closeBtn.addEventListener("click", closeModal);
    if (prevBtn) {
      prevBtn.addEventListener("click", () => showElement(activeIdx - 1));
    }
    if (nextBtn) {
      nextBtn.addEventListener("click", () => showElement(activeIdx + 1));
    }

    modal.addEventListener("click", (e) => {
      if (e.target === modal) closeModal();
    });

    document.addEventListener("keydown", (e) => {
      if (modal.hidden) return;
      if (e.key === "Escape") closeModal();
      if (e.key === "ArrowLeft") showElement(activeIdx - 1);
      if (e.key === "ArrowRight") showElement(activeIdx + 1);
    });
  }

  /* ------------------------------------------------------------------------
   * 2. Toast Helper
   * ------------------------------------------------------------------------ */
  let toastTimer = null;
  function showToast(message) {
    const toast = document.getElementById("toast");
    if (!toast) return;
    toast.textContent = message;
    toast.classList.add("is-visible");
    if (toastTimer) clearTimeout(toastTimer);
    toastTimer = window.setTimeout(() => {
      toast.classList.remove("is-visible");
    }, 3200);
  }

  /* ------------------------------------------------------------------------
   * 3. Envelope Cover Reveal
   * ------------------------------------------------------------------------ */
  function initEnvelopeCover() {
    const cover = document.getElementById("envelope-cover");
    const openBtn = document.getElementById("open-invitation-btn");
    const silentBtn = document.getElementById("open-silent-btn");
    if (!cover) return;

    document.body.classList.add("cover-locked");

    function openCover(withMusic) {
      cover.classList.add("is-opened");
      document.body.classList.remove("cover-locked");
      if (withMusic && window.MusicController) {
        window.MusicController.play();
      }
      window.setTimeout(() => {
        cover.setAttribute("aria-hidden", "true");
        triggerHeroReveals();
      }, 320);
    }

    if (openBtn) {
      openBtn.addEventListener("click", () => openCover(true));
    }
    if (silentBtn) {
      silentBtn.addEventListener("click", () => openCover(false));
    }
  }

  /* ------------------------------------------------------------------------
   * 4. Countdown Timer
   * ------------------------------------------------------------------------ */
  function initCountdown() {
    const daysEl = document.getElementById("cd-days");
    const hoursEl = document.getElementById("cd-hours");
    const minutesEl = document.getElementById("cd-minutes");
    const secondsEl = document.getElementById("cd-seconds");
    const statusLabel = document.getElementById("countdown-status-label");

    if (!daysEl || !hoursEl || !minutesEl || !secondsEl) return;

    const startMs = new Date(cfg.event.startISO).getTime();
    const endMs = new Date(cfg.event.endISO).getTime();

    function pad(num) {
      return String(Math.max(0, num)).padStart(2, "0");
    }

    function update() {
      const now = Date.now();
      const diff = startMs - now;

      if (diff <= 0) {
        daysEl.textContent = "00";
        hoursEl.textContent = "00";
        minutesEl.textContent = "00";
        secondsEl.textContent = "00";
        if (statusLabel) {
          statusLabel.textContent =
            now <= endMs
              ? "Buổi lễ đang diễn ra ngay lúc này!"
              : "Cảm ơn bạn đã chung vui trong ngày tốt nghiệp!";
        }
        return;
      }

      const totalSec = Math.floor(diff / 1000);
      const days = Math.floor(totalSec / 86400);
      const hours = Math.floor((totalSec % 86400) / 3600);
      const minutes = Math.floor((totalSec % 3600) / 60);
      const seconds = totalSec % 60;

      daysEl.textContent = pad(days);
      hoursEl.textContent = pad(hours);
      minutesEl.textContent = pad(minutes);
      secondsEl.textContent = pad(seconds);
    }

    update();
    window.setInterval(update, 1000);
  }

  /* ------------------------------------------------------------------------
   * 5. Photo Gallery & Lightbox
   * ------------------------------------------------------------------------ */
  function initGallery() {
    const grid = document.getElementById("gallery-grid");
    const lightbox = document.getElementById("lightbox");
    const lbImg = document.getElementById("lightbox-img");
    const lbTag = document.getElementById("lightbox-tag");
    const lbText = document.getElementById("lightbox-text");
    const lbClose = document.getElementById("lightbox-close");
    const lbPrev = document.getElementById("lightbox-prev");
    const lbNext = document.getElementById("lightbox-next");

    if (!grid || !Array.isArray(cfg.gallery)) return;

    let activeIndex = 0;

    grid.innerHTML = "";
    cfg.gallery.forEach((photo, index) => {
      const card = document.createElement("article");
      card.className = "gallery-card reveal";
      card.tabIndex = 0;
      card.setAttribute("role", "button");
      card.setAttribute("aria-label", "Xem ảnh: " + (photo.alt || photo.tag));

      const media = document.createElement("div");
      media.className = "gallery-media";

      const img = document.createElement("img");
      img.src = photo.src;
      img.alt = photo.alt || photo.caption || "";
      img.loading = "lazy";

      const tag = document.createElement("span");
      tag.className = "gallery-tag";
      tag.textContent = photo.tag || "";

      media.append(img, tag);

      const body = document.createElement("div");
      body.className = "gallery-body";
      const cap = document.createElement("p");
      cap.className = "gallery-caption";
      cap.textContent = photo.caption || "";
      body.appendChild(cap);

      card.append(media, body);
      card.addEventListener("click", () => openLightbox(index));
      card.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          openLightbox(index);
        }
      });

      grid.appendChild(card);
    });

    function showPhoto(idx) {
      activeIndex = (idx + cfg.gallery.length) % cfg.gallery.length;
      const item = cfg.gallery[activeIndex];
      lbImg.src = item.src;
      lbImg.alt = item.alt || "";
      lbTag.textContent = item.tag || "";
      lbText.textContent = item.caption || "";
    }

    function openLightbox(idx) {
      if (!lightbox) return;
      showPhoto(idx);
      lightbox.hidden = false;
      document.body.style.overflow = "hidden";
    }

    function closeLightbox() {
      if (!lightbox) return;
      lightbox.hidden = true;
      document.body.style.overflow = "";
    }

    if (lbClose) lbClose.addEventListener("click", closeLightbox);
    if (lbPrev) lbPrev.addEventListener("click", () => showPhoto(activeIndex - 1));
    if (lbNext) lbNext.addEventListener("click", () => showPhoto(activeIndex + 1));

    if (lightbox) {
      lightbox.addEventListener("click", (e) => {
        if (e.target === lightbox) closeLightbox();
      });

      // Touch swipe support on mobile
      let touchStartX = 0;
      lightbox.addEventListener(
        "touchstart",
        (e) => {
          touchStartX = e.changedTouches[0].clientX;
        },
        { passive: true }
      );
      lightbox.addEventListener(
        "touchend",
        (e) => {
          const deltaX = e.changedTouches[0].clientX - touchStartX;
          if (Math.abs(deltaX) > 45) {
            showPhoto(deltaX > 0 ? activeIndex - 1 : activeIndex + 1);
          }
        },
        { passive: true }
      );
    }

    document.addEventListener("keydown", (e) => {
      if (!lightbox || lightbox.hidden) return;
      if (e.key === "Escape") closeLightbox();
      if (e.key === "ArrowLeft") showPhoto(activeIndex - 1);
      if (e.key === "ArrowRight") showPhoto(activeIndex + 1);
    });
  }

  /* ------------------------------------------------------------------------
   * 8. RSVP Form & Guestbook
   * ------------------------------------------------------------------------ */
  function getInitials(name) {
    const parts = String(name || "")
      .trim()
      .split(/\s+/)
      .filter(Boolean);
    if (parts.length === 0) return "?";
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }

  function formatTimestamp(iso) {
    try {
      const d = new Date(iso);
      return d.toLocaleDateString("vi-VN", {
        day: "2-digit",
        month: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return "";
    }
  }

  function createWishCard(entry, isNew) {
    const card = document.createElement("article");
    card.className = "wish-card" + (isNew ? " is-new" : "");

    const top = document.createElement("div");
    top.className = "wish-top";

    const author = document.createElement("div");
    author.className = "wish-author";

    const avatar = document.createElement("div");
    avatar.className = "wish-avatar";
    avatar.textContent = getInitials(entry.name);

    const info = document.createElement("div");
    info.style.minWidth = "0";

    const nameEl = document.createElement("h4");
    nameEl.className = "wish-name";
    nameEl.textContent = entry.name;

    const meta = document.createElement("div");
    meta.className = "wish-meta";
    meta.textContent =
      entry.relationship + " · " + formatTimestamp(entry.createdAt);

    info.append(nameEl, meta);
    author.append(avatar, info);

    const status = document.createElement("span");
    const isAttending = entry.attendance === "attending";
    status.className =
      "wish-status " +
      (isAttending ? "wish-status--attending" : "wish-status--declined");
    status.textContent = isAttending ? "Tham dự" : "Gửi lời chúc";

    top.append(author, status);

    const msg = document.createElement("p");
    msg.className = "wish-message";
    msg.textContent = entry.message;

    // Footer row with interactive Heart / Thả tim button
    const footer = document.createElement("div");
    footer.className = "wish-footer";

    const likeBtn = document.createElement("button");
    likeBtn.type = "button";
    const alreadyLiked = window.RsvpService.isLiked(entry.id);
    likeBtn.className = "wish-like-btn" + (alreadyLiked ? " is-liked" : "");
    likeBtn.setAttribute("aria-pressed", String(alreadyLiked));

    const heartSpan = document.createElement("span");
    heartSpan.className = "wish-heart";
    heartSpan.textContent = alreadyLiked ? "♥" : "♡";

    const countSpan = document.createElement("span");
    countSpan.className = "wish-like-count";
    countSpan.textContent = String(Number(entry.likes || 0));

    likeBtn.append(heartSpan, countSpan);

    likeBtn.addEventListener("click", async () => {
      if (likeBtn.classList.contains("is-liked")) return;
      likeBtn.classList.add("is-liked");
      likeBtn.setAttribute("aria-pressed", "true");
      heartSpan.textContent = "♥";
      const optimistic = Number(countSpan.textContent || 0) + 1;
      countSpan.textContent = String(optimistic);
      const res = await window.RsvpService.likeWish(entry.id);
      if (res && typeof res.likes === "number") {
        countSpan.textContent = String(res.likes);
        entry.likes = res.likes;
      } else {
        entry.likes = optimistic;
      }
    });

    footer.appendChild(likeBtn);
    card.append(top, msg, footer);
    return card;
  }

  async function initRsvp() {
    const form = document.getElementById("rsvp-form");
    const errorEl = document.getElementById("rsvp-error");
    const successBanner = document.getElementById("rsvp-success-banner");
    const listEl = document.getElementById("guestbook-list");
    const panelEl = document.getElementById("guestbook-panel");
    const totalEl = document.getElementById("stat-total");
    const attendingEl = document.getElementById("stat-attending");
    const refreshBtn = document.getElementById("guestbook-refresh-btn");
    const filtersEl = document.getElementById("guestbook-filters");
    const msgInput = document.getElementById("guest-message");
    const charCountEl = document.getElementById("message-char-count");

    if (!form || !listEl || !window.RsvpService) return;

    let cachedEntries = [];
    let currentFilter = "all";

    if (msgInput && charCountEl) {
      const updateCount = () => {
        charCountEl.textContent = msgInput.value.length + " / 500";
      };
      msgInput.addEventListener("input", updateCount);
      updateCount();
    }

    function updateStats(entries) {
      const total = entries.length;
      const attending = entries.filter(
        (item) => item.attendance === "attending"
      ).length;
      if (totalEl) totalEl.textContent = total + " lời chúc";
      if (attendingEl) attendingEl.textContent = attending + " tham dự";
    }

    function filterEntries(entries) {
      if (currentFilter === "all") return entries;
      if (currentFilter === "attending") {
        return entries.filter((item) => item.attendance === "attending");
      }
      return entries.filter((item) => item.relationship === currentFilter);
    }

    function renderList(newestId) {
      const visible = filterEntries(cachedEntries);
      listEl.innerHTML = "";

      if (visible.length === 0) {
        const empty = document.createElement("p");
        empty.className = "guestbook-empty";
        empty.textContent =
          "Chưa có lời chúc nào trong mục này. Hãy là người đầu tiên gửi lời chúc nhé!";
        listEl.appendChild(empty);
        return;
      }

      visible.forEach((entry) => {
        listEl.appendChild(createWishCard(entry, entry.id === newestId));
      });
    }

    async function loadWishes(newestId) {
      cachedEntries = await window.RsvpService.listWishes();
      updateStats(cachedEntries);
      renderList(newestId);
    }

    if (filtersEl) {
      filtersEl.addEventListener("click", (e) => {
        const btn = e.target.closest(".filter-chip");
        if (!btn) return;
        currentFilter = btn.getAttribute("data-filter") || "all";
        filtersEl.querySelectorAll(".filter-chip").forEach((chip) => {
          chip.classList.toggle("is-active", chip === btn);
        });
        renderList(null);
      });
    }

    if (refreshBtn) {
      refreshBtn.addEventListener("click", async () => {
        refreshBtn.classList.add("is-spinning");
        await loadWishes(null);
        window.setTimeout(() => refreshBtn.classList.remove("is-spinning"), 450);
        showToast("Đã cập nhật Sổ lưu bút mới nhất!");
      });
    }

    await loadWishes(null);

    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      if (errorEl) errorEl.textContent = "";
      if (successBanner) successBanner.hidden = true;

      const formData = new FormData(form);
      const name = String(formData.get("name") || "").trim();
      const relationship = String(formData.get("relationship") || "Bạn bè");
      const attendance = String(formData.get("attendance") || "attending");
      const message = String(formData.get("message") || "").trim();

      if (!name) {
        if (errorEl) errorEl.textContent = "Vui lòng nhập họ và tên của bạn.";
        document.getElementById("guest-name")?.focus();
        return;
      }
      if (!message) {
        if (errorEl)
          errorEl.textContent = "Vui lòng gửi đôi lời chúc đến Tân Kỹ sư nhé!";
        document.getElementById("guest-message")?.focus();
        return;
      }

      const submitBtn = document.getElementById("rsvp-submit-btn");
      const btnText = submitBtn ? submitBtn.querySelector("span") : null;
      if (submitBtn) submitBtn.disabled = true;
      if (btnText) btnText.textContent = "Đang gửi lời chúc...";

      try {
        const saved = await window.RsvpService.submitWish({
          name,
          relationship,
          attendance,
          message,
        });

        // Reset filter to "Tất cả" so the guest immediately sees their wish at the top
        currentFilter = "all";
        if (filtersEl) {
          filtersEl.querySelectorAll(".filter-chip").forEach((chip) => {
            chip.classList.toggle(
              "is-active",
              chip.getAttribute("data-filter") === "all"
            );
          });
        }

        await loadWishes(saved.id);

        // Celebrate with 60fps confetti!
        if (window.ConfettiEffect) {
          window.ConfettiEffect.burst(110);
        }

        form.reset();
        if (charCountEl) charCountEl.textContent = "0 / 500";

        if (successBanner) {
          successBanner.textContent =
            "✓ Đã lưu lời chúc của " + name + " vào Sổ lưu bút!";
          successBanner.hidden = false;
        }
        showToast("Cảm ơn " + name + " đã gửi lời chúc!");

        // Smoothly bring the newly added wish card into view on mobile screens
        if (panelEl && window.innerWidth < 860) {
          panelEl.scrollIntoView({ behavior: "smooth", block: "nearest" });
        }
      } catch (err) {
        console.error(err);
        if (errorEl) {
          errorEl.textContent =
            "Có lỗi xảy ra khi gửi lời chúc. Vui lòng thử lại nhé!";
        }
      } finally {
        if (submitBtn) submitBtn.disabled = false;
        if (btnText) btnText.textContent = "Gửi xác nhận & Lời chúc";
      }
    });
  }

  /* ------------------------------------------------------------------------
   * 9. Music Toggle UI & Sticky Nav Shadow
   * ------------------------------------------------------------------------ */
  function initUtilities() {
    const musicBtn = document.getElementById("music-toggle");
    const musicLabel = document.getElementById("music-label");
    if (musicBtn && window.MusicController) {
      const songTitle =
        (cfg.music && cfg.music.title) || "Nụ Cười 18 20";
      const syncUi = (playing) => {
        musicBtn.classList.toggle("is-playing", playing);
        musicBtn.setAttribute("aria-pressed", String(playing));
        if (musicLabel) {
          musicLabel.textContent = playing
            ? "♫ " + songTitle
            : songTitle;
        }
      };

      window.MusicController.onChange(syncUi);
      musicBtn.addEventListener("click", () => {
        const nowPlaying = window.MusicController.toggle();
        showToast(
          nowPlaying
            ? "Đang phát: " + songTitle
            : "Đã tạm dừng nhạc nền"
        );
      });
    }

    const topNav = document.getElementById("top-nav");
    if (topNav) {
      window.addEventListener(
        "scroll",
        () => {
          topNav.classList.toggle("is-scrolled", window.scrollY > 12);
        },
        { passive: true }
      );
    }
  }

  /* ------------------------------------------------------------------------
   * 10. Scroll Reveal Animations
   * ------------------------------------------------------------------------ */
  function triggerHeroReveals() {
    document
      .querySelectorAll("#hero .reveal")
      .forEach((el, idx) => {
        window.setTimeout(() => el.classList.add("is-visible"), idx * 70);
      });
  }

  function initScrollReveal() {
    const targets = document.querySelectorAll(".reveal");
    if (!("IntersectionObserver" in window)) {
      targets.forEach((el) => el.classList.add("is-visible"));
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -24px 0px" }
    );

    targets.forEach((el) => observer.observe(el));
  }

  /* ------------------------------------------------------------------------
   * Boot Application
   * ------------------------------------------------------------------------ */
  hydrateBindings();
  initElementModal();
  initGallery();
  initCountdown();
  initRsvp();
  initUtilities();
  initScrollReveal();
  initEnvelopeCover();
})();
