import Job from "../models/Job.js";
import {
    parseNaturalLanguageQuery,
    calculateAccessibilityScore,
    detectBarriers,
} from "../utils/accessibilityUtils.js";

/**
 * GET /api/jobs/ai-search
 *
 * Query params:
 *   q          - Natural language search query (e.g. "frontend job in Bangalore with wheelchair access")
 *   location   - Optional explicit location override
 *   category   - Optional job category filter
 *   level      - Optional job level filter
 *   remote     - Optional "true" to filter remote jobs only
 *   features   - Comma-separated frontend label names (e.g. "Wheelchair Friendly,Elevator Available")
 *
 * Returns a ranked list of jobs with accessibility score, detected barriers, and match reason.
 */
export const aiSearchJobs = async (req, res) => {
    try {
        const {
            q = "",
            location: explicitLocation,
            category,
            level,
            remote: remoteParam,
            features: featuresParam,
        } = req.query;

        // ── 1. Parse Natural Language Query ──────────────────────────────────
        const {
            role,
            location: parsedLocation,
            accessibilityNeeds: nlpNeeds,
            remote: nlpRemote,
        } = parseNaturalLanguageQuery(q);

        // Merge explicit params with NLP-parsed values
        const effectiveLocation = explicitLocation || parsedLocation;
        const effectiveRemote = remoteParam === "true" || nlpRemote;

        // Parse comma-separated frontend feature labels from query param
        let featureNeeds = [];
        if (featuresParam) {
            // These arrive as frontend display labels like "Wheelchair Friendly"
            const { FRONTEND_TO_DB_MAP } = await import("../utils/accessibilityUtils.js");
            featureNeeds = featuresParam
                .split(",")
                .map((f) => f.trim().toLowerCase())
                .map((f) => FRONTEND_TO_DB_MAP[f])
                .filter(Boolean);
        }

        // Combined user accessibility needs (NLP + explicit filter params)
        const userNeeds = [...new Set([...nlpNeeds, ...featureNeeds])];

        // ── 2. Build MongoDB Query ────────────────────────────────────────────
        const mongoQuery = { visible: true };

        // Text search on title + description using role keywords
        if (role) {
            mongoQuery.$or = [
                { title: { $regex: role, $options: "i" } },
                { description: { $regex: role, $options: "i" } },
                { category: { $regex: role, $options: "i" } },
                { required_skills: { $elemMatch: { $regex: role, $options: "i" } } },
            ];
        }

        // Location filter
        if (effectiveLocation) {
            mongoQuery.location = { $regex: effectiveLocation, $options: "i" };
        }

        // Category filter
        if (category && category !== "All") {
            mongoQuery.category = category;
        }

        // Level filter
        if (level && level !== "All") {
            mongoQuery.level = level;
        }

        // Remote filter
        if (effectiveRemote) {
            mongoQuery.remote_option = true;
        }

        // Accessibility features filter — only include jobs that have ALL required features
        if (userNeeds.length > 0) {
            mongoQuery.accessibility_features = { $all: userNeeds };
        }

        // ── 3. Fetch Jobs ─────────────────────────────────────────────────────
        const rawJobs = await Job.find(mongoQuery)
            .populate("companyId", "-password")
            .lean();

        // If zero results with strict feature filter, fall back to soft match
        let jobs = rawJobs;
        if (jobs.length === 0 && userNeeds.length > 0) {
            // Soft fallback: remove strict feature filter, score and rank instead
            delete mongoQuery.accessibility_features;
            jobs = await Job.find(mongoQuery)
                .populate("companyId", "-password")
                .lean();
        }

        // ── 4. Score, Detect Barriers & Build Response ────────────────────────
        const results = jobs.map((job) => {
            const features = job.accessibility_features || [];

            // Dynamically recalculate score from features in DB
            const accessibilityScore = calculateAccessibilityScore(features);

            // Detect barriers for this specific user's needs
            const barriersDetected = detectBarriers(userNeeds, features);

            // Compute a match reason string
            const matchedFeatures = userNeeds.filter((n) => features.includes(n));
            let matchReason = "";
            if (matchedFeatures.length === userNeeds.length && userNeeds.length > 0) {
                matchReason = `Fully accessible: all ${userNeeds.length} required feature(s) available`;
            } else if (matchedFeatures.length > 0) {
                matchReason = `Partially accessible: ${matchedFeatures.length} of ${userNeeds.length} required feature(s) available`;
            } else if (userNeeds.length === 0) {
                matchReason = role ? `Matched by role: "${role}"` : "Matched all visible jobs";
            } else {
                matchReason = "No accessibility features matched – check barriers";
            }

            // Boost score for jobs with no barriers (full match)
            const rankingScore = accessibilityScore + (barriersDetected.length === 0 && userNeeds.length > 0 ? 20 : 0);

            return {
                job_title: job.title,
                company: job.companyId?.name || "Unknown Company",
                location: job.location,
                level: job.level,
                category: job.category,
                salary: job.salary,
                remote_option: job.remote_option,
                accessibility_score: accessibilityScore,
                accessibility_features: features,
                barriers_detected: barriersDetected,
                match_reason: matchReason,
                accommodations_available: job.accommodations_available || [],
                inclusive_hiring_policy: job.inclusive_hiring_policy || null,
                _rankingScore: rankingScore,
                _id: job._id,
            };
        });

        // ── 5. Rank by Accessibility Score ────────────────────────────────────
        results.sort((a, b) => b._rankingScore - a._rankingScore);

        // Remove internal ranking field from final output
        const finalResults = results.map(({ _rankingScore, ...job }) => job);

        return res.status(200).json({
            success: true,
            query: q,
            parsed_filters: {
                role,
                location: effectiveLocation,
                accessibility_needs: userNeeds,
                remote: effectiveRemote,
            },
            total: finalResults.length,
            jobData: finalResults,
        });

    } catch (error) {
        console.error("AI Search Error:", error);
        return res.status(500).json({
            success: false,
            message: "AI job search failed",
        });
    }
};
