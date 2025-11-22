import React, { useEffect, useState, useRef, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";

// --- Animation Configuration ---
const TRANSITION_DURATION = 0.7; // Time for one word to glide into the center
const INTERVAL_DELAY = 1200; // Time the center word remains static
const TOTAL_LOAD_TIME_MS = 20000; // Reduced to 20 seconds for quicker testing
const FADE_OUT_DURATION_MS = 800; // Duration of the final black screen fade
const WORD_SCALE_CENTER = 1.2;
const WORD_SCALE_SIDE = 0.7;

interface PreloaderProps {
  onFinish: () => void;
}

const ElegantPreloader: React.FC<PreloaderProps> = ({ onFinish }) => {
  const words = useMemo(
    () => [
      "Growth",
      "Advisory",
      "Optimization",
      "Compliance",
      "Partnership",
      "Innovation",
      "Strategy",
      "Excellence",
      "Transformation",
    ],
    []
  );

  const [index, setIndex] = useState(0);
  const [done, setDone] = useState(false);
  
  // Set initial offset large enough to ensure visibility before measurement
  const [dynamicOffset, setDynamicOffset] = useState(350); 
  const wordRefs = useRef<(HTMLDivElement | null)[]>([]);
  const numWords = words.length;
  const halfWords = Math.floor(numWords / 2);

  // --- 1. PRECISE CINEMATIC "KISSING" GAP CALCULATION ---
  useEffect(() => {
    const timer = setTimeout(() => {
      const currentIndex = index % numWords;
      const leftIndex = (index - 1 + numWords) % numWords;
      const rightIndex = (index + 1) % numWords;

      const currentEl = wordRefs.current[currentIndex];
      const leftEl = wordRefs.current[leftIndex];
      const rightEl = wordRefs.current[rightIndex];
      
      if (currentEl && leftEl && rightEl && currentEl.offsetWidth > 0) {
        const currentEffectiveWidth = currentEl.offsetWidth * WORD_SCALE_CENTER;
        const leftEffectiveWidth = leftEl.offsetWidth * WORD_SCALE_SIDE;
        const rightEffectiveWidth = rightEl.offsetWidth * WORD_SCALE_SIDE;

        const leftOffset = (currentEffectiveWidth / 2) + (leftEffectiveWidth / 2);
        const rightOffset = (currentEffectiveWidth / 2) + (rightEffectiveWidth / 2);
        
        const calculatedOffset = Math.max(leftOffset, rightOffset);
        
        setDynamicOffset(Math.ceil(calculatedOffset) + 2);
      }
    }, 50); 
    
    return () => clearTimeout(timer);
  }, [index, numWords]);

  // --- 2. Fixed Total Load Timer ---
  useEffect(() => {
    const totalTimer = setTimeout(() => {
      setDone(true);
      setTimeout(onFinish, FADE_OUT_DURATION_MS);
    }, TOTAL_LOAD_TIME_MS);

    return () => clearTimeout(totalTimer);
  }, [onFinish]);

  // --- 3. Infinite Word Cycling ---
  useEffect(() => {
    if (!done) { 
      const timer = setTimeout(() => {
        setIndex((prev) => (prev + 1) % numWords);
      }, INTERVAL_DELAY);
      return () => clearTimeout(timer);
    }
  }, [index, done, numWords]);

  if (done) return null;
  
  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center bg-black text-white overflow-hidden z-50 font-['Inter']">
      
      {/* Static Title */}
      <h1 className="text-5xl md:text-6xl font-semibold mb-20 text-white/90 tracking-widest absolute top-1/4">
        Brain Powered
      </h1>
      
      <div className="relative flex items-center justify-center w-full h-40">
        <div className="relative flex items-center justify-center">
          <AnimatePresence mode="wait">
            {words.map((word, i) => {
              let offset = i - index;
              
              if (offset < -halfWords) offset += numWords;
              else if (offset > halfWords) offset -= numWords;

              const x = offset * dynamicOffset;
              const scale = offset === 0 ? WORD_SCALE_CENTER : WORD_SCALE_SIDE;
              const opacity = Math.abs(offset) <= 1 ? (offset === 0 ? 1 : 0.25) : 0;

              return (
                <motion.div
                  key={word}
                  ref={(el) => { wordRefs.current[i] = el; }}
                  data-word-id={word}
                  data-word-index={i}
                  className="absolute text-6xl md:text-7xl font-bold whitespace-nowrap min-w-10" 
                  initial={{
                    x: 0, 
                    opacity: 0,
                    scale: 0.8,
                  }}
                  animate={{ 
                    x, 
                    opacity, 
                    scale,
                    transition: {
                      duration: TRANSITION_DURATION,
                      ease: "easeInOut",
                    }
                  }}
                  exit={{
                    x: offset > 0 ? dynamicOffset * 3 : -dynamicOffset * 3, 
                    opacity: 0,
                    scale: 0.8,
                    transition: {
                      duration: TRANSITION_DURATION,
                      ease: "easeOut",
                    }
                  }}
                  style={{
                    zIndex: offset === 0 ? 10 : 10 - Math.abs(offset),
                    filter:
                      offset === 0
                        ? "brightness(1.5) drop-shadow(0 0 20px rgba(255,255,255,0.4))"
                        : `blur(${Math.abs(offset) * 0.3}px) brightness(0.8)`,
                  }}
                >
                  {word}
                </motion.div>
              );
            })}
          </AnimatePresence>

          {/* Enhanced glow */}
          <div className="absolute left-1/2 -translate-x-1/2 w-[400px] h-[200px] bg-white/10 blur-[120px] rounded-full pointer-events-none z-0" />
          <div className="absolute left-1/2 -translate-x-1/2 w-[200px] h-[100px] bg-white/15 blur-[80px] rounded-full pointer-events-none z-0" />
        </div>
      </div>

      {/* Fade-out overlay */}
      <AnimatePresence>
        {done && (
          <motion.div
            className="absolute inset-0 bg-black"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{
              duration: FADE_OUT_DURATION_MS / 1000,
              ease: "easeOut",
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

interface FeatureCardProps {
  title: string;
  description: string;
}

const FeatureCard: React.FC<FeatureCardProps> = ({ title, description }) => (
  <motion.div
    className="bg-gray-800 p-4 rounded-lg shadow-xl border border-gray-700/50"
    whileHover={{ scale: 1.02, backgroundColor: "#1f2937" }}
    transition={{ type: "spring", stiffness: 300 }}
  >
    <h3 className="text-xl font-semibold text-teal-400 mb-1 flex items-center">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="h-5 w-5 mr-2 text-green-400"
        viewBox="0 0 20 20"
        fill="currentColor"
      >
        <path
          fillRule="evenodd"
          d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
          clipRule="evenodd"
        />
      </svg>
      {title}
    </h3>
    <p className="text-gray-400 text-sm">{description}</p>
  </motion.div>
);


const App = () => {
  const [loading, setLoading] = useState(true);

  return (
    <>
      {loading && <ElegantPreloader onFinish={() => setLoading(false)} />}

      <AnimatePresence>
        {!loading && (
          <motion.div
            className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white p-8"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1 }}
          >
            <h2 className="text-4xl font-extrabold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-teal-400">
              Welcome to the Main Application!
            </h2>
            <p className="text-lg text-gray-300 max-w-xl text-center">
              The cinematic preloader has completed its smooth transition.
            </p>
            <div className="mt-12 space-y-4 max-w-2xl w-full">
              <FeatureCard
                title=""
                description=""
              />
              <FeatureCard
                title=""
                description=""
              />
              <FeatureCard
                title=""
                description=""
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default App;