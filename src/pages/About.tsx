
import React from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';

const About = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 p-6">
      <ScrollArea className="h-full">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-5xl font-light text-white mb-4 tracking-wide">
              SolCue
            </h1>
            <p className="text-xl text-blue-200 font-light tracking-wider">
              A Sacred Practice of Natural Attunement
            </p>
          </div>

          {/* Philosophy Section */}
          <div className="bg-white/10 backdrop-blur-md rounded-3xl p-8 mb-8 border border-white/20">
            <h2 className="text-2xl font-light text-white mb-6 text-center">
              The Sacred Art of Solar Alignment
            </h2>
            <div className="text-lg text-white/90 leading-relaxed space-y-6 font-light">
              <p>
                SolCue is not a health app. It is not a tracker. It is a living artwork 
                that helps you remember what your body already knows: the ancient rhythm 
                of light and dark that has guided life on Earth for billions of years.
              </p>
              <p>
                We have forgotten how to listen to the sun's whispers, how to feel the 
                subtle invitation of dawn, the gentle calling of dusk. This is an 
                invitation back to that knowing—a way of being that expands consciousness 
                through the simplest, most profound practice: being present with light.
              </p>
              <p>
                When we align with nature's timing, we don't just optimize our biology. 
                We remember our place in the larger dance of existence. We become more 
                than human—we become participants in the cosmic rhythm that moves through 
                all things.
              </p>
            </div>
          </div>

          {/* The Practice Section */}
          <div className="bg-white/10 backdrop-blur-md rounded-3xl p-8 mb-8 border border-white/20">
            <h2 className="text-2xl font-light text-white mb-6 text-center">
              The Practice
            </h2>
            <div className="text-lg text-white/90 leading-relaxed space-y-6 font-light">
              <p>
                SolCue offers sacred windows—extended moments when the light is most 
                medicine, most invitation. These aren't rigid schedules but gentle 
                suggestions from the cosmos itself.
              </p>
              <p>
                Dawn expands for 2 hours and 15 minutes around sunrise. Dusk flows 
                for the same sacred duration around sunset. These are not constraints 
                but spacious invitations to witness the day's most transformative moments.
              </p>
              <p>
                Simply being present with this light—whether for 5 minutes or an hour—
                begins to attune your entire being to rhythms older than civilization, 
                deeper than thought.
              </p>
            </div>
          </div>

          {/* Ocean State of Mind */}
          <div className="bg-white/10 backdrop-blur-md rounded-3xl p-8 mb-8 border border-white/20">
            <h2 className="text-2xl font-light text-white mb-6 text-center">
              Ocean State of Mind
            </h2>
            <div className="text-lg text-white/90 leading-relaxed space-y-6 font-light">
              <p>
                Created by Damian Ewens, a guide who has spent years learning from the 
                ocean's wisdom. The Ocean State of Mind philosophy recognizes that the 
                most powerful medicine is nature itself—not as something to consume, 
                but as something to commune with.
              </p>
              <p>
                Through 1:1 Flow Coaching, Ocean-Based Rewilding Adventures, and Corporate 
                Wellness Retreats, we help people remember their innate connection to 
                natural rhythms. SolCue extends this practice into daily life.
              </p>
              <div className="text-center mt-8">
                <button
                  onClick={() => window.open('https://OceanStateofMind.blue', '_blank')}
                  className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white px-8 py-3 rounded-full font-light tracking-wide transition-all duration-300 shadow-lg hover:shadow-xl"
                >
                  Explore Ocean State of Mind
                </button>
              </div>
            </div>
          </div>

          {/* How to Use */}
          <div className="bg-white/10 backdrop-blur-md rounded-3xl p-8 mb-8 border border-white/20">
            <h2 className="text-2xl font-light text-white mb-6 text-center">
              How to Practice
            </h2>
            <div className="text-lg text-white/90 leading-relaxed space-y-4 font-light">
              <div className="flex items-start space-x-4">
                <span className="text-yellow-400 text-2xl">🌅</span>
                <p>Watch the visual rhythms change throughout the day—let them guide your awareness of natural timing</p>
              </div>
              <div className="flex items-start space-x-4">
                <span className="text-yellow-400 text-2xl">✨</span>
                <p>When prime windows open, feel the invitation rather than the obligation</p>
              </div>
              <div className="flex items-start space-x-4">
                <span className="text-yellow-400 text-2xl">🌊</span>
                <p>Step outside during these sacred times—even briefly—to receive the light's medicine</p>
              </div>
              <div className="flex items-start space-x-4">
                <span className="text-yellow-400 text-2xl">🎨</span>
                <p>Let tracking be optional—a gentle reflection rather than a demanding measure</p>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="text-center py-12">
            <p className="text-xl text-blue-200 font-light italic tracking-wide mb-4">
              "Start with the sun. Reclaim your rhythm."
            </p>
            <p className="text-sm text-white/60 font-light">
              Version 1.0.0 • A Sacred Practice Tool by Ocean State of Mind LLC
            </p>
          </div>
        </div>
      </ScrollArea>
    </div>
  );
};

export default About;
