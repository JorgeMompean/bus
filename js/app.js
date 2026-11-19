/**
 * Bus Pass Planner - Application Logic
 * Academic Year Period: November to May
 * Pure JSON-driven architecture: loads from and re-writes data.json directly.
 */

// Academic calendar months specification (Nov to May)
const ACADEMIC_MONTHS = [
  { key: "nov", name: "Noviembre", monthIndex: 10, yearOffset: 0 },
  { key: "dic", name: "Diciembre", monthIndex: 11, yearOffset: 0 },
  { key: "ene", name: "Enero", monthIndex: 0, yearOffset: 1 },
  { key: "feb", name: "Febrero", monthIndex: 1, yearOffset: 1 },
  { key: "mar", name: "Marzo", monthIndex: 2, yearOffset: 1 },
  { key: "abr", name: "Abril", monthIndex: 3, yearOffset: 1 },
  { key: "may", name: "Mayo", monthIndex: 4, yearOffset: 1 }
];

const DATA_FILE_URL = "data.json";
const THEME_KEY = "bus_pass_planner_theme";

class BusPassApp {
  constructor() {
    this.currentBaseYear = this.determineBaseYear();
    this.activeMonthKey = this.getCurrentAcademicMonthKey();
    this.defaultTripsPerDay = 2;
    this.editingDay = null; // For modal customizer
    this.serverSyncSupported = true;
    this.lastSavedTimestamp = null;

    // GitHub Direct Auto-Commit credentials
    this.ghToken = localStorage.getItem("buspass_gh_token") || "";
    this.ghRepo = localStorage.getItem("buspass_gh_repo") || "jorgemompean/bus";
    this.ghBranch = localStorage.getItem("buspass_gh_branch") || "main";
    this.ghCommitTimer = null;

    // Default template state (used while data.json loads or if offline)
    this.state = this.createDefaultState();
    
    this.initTheme();
    this.bindEvents();
    this.render();

    // Set copyright year
    const yearEl = document.getElementById("currentYear");
    if (yearEl) yearEl.textContent = new Date().getFullYear();

    // Load source of truth directly from data.json or GitHub API
    this.loadFromJsonFile();
  }

  getCurrentAcademicMonthKey() {
    const today = new Date();
    const currentMonthIndex = today.getMonth(); // 0 = Ene, 1 = Feb, ..., 10 = Nov, 11 = Dic
    const match = ACADEMIC_MONTHS.find(m => m.monthIndex === currentMonthIndex);
    if (match) {
      return match.key;
    }
    // If today is outside the academic window (e.g., summer months June to October),
    // default to the start of the course (November)
    return "nov";
  }

  determineBaseYear() {
    const today = new Date();
    const currentMonth = today.getMonth(); // 0 to 11
    if (currentMonth >= 6) {
      return today.getFullYear();
    } else {
      return today.getFullYear() - 1;
    }
  }

  getDefaultMonthState(key) {
    return {
      hasMonthlyPass: true,
      eightPassesCount: 0,
      eightLooseTrips: 0,
      selectedDays: {}
    };
  }

  createDefaultState() {
    const initialMonths = {};
    ACADEMIC_MONTHS.forEach(m => {
      initialMonths[m.key] = this.getDefaultMonthState(m.key);
    });

    return {
      baseYear: this.currentBaseYear,
      defaultTripsPerDay: 2,
      activeMonthKey: "nov",
      months: initialMonths
    };
  }

  /* --------------------------------------------------------------------------
     JSON FILE & GITHUB API DATA LAYER (SOURCE OF TRUTH)
     -------------------------------------------------------------------------- */
  async loadFromJsonFile() {
    this.updateStatusBadge("loading", "Cargando data.json...");

    // 1. If GitHub Token is connected, query GitHub Contents API directly (real-time, zero cache delay)
    if (this.ghToken) {
      try {
        const ghUrl = `https://api.github.com/repos/${this.ghRepo}/contents/data.json?ref=${this.ghBranch}&_t=${Date.now()}`;
        const ghRes = await fetch(ghUrl, {
          headers: {
            "Authorization": `Bearer ${this.ghToken}`,
            "Accept": "application/vnd.github+json"
          }
        });
        if (ghRes.ok) {
          const fileData = await ghRes.json();
          if (fileData && fileData.content) {
            const rawJson = decodeURIComponent(escape(atob(fileData.content.replace(/\n/g, ""))));
            const parsed = JSON.parse(rawJson);
            if (this.applyLoadedState(parsed)) {
              this.updateStatusBadge("synced", "data.json sincronizado (GitHub)");
              return;
            }
          }
        }
      } catch (err) {
        console.warn("Could not load from GitHub API, falling back to static file", err);
      }
    }

    // 2. Fallback to static data.json (or local Python server)
    try {
      const response = await fetch(`${DATA_FILE_URL}?_t=${Date.now()}`);
      if (response.ok) {
        const parsed = await response.json();
        if (this.applyLoadedState(parsed)) {
          this.updateStatusBadge("synced", "data.json sincronizado");
          return;
        }
      }
      this.updateStatusBadge("warning", "data.json no encontrado, usando plantilla");
    } catch (e) {
      console.warn("Could not load data.json from server, checking local backup", e);
      // Check if there is an unsaved local backup
      try {
        const localBackup = localStorage.getItem("buspass_local_backup");
        if (localBackup) {
          const parsed = JSON.parse(localBackup);
          if (this.applyLoadedState(parsed.state || parsed)) {
            this.updateStatusBadge("memory", "Cargado desde copia local");
            return;
          }
        }
      } catch (err) {}
      this.updateStatusBadge("warning", "Modo sin servidor (data.json plantilla)");
    }
  }

  applyLoadedState(parsed) {
    if (!parsed || !parsed.months) return false;

    // Sanitize months (remove jun if present in older files)
    if (parsed.months.jun) delete parsed.months.jun;
    if (parsed.activeMonthKey === "jun") parsed.activeMonthKey = "nov";

    // Ensure all active academic months exist
    ACADEMIC_MONTHS.forEach(m => {
      if (!parsed.months[m.key]) {
        parsed.months[m.key] = this.getDefaultMonthState(m.key);
      }
    });

    this.state = parsed;
    if (parsed.defaultTripsPerDay) {
      this.defaultTripsPerDay = parsed.defaultTripsPerDay;
      const select = document.getElementById("defaultTripsSelect");
      if (select) select.value = this.defaultTripsPerDay;
    }
    // Always ensure the app opens in the current real-world month
    this.activeMonthKey = this.getCurrentAcademicMonthKey();

    this.render();
    this.scrollActiveMonthIntoView();
    return true;
  }

  async saveState() {
    this.state.defaultTripsPerDay = this.defaultTripsPerDay;
    this.state.activeMonthKey = this.activeMonthKey;

    // Save immediate local backup so accidental refresh never loses changes
    try {
      localStorage.setItem("buspass_local_backup", JSON.stringify({ state: this.state, ts: Date.now() }));
    } catch (e) {}

    this.updateStatusBadge("saving", "Guardando cambios...");

    // 1. Try local server (server.py) first
    try {
      const response = await fetch("/api/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(this.state, null, 2)
      });

      if (response.ok) {
        this.serverSyncSupported = true;
        this.lastSavedTimestamp = new Date();
        this.updateStatusBadge("synced", `Guardado en disco (${this.formatTime(this.lastSavedTimestamp)})`);
        return;
      }
    } catch (e) {
      // Local server not available, proceeding to GitHub or static mode
    }

    // 2. If GitHub Token is configured, perform debounced auto-commit
    if (this.ghToken) {
      this.scheduleGithubCommit();
    } else {
      // Static server / GitHub Pages without token
      this.serverSyncSupported = false;
      this.updateStatusBadge("memory", "data.json (en memoria). Conecta GitHub para auto-commit");
    }
  }

  scheduleGithubCommit() {
    if (this.ghCommitTimer) clearTimeout(this.ghCommitTimer);
    this.updateStatusBadge("saving", "Comiteando en GitHub...");

    this.ghCommitTimer = setTimeout(() => {
      this.commitToGithub();
    }, 1200);
  }

  async commitToGithub() {
    if (!this.ghToken) return;

    try {
      // Step A: Get current file SHA from GitHub API
      const getUrl = `https://api.github.com/repos/${this.ghRepo}/contents/data.json?ref=${this.ghBranch}&_t=${Date.now()}`;
      const getRes = await fetch(getUrl, {
        headers: {
          "Authorization": `Bearer ${this.ghToken}`,
          "Accept": "application/vnd.github+json"
        }
      });

      if (!getRes.ok) {
        throw new Error(`Error al leer archivo en GitHub (HTTP ${getRes.status})`);
      }

      const fileInfo = await getRes.json();
      const currentSha = fileInfo.sha;

      // Step B: Encode JSON to Base64 (supporting UTF-8 characters safely)
      const jsonString = JSON.stringify(this.state, null, 2);
      const b64Content = btoa(unescape(encodeURIComponent(jsonString)));

      // Step C: Push commit via PUT
      const putUrl = `https://api.github.com/repos/${this.ghRepo}/contents/data.json`;
      const putRes = await fetch(putUrl, {
        method: "PUT",
        headers: {
          "Authorization": `Bearer ${this.ghToken}`,
          "Accept": "application/vnd.github+json",
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          message: `update: actualizar viajes en data.json [BusPass Web]`,
          content: b64Content,
          sha: currentSha,
          branch: this.ghBranch
        })
      });

      if (putRes.ok) {
        this.lastSavedTimestamp = new Date();
        this.updateStatusBadge("synced", `Incrustado en GitHub (${this.formatTime(this.lastSavedTimestamp)})`);
      } else {
        const errData = await putRes.json().catch(() => ({}));
        throw new Error(errData.message || `HTTP ${putRes.status}`);
      }
    } catch (err) {
      console.error("Error al comitear en GitHub:", err);
      this.updateStatusBadge("warning", "Error al comitear en GitHub (revisa token)");
    }
  }

  async connectGithubToken(token) {
    const cleanToken = (token || "").trim();
    if (!cleanToken) {
      alert("Introduce un token válido.");
      return;
    }

    this.updateStatusBadge("loading", "Verificando token de GitHub...");

    try {
      // Validate token against repository contents endpoint
      const checkRes = await fetch(`https://api.github.com/repos/${this.ghRepo}/contents/data.json?ref=${this.ghBranch}&_t=${Date.now()}`, {
        headers: {
          "Authorization": `Bearer ${cleanToken}`,
          "Accept": "application/vnd.github+json"
        }
      });

      if (checkRes.ok) {
        this.ghToken = cleanToken;
        localStorage.setItem("buspass_gh_token", cleanToken);
        this.updateGhUiStatus();
        this.updateStatusBadge("synced", "Conectado a GitHub (Auto-commit activo)");
        alert("¡Conexión con GitHub exitosa! Ahora cualquier cambio se comiteará directamente en tu repositorio.");
        // Trigger initial sync commit
        await this.commitToGithub();
      } else if (checkRes.status === 401) {
        alert("Token inválido o expirado. Revisa que lo hayas copiado completo.");
        this.updateStatusBadge("warning", "Token de GitHub no válido");
      } else if (checkRes.status === 404) {
        alert("Repositorio o archivo no encontrado. Verifica que el token tenga permisos sobre 'jorgemompean/bus'.");
        this.updateStatusBadge("warning", "Repo no accesible");
      } else {
        alert(`Error al conectar con GitHub (${checkRes.status}).`);
      }
    } catch (err) {
      alert("Error de red al conectar con GitHub API.");
    }
  }

  disconnectGithubToken() {
    this.ghToken = "";
    localStorage.removeItem("buspass_gh_token");
    this.updateGhUiStatus();
    this.updateStatusBadge("memory", "data.json (en memoria)");
    alert("Token de GitHub desconectado.");
  }

  updateGhUiStatus() {
    const statusEl = document.getElementById("ghConnectionStatus");
    const inputEl = document.getElementById("ghTokenInput");
    const connectBtn = document.getElementById("ghConnectBtn");
    const disconnectBtn = document.getElementById("ghDisconnectBtn");

    if (this.ghToken) {
      if (statusEl) {
        statusEl.innerHTML = `<span style="color: var(--accent-emerald);">● Conectado a ${this.ghRepo}</span>`;
      }
      if (inputEl) {
        inputEl.value = "••••••••••••••••••••••••••••••••••••••••";
        inputEl.disabled = true;
      }
      if (connectBtn) connectBtn.style.display = "none";
      if (disconnectBtn) disconnectBtn.style.display = "inline-block";
    } else {
      if (statusEl) {
        statusEl.innerHTML = `<span style="color: var(--text-muted);">Sin conectar</span>`;
      }
      if (inputEl) {
        inputEl.value = "";
        inputEl.disabled = false;
      }
      if (connectBtn) connectBtn.style.display = "inline-block";
      if (disconnectBtn) disconnectBtn.style.display = "none";
    }
  }

  formatTime(date) {
    if (!date) return "";
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" });
  }

  updateStatusBadge(type, text) {
    const badge = document.getElementById("jsonStatusBadge");
    const headerBtn = document.getElementById("jsonHeaderBtn");
    if (!badge && !headerBtn) return;

    let dotClass = "synced";
    let displayText = "data.json al día";

    if (type === "synced") {
      dotClass = "synced";
      displayText = "data.json al día";
    } else if (type === "saving") {
      dotClass = "saving";
      displayText = "Guardando...";
    } else if (type === "loading") {
      dotClass = "loading";
      displayText = "Cargando...";
    } else if (type === "memory") {
      dotClass = "memory";
      displayText = "data.json (en memoria)";
    } else if (type === "warning") {
      dotClass = "warning";
      displayText = "data.json (plantilla)";
    }

    if (badge) {
      badge.innerHTML = `<span class="status-pill-dot ${dotClass}"></span><span class="status-pill-text">${displayText}</span>`;
      badge.setAttribute("title", text || displayText);
    }

    if (headerBtn) {
      headerBtn.setAttribute("title", text || displayText);
    }
  }

  openJsonModal() {
    this.updateGhUiStatus();
    const modal = document.getElementById("jsonModal");
    if (modal) modal.classList.add("active");
  }

  closeJsonModal() {
    const modal = document.getElementById("jsonModal");
    if (modal) modal.classList.remove("active");
  }

  exportDataJson() {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(this.state, null, 2));
    const a = document.createElement("a");
    a.href = dataStr;
    a.download = "data.json";
    a.click();
  }

  importDataJson() {
    const fileInput = document.createElement("input");
    fileInput.type = "file";
    fileInput.accept = ".json";
    fileInput.onchange = (e) => {
      const file = e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = async (event) => {
        try {
          const imported = JSON.parse(event.target.result);
          if (imported && imported.months) {
            if (imported.months.jun) delete imported.months.jun;
            this.state = imported;
            await this.saveState();
            this.render();
            alert("¡data.json cargado y guardado correctamente!");
            this.closeJsonModal();
          } else {
            alert("El archivo JSON no tiene la estructura de BusPass.");
          }
        } catch (err) {
          alert("Error al leer el archivo JSON.");
        }
      };
      reader.readAsText(file);
    };
    fileInput.click();
  }

  /* --------------------------------------------------------------------------
     THEME MANAGEMENT
     -------------------------------------------------------------------------- */
  initTheme() {
    const savedTheme = localStorage.getItem(THEME_KEY) || "dark";
    document.documentElement.setAttribute("data-theme", savedTheme);
    this.updateThemeMetaColor(savedTheme);
    this.updateThemeButtonIcon(savedTheme);
  }

  toggleTheme() {
    const current = document.documentElement.getAttribute("data-theme");
    const next = current === "light" ? "dark" : "light";
    document.documentElement.setAttribute("data-theme", next);
    localStorage.setItem(THEME_KEY, next);
    this.updateThemeMetaColor(next);
    this.updateThemeButtonIcon(next);
  }

  updateThemeMetaColor(theme) {
    const meta = document.getElementById("metaThemeColor");
    if (meta) {
      meta.setAttribute("content", theme === "light" ? "#f8fafc" : "#0b0f19");
    }
  }

  updateThemeButtonIcon(theme) {
    const btn = document.getElementById("themeToggleBtn");
    if (!btn) return;
    btn.innerHTML = theme === "light" ? Icons.moon(20) : Icons.sun(20);
    btn.setAttribute("title", theme === "light" ? "Cambiar a modo oscuro" : "Cambiar a modo claro");
    btn.setAttribute("aria-label", theme === "light" ? "Modo oscuro" : "Modo claro");
  }

  /* --------------------------------------------------------------------------
     BUSINESS CALCULATIONS (CASCADING ROLLOVER)
     -------------------------------------------------------------------------- */
  calculateAllMonths() {
    const results = {};
    let eightTripRolloverIn = 0; // Cumulative remaining 8-trip rides brought from previous month

    ACADEMIC_MONTHS.forEach((mDef) => {
      const mState = this.state.months[mDef.key];
      const year = this.state.baseYear + mDef.yearOffset;
      const daysInMonth = new Date(year, mDef.monthIndex + 1, 0).getDate();

      // Sum required trips
      let totalTripsRequired = 0;
      let totalClassDays = 0;
      const sortedDays = [];

      for (let day = 1; day <= daysInMonth; day++) {
        const trips = mState.selectedDays[day] || 0;
        if (trips > 0) {
          totalTripsRequired += trips;
          totalClassDays += 1;
          sortedDays.push({ day, trips });
        }
      }

      // Monthly pass provides 20 trips strictly for this month (expires at month end)
      const monthlyPassTripsAvailable = mState.hasMonthlyPass ? 20 : 0;
      const monthlyTripsUsed = Math.min(totalTripsRequired, monthlyPassTripsAvailable);
      const monthlyTripsUnused = monthlyPassTripsAvailable - monthlyTripsUsed; // these expire

      const tripsRemainingAfterMonthly = Math.max(0, totalTripsRequired - monthlyTripsUsed);

      // 8-trip passes pool for this month:
      // rollover from previous month + new 8-trip passes bought this month + loose trips
      const eightPassesBoughtTrips = (mState.eightPassesCount || 0) * 8;
      const looseTrips = mState.eightLooseTrips || 0;
      const totalEightTripsAvailable = eightTripRolloverIn + eightPassesBoughtTrips + looseTrips;

      const eightTripsUsed = Math.min(tripsRemainingAfterMonthly, totalEightTripsAvailable);
      const eightTripRolloverOut = totalEightTripsAvailable - eightTripsUsed;

      // Uncovered trips that need tickets
      const uncoveredTrips = Math.max(0, tripsRemainingAfterMonthly - eightTripsUsed);
      const recommendedEightPassesToBuy = uncoveredTrips > 0 ? Math.ceil(uncoveredTrips / 8) : 0;

      // Now determine coverage per day for visual marking on the calendar
      const dayCoverageMap = {};
      let remainingMonthlyQuota = monthlyPassTripsAvailable;
      let remainingEightQuota = totalEightTripsAvailable;

      sortedDays.forEach(({ day, trips }) => {
        let tripsToCover = trips;
        let coveredByMonthly = 0;
        let coveredByEight = 0;

        if (remainingMonthlyQuota > 0) {
          coveredByMonthly = Math.min(tripsToCover, remainingMonthlyQuota);
          remainingMonthlyQuota -= coveredByMonthly;
          tripsToCover -= coveredByMonthly;
        }

        if (tripsToCover > 0 && remainingEightQuota > 0) {
          coveredByEight = Math.min(tripsToCover, remainingEightQuota);
          remainingEightQuota -= coveredByEight;
          tripsToCover -= coveredByEight;
        }

        if (tripsToCover === 0) {
          if (coveredByMonthly === trips) {
            dayCoverageMap[day] = "monthly";
          } else if (coveredByEight === trips) {
            dayCoverageMap[day] = "eight";
          } else {
            dayCoverageMap[day] = "partial"; // Split between monthly and 8-trip
          }
        } else {
          if (coveredByMonthly === 0 && coveredByEight === 0) {
            dayCoverageMap[day] = "uncovered";
          } else {
            dayCoverageMap[day] = "partial";
          }
        }
      });

      results[mDef.key] = {
        mDef,
        year,
        daysInMonth,
        totalClassDays,
        totalTripsRequired,
        monthlyPassTripsAvailable,
        monthlyTripsUsed,
        monthlyTripsUnused,
        eightTripRolloverIn,
        eightPassesBoughtTrips,
        looseTrips,
        totalEightTripsAvailable,
        eightTripsUsed,
        eightTripRolloverOut,
        uncoveredTrips,
        recommendedEightPassesToBuy,
        dayCoverageMap
      };

      // Rollover to next academic month
      eightTripRolloverIn = eightTripRolloverOut;
    });

    return results;
  }

  /* --------------------------------------------------------------------------
     EVENTS & USER ACTIONS
     -------------------------------------------------------------------------- */
  bindEvents() {
    // Theme toggle
    const themeBtn = document.getElementById("themeToggleBtn");
    if (themeBtn) {
      themeBtn.addEventListener("click", () => this.toggleTheme());
    }

    // Default trips selector
    const defaultSelect = document.getElementById("defaultTripsSelect");
    if (defaultSelect) {
      defaultSelect.value = this.defaultTripsPerDay;
      defaultSelect.addEventListener("change", (e) => {
        this.defaultTripsPerDay = parseInt(e.target.value, 10) || 2;
        this.saveState();
      });
    }

    // Modal elements
    const modalBackdrop = document.getElementById("dayModal");
    const modalClose = document.getElementById("modalCloseBtn");
    const modalCancel = document.getElementById("modalCancelBtn");
    const modalSave = document.getElementById("modalSaveBtn");

    if (modalClose) modalClose.addEventListener("click", () => this.closeModal());
    if (modalCancel) modalCancel.addEventListener("click", () => this.closeModal());
    if (modalBackdrop) {
      modalBackdrop.addEventListener("click", (e) => {
        if (e.target === modalBackdrop) this.closeModal();
      });
    }

    if (modalSave) {
      modalSave.addEventListener("click", () => {
        if (this.editingDay) {
          const selectedOption = document.querySelector(".trip-option-btn.selected");
          const trips = selectedOption ? parseInt(selectedOption.getAttribute("data-trips"), 10) : 0;
          this.setDayTrips(this.editingDay.day, trips);
          this.closeModal();
        }
      });
    }

    // Keyboard navigation (ESC for modal)
    window.addEventListener("keydown", (e) => {
      if (e.key === "Escape") {
        this.closeModal();
        this.closeJsonModal();
      }
    });

    // JSON Data Modal events
    const jsonBtn = document.getElementById("jsonHeaderBtn");
    if (jsonBtn) jsonBtn.addEventListener("click", () => this.openJsonModal());

    const jsonClose = document.getElementById("jsonModalCloseBtn");
    if (jsonClose) jsonClose.addEventListener("click", () => this.closeJsonModal());

    const jsonModal = document.getElementById("jsonModal");
    if (jsonModal) {
      jsonModal.addEventListener("click", (e) => {
        if (e.target === jsonModal) this.closeJsonModal();
      });
    }

    const jsonDownloadBtn = document.getElementById("jsonDownloadBtn");
    if (jsonDownloadBtn) jsonDownloadBtn.addEventListener("click", () => this.exportDataJson());

    const jsonUploadBtn = document.getElementById("jsonUploadBtn");
    if (jsonUploadBtn) jsonUploadBtn.addEventListener("click", () => this.importDataJson());

    const jsonReloadBtn = document.getElementById("jsonReloadBtn");
    if (jsonReloadBtn) jsonReloadBtn.addEventListener("click", async () => {
      await this.loadFromJsonFile();
      alert("¡data.json recargado!");
      this.closeJsonModal();
    });

    // GitHub Auto-Commit buttons
    const ghConnectBtn = document.getElementById("ghConnectBtn");
    if (ghConnectBtn) {
      ghConnectBtn.addEventListener("click", () => {
        const input = document.getElementById("ghTokenInput");
        if (input) this.connectGithubToken(input.value);
      });
    }

    const ghDisconnectBtn = document.getElementById("ghDisconnectBtn");
    if (ghDisconnectBtn) {
      ghDisconnectBtn.addEventListener("click", () => {
        if (confirm("¿Desconectar el token de GitHub? Los cambios volverán a ser solo locales.")) {
          this.disconnectGithubToken();
        }
      });
    }

    // Touch long-press handler on calendar days container
    this.setupTouchLongPress();
  }

  setupTouchLongPress() {
    const calendarDaysGrid = document.getElementById("calendarDaysGrid");
    if (!calendarDaysGrid) return;

    let touchTimer = null;
    let touchMoved = false;
    let targetDay = null;

    calendarDaysGrid.addEventListener("touchstart", (e) => {
      const cell = e.target.closest(".day-cell:not(.empty-day)");
      if (!cell) return;
      targetDay = parseInt(cell.getAttribute("data-day"), 10);
      touchMoved = false;

      touchTimer = setTimeout(() => {
        if (!touchMoved && targetDay) {
          // Trigger long press modal
          this.ignoreNextClick = true;
          if (navigator.vibrate) navigator.vibrate(30);
          this.openDayModal(targetDay);
          targetDay = null; // Prevent toggle on touchend
        }
      }, 420);
    }, { passive: true });

    calendarDaysGrid.addEventListener("touchmove", () => {
      touchMoved = true;
      if (touchTimer) {
        clearTimeout(touchTimer);
        touchTimer = null;
      }
    }, { passive: true });

    calendarDaysGrid.addEventListener("touchend", () => {
      if (touchTimer) {
        clearTimeout(touchTimer);
        touchTimer = null;
      }
    });

    calendarDaysGrid.addEventListener("touchcancel", () => {
      if (touchTimer) {
        clearTimeout(touchTimer);
        touchTimer = null;
      }
    });
  }

  setActiveMonth(key) {
    if (this.state.months[key]) {
      this.activeMonthKey = key;
      this.saveState();
      this.render();
      this.scrollActiveMonthIntoView();
    }
  }

  scrollActiveMonthIntoView() {
    setTimeout(() => {
      const container = document.getElementById("monthSelectorScroll");
      const activeChip = document.querySelector(`.month-chip[data-month="${this.activeMonthKey}"]`);
      if (container && activeChip) {
        const chipLeft = activeChip.offsetLeft;
        const chipWidth = activeChip.offsetWidth;
        const containerWidth = container.offsetWidth;
        const scrollTarget = chipLeft - (containerWidth / 2) + (chipWidth / 2);
        container.scrollTo({ left: Math.max(0, scrollTarget), behavior: "smooth" });
      }
    }, 60);
  }

  toggleDay(dayNumber) {
    if (this.ignoreNextClick) {
      this.ignoreNextClick = false;
      return;
    }
    const currentMonthState = this.state.months[this.activeMonthKey];
    const currentTrips = currentMonthState.selectedDays[dayNumber] || 0;

    if (currentTrips > 0) {
      // Toggle off
      delete currentMonthState.selectedDays[dayNumber];
    } else {
      // Toggle on with default trips
      currentMonthState.selectedDays[dayNumber] = this.defaultTripsPerDay;
    }

    this.saveState();
    this.render();
  }

  openDayModal(dayNumber) {
    const currentMonthState = this.state.months[this.activeMonthKey];
    const currentTrips = currentMonthState.selectedDays[dayNumber] || 0;
    this.editingDay = { day: dayNumber, trips: currentTrips };

    const modalBackdrop = document.getElementById("dayModal");
    const modalTitle = document.getElementById("modalTitle");
    const monthDef = ACADEMIC_MONTHS.find(m => m.key === this.activeMonthKey);

    if (modalTitle && monthDef) {
      modalTitle.textContent = `${dayNumber} de ${monthDef.name}`;
    }

    // Setup options buttons
    const options = document.querySelectorAll(".trip-option-btn");
    options.forEach(btn => {
      const val = parseInt(btn.getAttribute("data-trips"), 10);
      if (val === currentTrips) {
        btn.classList.add("selected");
      } else {
        btn.classList.remove("selected");
      }
      btn.onclick = () => {
        options.forEach(b => b.classList.remove("selected"));
        btn.classList.add("selected");
      };
    });

    if (modalBackdrop) {
      modalBackdrop.classList.add("active");
    }
  }

  closeModal() {
    const modalBackdrop = document.getElementById("dayModal");
    if (modalBackdrop) {
      modalBackdrop.classList.remove("active");
    }
    this.editingDay = null;
  }

  setDayTrips(dayNumber, trips) {
    const currentMonthState = this.state.months[this.activeMonthKey];
    if (trips <= 0) {
      delete currentMonthState.selectedDays[dayNumber];
    } else {
      currentMonthState.selectedDays[dayNumber] = trips;
    }
    this.saveState();
    this.render();
  }

  toggleMonthlyPass() {
    const currentMonthState = this.state.months[this.activeMonthKey];
    currentMonthState.hasMonthlyPass = !currentMonthState.hasMonthlyPass;
    this.saveState();
    this.render();
  }

  changeEightPasses(delta) {
    const currentMonthState = this.state.months[this.activeMonthKey];
    const current = currentMonthState.eightPassesCount || 0;
    const next = Math.max(0, current + delta);
    currentMonthState.eightPassesCount = next;
    this.saveState();
    this.render();
  }

  changeLooseTrips(delta) {
    const currentMonthState = this.state.months[this.activeMonthKey];
    const current = currentMonthState.eightLooseTrips || 0;
    const next = Math.max(0, current + delta);
    currentMonthState.eightLooseTrips = next;
    this.saveState();
    this.render();
  }

  promptSetLooseTrips() {
    const currentMonthState = this.state.months[this.activeMonthKey];
    const current = currentMonthState.eightLooseTrips || 0;
    const input = prompt("¿Cuántos viajes te quedan en tu bono de 8 en uso?", current);
    if (input !== null) {
      const parsed = parseInt(input.trim(), 10);
      if (!isNaN(parsed) && parsed >= 0) {
        currentMonthState.eightLooseTrips = parsed;
        this.saveState();
        this.render();
      }
    }
  }

  buyRecommendedPasses(count) {
    if (count <= 0) return;
    const currentMonthState = this.state.months[this.activeMonthKey];
    currentMonthState.eightPassesCount = (currentMonthState.eightPassesCount || 0) + count;
    this.saveState();
    this.render();
  }

  markWeekdaysPattern(patternDays) {
    // patternDays: array of day of week (1 = Mon, 2 = Tue, 3 = Wed, 4 = Thu, 5 = Fri)
    const monthDef = ACADEMIC_MONTHS.find(m => m.key === this.activeMonthKey);
    const year = this.state.baseYear + monthDef.yearOffset;
    const daysInMonth = new Date(year, monthDef.monthIndex + 1, 0).getDate();
    const currentMonthState = this.state.months[this.activeMonthKey];

    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, monthDef.monthIndex, day);
      const dayOfWeek = date.getDay(); // 0 is Sun, 1 is Mon...
      if (patternDays.includes(dayOfWeek)) {
        currentMonthState.selectedDays[day] = this.defaultTripsPerDay;
      }
    }

    this.saveState();
    this.render();
  }

  clearCurrentMonth() {
    const monthDef = ACADEMIC_MONTHS.find(m => m.key === this.activeMonthKey);
    if (confirm(`¿Seguro que deseas desmarcar todos los días de clase de ${monthDef.name}?`)) {
      this.state.months[this.activeMonthKey].selectedDays = {};
      this.saveState();
      this.render();
    }
  }

  navigateMonth(direction) {
    const currentIndex = ACADEMIC_MONTHS.findIndex(m => m.key === this.activeMonthKey);
    const targetIndex = currentIndex + direction;
    if (targetIndex >= 0 && targetIndex < ACADEMIC_MONTHS.length) {
      this.setActiveMonth(ACADEMIC_MONTHS[targetIndex].key);
    }
  }

  /* --------------------------------------------------------------------------
     RENDERING
     -------------------------------------------------------------------------- */
  render() {
    const calculations = this.calculateAllMonths();
    const activeCalc = calculations[this.activeMonthKey];
    const activeState = this.state.months[this.activeMonthKey];

    this.renderMonthSelector(calculations);
    this.renderSummaryCards(activeCalc);
    this.renderBonoManager(activeState, activeCalc);
    this.renderCalendar(activeCalc);
    this.renderAdvisor(activeCalc);
  }

  renderMonthSelector(calculations) {
    const container = document.getElementById("monthSelectorScroll");
    if (!container) return;

    container.innerHTML = ACADEMIC_MONTHS.map(m => {
      const calc = calculations[m.key];
      const isActive = m.key === this.activeMonthKey;
      const countLabel = calc.totalClassDays > 0 ? `${calc.totalTripsRequired}v` : "0";
      const hasUncovered = calc.uncoveredTrips > 0;

      return `
        <button class="month-chip ${isActive ? "active" : ""}" data-month="${m.key}" onclick="app.setActiveMonth('${m.key}')">
          <span>${m.name.substring(0, 3)}</span>
          <span class="chip-count" style="${hasUncovered ? "color: var(--accent-rose); font-weight: 700;" : ""}">${countLabel}</span>
        </button>
      `;
    }).join("");
  }

  renderSummaryCards(calc) {
    const container = document.getElementById("summaryGrid");
    if (!container) return;

    // Card 1: Total Trips
    const totalTripsHtml = `
      <div class="stat-card">
        <div class="stat-header">
          <span class="stat-title">Viajes Necesarios</span>
          ${Icons.bus(18)}
        </div>
        <div class="stat-value-group">
          <span class="stat-value">${calc.totalTripsRequired}</span>
          <span class="stat-unit">viajes</span>
        </div>
        <div class="stat-desc">${calc.totalClassDays} días lectivos marcados</div>
      </div>
    `;

    // Card 2: Bono Mensual Status
    const monthlyPassHtml = `
      <div class="stat-card ${calc.monthlyPassTripsAvailable > 0 ? "good-card" : ""}">
        <div class="stat-header">
          <span class="stat-title">Bono 20 (Mes)</span>
          ${Icons.ticket(18)}
        </div>
        <div class="stat-value-group">
          <span class="stat-value">${calc.monthlyTripsUsed}</span>
          <span class="stat-unit">/ ${calc.monthlyPassTripsAvailable} v.</span>
        </div>
        <div class="stat-desc">
          ${calc.monthlyPassTripsAvailable > 0
            ? (calc.monthlyTripsUnused > 0 ? `Sobran ${calc.monthlyTripsUnused}v (caducan)` : "Agotado al 100%")
            : "No activado este mes"}
        </div>
      </div>
    `;

    // Card 3: Bonos 8 Trips Status
    const eightPassHtml = `
      <div class="stat-card">
        <div class="stat-header">
          <span class="stat-title">Bonos de 8</span>
          ${Icons.ticket(18)}
        </div>
        <div class="stat-value-group">
          <span class="stat-value">${calc.eightTripsUsed}</span>
          <span class="stat-unit">/ ${calc.totalEightTripsAvailable} v.</span>
        </div>
        <div class="stat-desc">Pasan al sig. mes: <strong>${calc.eightTripRolloverOut} viajes</strong></div>
      </div>
    `;

    // Card 4: Coverage / Missing
    let balanceClass = "good-card";
    let balanceTitle = "Cubierto";
    let balanceValue = "100%";
    let balanceDesc = "Todos tus viajes están cubiertos";

    if (calc.uncoveredTrips > 0) {
      balanceClass = "danger-card";
      balanceTitle = "Faltan";
      balanceValue = `-${calc.uncoveredTrips}`;
      balanceDesc = `Comprar ${calc.recommendedEightPassesToBuy} bono(s) de 8`;
    } else if (calc.totalTripsRequired === 0) {
      balanceClass = "";
      balanceTitle = "Estado";
      balanceValue = "0";
      balanceDesc = "Selecciona días de clase";
    }

    const balanceHtml = `
      <div class="stat-card ${balanceClass}">
        <div class="stat-header">
          <span class="stat-title">${balanceTitle}</span>
          ${calc.uncoveredTrips > 0 ? Icons.alertTriangle(18) : Icons.checkCircle(18)}
        </div>
        <div class="stat-value-group">
          <span class="stat-value">${balanceValue}</span>
          <span class="stat-unit">${calc.uncoveredTrips > 0 ? "viajes" : ""}</span>
        </div>
        <div class="stat-desc">${balanceDesc}</div>
      </div>
    `;

    container.innerHTML = totalTripsHtml + monthlyPassHtml + balanceHtml + eightPassHtml;
  }

  renderBonoManager(mState, calc) {
    const container = document.getElementById("bonoControlsContainer");
    if (!container) return;

    container.innerHTML = `
      <!-- Bono Mensual 20 viajes -->
      <div class="bono-box">
        <div class="bono-box-header">
          <span class="bono-tag monthly">Exclusivo del mes</span>
          <label class="switch">
            <input type="checkbox" id="monthlyPassToggle" ${mState.hasMonthlyPass ? "checked" : ""} onchange="app.toggleMonthlyPass()">
            <span class="slider"></span>
          </label>
        </div>
        <div>
          <div class="bono-title">Bono Mensual (20 viajes)</div>
          <div class="bono-helper">Solo se gasta este mes. Si sobran, caducan a fin de mes.</div>
        </div>
      </div>

      <!-- Bonos de 8 viajes -->
      <div class="bono-box">
        <div class="bono-box-header">
          <span class="bono-tag eight">Acumulables</span>
          <span class="bono-total-pill">Total: <strong>${calc.totalEightTripsAvailable} v.</strong></span>
        </div>
        <div>
          <div class="bono-title">Bonos de 8 Viajes</div>
          <div class="bono-helper">No caducan a fin de mes. Los viajes sobrantes pasan al siguiente mes.</div>
        </div>

        <!-- Fila: Bonos enteros (8 viajes cada uno) -->
        <div class="bono-subrow">
          <div class="bono-subrow-info">
            <span class="bono-subrow-label">Bonos enteros (x8):</span>
            <span class="bono-subrow-desc">${(mState.eightPassesCount || 0) * 8} viajes</span>
          </div>
          <div class="stepper">
            <button class="stepper-btn" onclick="app.changeEightPasses(-1)" ${mState.eightPassesCount === 0 ? "disabled" : ""} aria-label="Restar bono entero">-</button>
            <span class="stepper-value">${mState.eightPassesCount || 0}</span>
            <button class="stepper-btn" onclick="app.changeEightPasses(1)" aria-label="Añadir bono entero">+</button>
          </div>
        </div>

        <!-- Fila: Viajes de bono empezado / sueltos -->
        <div class="bono-subrow">
          <div class="bono-subrow-info">
            <span class="bono-subrow-label">Bono en uso / Viajes sueltos:</span>
            <span class="bono-subrow-desc">Toca para escribir cifra exacta</span>
          </div>
          <div class="stepper">
            <button class="stepper-btn" onclick="app.changeLooseTrips(-1)" ${(mState.eightLooseTrips || 0) === 0 ? "disabled" : ""} aria-label="Restar viaje">-</button>
            <button class="stepper-value-btn" onclick="app.promptSetLooseTrips()" title="Pulsar para escribir número exacto de viajes">
              ${mState.eightLooseTrips || 0}v
            </button>
            <button class="stepper-btn" onclick="app.changeLooseTrips(1)" aria-label="Añadir viaje">+</button>
          </div>
        </div>
      </div>
    `;

    // Rollover strip
    const rolloverContainer = document.getElementById("rolloverStripContainer");
    if (rolloverContainer) {
      rolloverContainer.innerHTML = `
        <div class="rollover-strip">
          <span>Remanente anterior de bonos de 8: <strong class="rollover-highlight">${calc.eightTripRolloverIn} viajes</strong></span>
          <span>Sobrante que pasa al próximo mes: <strong class="rollover-highlight">${calc.eightTripRolloverOut} viajes</strong></span>
        </div>
      `;
    }
  }

  renderCalendar(calc) {
    const calendarMonthTitle = document.getElementById("calendarMonthTitle");
    const calendarDaysGrid = document.getElementById("calendarDaysGrid");
    if (!calendarDaysGrid) return;

    if (calendarMonthTitle) {
      calendarMonthTitle.textContent = `${calc.mDef.name} ${calc.year}`;
    }

    // Determine day of week of 1st day of month
    // In JS: 0 = Sun, 1 = Mon ... 6 = Sat
    // We want Monday as first column (0 = Mon ... 6 = Sun)
    const firstDayDate = new Date(calc.year, calc.mDef.monthIndex, 1);
    let startDayOfWeek = firstDayDate.getDay();
    let emptyLeadingCells = (startDayOfWeek === 0) ? 6 : (startDayOfWeek - 1);

    const today = new Date();
    const isCurrentCalendarMonth = (today.getFullYear() === calc.year && today.getMonth() === calc.mDef.monthIndex);
    const todayDateNumber = today.getDate();

    let gridHtml = "";

    // Empty cells for alignment
    for (let i = 0; i < emptyLeadingCells; i++) {
      gridHtml += `<div class="day-cell empty-day"></div>`;
    }

    // Days of month
    for (let day = 1; day <= calc.daysInMonth; day++) {
      const trips = this.state.months[this.activeMonthKey].selectedDays[day] || 0;
      const isClassDay = trips > 0;
      const coverage = calc.dayCoverageMap[day] || "";
      const dateObj = new Date(calc.year, calc.mDef.monthIndex, day);
      const isWeekend = (dateObj.getDay() === 0 || dateObj.getDay() === 6);
      const isToday = isCurrentCalendarMonth && (day === todayDateNumber);

      let covClass = "";
      if (isClassDay) {
        if (coverage === "monthly") covClass = "cov-monthly";
        else if (coverage === "eight") covClass = "cov-eight";
        else if (coverage === "partial") covClass = "cov-partial";
        else if (coverage === "uncovered") covClass = "cov-uncovered";
      }

      gridHtml += `
        <div class="day-cell ${isClassDay ? "class-day" : ""} ${covClass} ${isWeekend ? "weekend-day" : ""} ${isToday ? "today" : ""}"
             data-day="${day}"
             onclick="app.toggleDay(${day})"
             oncontextmenu="event.preventDefault(); app.openDayModal(${day});">
          <div class="day-number">${day}</div>
          <div class="day-footer">
            ${isClassDay ? `<span class="trips-badge">${trips}v</span>` : `<span></span>`}
            ${isClassDay ? `<span class="cov-indicator-dot"></span>` : `<span></span>`}
          </div>
        </div>
      `;
    }

    calendarDaysGrid.innerHTML = gridHtml;
  }

  renderAdvisor(calc) {
    const advisorBox = document.getElementById("advisorBox");
    if (!advisorBox) return;

    if (calc.uncoveredTrips > 0) {
      advisorBox.innerHTML = `
        <div class="advisor-icon-box" style="border-color: var(--accent-rose);">
          ${Icons.cart(20)}
        </div>
        <div class="advisor-content">
          <div class="advisor-title">Te faltan ${calc.uncoveredTrips} viajes en ${calc.mDef.name}</div>
          <div class="advisor-msg">
            Tus bonos actuales no alcanzan para todos los días de clase marcados. Te recomendamos comprar <strong>${calc.recommendedEightPassesToBuy} bono(s) de 8 viajes</strong>.
            ${(calc.recommendedEightPassesToBuy * 8) - calc.uncoveredTrips > 0 ? `Te sobrarán ${(calc.recommendedEightPassesToBuy * 8) - calc.uncoveredTrips} viajes para el próximo mes.` : ""}
          </div>
          <button class="advisor-action" onclick="app.buyRecommendedPasses(${calc.recommendedEightPassesToBuy})">
            ${Icons.plus(14)} Añadir ${calc.recommendedEightPassesToBuy} bono(s) de 8 al mes
          </button>
        </div>
      `;
      advisorBox.style.display = "flex";
    } else if (calc.totalTripsRequired > 0) {
      advisorBox.innerHTML = `
        <div class="advisor-icon-box" style="border-color: var(--accent-emerald);">
          ${Icons.checkCircle(20)}
        </div>
        <div class="advisor-content">
          <div class="advisor-title">¡Cobertura completa!</div>
          <div class="advisor-msg">
            Todos tus ${calc.totalTripsRequired} viajes de ${calc.mDef.name} están cubiertos.
            ${calc.eightTripRolloverOut > 0 ? `Además, transferirás <strong>${calc.eightTripRolloverOut} viajes</strong> sobrantes al mes siguiente.` : ""}
          </div>
        </div>
      `;
      advisorBox.style.display = "flex";
    } else {
      advisorBox.innerHTML = `
        <div class="advisor-icon-box">
          ${Icons.calendar(20)}
        </div>
        <div class="advisor-content">
          <div class="advisor-title">Sin días de clase marcados</div>
          <div class="advisor-msg">Toca los días en el calendario para calcular automáticamente el consumo de tus bonos.</div>
        </div>
      `;
      advisorBox.style.display = "flex";
    }
  }
}

// Global initialization
let app = null;
document.addEventListener("DOMContentLoaded", () => {
  app = new BusPassApp();
});
