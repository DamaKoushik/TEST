import { Octokit } from "octokit";
// Polyfill Buffer for browser environment if needed, though Vite usually handles it or we use native APIs
if (typeof window !== 'undefined') {
  // window.Buffer = Buffer; // Unnecessary for this implementation
}


export class GithubService {
  constructor(token) {
    this.octokit = new Octokit({
      auth: token,
    });
  }

  async testConnection(owner, repo) {
    try {
        const { data } = await this.octokit.rest.repos.get({
            owner,
            repo,
        });
        return { success: true, data };
    } catch (error) {
        console.error("Connection failed:", error);
        throw error;
    }
  }

  async getFile(owner, repo, path, branch = 'main') {
    try {
        const response = await this.octokit.rest.repos.getContent({
            owner,
            repo,
            path,
            ref: branch,
        });
        return response.data;
    } catch (error) {
        console.error("Error fetching file:", error);
        throw error;
    }
  }

  async listFiles(owner, repo, path, branch = 'main') {
      try {
          // GitHub API returns content of directory
          const response = await this.octokit.rest.repos.getContent({
              owner,
              repo,
              path,
              ref: branch,
          });
          return Array.isArray(response.data) ? response.data : [];
      } catch (error) {
          // If 404, it might mean the directory doesn't exist yet, which is fine
          if (error.status === 404) return [];
          throw error;
      }
  }

  async uploadFile(owner, repo, path, fileContent, message, branch = 'main') {
    // fileContent should be base64 string
    // Check if file exists to get SHA
    let sha;
    try {
        const existing = await this.getFile(owner, repo, path, branch);
        if (!Array.isArray(existing)) {
            sha = existing.sha;
        }
    } catch (e) {
        // File doesn't exist, proceed
    }

    try {
        const response = await this.octokit.rest.repos.createOrUpdateFileContents({
            owner,
            repo,
            path,
            message,
            content: fileContent,
            branch,
            sha, // Include SHA if updating
        });
        return response.data;
    } catch (error) {
        console.error("Upload failed:", error);
        throw error;
    }
  }

  async deleteFile(owner, repo, path, message, branch = 'main') {
      try {
          const currentFile = await this.getFile(owner, repo, path, branch);
          const sha = currentFile.sha;
          
          const response = await this.octokit.rest.repos.deleteFile({
              owner,
              repo,
              path,
              message,
              sha,
              branch,
          });
          return response.data;
      } catch (error) {
          console.error("Delete failed:", error);
          throw error;
      }
  }
}
