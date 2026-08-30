/* =========================================================
   IT Service Desk — shared app logic
   Data is stored inside the connected GitHub repo as JSON
   files under /data/*.json, written via the Contents API.
   ========================================================= */

const IT = (() => {

  const CFG_KEY = "itdesk_config";

  function getConfig() {
    const raw = localStorage.getItem(CFG_KEY);
    return raw ? JSON.parse(raw) : null;
  }

  function setConfig(cfg) {
    localStorage.setItem(CFG_KEY, JSON.stringify(cfg));
  }

  function clearConfig() {
    localStorage.removeItem(CFG_KEY);
  }

  function requireAuth() {
    const cfg = getConfig();
    if (!cfg || !cfg.token || !cfg.owner || !cfg.repo) {
      window.location.href = "index.html";
      return null;
    }
    return cfg;
  }

  function apiBase(cfg) {
    return `https://api.github.com/repos/${cfg.owner}/${cfg.repo}/contents`;
  }

  function b64EncodeUnicode(str) {
    return btoa(unescape(encodeURIComponent(str)));
  }
  function b64DecodeUnicode(str) {
    return decodeURIComponent(escape(atob(str)));
  }

  // Reads a JSON array file from the repo. Returns {data, sha} — sha is
  // null when the file does not exist yet (first write will create it).
  async function readFile(cfg, path) {
    const url = `${apiBase(cfg)}/${path}?ref=${encodeURIComponent(cfg.branch || "main")}&t=${Date.now()}`;
    const res = await fetch(url, {
      headers: {
        Authorization: `token ${cfg.token}`,
        Accept: "application/vnd.github+json"
      }
    });
    if (res.status === 404) return { data: [], sha: null };
    if (!res.ok) throw new Error(`GitHub API ${res.status}: ${await res.text()}`);
    const json = await res.json();
    const content = b64DecodeUnicode(json.content.replace(/\n/g, ""));
    let data = [];
    try { data = JSON.parse(content); } catch (e) { data = []; }
    return { data, sha: json.sha };
  }

  // Writes the full array back to the repo file.
  async function writeFile(cfg, path, data, sha, message) {
    const url = `${apiBase(cfg)}/${path}`;
    const body = {
      message,
      content: b64EncodeUnicode(JSON.stringify(data, null, 2)),
      branch: cfg.branch || "main"
    };
    if (sha) body.sha = sha;
    const res = await fetch(url, {
      method: "PUT",
      headers: {
        Authorization: `token ${cfg.token}`,
        Accept: "application/vnd.github+json",
        "Content-Type": "application/json"
      },
      body: JSON.stringify(body)
    });
    if (!res.ok) throw new Error(`GitHub API ${res.status}: ${await res.text()}`);
    return res.json();
  }

  // Appends one record to a data file, retrying once on sha conflict.
  async function addRecord(cfg, path, record, commitMsg) {
    const { data, sha } = await readFile(cfg, path);
    data.push(record);
    try {
      await writeFile(cfg, path, data, sha, commitMsg);
    } catch (e) {
      // Someone else may have written in the meantime — refetch sha & retry once.
      const retry = await readFile(cfg, path);
      retry.data.push(record);
      await writeFile(cfg, path, retry.data, retry.sha, commitMsg);
    }
    return record;
  }

  async function loadRecords(cfg, path) {
    const { data } = await readFile(cfg, path);
    return data;
  }

  async function testConnection(cfg) {
    const res = await fetch(`https://api.github.com/repos/${cfg.owner}/${cfg.repo}`, {
      headers: {
        Authorization: `token ${cfg.token}`,
        Accept: "application/vnd.github+json"
      }
    });
    if (!res.ok) {
      if (res.status === 404) throw new Error("রিপোজিটরি খুঁজে পাওয়া যায়নি — owner/repo নাম চেক করুন।");
      if (res.status === 401) throw new Error("Token সঠিক নয় বা মেয়াদ শেষ।");
      throw new Error(`সংযোগ ব্যর্থ (${res.status})`);
    }
    return res.json();
  }

  function nextTicketNo(existingRecords) {
    const now = new Date();
    const stamp = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}`;
    const countThisMonth = existingRecords.filter(r => (r.ticketNo || "").includes(stamp)).length;
    return `TKT-${stamp}-${String(countThisMonth + 1).padStart(3, "0")}`;
  }

  function todayStr() {
    return new Date().toISOString().slice(0, 10);
  }

  function escapeHtml(s) {
    return String(s ?? "").replace(/[&<>"']/g, c => ({
      "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
    }[c]));
  }

  function exportToExcel(rows, columns, filename) {
    const aoa = [columns.map(c => c.label)];
    rows.forEach(r => aoa.push(columns.map(c => r[c.key] ?? "")));
    const ws = XLSX.utils.aoa_to_sheet(aoa);
    ws["!cols"] = columns.map(() => ({ wch: 20 }));
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Data");
    XLSX.writeFile(wb, filename);
  }

  return {
    getConfig, setConfig, clearConfig, requireAuth,
    readFile, writeFile, addRecord, loadRecords, testConnection,
    nextTicketNo, todayStr, escapeHtml, exportToExcel
  };
})();
