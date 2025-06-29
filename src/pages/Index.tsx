
import { useState } from "react";
import Navigation from "@/components/Navigation";
import UnifiedSunClock from "@/components/UnifiedSunClock";
import { Link } from "react-router-dom";

const Index = () => {
  const [activeTab, setActiveTab] = useState<'home' | 'stats' | 'about'>('home');
  const [currentTime] = useState(new Date());

  return (
    <div className="min-h-screen">
      <UnifiedSunClock />
      <Navigation 
        activeTab={activeTab}
        onTabChange={setActiveTab}
        currentTime={currentTime}
      />
      
      {/* UV Mockup Test Link */}
      <div className="fixed top-4 right-4 z-50">
        <Link 
          to="/uv-mockup" 
          className="bg-purple-600 text-white px-3 py-2 rounded-lg text-sm hover:bg-purple-700 transition-colors"
        >
          UV Test
        </Link>
      </div>
    </div>
  );
};

export default Index;
