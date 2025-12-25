import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Github, Key, FolderGit2, AlertCircle } from 'lucide-react';

const Login = () => {
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    token: '',
    owner: '',
    repo: '',
    branch: 'main'
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await login(formData.token, formData.owner, formData.repo, formData.branch);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
      <div className="bg-gray-800 p-8 rounded-2xl shadow-xl w-full max-w-md border border-gray-700">
        <div className="text-center mb-8">
          <div className="bg-blue-600/20 p-4 rounded-full w-20 h-20 mx-auto flex items-center justify-center mb-4">
            <Github className="w-10 h-10 text-blue-500" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Media Manager</h1>
          <p className="text-gray-400">Connect to your GitHub Repository</p>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/50 text-red-500 p-4 rounded-lg mb-6 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <p className="text-sm">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">
              Personal Access Token
            </label>
            <div className="relative">
              <Key className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
              <input
                type="password"
                name="token"
                value={formData.token}
                onChange={handleChange}
                className="w-full bg-gray-900 border border-gray-700 rounded-lg py-3 pl-10 pr-4 text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                placeholder="ghp_..."
                required
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">Requires 'repo' scope</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">
                Owner/User
              </label>
              <input
                type="text"
                name="owner"
                value={formData.owner}
                onChange={handleChange}
                className="w-full bg-gray-900 border border-gray-700 rounded-lg py-3 px-4 text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                placeholder="username"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">
                Repository
              </label>
              <input
                type="text"
                name="repo"
                value={formData.repo}
                onChange={handleChange}
                className="w-full bg-gray-900 border border-gray-700 rounded-lg py-3 px-4 text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                placeholder="repo-name"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">
              Branch (Optional)
            </label>
            <div className="relative">
              <FolderGit2 className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
              <input
                type="text"
                name="branch"
                value={formData.branch}
                onChange={handleChange}
                className="w-full bg-gray-900 border border-gray-700 rounded-lg py-3 pl-10 pr-4 text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                placeholder="main"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className={`w-full py-3 px-4 rounded-lg font-medium text-white transition-all ${
              isLoading
                ? 'bg-blue-600/50 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700 active:transform active:scale-[0.98]'
            }`}
          >
            {isLoading ? 'Connecting...' : 'Connect Repository'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
