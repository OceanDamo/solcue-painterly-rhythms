
import React from 'react';
import { SolCueLogo1, SolCueLogo2, SolCueLogo3 } from './logos';

const LogoShowcase: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-black p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold text-white text-center mb-12">
          SolCue Logo Variations
        </h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Logo 1 - Classic */}
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20">
            <h2 className="text-xl font-semibold text-white mb-4 text-center">Classic</h2>
            <div className="flex justify-center">
              <SolCueLogo1 width={320} height={240} />
            </div>
          </div>
          
          {/* Logo 2 - Minimalist */}
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20">
            <h2 className="text-xl font-semibold text-white mb-4 text-center">Minimalist</h2>
            <div className="flex justify-center">
              <SolCueLogo2 width={320} height={240} />
            </div>
          </div>
          
          {/* Logo 3 - Circular Badge */}
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20">
            <h2 className="text-xl font-semibold text-white mb-4 text-center">Circular Badge</h2>
            <div className="flex justify-center">
              <SolCueLogo3 width={320} height={260} />
            </div>
          </div>
        </div>
        
        {/* Size Variations */}
        <div className="mt-16">
          <h2 className="text-2xl font-bold text-white text-center mb-8">Size Variations</h2>
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center">
              <div className="text-center">
                <p className="text-white mb-4">Small (150x100)</p>
                <SolCueLogo1 width={150} height={100} />
              </div>
              <div className="text-center">
                <p className="text-white mb-4">Medium (300x200)</p>
                <SolCueLogo1 width={300} height={200} />
              </div>
              <div className="text-center">
                <p className="text-white mb-4">Large (450x300)</p>
                <SolCueLogo1 width={450} height={300} />
              </div>
            </div>
          </div>
        </div>
        
        {/* Dark/Light Background Test */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-white rounded-2xl p-8">
            <h3 className="text-xl font-semibold text-gray-800 mb-4 text-center">Light Background</h3>
            <div className="flex justify-center">
              <SolCueLogo2 width={280} height={200} />
            </div>
          </div>
          <div className="bg-black rounded-2xl p-8">
            <h3 className="text-xl font-semibold text-white mb-4 text-center">Dark Background</h3>
            <div className="flex justify-center">
              <SolCueLogo2 width={280} height={200} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LogoShowcase;
