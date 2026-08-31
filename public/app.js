const username = localStorage.getItem("username");

const welcome = document.getElementById("welcome");

if (username && welcome) {
  welcome.textContent = "Welcome " + username;
}

const form = document.querySelector("#report-form");
const formMessage = document.querySelector("#form-message");
const itemsList = document.querySelector("#items-list");
const itemsStatus = document.querySelector("#items-status");
const refreshButton = document.querySelector("#refresh-button");
const dateInput = document.querySelector("#item_date");

function formatDate(dateValue) {
  if (!dateValue) {
    return "No date";
  }

  const dateOnly = String(dateValue).slice(0, 10);
  const [year, month, day] = dateOnly.split("-").map(Number);

  const date = new Date(year, month - 1, day);

  return date.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric"
  });
}

function createTextElement(tag, className, text) {
  const element = document.createElement(tag);

  if (className) {
    element.className = className;
  }

  element.textContent = text;
  return element;U 
}

function createItemCard(item) {
  const article = document.createElement("article");
  article.className = `item-card${item.resolved ? " resolved" : ""}`;

  const topRow = document.createElement("div");
  topRow.className = "item-top-row";

  const typeBadge = createTextElement(
    "span",
    `badge ${item.type}`,
    item.type.toUpperCase()
  );

  const statusBadge = createTextElement(
    "span",
    `status-badge ${item.resolved ? "done" : "open"}`,
    item.resolved ? "RESOLVED" : "OPEN"
  );

  topRow.append(typeBadge, statusBadge);

  const title = createTextElement("h3", "", item.title);
  const meta = createTextElement(
    "p",
    "item-meta",
    `${item.category} · ${item.location} · ${formatDate(item.item_date)}`
  );
  const description = createTextElement("p", "item-description", item.description);
  const contact = createTextElement("p", "item-contact", `Contact: ${item.contact}`);

  article.append(topRow, title, meta, description, contact);

  if (!item.resolved) {
    const resolveButton = createTextElement("button", "button small secondary", "Mark as resolved");
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

    if (!response.ok) {
      throw new Error("Could not load reports.");
    }

    const items = await response.json();

    if (items.length === 0) {
      itemsStatus.textContent = "No reports yet. Add the first one above.";
      return;
    }

    itemsStatus.textContent = `${items.length} report${items.length === 1 ? "" : "s"}`;

    for (const item of items) {
      itemsList.append(createItemCard(item));
    }
  } catch (error) {
    itemsStatus.textContent = "Could not load reports. Check the server and database connection.";
  }
}

async function resolveItem(id, button) {
  button.disabled = true;
  button.textContent = "Updating...";

  try {
    const response = await fetch(`/api/items/${id}/resolve`, {
      method: "PATCH"
    });

    if (!response.ok) {
      throw new Error("Could not update report.");
    }

    await loadItems();
  } catch (error) {
    button.disabled = false;
    button.textContent = "Mark as resolved";
    itemsStatus.textContent = "Could not update the report. Please try again.";
  }
}

form.addEventListener("submit", async (event) => {
  event.preventDefault();
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
        "Content-Type": "application/json"
      },
      body: JSON.stringify(data)
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || "Could not submit report.");
    }

    form.reset();
    dateInput.valueAsDate = new Date();
    formMessage.textContent = "Report added successfully.";
    formMessage.className = "message success";
    await loadItems();
  } catch (error) {
    formMessage.textContent = error.message;
    formMessage.className = "message error";
  }
});

refreshButton.addEventListener("click", loadItems);

dateInput.valueAsDate = new Date();
loadItems();
