
import React, { useState, useEffect } from 'react';
import UnifiedSunClock from "@/components/UnifiedSunClock";
import StatsPage from "@/components/StatsPage";
import AboutPage from "@/components/AboutPage";
import Navigation from "@/components/Navigation";

const Index = () => {
  const [activeTab, setActiveTab] = useState<'home' | 'stats' | 'about'>('home');
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const renderCurrentPage = () => {
    switch (activeTab) {
      case 'home':
        return <UnifiedSunClock currentTime={currentTime} />;
      case 'stats':
        return <StatsPage currentTime={currentTime} />;
      case 'about':
        return <AboutPage currentTime={currentTime} />;
      default:
        return <UnifiedSunClock currentTime={currentTime} />;
    }
  };

  return (
    <div className="relative min-h-screen">
      {renderCurrentPage()}
      <Navigation 
        activeTab={activeTab} 
        onTabChange={setActiveTab} 
        currentTime={currentTime}
      />
    </div>
  );
};

export default Index;
