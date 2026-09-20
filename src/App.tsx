import React from 'react';
import { useSignMindStore } from './store/useSignMindStore';
import { Header } from './components/Header';
import { BottomNav } from './components/BottomNav';
import { HomeDashboard } from './components/HomeDashboard';
import { JourneyMap } from './components/JourneyMap';
import { PracticeStudio } from './components/PracticeStudio';
import { MissionsView } from './components/MissionsView';
import { SignDNAView } from './components/SignDNAView';
import { ProfileView } from './components/ProfileView';

export const App: React.FC = () => {
  const { activeTab } = useSignMindStore();

  return (
    <div className="min-h-screen bg-background font-body-md text-on-surface relative selection:bg-primary-container selection:text-on-primary-container pb-24 xl:pb-12">
      {/* Global Ambient Radial Glow Matching Stitch */}
      <div className="fixed inset-0 pointer-events-none z-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_-20%,rgba(0,245,160,0.08),rgba(15,19,28,0))]"></div>

      {/* Top Fixed Header */}
      <Header />

      {/* Main Dynamic Viewport */}
      <main className="relative w-full pt-0 xl:pt-20 bg-transparent min-h-screen">
        {activeTab === 'home' && <HomeDashboard />}
        {activeTab === 'journey' && <JourneyMap />}
        {activeTab === 'practice' && <PracticeStudio />}
        {activeTab === 'missions' && <MissionsView />}
        {activeTab === 'signdna' && <SignDNAView />}
        {activeTab === 'profile' && <ProfileView />}
      </main>

      {/* Persistent Bottom Navigation for Mobile */}
      <BottomNav />
    </div>
  );
};

export default App;
