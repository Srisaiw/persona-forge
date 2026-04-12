const userContainer = document.getElementById("userContainer");
const loading = document.getElementById("loading");
const error = document.getElementById("error");
const emptyState = document.getElementById("emptyState");

const generateBtn = document.getElementById("generateBtn");
const searchInput = document.getElementById("searchInput");
const nationalityFilter = document.getElementById("nationalityFilter");
const ageSort = document.getElementById("ageSort");
const themeToggle = document.getElementById("themeToggle");

const API_URL = "https://randomuser.me/api/?results=20";

let allUsers = [];
let favoriteUsers = JSON.parse(localStorage.getItem("favoriteUsers")) || [];
let darkMode = JSON.parse(localStorage.getItem("darkMode")) || false;

async function fetchUsers() {
  showLoading();
  hideError();
  hideEmpty();
  userContainer.innerHTML = "";

  try {
    const response = await fetch(API_URL);

    if (!response.ok) {
      throw new Error("Failed to fetch users");
    }

    const data = await response.json();
    allUsers = data.results;
    populateNationalityOptions(allUsers);
    applyFiltersAndRender();
  } catch (err) {
    showError();
    console.error(err);
  } finally {
    hideLoading();
  }
}

function populateNationalityOptions(users) {
  const nationalities = [...new Set(users.map((user) => user.nat))].sort();

  nationalityFilter.innerHTML = `
    <option value="all">All Nationalities</option>
    ${nationalities
      .map((nat) => `<option value="${nat}">${nat}</option>`)
      .join("")}
  `;
}

function applyFiltersAndRender() {
  const searchValue = searchInput.value.trim().toLowerCase();
  const selectedNationality = nationalityFilter.value;
  const sortValue = ageSort.value;

  let filteredUsers = allUsers.filter((user) => {
    const fullName = `${user.name.first} ${user.name.last}`.toLowerCase();
    const country = user.location.country.toLowerCase();

    const matchesSearch =
      fullName.includes(searchValue) || country.includes(searchValue);

    const matchesNationality =
      selectedNationality === "all" || user.nat === selectedNationality;

    return matchesSearch && matchesNationality;
  });

  if (sortValue === "asc") {
    filteredUsers = [...filteredUsers].sort((a, b) => a.dob.age - b.dob.age);
  } else if (sortValue === "desc") {
    filteredUsers = [...filteredUsers].sort((a, b) => b.dob.age - a.dob.age);
  }

  renderUsers(filteredUsers);
}

function renderUsers(users) {
  if (users.length === 0) {
    userContainer.innerHTML = "";
    showEmpty();
    return;
  }

  hideEmpty();

  userContainer.innerHTML = users
    .map((user) => {
      const userId = user.login.uuid;
      const isFavorite = favoriteUsers.find((fav) => fav.login.uuid === userId);
      const isDetailsOpen = user.showDetails || false;

      return `
        <div class="user-card">
          <img
            class="user-image"
            src="${user.picture.large}"
            alt="${user.name.first} ${user.name.last}"
          />
          <div class="user-content">
            <h2>${user.name.first} ${user.name.last}</h2>
            <p><span class="label">Age:</span> ${user.dob.age}</p>
            <p><span class="label">Gender:</span> ${user.gender}</p>
            <p><span class="label">Country:</span> ${user.location.country}</p>
            <p><span class="label">Nationality:</span> ${user.nat}</p>

            <div class="card-actions">
              <button
                class="favorite-btn ${isFavorite ? "active" : ""}"
                onclick="toggleFavorite('${userId}')"
              >
                ${isFavorite ? "❤️ Favorited" : "🤍 Favorite"}
              </button>

              <button class="view-btn" onclick="toggleDetails('${userId}')">
                ${isDetailsOpen ? "Hide Details" : "View More"}
              </button>
            </div>

            ${
              isDetailsOpen
                ? `
                <div class="extra-details">
                  <p><span class="label">Email:</span> ${user.email}</p>
                  <p><span class="label">Phone:</span> ${user.phone}</p>
                  <p><span class="label">City:</span> ${user.location.city}</p>
                  <p><span class="label">Username:</span> ${user.login.username}</p>
                </div>
              `
                : ""
            }
          </div>
        </div>
      `;
    })
    .join("");
}

function toggleFavorite(userId) {
  const selectedUser = allUsers.find((user) => user.login.uuid === userId);

  if (!selectedUser) return;

  const alreadyFavorite = favoriteUsers.find((fav) => fav.login.uuid === userId);

  if (alreadyFavorite) {
    favoriteUsers = favoriteUsers.filter((fav) => fav.login.uuid !== userId);
  } else {
    favoriteUsers = [...favoriteUsers, selectedUser];
  }

  localStorage.setItem("favoriteUsers", JSON.stringify(favoriteUsers));
  applyFiltersAndRender();
}

function toggleDetails(userId) {
  allUsers = allUsers.map((user) => {
    if (user.login.uuid === userId) {
      return { ...user, showDetails: !user.showDetails };
    }
    return user;
  });

  applyFiltersAndRender();
}

function applySavedTheme() {
  if (darkMode) {
    document.body.classList.add("dark");
    themeToggle.textContent = "☀️ Light Mode";
  } else {
    document.body.classList.remove("dark");
    themeToggle.textContent = "🌙 Dark Mode";
  }
}

function toggleTheme() {
  darkMode = !darkMode;
  localStorage.setItem("darkMode", JSON.stringify(darkMode));
  applySavedTheme();
}

function showLoading() {
  loading.classList.remove("hidden");
}

function hideLoading() {
  loading.classList.add("hidden");
}

function showError() {
  error.classList.remove("hidden");
}

function hideError() {
  error.classList.add("hidden");
}

function showEmpty() {
  emptyState.classList.remove("hidden");
}

function hideEmpty() {
  emptyState.classList.add("hidden");
}

searchInput.addEventListener("input", applyFiltersAndRender);
nationalityFilter.addEventListener("change", applyFiltersAndRender);
ageSort.addEventListener("change", applyFiltersAndRender);
generateBtn.addEventListener("click", fetchUsers);
themeToggle.addEventListener("click", toggleTheme);

applySavedTheme();
fetchUsers();