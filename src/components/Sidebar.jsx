import React from 'react';
import { LayoutGrid, Image, Video, Music, Settings } from 'lucide-react';

const Sidebar = ({ activeFilter, setActiveFilter, user }) => {
  const menuItems = [
    { id: 'all', label: 'All Media', icon: LayoutGrid },
    { id: 'images', label: 'Images', icon: Image },
    { id: 'videos', label: 'Videos', icon: Video },
    { id: 'audio', label: 'Audio', icon: Music },
  ];

  return (
    <div className="flex flex-col h-full border-r border-gray-700">
      <div className="p-6">
        <div className="flex items-center gap-3 px-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center font-bold text-white">
                M
            </div>
            <span className="font-bold text-lg tracking-tight">MediaManager</span>
        </div>
      </div>

      <nav className="flex-1 px-4 space-y-1">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeFilter === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveFilter(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                isActive 
                  ? 'bg-blue-600/10 text-blue-400 font-medium' 
                  : 'text-gray-400 hover:bg-gray-800 hover:text-white'
              }`}
            >
              <Icon className={`w-5 h-5 ${isActive ? 'text-blue-400' : ''}`} />
              {item.label}
            </button>
          );
        })}
      </nav>

      <div className="p-4 border-t border-gray-700">
        <div className="px-4 py-3 rounded-xl bg-gray-800/50 border border-gray-700">
            <div className="text-xs text-gray-500 mb-1">Connected as</div>
            <div className="text-sm font-medium text-white truncate">@{user?.owner}</div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
