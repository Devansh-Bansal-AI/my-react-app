import React, { useEffect, useState, useRef, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";

// --- Animation Configuration ---
const TRANSITION_DURATION = 0.7;
const INTERVAL_DELAY = 1200;
const TOTAL_LOAD_TIME_MS = 50000;
const FADE_OUT_DURATION_MS = 800;
const WORD_SCALE_CENTER = 1.2;
const WORD_SCALE_SIDE = 0.7;

const ElegantPreloader = ({ onFinish }) => {
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
  const [dynamicOffset, setDynamicOffset] = useState(250);
  const wordContainerRef = useRef(null);
  const wordRefs = useRef([]);
  const numWords = words.length;

  // --- 1. PRECISE CINEMATIC "KISSING" GAP CALCULATION ---
  useEffect(() => {
    const calculatePreciseOffset = () => {
      const currentIndex = index % numWords;
      const leftIndex = (index - 1 + numWords) % numWords;
      const rightIndex = (index + 1) % numWords;

      // Get the DOM elements for current, left, and right words
      const currentEl = wordRefs.current[currentIndex];
      const leftEl = wordRefs.current[leftIndex];
      const rightEl = wordRefs.current[rightIndex];

      if (currentEl && leftEl && rightEl) {
        // Get the actual rendered widths (including scale)
        const currentWidth = currentEl.offsetWidth * WORD_SCALE_CENTER;
        const leftWidth = leftEl.offsetWidth * WORD_SCALE_SIDE;
        const rightWidth = rightEl.offsetWidth * WORD_SCALE_SIDE;

        // Calculate the precise kissing distance
        // The side word should be positioned at: (currentWidth/2 + sideWidth/2)
        const leftOffset = (currentWidth / 2) + (leftWidth / 2);
        const rightOffset = (currentWidth / 2) + (rightWidth / 2);
        
        // Use the larger offset to ensure both sides have enough space
        const calculatedOffset = Math.max(leftOffset, rightOffset);
        
        // Add minimal gap (1-2px) to prevent actual touching which might cause visual issues
        setDynamicOffset(Math.ceil(calculatedOffset) + 2);
      }
    };

    // Use setTimeout to ensure DOM is updated and measurements are accurate
    const timer = setTimeout(calculatePreciseOffset, 50);
    return () => clearTimeout(timer);
  }, [index, numWords]);

  // --- 2. Fixed Total Load Timer (50s) ---
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

  const halfWords = Math.floor(numWords / 2);

  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center bg-black text-white overflow-hidden z-50 font-['Inter']">
      
      {/* Title removed, maintaining vertical centering */}
      <div className="h-20" /> 
      
      <div className="relative flex items-center justify-center w-full h-40">
        <div className="relative flex items-center justify-center" ref={wordContainerRef}>
          <AnimatePresence mode="wait">
            {words.map((word, i) => {
              let offset = i - index;
              // Normalize offset to be within [-halfWords, halfWords]
              if (offset < -halfWords) offset += numWords;
              else if (offset > halfWords) offset -= numWords;

              const x = offset * dynamicOffset;
              const scale = offset === 0 ? WORD_SCALE_CENTER : WORD_SCALE_SIDE;
              const opacity = Math.abs(offset) <= 1 ? (offset === 0 ? 1 : 0.25) : 0;
              const isEnteringOrExiting = Math.abs(offset) > 1;

              return (
                <motion.div
                  key={word}
                  ref={el => wordRefs.current[i] = el}
                  data-word-id={word}
                  data-word-index={i}
                  className="absolute text-6xl md:text-7xl font-bold whitespace-nowrap"
                  initial={{
                    x: isEnteringOrExiting
                      ? offset > 0
                        ? dynamicOffset * 3
                        : -dynamicOffset * 3
                      : x,
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
                      ease: "easeInOut",
                    }
                  }}
                  style={{
                    zIndex: offset === 0 ? 10 : Math.abs(offset),
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

          {/* Enhanced glow behind the spotlight word */}
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

// --- Main App Wrapper ---
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
              The cinematic preloader has completed its smooth transition after 50 seconds of infinite cycling.
            </p>
            <div className="mt-12 space-y-4 max-w-2xl w-full">
              <FeatureCard
                title="Perfect Cinematic Kissing Gap"
                description="Side words now precisely touch the center word using half-width offset mathematics for that perfect cinematic look."
              />
              <FeatureCard
                title="Dynamic Width Calculation"
                description="Each word's scaled width is calculated in real-time for perfect spacing regardless of word length."
              />
              <FeatureCard
                title="Seamless Visual Flow"
                description="The minimal gap creates a continuous visual experience with words appearing to connect."
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

const FeatureCard = ({ title, description }) => (
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

export default App;