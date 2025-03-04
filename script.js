const APIURL = "https://api.github.com/users/";
const REPOS_PER_PAGE = 5;

const main = document.querySelector("#main");
const searchBox = document.querySelector("#search");

// Show loading spinner
const showLoading = () => {
    main.innerHTML = `
        <div class="loading">
            <i class="fas fa-spinner fa-spin"></i>
            <p>Loading...</p>
        </div>
    `;
};

// Show error message
const showError = (message) => {
    main.innerHTML = `
        <div class="error">
            <h2>Error</h2>
            <p>${message}</p>
        </div>
    `;
};

// Create user card
const createUserCard = (user) => {
    return `
        <div class="card">
            <div>
                <img class="avatar" src="${user.avatar_url}" alt="${user.name || user.login}">
            </div>
            <div class="user-info">
                <h2>${user.name || user.login}</h2>
                <p>${user.bio || 'No bio available'}</p>
                
                <ul class="info">
                    <li><i class="fas fa-users"></i> ${user.followers} <strong>Followers</strong></li>
                    <li><i class="fas fa-user-plus"></i> ${user.following} <strong>Following</strong></li>
                    <li><i class="fas fa-code-branch"></i> ${user.public_repos} <strong>Repos</strong></li>
                </ul>

                <div id="repos"></div>
            </div>
        </div>
    `;
};

// Add repos to card
const addReposToCard = (repos) => {
    const reposEl = document.getElementById("repos");
    repos
        .slice(0, REPOS_PER_PAGE)
        .forEach(repo => {
            const repoEl = document.createElement("a");
            repoEl.classList.add("repo");
            repoEl.href = repo.html_url;
            repoEl.target = "_blank";
            repoEl.innerHTML = `
                <h3>${repo.name}</h3>
                <p>${repo.description || 'No description available'}</p>
                <span>
                    <i class="fas fa-star"></i> ${repo.stargazers_count}
                    <i class="fas fa-code-branch"></i> ${repo.forks_count}
                </span>
            `;
            reposEl.appendChild(repoEl);
        });
};

// Get user repos
const getRepos = async (username) => {
    try {
        const response = await fetch(`${APIURL}${username}/repos?sort=created&per_page=${REPOS_PER_PAGE}`);
        if (!response.ok) throw new Error('Problem fetching repos');
        return await response.json();
    } catch (error) {
        showError('Problem fetching repos');
        return [];
    }
};

// Get user data
const getUser = async (username) => {
    if (!username) return;
    
    showLoading();
    
    try {
        const response = await fetch(APIURL + username);
        if (!response.ok) {
            throw new Error(
                response.status === 404 
                    ? 'No profile with this username' 
                    : 'Problem fetching data'
            );
        }
        
        const userData = await response.json();
        main.innerHTML = createUserCard(userData);
        
        const repos = await getRepos(username);
        addReposToCard(repos);
        
    } catch (error) {
        showError(error.message);
    }
};

// Event listeners
searchBox.addEventListener("input", debounce((e) => {
    const username = e.target.value.trim();
    if (username) getUser(username);
}, 500));

searchBox.addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
        const username = e.target.value.trim();
        if (username) getUser(username);
    }
});

// Debounce helper
function debounce(func, delay) {
    let timeoutId;
    return (...args) => {
        if (timeoutId) clearTimeout(timeoutId);
        timeoutId = setTimeout(() => func.apply(this, args), delay);
    };
}

