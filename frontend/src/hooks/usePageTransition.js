import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const engineeringQuotes = [
  "Any sufficiently advanced technology is indistinguishable from magic. — Arthur C. Clarke",
  "The scientist discovers a new type of material or energy and the engineer discovers a new use for it. — Gordon Lindsay Ingram",
  "An engineer is someone who is good at math who doesn't have the personality to be an accountant.",
  "First, solve the problem. Then, write the code. — John Johnson",
  "Without requirements or design, programming is the art of adding bugs to an empty text file. — Louis Srygley",
  "Engineering is the closest thing to magic that exists in the world. — Elon Musk",
  "To the optimist, the glass is half full. To the pessimist, the glass is half empty. To the engineer, the glass is twice as big as it needs to be.",
  "Normal people believe that if it ain't broke, don't fix it. Engineers believe that if it ain't broke, it doesn't have enough features yet. — Scott Adams",
  "Software and cathedrals are much the same – first we build them, then we pray. — Sam Ewing",
  "There are two ways to write error-free programs; only the third one works. — Alan J. Perlis",
  "The best way to predict the future is to invent it. — Alan Kay",
  "Math is my Passion. Engineering is my Profession.",
  "Hardware: The parts of a computer system that can be kicked. — Jeff Pesis",
  "Programming isn't about what you know; it's about what you can figure out. — Chris Pine",
  "It's not a bug. It's an undocumented feature!",
  "A good programmer is someone who always looks both ways before crossing a one-way street. — Doug Linder",
  "Talk is cheap. Show me the code. — Linus Torvalds",
  "The most important property of a program is whether it accomplishes the intention of its user. — C.A.R. Hoare",
  "One man's crappy software is another man's full-time job. — Jessica Gaston",
  "If debugging is the process of removing software bugs, then programming must be the process of putting them in. — Edsger Dijkstra"
];

export function usePageTransition() {
  const location = useLocation();
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [prevLocation, setPrevLocation] = useState(location);
  const [currentQuote, setCurrentQuote] = useState(engineeringQuotes[0]);
  const [lastQuoteIndex, setLastQuoteIndex] = useState(0);

  useEffect(() => {
    if (location.pathname !== prevLocation.pathname) {
      setIsTransitioning(true);
      
      // Get random quote different from last
      let nextQuoteIdx;
      do {
        nextQuoteIdx = Math.floor(Math.random() * engineeringQuotes.length);
      } while (nextQuoteIdx === lastQuoteIndex);
      
      setCurrentQuote(engineeringQuotes[nextQuoteIdx]);
      setLastQuoteIndex(nextQuoteIdx);

      const timer = setTimeout(() => {
        setIsTransitioning(false);
        setPrevLocation(location);
      }, 2500);

      return () => clearTimeout(timer);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname]);

  return { isTransitioning, prevLocation, currentQuote };
}
