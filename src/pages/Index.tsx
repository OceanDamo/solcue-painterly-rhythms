
import { useState } from "react";
import Navigation from "@/components/Navigation";
import UnifiedSunClock from "@/components/UnifiedSunClock";
import StatsPage from "@/components/StatsPage";
import AboutPage from "@/components/AboutPage";

const Index = () => {
  const [activeTab, setActiveTab] = useState<'home' | 'stats' | 'about'>('home');
  const [currentTime] = useState(new Date());

  return (
    <div className="min-h-screen">
      {activeTab === 'home' && <UnifiedSunClock />}
      {activeTab === 'stats' && <StatsPage currentTime={currentTime} />}
      {activeTab === 'about' && <AboutPage currentTime={currentTime} />}
      <Navigation
        activeTab={activeTab}
        onTabChange={setActiveTab}
        currentTime={currentTime}
      />
    </div>
  );
};

export default Index;
