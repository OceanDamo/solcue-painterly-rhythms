
import React, { useState } from 'react';
import SolCue from "@/components/SolCue";
import StatsView from "@/components/StatsView";
import TabNavigation from "@/components/TabNavigation";

const Index = () => {
  const [activeTab, setActiveTab] = useState<'home' | 'stats'>('home');

  return (
    <div className="relative">
      {activeTab === 'home' ? <SolCue /> : <StatsView />}
      <TabNavigation activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  );
};

export default Index;
