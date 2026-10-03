const loginForm = document.getElementById("login-form");
const loginMessage = document.getElementById("login-message");
const loginScreen = document.getElementById("login-screen");
const dashboard = document.getElementById("dashboard");
const projectGrid = document.getElementById("project-grid");
const projectDialog = document.getElementById("project-dialog");
const detailsDialog = document.getElementById("details-dialog");
const projectForm = document.getElementById("project-form");
const projectDetails = document.getElementById("project-details");
const storageKey = "northstar-demo-projects-v1";
const filters = ["all", "In progress", "Planning", "Completed"];
let activeFilter = "all";
let searchTerm = "";
let selectedProjectId = null;

const sampleProjects = [
  { id: "p-101", name: "Brand refresh", description: "A new visual system for the next chapter of Northstar.", owner: "Maya Chen", dueDate: "2026-10-18", status: "In progress", progress: 72, symbol: "B", color: "#bc6543", tint: "#f6eae3" },
  { id: "p-102", name: "Customer portal", description: "One calm place for customers to manage their account.", owner: "Jordan Davis", dueDate: "2026-11-02", status: "In progress", progress: 46, symbol: "C", color: "#4d7a91", tint: "#e6eff3" },
  { id: "p-103", name: "Q4 launch plan", description: "Align the launch calendar, channels, and team owners.", owner: "Ravi Patel", dueDate: "2026-10-12", status: "Planning", progress: 18, symbol: "Q", color: "#ae822c", tint: "#f5efdf" },
  { id: "p-104", name: "Research library", description: "Make customer insights easier to find and share.", owner: "Elena Ruiz", dueDate: "2026-10-25", status: "Planning", progress: 8, symbol: "R", color: "#7a6a9a", tint: "#eeebf4" },
  { id: "p-105", name: "Spring campaign", description: "A multi-channel campaign celebrating local makers.", owner: "Maya Chen", dueDate: "2026-09-28", status: "Completed", progress: 100, symbol: "S", color: "#438465", tint: "#e6f1e9" },
  { id: "p-106", name: "Team onboarding", description: "A more welcoming first week for every new teammate.", owner: "Noah Williams", dueDate: "2026-09-19", status: "Completed", progress: 100, symbol: "T", color: "#b16d52", tint: "#f5ebe6" }
];

function loadProjects() {
  try {
    const savedProjects = localStorage.getItem(storageKey);
    return savedProjects ? JSON.parse(savedProjects) : sampleProjects;
  } catch {
    return sampleProjects;
  }
}

let projects = loadProjects();

function saveProjects() {
  try {
    localStorage.setItem(storageKey, JSON.stringify(projects));
  } catch {
    return;
  }
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (character) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  })[character]);
}

function initials(name) {
  return name.trim().split(/\s+/).slice(0, 2).map((part) => part[0] || "").join("").toUpperCase();
}

function formatDate(dateString) {
  if (!dateString) return "No due date";
  const date = new Date(`${dateString}T00:00:00`);
  return new Intl.DateTimeFormat("en", { month: "short", day: "numeric" }).format(date);
}

function updateSummary() {
  document.getElementById("total-count").textContent = projects.length;
  document.getElementById("active-count").textContent = projects.filter((project) => project.status === "In progress").length;
  document.getElementById("planning-count").textContent = projects.filter((project) => project.status === "Planning").length;
  document.getElementById("completed-count").textContent = projects.filter((project) => project.status === "Completed").length;
  document.getElementById("all-filter-count").textContent = projects.length;
}

function renderProjects() {
  updateSummary();
  const normalizedSearch = searchTerm.toLowerCase();
  const visibleProjects = projects.filter((project) => {
    const matchesFilter = activeFilter === "all" || project.status === activeFilter;
    const searchableText = `${project.name} ${project.owner} ${project.description}`.toLowerCase();
    return matchesFilter && searchableText.includes(normalizedSearch);
  });

  document.getElementById("project-result-count").textContent = `${visibleProjects.length} ${visibleProjects.length === 1 ? "project" : "projects"} in this view`;
  document.getElementById("empty-state").hidden = visibleProjects.length > 0;
  projectGrid.hidden = visibleProjects.length === 0;
  projectGrid.innerHTML = visibleProjects.map((project, index) => {
    const statusClass = project.status.toLowerCase().replaceAll(" ", "-");
    const progress = Math.max(0, Math.min(100, Number(project.progress) || 0));
    return `<button class="project-card" type="button" data-project-id="${escapeHtml(project.id)}" style="--project-color:${escapeHtml(project.color || "#28785c")};--project-tint:${escapeHtml(project.tint || "#e6f3ec")};animation-delay:${index * 45}ms" aria-label="Open ${escapeHtml(project.name)} project details">
      <span class="project-card-top"><span class="project-symbol" aria-hidden="true">${escapeHtml(project.symbol || initials(project.name))}</span><span class="project-status ${statusClass}">${escapeHtml(project.status)}</span></span>
      <span class="project-card-title"><span class="project-card-heading">${escapeHtml(project.name)}</span></span>
      <span class="project-description">${escapeHtml(project.description || "No description added yet.")}</span>
      <span class="project-progress"><span class="progress-heading"><span>Progress</span><span>${progress}%</span></span><span class="progress-track"><span class="progress-fill" style="width:${progress}%"></span></span></span>
      <span class="project-card-footer"><span class="project-owner"><span class="owner-avatar">${escapeHtml(initials(project.owner))}</span>${escapeHtml(project.owner)}</span><span class="project-due"><span aria-hidden="true">◷</span>${escapeHtml(formatDate(project.dueDate))}</span></span>
    </button>`;
  }).join("");
}

function openDetails(projectId) {
  const project = projects.find((item) => item.id === projectId);
  if (!project) return;
  selectedProjectId = projectId;
  projectDetails.innerHTML = `<div class="dialog-heading"><div><p class="eyebrow">NORTHSTAR LABS PROJECT</p><h2 id="details-title">${escapeHtml(project.name)}</h2></div><button class="icon-button dialog-close" type="button" data-close-details aria-label="Close dialog">×</button></div>
    <p class="details-description">${escapeHtml(project.description || "No description added yet.")}</p>
    <div class="details-meta"><div><span>Project lead</span><strong>${escapeHtml(project.owner)}</strong></div><div><span>Due date</span><strong>${escapeHtml(formatDate(project.dueDate))}</strong></div><div><span>Progress</span><strong>${Math.max(0, Math.min(100, Number(project.progress) || 0))}%</strong></div><div><span>Workspace</span><strong>Northstar Labs</strong></div></div>
    <label class="details-status" for="details-status-select">Project status<select id="details-status-select"><option${project.status === "Planning" ? " selected" : ""}>Planning</option><option${project.status === "In progress" ? " selected" : ""}>In progress</option><option${project.status === "Completed" ? " selected" : ""}>Completed</option></select></label>
    <div class="details-footer"><button class="secondary-button" type="button" data-close-details>Done</button></div>`;
  detailsDialog.showModal();
}

loginForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const email = document.getElementById("email").value.trim().toLowerCase();
  const password = document.getElementById("password").value;
  const isDemoAccount = email === "demo@example.com" && password === "password123";

  if (!isDemoAccount) {
    loginMessage.textContent = "Email or password is incorrect.";
    return;
  }

  loginMessage.textContent = "";
  loginScreen.hidden = true;
  dashboard.hidden = false;
  document.title = "Projects | Northstar Labs";
  document.getElementById("current-date").textContent = new Intl.DateTimeFormat("en", { weekday: "long", month: "long", day: "numeric" }).format(new Date()).toUpperCase();
  renderProjects();
});

document.getElementById("project-search").addEventListener("input", (event) => {
  searchTerm = event.target.value.trim();
  renderProjects();
});

document.querySelectorAll(".filter-tab").forEach((button) => {
  button.addEventListener("click", () => {
    activeFilter = filters.includes(button.dataset.filter) ? button.dataset.filter : "all";
    document.querySelectorAll(".filter-tab").forEach((tab) => {
      const isActive = tab === button;
      tab.classList.toggle("active", isActive);
      tab.setAttribute("aria-pressed", String(isActive));
    });
    renderProjects();
  });
});

projectGrid.addEventListener("click", (event) => {
  const card = event.target.closest("[data-project-id]");
  if (card) openDetails(card.dataset.projectId);
});

document.getElementById("open-project-dialog").addEventListener("click", () => {
  projectForm.reset();
  projectDialog.showModal();
  document.getElementById("project-name").focus();
});

document.querySelectorAll("[data-close-dialog]").forEach((button) => {
  button.addEventListener("click", () => projectDialog.close());
});

projectForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const formData = new FormData(projectForm);
  const name = String(formData.get("name")).trim();
  const owner = String(formData.get("owner")).trim();
  if (!name || !owner) return;

  const status = String(formData.get("status"));
  const project = {
    id: `p-${Date.now()}`,
    name,
    owner,
    dueDate: String(formData.get("dueDate")),
    description: String(formData.get("description")).trim(),
    status,
    progress: status === "Completed" ? 100 : status === "In progress" ? 15 : 0,
    symbol: initials(name).slice(0, 1),
    color: "#28785c",
    tint: "#e6f3ec"
  };

  projects = [project, ...projects];
  saveProjects();
  activeFilter = "all";
  searchTerm = "";
  document.getElementById("project-search").value = "";
  document.querySelectorAll(".filter-tab").forEach((tab) => {
    const isAll = tab.dataset.filter === "all";
    tab.classList.toggle("active", isAll);
    tab.setAttribute("aria-pressed", String(isAll));
  });
  renderProjects();
  projectDialog.close();
});

projectDetails.addEventListener("click", (event) => {
  if (event.target.closest("[data-close-details]")) detailsDialog.close();
});

projectDetails.addEventListener("change", (event) => {
  if (event.target.id !== "details-status-select") return;
  const project = projects.find((item) => item.id === selectedProjectId);
  if (!project) return;
  project.status = event.target.value;
  project.progress = project.status === "Completed" ? 100 : project.status === "Planning" ? Math.min(project.progress, 15) : Math.max(project.progress, 20);
  saveProjects();
  renderProjects();
  openDetails(selectedProjectId);
});

document.getElementById("sign-out").addEventListener("click", () => {
  dashboard.hidden = true;
  loginScreen.hidden = false;
  loginForm.reset();
  document.title = "Northstar Labs | Projects";
  document.getElementById("email").focus();
});

document.addEventListener("keydown", (event) => {
  if (event.key === "/" && !event.ctrlKey && !event.metaKey && !event.altKey && !dashboard.hidden && !["INPUT", "TEXTAREA"].includes(document.activeElement.tagName)) {
    event.preventDefault();
    document.getElementById("project-search").focus();
  }
});