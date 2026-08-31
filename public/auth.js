function showMessage(text, type = "") {
  const message =
    document.getElementById("auth-message");

  if (!message) {
    return;
  }

  message.textContent = text;

  message.className =
    type
      ? `message ${type}`
      : "message";
}

function saveSession(data) {
  if (
    !data ||
    !data.token ||
    !data.username
  ) {
    throw new Error(
      "The server returned an invalid login response."
    );
  }

  localStorage.setItem(
    "token",
    data.token
  );

  localStorage.setItem(
    "username",
    data.username
  );
}

async function readJson(response) {
  const text =
    await response.text();

  if (!text) {
    return {};
  }

  try {
    return JSON.parse(text);
  } catch (error) {
    return {};
  }
}

async function login(event) {
  event.preventDefault();

  const form =
    event.currentTarget;

  const button =
    form.querySelector(
      'button[type="submit"]'
    );

  const email =
    document
      .getElementById("email")
      .value
      .trim();

  const password =
    document
      .getElementById("password")
      .value;

  showMessage("Logging in...");

  button.disabled = true;

  try {
    const response =
      await fetch(
        "/api/auth/login",
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json"
          },

          body: JSON.stringify({
            email,
            password
          })
        }
      );

    const data =
      await readJson(response);

    if (!response.ok) {
      throw new Error(
        data.message ||
        "Login failed."
      );
    }

    saveSession(data);

    window.location.href =
      "index.html";
  } catch (error) {
    showMessage(
      error.message ||
        "Could not connect to the server.",
      "error"
    );

    button.disabled = false;
  }
}

async function signup(event) {
  event.preventDefault();

  const form =
    event.currentTarget;

  const button =
    form.querySelector(
      'button[type="submit"]'
    );

  const username =
    document
      .getElementById("username")
      .value
      .trim();

  const email =
    document
      .getElementById("email")
      .value
      .trim();

  const password =
    document
      .getElementById("password")
      .value;

  showMessage(
    "Creating account..."
  );

  button.disabled = true;

  try {
    const response =
      await fetch(
        "/api/auth/signup",
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json"
          },

          body:
            JSON.stringify({
              username,
              email,
              password
            })
        }
      );

    const data =
      await readJson(response);

    if (!response.ok) {
      throw new Error(
        data.message ||
        "Signup failed."
      );
    }

    saveSession(data);

    window.location.href =
      "index.html";
  } catch (error) {
    showMessage(
      error.message ||
        "Could not connect to the server.",
      "error"
    );

    button.disabled = false;
  }
}

const loginForm =
  document.getElementById(
    "login-form"
  );

const signupForm =
  document.getElementById(
    "signup-form"
  );

if (loginForm) {
  loginForm.addEventListener(
    "submit",
    login
  );
}

if (signupForm) {
  signupForm.addEventListener(
    "submit",
    signup
  );
}