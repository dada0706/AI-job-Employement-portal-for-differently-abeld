import React, { useState, useEffect, useRef, useContext } from "react";
import { Search, Mic, Loader2, AlertCircle, ChevronLeft } from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import AIJobCard from "../components/AIJobCard";
import { AppContext } from "../context/AppContext";
import { SlideUp } from "../utils/Animation";
import { useAISearch } from "../hooks/useAISearch";

// Accessibility feature filter chips — frontend labels map to backend via accessibilityUtils
const FEATURE_CHIPS = [
    { label: "Wheelchair Friendly", key: "Wheelchair Friendly" },
    { label: "Elevator Available", key: "Elevator Available" },
    { label: "Accessible Restroom", key: "Accessible Restroom" },
    { label: "Braille Support", key: "Braille Support" },
    { label: "Sign Language", key: "Sign Language Support" },
    { label: "Quiet Workspace", key: "Quiet Workspace" },
    { label: "Remote Friendly", key: "Remote Friendly" },
];

const EXAMPLE_QUERIES = [
    "Frontend developer in Bangalore with wheelchair access",
    "Remote data analyst job with accessible restroom",
    "Backend engineer with braille signage and elevator",
    "UI designer with sign language support",
];

function AISearchResults() {
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();

    const initialQuery = searchParams.get("q") || "";
    const [query, setQuery] = useState(initialQuery);
    const [submittedQuery, setSubmittedQuery] = useState(initialQuery);
    const [selectedFeatures, setSelectedFeatures] = useState([]);
    const [isListening, setIsListening] = useState(false);

    const inputRef = useRef(null);

    // ── Shared AI search hook ─────────────────────────────────────────────────
    const { aiJobs, parsedFilters, total, loading, error, hasSearched, runSearch, clearResults } = useAISearch();

    // ── Run search whenever submittedQuery or selectedFeatures change ─────────
    useEffect(() => {
        if (!submittedQuery.trim() && selectedFeatures.length === 0) return;
        runSearch(submittedQuery, selectedFeatures);
    }, [submittedQuery, selectedFeatures]);

    // ── Auto-run if query came from URL ─────────────────────────────────────
    useEffect(() => {
        if (initialQuery) setSubmittedQuery(initialQuery);
    }, []);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!query.trim() && selectedFeatures.length === 0) return;
        setSearchParams(query ? { q: query } : {});
        setSubmittedQuery(query);
    };

    const handleFeatureToggle = (key) => {
        setSelectedFeatures(prev =>
            prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]
        );
    };

    const handleVoiceSearch = () => {
        const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SR) { alert("Voice search is not supported in your browser."); return; }
        const recognition = new SR();
        recognition.lang = "en-US";
        recognition.interimResults = false;
        recognition.onstart = () => setIsListening(true);
        recognition.onresult = (event) => {
            const t = event.results[0][0].transcript;
            setQuery(t);
            setIsListening(false);
            setSearchParams({ q: t });
            setSubmittedQuery(t);
        };
        recognition.onerror = recognition.onend = () => setIsListening(false);
        recognition.start();
    };

    const handleExampleClick = (example) => {
        setQuery(example);
        setSearchParams({ q: example });
        setSubmittedQuery(example);
    };

    const clearSearch = () => {
        setQuery("");
        setSubmittedQuery("");
        setSelectedFeatures([]);
        clearResults();
        setSearchParams({});
        inputRef.current?.focus();
    };

    return (
        <>
            <Navbar />

            {/* ── Hero / Search Section ──────────────────────────────────── */}
            <section
                className="py-12 px-4 md:px-6"
                style={{ background: "var(--hero-bg)" }}
                aria-label="AI Job Search"
            >
                <div className="max-w-3xl mx-auto text-center">
                    <motion.h1
                        variants={SlideUp(0.2)}
                        initial="hidden"
                        animate="visible"
                        className="text-3xl md:text-4xl font-bold text-[var(--text-primary)] mb-2"
                    >
                        AI-Powered Job Search
                    </motion.h1>
                    <motion.p
                        variants={SlideUp(0.3)}
                        initial="hidden"
                        animate="visible"
                        className="text-[var(--text-muted)] mb-8"
                    >
                        Search in plain English — we'll find accessible jobs that match your needs.
                    </motion.p>

                    {/* Search Form */}
                    <motion.form
                        onSubmit={handleSubmit}
                        variants={SlideUp(0.4)}
                        initial="hidden"
                        animate="visible"
                        className="bg-[var(--card-bg)] rounded-xl shadow border border-[var(--border-color)] p-3 flex flex-col sm:flex-row gap-3 items-stretch sm:items-center w-full focus-within:ring-4 focus-within:ring-[var(--primary-color)] mb-4"
                        role="search"
                        aria-label="AI job search form"
                    >
                        <div className="flex items-center border border-[var(--border-color)] rounded-lg px-3 py-2.5 bg-[var(--input-bg)] w-full relative">
                            <Search className="text-[var(--text-muted)] mr-2 shrink-0" size={18} aria-hidden="true" />
                            <label htmlFor="ai-search-input" className="sr-only">Describe the job you're looking for</label>
                            <input
                                id="ai-search-input"
                                ref={inputRef}
                                type="text"
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                onKeyDown={(e) => { if (e.key === "Enter") handleSubmit(e); }}
                                placeholder="e.g. Frontend developer in Bangalore with wheelchair access"
                                aria-label="Describe the job you're looking for"
                                autoComplete="off"
                                autoFocus
                                className="w-full outline-none text-sm bg-transparent placeholder:text-[var(--text-muted)] text-[var(--text-color)] pr-8"
                            />
                            <button
                                type="button"
                                onClick={handleVoiceSearch}
                                aria-label={isListening ? "Listening… speak now" : "Start voice search"}
                                className={`absolute right-2 p-1 rounded-full transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary-color)] ${isListening ? "text-red-500 bg-red-100 animate-pulse" : "text-[var(--text-muted)] hover:text-[var(--primary-color)]"}`}
                            >
                                <Mic size={18} aria-hidden="true" />
                            </button>
                        </div>

                        <button
                            type="submit"
                            aria-label="Search jobs"
                            disabled={loading}
                            className="w-full sm:w-auto bg-[var(--primary-color)] hover:opacity-90 disabled:opacity-60 text-white font-semibold py-2.5 px-7 rounded-lg transition text-sm cursor-pointer focus:outline-none focus-visible:ring-4 focus-visible:ring-[var(--primary-color)] flex items-center justify-center gap-2"
                        >
                            {loading ? <Loader2 size={16} className="animate-spin" aria-hidden="true" /> : null}
                            {loading ? "Searching…" : "Search"}
                        </button>
                    </motion.form>

                    {/* Accessibility Feature Chips */}
                    <motion.div
                        variants={SlideUp(0.5)}
                        initial="hidden"
                        animate="visible"
                        className="flex flex-wrap gap-2 justify-center mb-6"
                        aria-label="Filter by accessibility feature"
                        role="group"
                    >
                        {FEATURE_CHIPS.map(({ label, key }) => {
                            const active = selectedFeatures.includes(key);
                            return (
                                <button
                                    key={key}
                                    type="button"
                                    onClick={() => handleFeatureToggle(key)}
                                    aria-pressed={active}
                                    className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary-color)] ${active
                                        ? "bg-[var(--primary-color)] text-white border-[var(--primary-color)]"
                                        : "bg-[var(--card-bg)] text-[var(--text-muted)] border-[var(--border-color)] hover:border-[var(--primary-color)] hover:text-[var(--primary-color)]"
                                        }`}
                                >
                                    {active ? "✓ " : ""}{label}
                                </button>
                            );
                        })}
                        {(selectedFeatures.length > 0 || submittedQuery) && (
                            <button
                                type="button"
                                onClick={clearSearch}
                                className="px-3 py-1.5 rounded-full text-xs font-medium border border-red-300 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition focus:outline-none focus-visible:ring-2 focus-visible:ring-red-400"
                                aria-label="Clear all search filters"
                            >
                                ✕ Clear All
                            </button>
                        )}
                    </motion.div>

                    {/* Example Queries */}
                    {!hasSearched && (
                        <motion.div variants={SlideUp(0.6)} initial="hidden" animate="visible" className="text-sm text-[var(--text-muted)]">
                            <p className="font-medium mb-2">Try searching:</p>
                            <div className="flex flex-wrap gap-2 justify-center">
                                {EXAMPLE_QUERIES.map((ex, i) => (
                                    <button
                                        key={i}
                                        type="button"
                                        onClick={() => handleExampleClick(ex)}
                                        className="text-xs px-3 py-1.5 rounded-full border border-[var(--border-color)] hover:border-[var(--primary-color)] hover:text-[var(--primary-color)] transition text-[var(--text-muted)] bg-[var(--card-bg)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary-color)]"
                                    >
                                        "{ex}"
                                    </button>
                                ))}
                            </div>
                        </motion.div>
                    )}
                </div>
            </section>

            {/* ── Results Section ─────────────────────────────────────────── */}
            <main className="max-w-5xl mx-auto px-4 md:px-6 py-8 min-h-[40vh]" aria-live="polite" aria-atomic="false">

                {/* Parsed Filters Badge Row */}
                <AnimatePresence>
                    {parsedFilters && !loading && (
                        <motion.div
                            key="filters"
                            initial={{ opacity: 0, y: -8 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0 }}
                            className="mb-6 p-3 rounded-lg bg-[var(--card-bg)] border border-[var(--border-color)] text-xs text-[var(--text-muted)] flex flex-wrap gap-3"
                            aria-label="Detected search filters"
                        >
                            <span className="font-semibold text-[var(--text-primary)]">AI detected:</span>
                            {parsedFilters.role && <span className="bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 px-2 py-0.5 rounded-full border border-blue-200 dark:border-blue-700">🔍 Role: {parsedFilters.role}</span>}
                            {parsedFilters.location && <span className="bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300 px-2 py-0.5 rounded-full border border-purple-200 dark:border-purple-700">📍 Location: {parsedFilters.location}</span>}
                            {parsedFilters.remote && <span className="bg-teal-50 dark:bg-teal-900/20 text-teal-700 dark:text-teal-300 px-2 py-0.5 rounded-full border border-teal-200 dark:border-teal-700">🌐 Remote</span>}
                            {parsedFilters.accessibility_needs?.map(n => (
                                <span key={n} className="bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-700">♿ {n.replace(/_/g, " ")}</span>
                            ))}
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Loading State */}
                {loading && (
                    <div className="text-center py-20" role="status" aria-live="polite">
                        <Loader2 size={40} className="animate-spin text-[var(--primary-color)] mx-auto mb-4" aria-hidden="true" />
                        <p className="text-[var(--text-muted)] font-medium text-lg">Searching jobs…</p>
                        <p className="text-[var(--text-muted)] text-sm mt-1">Our AI is finding the most accessible matches for you.</p>
                    </div>
                )}

                {/* Error State */}
                {!loading && error && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-center py-16 flex flex-col items-center gap-3"
                        role="alert"
                    >
                        <AlertCircle size={48} className="text-red-400" aria-hidden="true" />
                        <p className="text-[var(--text-primary)] font-semibold text-lg">Something went wrong</p>
                        <p className="text-[var(--text-muted)] text-sm max-w-sm">{error}</p>
                        <button
                            onClick={() => runSearch(submittedQuery, selectedFeatures)}
                            className="mt-2 px-5 py-2 bg-[var(--primary-color)] text-white rounded-lg text-sm font-medium hover:opacity-90 transition focus:outline-none focus-visible:ring-4 focus-visible:ring-[var(--primary-color)]"
                        >
                            Try Again
                        </button>
                    </motion.div>
                )}

                {/* No Results State */}
                {!loading && !error && hasSearched && aiJobs.length === 0 && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-center py-16"
                    >
                        <p className="text-4xl mb-4">🔍</p>
                        <p className="text-[var(--text-primary)] font-semibold text-lg mb-2">No matching jobs found</p>
                        <p className="text-[var(--text-muted)] text-sm max-w-sm mx-auto mb-6">
                            Try broadening your query, changing location, or removing some accessibility filters.
                        </p>
                        <button onClick={clearSearch} className="px-5 py-2 bg-[var(--primary-color)] text-white rounded-lg text-sm font-medium hover:opacity-90 transition focus:outline-none focus-visible:ring-4 focus-visible:ring-[var(--primary-color)]">
                            Clear Filters
                        </button>
                    </motion.div>
                )}

                {/* Results */}
                {!loading && !error && aiJobs.length > 0 && (
                    <AnimatePresence>
                        <motion.div
                            key="results"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="space-y-5"
                        >
                            {/* Result count header */}
                            <div className="flex items-center justify-between flex-wrap gap-2 mb-4">
                                <h2 className="text-xl font-bold text-[var(--text-primary)]">
                                    {total} {total === 1 ? "job" : "jobs"} found
                                    {submittedQuery && <span className="text-[var(--text-muted)] font-normal text-base"> for "{submittedQuery}"</span>}
                                </h2>
                                <span className="text-xs text-[var(--text-muted)]">Ranked by accessibility compatibility</span>
                            </div>

                            {aiJobs.map((job, i) => (
                                <motion.div
                                    key={job._id || i}
                                    initial={{ opacity: 0, y: 16 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: i * 0.05 }}
                                >
                                    <AIJobCard job={job} />
                                </motion.div>
                            ))}
                        </motion.div>
                    </AnimatePresence>
                )}

                {/* Back Button (when not loading and searched) */}
                {hasSearched && !loading && (
                    <div className="mt-10 flex justify-center">
                        <button
                            onClick={() => navigate(-1)}
                            className="flex items-center gap-1.5 text-sm text-[var(--text-muted)] hover:text-[var(--primary-color)] transition focus:outline-none focus-visible:underline"
                            aria-label="Go back"
                        >
                            <ChevronLeft size={16} aria-hidden="true" /> Back
                        </button>
                    </div>
                )}
            </main>

            <Footer />
        </>
    );
}

export default AISearchResults;
