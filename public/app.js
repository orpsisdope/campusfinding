const form = document.getElementById("report-form");
const formMessage = document.getElementById("form-message");
const itemsList = document.getElementById("items-list");
const itemsStatus = document.getElementById("items-status");
const refreshButton = document.getElementById("refresh-button");
const dateInput = document.getElementById("item_date");
const welcome = document.getElementById("welcome");
const loginLink = document.getElementById("login-link");
const signupLink = document.getElementById("signup-link");
const logoutButton = document.getElementById("logout-button");

function getToken() {
  return localStorage.getItem("token") || "";
}

function clearSession() {
  localStorage.removeItem("token");
  localStorage.removeItem("username");
}

function setLoggedOutUi() {
  if (welcome) welcome.textContent = "";
  if (loginLink) loginLink.hidden = false;
  if (signupLink) signupLink.hidden = false;
  if (logoutButton) logoutButton.hidden = true;
}

function setLoggedInUi(username) {
  if (welcome) welcome.textContent = `Welcome ${username}`;
  if (loginLink) loginLink.hidden = true;
  if (signupLink) signupLink.hidden = true;
  if (logoutButton) logoutButton.hidden = false;
}

async function validateSession() {
  const token = getToken();

  if (!token) {
    clearSession();
    setLoggedOutUi();
    return false;
  }

  try {
    const response = await fetch("/api/auth/me", {
      headers: { Authorization: `Bearer ${token}` }
    });

    if (!response.ok) {
      clearSession();
      setLoggedOutUi();
      return false;
    }

    const data = await response.json();
    const username = data.user && data.user.username;

    if (!username) {
      clearSession();
      setLoggedOutUi();
      return false;
    }

    localStorage.setItem("username", username);
    setLoggedInUi(username);
    return true;
  } catch {
    setLoggedOutUi();
    return false;
  }
}

function logout() {
  clearSession();
  setLoggedOutUi();
  window.location.href = "index.html";
}

function formatDate(dateValue) {
  if (!dateValue) return "No date";

  const [year, month, day] = String(dateValue).slice(0, 10).split("-").map(Number);
  const date = new Date(year, month - 1, day);

  return date.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric"
  });
}

function createTextElement(tag, className, text) {
  const element = document.createElement(tag);
  if (className) element.className = className;
  element.textContent = text;
  return element;
}

function createItemCard(item) {
  const article = document.createElement("article");
  article.className = `item-card${item.resolved ? " resolved" : ""}`;

  const topRow = document.createElement("div");
  topRow.className = "item-top-row";

  const typeBadge = createTextElement(
    "span",
    `badge ${item.type}`,
    String(item.type || "").toUpperCase()
  );

  const statusBadge = createTextElement(
    "span",
    `status-badge ${item.resolved ? "done" : "open"}`,
    item.resolved ? "RESOLVED" : "OPEN"
  );

  topRow.append(typeBadge, statusBadge);

  const title = createTextElement("h3", "", item.title || "Untitled report");

  const meta = createTextElement(
    "p",
    "item-meta",
    `${item.category || "Other"} · ${item.location || "Unknown location"} · ${formatDate(item.item_date)}`
  );

  const description = createTextElement("p", "item-description", item.description || "");
  const contact = createTextElement("p", "item-contact", `Contact: ${item.contact || "Not provided"}`);

  article.append(topRow, title, meta, description, contact);

  if (!item.resolved && getToken()) {
    const resolveButton = createTextElement(
      "button",
      "button small secondary",
      "Mark as resolved"
    );

    resolveButton.type = "button";
    resolveButton.addEventListener("click", () => resolveItem(item.id, resolveButton));
    article.append(resolveButton);
  }

  return article;
}

async function loadItems() {
  itemsStatus.textContent = "Loading reports...";
  itemsList.replaceChildren();

  try {
    const response = await fetch("/api/items");
    if (!response.ok) throw new Error("Could not load reports.");

    const items = await response.json();

    if (!Array.isArray(items) || items.length === 0) {
      itemsStatus.textContent = "No reports yet. Add the first one above.";
      return;
    }

    itemsStatus.textContent = `${items.length} report${items.length === 1 ? "" : "s"}`;

    for (const item of items) {
      itemsList.append(createItemCard(item));
    }
  } catch {
    itemsStatus.textContent =
      "Could not load reports. Check the server and database connection.";
  }
}

async function resolveItem(id, button) {
  const token = getToken();

  if (!token) {
    window.location.href = "login.html";
    return;
  }

  button.disabled = true;
  button.textContent = "Updating...";

  try {
    const response = await fetch(`/api/items/${id}/resolve`, {
      method: "PATCH",
      headers: { Authorization: `Bearer ${token}` }
    });

    const result = await response.json().catch(() => ({}));

    if (response.status === 401) {
      clearSession();
      setLoggedOutUi();
      window.location.href = "login.html";
      return;
    }

    if (!response.ok) {
      throw new Error(result.message || "Could not update report.");
    }

    await loadItems();
  } catch (error) {
    button.disabled = false;
    button.textContent = "Mark as resolved";
    itemsStatus.textContent =
      error.message || "Could not update the report. Please try again.";
  }
}

async function submitReport(event) {
  event.preventDefault();

  const token = getToken();

  if (!token) {
    alert("Please log in before submitting a report.");
    window.location.href = "login.html";
    return;
  }

  formMessage.textContent = "Submitting...";
  formMessage.className = "message";

  const data = {
    title: form.title.value,
    type: form.type.value,
    category: form.category.value,
    location: form.location.value,
    item_date: form.item_date.value,
    description: form.description.value,
    contact: form.contact.value
  };

  try {
    const response = await fetch("/api/items", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(data)
    });

    const result = await response.json().catch(() => ({}));

    if (response.status === 401) {
      clearSession();
      setLoggedOutUi();
      alert("Your login session expired. Please log in again.");
      window.location.href = "login.html";
      return;
    }

    if (!response.ok) {
      throw new Error(result.message || "Could not submit report.");
    }

    form.reset();
    dateInput.valueAsDate = new Date();

    formMessage.textContent = "Report added successfully.";
    formMessage.className = "message success";

    await loadItems();
  } catch (error) {
    formMessage.textContent = error.message || "Could not submit report.";
    formMessage.className = "message error";
  }
}

async function init() {
  if (dateInput) dateInput.valueAsDate = new Date();
  if (logoutButton) logoutButton.addEventListener("click", logout);
  if (form) form.addEventListener("submit", submitReport);
  if (refreshButton) refreshButton.addEventListener("click", loadItems);

  await validateSession();
  await loadItems();
}

init();