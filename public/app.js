const form = document.querySelector("#report-form");
const formMessage = document.querySelector("#form-message");
const itemsList = document.querySelector("#items-list");
const itemsStatus = document.querySelector("#items-status");
const refreshButton = document.querySelector("#refresh-button");
const dateInput = document.querySelector("#item_date");


function formatDate(dateValue) {
  const date = new Date(`${dateValue}T00:00:00`);


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
