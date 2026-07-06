import { useState, useCallback, useContext } from "react";
import { AppContext } from "../context/AppContext";

/**
 * useAISearch — shared hook for calling GET /api/jobs/ai-search
 *
 * Returns:
 *   aiJobs        — array of job results from the AI endpoint
 *   parsedFilters — { role, location, accessibility_needs, remote }
 *   total         — total result count
 *   loading       — true while fetching
 *   error         — error message string, or ""
 *   hasSearched   — true after at least one search has been run
 *   runSearch     — (query: string, features?: string[]) => void
 *   clearResults  — resets all state
 */
export function useAISearch() {
    const { backendUrl } = useContext(AppContext);

    const [aiJobs, setAiJobs] = useState([]);
    const [parsedFilters, setParsedFilters] = useState(null);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [hasSearched, setHasSearched] = useState(false);

    const runSearch = useCallback(async (query = "", features = []) => {
        if (!query.trim() && features.length === 0) return;

        setLoading(true);
        setError("");
        setHasSearched(true);

        try {
            const params = new URLSearchParams();
            if (query) params.set("q", query);
            if (features.length > 0) params.set("features", features.join(","));

            const res = await fetch(`${backendUrl}/job/ai-search?${params.toString()}`);
            if (!res.ok) throw new Error(`Server error: ${res.status}`);
            const data = await res.json();

            if (data.success) {
                setAiJobs(data.jobData || []);
                setParsedFilters(data.parsed_filters || null);
                setTotal(data.total || 0);
            } else {
                setError(data.message || "Search failed. Please try again.");
                setAiJobs([]);
            }
        } catch (err) {
            setError(err.message || "Could not connect to the AI search service.");
            setAiJobs([]);
        } finally {
            setLoading(false);
        }
    }, [backendUrl]);

    const clearResults = useCallback(() => {
        setAiJobs([]);
        setParsedFilters(null);
        setTotal(0);
        setError("");
        setHasSearched(false);
    }, []);

    return { aiJobs, parsedFilters, total, loading, error, hasSearched, runSearch, clearResults };
}
