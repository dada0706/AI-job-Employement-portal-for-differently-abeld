import React, { useContext, useRef, useState } from "react";
import { Search, MapPin, Mic } from "lucide-react";
import { AppContext } from "../context/AppContext";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { SlideUp } from "../utils/Animation";

const Hero = () => {
  const navigate = useNavigate();

  const titleRef = useRef(null);
  const locationRef = useRef(null);
  const [isListening, setIsListening] = useState(false);

  const { setSearchFilter, setIsSearched } = useContext(AppContext);

  const searchHandler = (e) => {
    e.preventDefault();
    const titleVal = titleRef.current?.value?.trim() || "";
    const locationVal = locationRef.current?.value?.trim() || "";

    if (!titleVal && !locationVal) return;

    // Build a natural language query combining title and location
    let q = titleVal;
    if (locationVal) q += ` in ${locationVal}`;

    // Also keep the existing context filter for AllJobs fallback
    setSearchFilter({ title: titleVal, location: locationVal });
    setIsSearched(true);

    // Navigate to AI Search Results page
    navigate(`/ai-search?q=${encodeURIComponent(q)}`);
  };


  const startListening = () => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Your browser does not support Speech Recognition.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = "en-US";
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      setIsListening(true);
    };

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      if (titleRef.current) {
        titleRef.current.value = transcript;
      }
      setIsListening(false);
    };

    recognition.onerror = () => {
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.start();
  };

  return (
    <section className="rounded-lg py-16 px-6 md:px-20" style={{ background: "var(--hero-bg)" }}>
      <div className="text-center max-w-2xl mx-auto">
        {/* Heading */}
        <motion.h1
          className="text-3xl sm:text-4xl md:text-5xl font-bold text-[var(--text-primary)] mb-4 leading-tight sm:leading-snug"
          variants={SlideUp(0.4)}
          initial="hidden"
          animate="visible"
        >
          There Are <span className="text-[var(--primary-color)]">93,178</span> Postings Here
          For You!
        </motion.h1>

        {/* Subtext */}
        <motion.p
          className="text-[var(--text-muted)] mb-10"
          variants={SlideUp(0.4)}
          initial="hidden"
          animate="visible"
        >
          Your next big career move starts right here — explore the best job
          opportunities and take the first step toward your future!
        </motion.p>

        {/* Search Form */}
        <motion.form
          onSubmit={searchHandler}
          className="bg-[var(--card-bg)] rounded-lg shadow p-3 flex flex-col sm:flex-row gap-4 sm:gap-2 items-stretch sm:items-center w-full focus-within:ring-4 focus-within:ring-[var(--primary-color)]"
          variants={SlideUp(0.5)}
          initial="hidden"
          animate="visible"
        >
          {/* Job Title Input */}
          <div className="flex items-center border border-[var(--border-color)] rounded-md px-3 py-2 md:py-2.5 bg-[var(--input-bg)] w-full relative">
            <Search className="text-[var(--text-muted)] mr-2 shrink-0" />
            <label htmlFor="job-title-input" className="sr-only">Describe the job you're looking for</label>
            <input
              id="job-title-input"
              type="text"
              name="job"
              placeholder="Describe the job you're looking for…"
              aria-label="Describe the job you're looking for…"
              autoComplete="on"
              className="w-full outline-none text-sm bg-transparent placeholder:text-[var(--text-muted)] text-[var(--text-color)] pr-8"
              ref={titleRef}
            />
            <button
              type="button"
              onClick={startListening}
              aria-label={isListening ? "Listening..." : "Start voice search"}
              className={`absolute right-2 p-1 rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary-color)] transition-colors ${isListening ? "text-red-500 bg-red-100 animate-pulse" : "text-[var(--text-muted)] hover:text-[var(--primary-color)] hover:bg-[var(--border-color)]"
                }`}
            >
              <Mic size={20} />
            </button>
          </div>

          {/* Location Input */}
          <div className="flex items-center border border-[var(--border-color)] rounded-md px-3 py-2 md:py-2.5 bg-[var(--input-bg)] w-full sm:w-1/3">
            <MapPin className="text-[var(--text-muted)] mr-2 shrink-0" />
            <label htmlFor="job-location-input" className="sr-only">Job Location</label>
            <input
              id="job-location-input"
              type="text"
              name="location"
              placeholder="Location"
              aria-label="Job Location"
              autoComplete="on"
              className="w-full outline-none text-sm bg-transparent placeholder:text-[var(--text-muted)] text-[var(--text-color)]"
              ref={locationRef}
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            aria-label="Search Jobs"
            className="w-full sm:w-auto bg-[var(--primary-color)] hover:opacity-90 text-white font-semibold py-2.5 md:py-3 px-6 rounded-md transition text-sm cursor-pointer focus:outline-none focus-visible:ring-4 focus-visible:ring-[var(--primary-color)]"
          >
            Search
          </button>
        </motion.form>

        {/* Helper Examples */}
        <motion.div
          className="mt-4 text-sm text-[var(--text-muted)] text-left"
          variants={SlideUp(0.6)}
          initial="hidden"
          animate="visible"
        >
          <p className="font-medium mb-2">Try searching:</p>
          <ul className="space-y-1 list-disc list-inside">
            <li>"Remote frontend job suitable for wheelchair user"</li>
            <li>"Work from home data entry for visually impaired"</li>
          </ul>
        </motion.div>
      </div>
    </section>
  );
};

export default Hero;
