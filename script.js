const userContainer = document.getElementById("userContainer");
const loading = document.getElementById("loading");
const error = document.getElementById("error");
const generateBtn = document.getElementById("generateBtn");

const API_URL = "https://randomuser.me/api/?results=12";

async function fetchUsers() {
  showLoading();
  hideError();
  userContainer.innerHTML = "";

  try {
    const response = await fetch(API_URL);

    if (!response.ok) {
      throw new Error("Failed to fetch users");
    }

    const data = await response.json();
    displayUsers(data.results);
  } catch (err) {
    showError();
    console.error(err);
  } finally {
    hideLoading();
  }
}

function displayUsers(users) {
  userContainer.innerHTML = users
    .map((user) => {
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
            <p><span class="label">Email:</span> ${user.email}</p>
          </div>
        </div>
      `;
    })
    .join("");
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

generateBtn.addEventListener("click", fetchUsers);

fetchUsers();