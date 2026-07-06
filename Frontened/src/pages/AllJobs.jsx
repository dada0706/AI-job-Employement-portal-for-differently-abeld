import { ChevronLeft, ChevronRight, Filter, Search, MapPin, Mic, Loader2 } from "lucide-react";
import React, { useContext, useEffect, useState, useMemo, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { JobCategories, JobLocations, DisabilitySupportOptions } from "../assets/assets";
import JobCard from "../components/JobCard";
import AIJobCard from "../components/AIJobCard";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { AppContext } from "../context/AppContext";
import Loader from "../components/Loader";
import { motion } from "framer-motion";
import { slideRigth, SlideUp } from "../utils/Animation";
import { useAISearch } from "../hooks/useAISearch";

function AllJobs() {
  const [jobData, setJobData] = useState([]);
  const [filteredJobs, setFilteredJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);
  const [isListening, setIsListening] = useState(false);

  const titleRef = useRef(null);

  const {
    jobs,
    searchFilter,
    setSearchFilter,
    setIsSearched,
    isSearched,
    fetchJobsData,
  } = useContext(AppContext);

  // ── AI Search hook ──────────────────────────────────────────────────────────
  const {
    aiJobs,
    loading: aiLoading,
    error: aiError,
    hasSearched: aiHasSearched,
    runSearch: runAISearch,
    clearResults: clearAIResults,
  } = useAISearch();

  const { category } = useParams();
  const navigate = useNavigate();

  const jobsPerPage = 6;

  const [searchInput, setSearchInput] = useState({
    title: "",
    location: "",
    selectedCategories: [],
    selectedLocations: [],
    selectedDisabilities: [],
  });

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      await fetchJobsData();
      setLoading(false);
    };
    fetchData();
  }, []);

  useEffect(() => {
    if (!jobs?.length) return;

    let filtered = [...jobs];

    if (category !== "all") {
      filtered = filtered.filter(
        (job) => job.category.toLowerCase() === category.toLowerCase()
      );
    }

    setJobData(filtered);
    setSearchInput({
      title: isSearched ? searchFilter.title : "",
      location: isSearched ? searchFilter.location : "",
      selectedCategories: [],
      selectedLocations: [],
      selectedDisabilities: [],
    });

    setCurrentPage(1);
  }, [category, jobs, isSearched, searchFilter]);

  useEffect(() => {
    let results = [...jobData];

    if (searchInput.title.trim()) {
      results = results.filter((job) =>
        job.title.toLowerCase().includes(searchInput.title.trim().toLowerCase())
      );
    }

    if (searchInput.location.trim()) {
      results = results.filter((job) =>
        job.location
          .toLowerCase()
          .includes(searchInput.location.trim().toLowerCase())
      );
    }

    if (searchInput.selectedCategories.length > 0) {
      results = results.filter((job) =>
        searchInput.selectedCategories.includes(job.category)
      );
    }

    if (searchInput.selectedLocations.length > 0) {
      results = results.filter((job) =>
        searchInput.selectedLocations.includes(job.location)
      );
    }

    if (searchInput.selectedDisabilities.length > 0) {
      results = results.filter((job) =>
        job.disability_support?.some(d => searchInput.selectedDisabilities.includes(d))
      );
    }

    setFilteredJobs(results);
    setCurrentPage(1);
  }, [jobData, searchInput]);

  const handleSearchChange = (e) => {
    const { name, value } = e.target;
    setSearchInput((prev) => ({ ...prev, [name]: value }));
  };

  const handleCategoryToggle = (cat) => {
    setSearchInput((prev) => {
      const updated = prev.selectedCategories.includes(cat)
        ? prev.selectedCategories.filter((c) => c !== cat)
        : [...prev.selectedCategories, cat];
      return { ...prev, selectedCategories: updated };
    });
  };

  const handleLocationToggle = (loc) => {
    setSearchInput((prev) => {
      const updated = prev.selectedLocations.includes(loc)
        ? prev.selectedLocations.filter((l) => l !== loc)
        : [...prev.selectedLocations, loc];
      return { ...prev, selectedLocations: updated };
    });
  };

  const handleDisabilityToggle = (disability) => {
    setSearchInput((prev) => {
      const updated = prev.selectedDisabilities.includes(disability)
        ? prev.selectedDisabilities.filter((d) => d !== disability)
        : [...prev.selectedDisabilities, disability];
      return { ...prev, selectedDisabilities: updated };
    });
  };

  const clearAllFilters = () => {
    setSearchInput({
      title: "",
      location: "",
      selectedCategories: [],
      selectedLocations: [],
      selectedDisabilities: [],
    });
    setSearchFilter({ title: "", location: "" });
    setIsSearched(false);
    clearAIResults();
    navigate("/all-jobs/all");
  };

  const searchSubmitHandler = (e) => {
    e.preventDefault();
    const titleVal = searchInput.title.trim();
    const locationVal = searchInput.location.trim();

    if (!titleVal && !locationVal) return;

    // Build natural language query and call AI endpoint
    let q = titleVal;
    if (locationVal) q += ` in ${locationVal}`;
    runAISearch(q);

    // Also keep context filter for breadcrumb/category compatibility
    setSearchFilter({ title: titleVal, location: locationVal });
    setIsSearched(true);
    setCurrentPage(1);
    if (category !== "all") {
      navigate("/all-jobs/all");
    }
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
      setSearchInput((prev) => ({ ...prev, title: transcript }));
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

  const totalPages = Math.ceil(filteredJobs.length / jobsPerPage);

  const paginatedJobs = useMemo(() => {
    return [...filteredJobs]
      .reverse()
      .slice((currentPage - 1) * jobsPerPage, currentPage * jobsPerPage);
  }, [filteredJobs, currentPage]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader />
      </div>
    );
  }

  return (
    <>
      <Navbar />



      <section>
        <div className="md:hidden flex justify-end mb-4 px-4">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 bg-[var(--primary-color)] text-white px-4 py-2 rounded-md transition"
          >
            <Filter size={18} />
            {showFilters ? "Hide Filters" : "Show Filters"}
          </button>
        </div>

        <motion.div
          variants={slideRigth(0.5)}
          initial="hidden"
          animate="visible"
          className="flex flex-col md:flex-row md:gap-8 lg:gap-16"
        >
          {/* Filters */}
          <div
            className={`lg:w-1/4 p-4 rounded-lg border border-[var(--border-color)] bg-[var(--card-bg)] ${showFilters ? "block" : "hidden md:block"
              }`}
          >
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-2">
                  Categories
                </h2>
                <ul className="space-y-2">
                  {JobCategories.map((cat, i) => (
                    <li key={i} className="flex items-center">
                      <input
                        type="checkbox"
                        id={`cat-${i}`}
                        checked={searchInput.selectedCategories.includes(cat)}
                        onChange={() => handleCategoryToggle(cat)}
                        className="h-4 w-4 rounded border-[var(--border-color)] text-[var(--primary-color)]"
                      />
                      <label
                        htmlFor={`cat-${i}`}
                        className="ml-2 text-[var(--text-color)]"
                      >
                        {cat}
                      </label>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-2">
                  Locations
                </h2>
                <ul className="space-y-2">
                  {JobLocations.map((loc, i) => (
                    <li key={i} className="flex items-center">
                      <input
                        type="checkbox"
                        id={`loc-${i}`}
                        checked={searchInput.selectedLocations.includes(loc)}
                        onChange={() => handleLocationToggle(loc)}
                        className="h-4 w-4 rounded border-[var(--border-color)] text-[var(--primary-color)]"
                      />
                      <label
                        htmlFor={`loc-${i}`}
                        className="ml-2 text-[var(--text-color)]"
                      >
                        {loc}
                      </label>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-2">
                  Disability Support
                </h2>
                <ul className="space-y-2">
                  {DisabilitySupportOptions.map((dis, i) => (
                    <li key={i} className="flex items-center">
                      <input
                        type="checkbox"
                        id={`dis-${i}`}
                        checked={searchInput.selectedDisabilities.includes(dis)}
                        onChange={() => handleDisabilityToggle(dis)}
                        className="h-4 w-4 rounded border-[var(--border-color)] text-[var(--primary-color)]"
                      />
                      <label
                        htmlFor={`dis-${i}`}
                        className="ml-2 text-[var(--text-color)]"
                      >
                        {dis}
                      </label>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* Job Cards */}
          <div className="lg:w-3/4">
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-[var(--text-primary)] capitalize mb-2">
                {category === "all"
                  ? "Latest Jobs Matching Criteria"
                  : `Jobs in ${category.charAt(0).toUpperCase() + category.slice(1)
                  }`}
                {filteredJobs.length > 0 && (
                  <span className="ml-2 text-[var(--text-muted)] text-lg">
                    ({filteredJobs.length}{" "}
                    {filteredJobs.length === 1 ? "job" : "jobs"})
                  </span>
                )}
              </h1>
              <p className="text-[var(--text-muted)]">
                Get your desired job from top companies
              </p>
            </div>

            <motion.div
              variants={SlideUp(0.5)}
              initial="hidden"
              animate="visible"
              className="space-y-4"
            >
              {/* ── AI Search Results (when active) ── */}
              {aiHasSearched ? (
                aiLoading ? (
                  <div className="text-center py-16" role="status" aria-live="polite">
                    <Loader2 size={36} className="animate-spin text-[var(--primary-color)] mx-auto mb-3" aria-hidden="true" />
                    <p className="text-[var(--text-muted)] font-medium">Searching jobs…</p>
                  </div>
                ) : aiError ? (
                  <div className="text-center p-6 border border-red-200 rounded-lg bg-red-50" role="alert">
                    <p className="text-red-700 font-medium mb-2">Search failed</p>
                    <p className="text-red-600 text-sm mb-3">{aiError}</p>
                    <button onClick={clearAllFilters} className="px-4 py-2 bg-[var(--primary-color)] text-white rounded-md hover:opacity-90 text-sm">
                      Clear & Retry
                    </button>
                  </div>
                ) : aiJobs.length > 0 ? (
                  <>
                    <p className="text-sm text-[var(--text-muted)] mb-2">
                      {aiJobs.length} AI-matched {aiJobs.length === 1 ? "job" : "jobs"} — ranked by accessibility
                    </p>
                    {aiJobs.map((job, i) => <AIJobCard key={job._id || i} job={job} />)}
                  </>
                ) : (
                  <div className="text-center bg-[var(--card-bg)] p-6 border border-[var(--border-color)] rounded-md">
                    <p className="text-lg font-semibold text-[var(--text-primary)] mb-1">No matching jobs found</p>
                    <p className="text-[var(--text-muted)] mb-3">Try a different query or remove accessibility filters.</p>
                    <button onClick={clearAllFilters} className="px-4 py-2 bg-[var(--primary-color)] text-white rounded-md hover:opacity-90 transition-opacity">
                      Clear All Filters
                    </button>
                  </div>
                )
              ) : (
                /* ── Normal filtered results (default) ── */
                paginatedJobs.length > 0 ? (
                  paginatedJobs.map((job, i) => <JobCard key={i} job={job} />)
                ) : (
                  <div className="text-center bg-[var(--card-bg)] p-6 border border-[var(--border-color)] rounded-md">
                    <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-1">
                      No jobs found
                    </h3>
                    <p className="text-[var(--text-muted)] mb-3">
                      Try adjusting your search filters.
                    </p>
                    <button
                      onClick={clearAllFilters}
                      className="px-4 py-2 bg-[var(--primary-color)] text-white rounded-md hover:opacity-90 transition-opacity"
                    >
                      Clear All Filters
                    </button>
                  </div>
                )
              )}
            </motion.div>

            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-2 mt-8 flex-wrap">
                <button
                  onClick={() =>
                    setCurrentPage((prev) => Math.max(prev - 1, 1))
                  }
                  disabled={currentPage === 1}
                  className="p-2 border border-[var(--border-color)] rounded-md hover:bg-[var(--border-color)] disabled:opacity-50 text-[var(--text-color)]"
                >
                  <ChevronLeft size={20} />
                </button>

                {Array.from({ length: totalPages }, (_, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrentPage(i + 1)}
                    className={`w-10 h-10 rounded-md border text-center cursor-pointer ${currentPage === i + 1
                      ? "bg-[var(--primary-color)]/10 text-[var(--primary-color)] border-[var(--primary-color)]/30"
                      : "bg-[var(--card-bg)] border-[var(--border-color)] text-[var(--text-color)] hover:bg-[var(--border-color)]"
                      }`}
                  >
                    {i + 1}
                  </button>
                ))}

                <button
                  onClick={() =>
                    setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                  }
                  disabled={currentPage === totalPages}
                  className="p-2 border border-[var(--border-color)] rounded-md hover:bg-[var(--border-color)] disabled:opacity-50 text-[var(--text-color)]"
                >
                  <ChevronRight size={20} />
                </button>
              </div>
            )}
          </div>
        </motion.div>
      </section>
      <Footer />
    </>
  );
}

export default AllJobs;
