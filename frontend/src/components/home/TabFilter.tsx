import React from 'react';
import { gsap } from 'gsap';
import { Flip } from 'gsap/Flip';
import { useGSAP } from '@gsap/react';

gsap.registerPlugin(Flip);

interface TabFilterProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const TabFilter: React.FC<TabFilterProps> = ({ activeTab, setActiveTab }) => {
  const tabs = [
    { id: 'all', label: 'Trending', icon: '🔥' },
    { id: 'new', label: 'Newest', icon: '🆕' },
    { id: 'graduated', label: 'Graduated', icon: '🎓' },
    { id: 'following', label: 'Following', icon: '⭐' },
  ];

  const handleTabClick = (tabId: string) => {
    if (tabId === activeTab) return;
    setActiveTab(tabId);
  };

  useGSAP(() => {
    const state = Flip.getState('.tab-bg');
    Flip.from(state, { 
      duration: 0.3, 
      ease: 'power2.out',
      absolute: true
    });
  }, [activeTab]);

  return (
    <div className="flex items-center gap-2 bg-surface/50 p-1.5 rounded-2xl border border-white/5">
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => handleTabClick(tab.id)}
            className={`relative px-5 py-2.5 rounded-xl flex items-center gap-2 transition-colors duration-300 ${
              isActive ? 'text-white' : 'text-white/40 hover:text-white/60'
            }`}
          >
            {isActive && (
              <div className="tab-bg absolute inset-0 bg-primary/20 border border-primary/50 rounded-xl" />
            )}
            <span className="text-xs">{tab.icon}</span>
            <span className="text-sm font-display font-bold uppercase tracking-wider">
              {tab.label}
            </span>
          </button>
        );
      })}
    </div>
  );
};

export default TabFilter;
