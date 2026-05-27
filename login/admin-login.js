// admin-login.js
const storeCredentials = {
  xiaoyun: "1234",
  goldenbowl: "5678",
  wokroll: "9012",
  boba: "3456",
  greenbowl: "7890"
};

function login() {
  const username = document.getElementById("username").value.trim().toLowerCase();
  const password = document.getElementById("password").value;
  const errorEl = document.getElementById("error");

  if (storeCredentials[username] === password) {
    localStorage.setItem("adminLoggedIn", "true");
    localStorage.setItem("loggedInStore", username);
    window.location.href = "/restaurant.html";
  } else {
    errorEl.textContent = "Wrong Username or Password";
    errorEl.classList.add("show");
    document.getElementById("password").value = "";
  }
}

// Allow Enter key to submit
document.addEventListener("keydown", (e) => {
  if (e.key === "Enter" && window.location.pathname.includes("admin-login")) {
    login();
  }
});