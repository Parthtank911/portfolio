/**
 * GitHub API Service Module
 * 
 * Fetches dynamic repository and profile data from the public GitHub REST API.
 * Handles sorting, filtering of forks, explicit exclusions, limit constraint,
 * and merges in manual custom projects when provided.
 */

/**
 * Fetches profile stats and repository list for the given GitHub username.
 * @param {string} username The GitHub username to query.
 * @param {Object} overrideConfig Configuration object from projects-override.json.
 * @returns {Promise<{profile: Object|null, repos: Array}>}
 */
export async function fetchGithubData(username, overrideConfig = {}) {
  const {
    sortBy = "updated",
    excludeForks = true,
    excludeRepos = [],
    limit = 6,
    customProjects = []
  } = overrideConfig;

  let profile = null;
  let repos = [];

  try {
    // Run fetches in parallel for optimal performance
    const [profileRes, reposRes] = await Promise.all([
      fetch(`https://api.github.com/users/${username}`),
      fetch(`https://api.github.com/users/${username}/repos?per_page=100`)
    ]);

    if (profileRes.ok) {
      profile = await profileRes.json();
    } else {
      console.warn(`GitHub Profile API returned status: ${profileRes.status}`);
    }

    if (reposRes.ok) {
      const rawRepos = await reposRes.json();
      
      // 1. Filter forks and explicitly excluded repositories
      let filteredRepos = rawRepos.filter(repo => {
        if (excludeForks && repo.fork) return false;
        if (excludeRepos.includes(repo.name)) return false;
        return true;
      });

      // 2. Map standard GitHub properties to a consistent internal format
      repos = filteredRepos.map(repo => ({
        name: repo.name,
        description: repo.description || "No description provided.",
        language: repo.language || "Markdown",
        stars: repo.stargazers_count,
        updated_at: repo.updated_at,
        html_url: repo.html_url
      }));
    } else {
      console.warn(`GitHub Repos API returned status: ${reposRes.status}`);
    }
  } catch (error) {
    console.error("Error fetching from GitHub API:", error);
    // If the API call fails or is rate-limited, we proceed with null values
    // and rely on our custom/static projects fallback.
  }

  // 3. Integrate custom manual projects from config
  if (Array.isArray(customProjects)) {
    const normalizedCustom = customProjects.map(proj => ({
      name: proj.name,
      description: proj.description || "No description provided.",
      language: proj.language || "JavaScript",
      stars: proj.stars || 0,
      updated_at: proj.updated_at || new Date().toISOString(),
      html_url: proj.html_url || "#"
    }));
    repos = [...repos, ...normalizedCustom];
  }

  // 4. Perform Sorting
  repos.sort((a, b) => {
    if (sortBy === "stars") {
      return b.stars - a.stars;
    } else if (sortBy === "created") {
      return new Date(b.created_at || 0) - new Date(a.created_at || 0);
    } else { // default: updated
      return new Date(b.updated_at || 0) - new Date(a.updated_at || 0);
    }
  });

  // 5. Apply limit constraint
  repos = repos.slice(0, limit);

  return { profile, repos };
}
