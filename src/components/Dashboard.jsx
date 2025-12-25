import React, { useState, useEffect } from 'react';
import Sidebar from './Sidebar';
import MediaGrid from './MediaGrid';
import UploadModal from './UploadModal';
import { useAuth } from '../context/AuthContext';
import { LogOut, Upload as UploadIcon, Menu } from 'lucide-react';

const Dashboard = () => {
  const { user, logout, githubService } = useAuth();
  const [activeFilter, setActiveFilter] = useState('all'); // all, images, videos, audio
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [files, setFiles] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchFiles = async () => {
    setIsLoading(true);
    try {
      // In a real scenario, we might want to recursively fetch or fetch distinct folders
      // For this simplified version, we'll try to fetch from specific folders or just root if structure is flat.
      // The requirement says: images/, videos/, audio/
      // So we fetch all three directories.
      
      const folders = ['images', 'videos', 'audio'];
      let allFiles = [];

      for (const folder of folders) {
          const folderFiles = await githubService.listFiles(user.owner, user.repo, folder, user.branch);
          // Add type metadata
          const withType = folderFiles.map(f => ({ ...f, mediaType: folder }));
          allFiles = [...allFiles, ...withType];
      }
      
      setFiles(allFiles);
    } catch (error) {
      console.error("Error fetching files:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (user && githubService) {
        fetchFiles();
    }
  }, [user, githubService]);

  const filteredFiles = files.filter(file => {
      const matchesFilter = activeFilter === 'all' || file.mediaType === activeFilter;
      const matchesSearch = file.name.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesFilter && matchesSearch;
  });

  return (
    <div className="flex h-screen bg-gray-900 text-white overflow-hidden">
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
            className="fixed inset-0 bg-black/50 z-20 lg:hidden"
            onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed inset-y-0 left-0 z-30 w-64 bg-gray-800 transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-auto
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <Sidebar 
            activeFilter={activeFilter} 
            setActiveFilter={setActiveFilter} 
            user={user}
        />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Header */}
        <header className="bg-gray-800 border-b border-gray-700 p-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button 
                onClick={() => setIsSidebarOpen(true)}
                className="lg:hidden p-2 hover:bg-gray-700 rounded-lg"
            >
                <Menu className="w-6 h-6" />
            </button>
            <h1 className="text-xl font-bold truncate">
                {user?.repo} <span className="text-gray-400 text-sm font-normal">({user?.branch})</span>
            </h1>
          </div>
          
          <div className="flex items-center gap-3">
             <input 
                type="text" 
                placeholder="Search files..." 
                className="hidden sm:block bg-gray-900 border border-gray-700 rounded-lg py-2 px-4 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
             />
             <button 
                onClick={() => setIsUploadModalOpen(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 text-sm font-medium transition-colors"
                >
                <UploadIcon className="w-4 h-4" />
                <span className="hidden sm:inline">Upload</span>
             </button>
             <button 
                onClick={logout}
                className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
                title="Logout"
             >
                <LogOut className="w-5 h-5" />
             </button>
          </div>
        </header>

        {/* Content Area */}
        <main className="flex-1 overflow-auto p-4 sm:p-6">
            <MediaGrid 
                files={filteredFiles} 
                isLoading={isLoading} 
                onRefresh={fetchFiles}
                user={user}
            />
        </main>
      </div>

      {isUploadModalOpen && (
        <UploadModal 
            onClose={() => setIsUploadModalOpen(false)} 
            onSuccess={() => {
                fetchFiles();
                setIsUploadModalOpen(false);
            }} 
        />
      )}
    </div>
  );
};

export default Dashboard;
