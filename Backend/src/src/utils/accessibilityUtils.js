/**
 * accessibilityUtils.js
 *
 * Maps frontend filter labels → DB field values,
 * calculates dynamic accessibility scores,
 * and detects barriers for a given user's needs.
 */

// ─── Frontend Label → DB Field Name ──────────────────────────────────────────
export const FRONTEND_TO_DB_MAP = {
    "wheelchair friendly": "wheelchair_access",
    "wheelchair accessible": "wheelchair_access",
    "wheelchair": "wheelchair_access",
    "elevator available": "elevator",
    "elevator": "elevator",
    "accessible restroom": "accessible_restroom",
    "restroom": "accessible_restroom",
    "braille support": "braille_signage",
    "braille": "braille_signage",
    "sign language support": "sign_language_support",
    "sign language": "sign_language_support",
    "quiet workspace": "quiet_workspace",
    "quiet": "quiet_workspace",
    "remote friendly": "remote_option",
    "remote": "remote_option",
    "accessible parking": "accessible_parking",
    "parking": "accessible_parking",
};

// ─── Scoring Weights ──────────────────────────────────────────────────────────
const SCORE_WEIGHTS = {
    wheelchair_access: 30,
    elevator: 20,
    accessible_restroom: 20,
    accessible_parking: 10,
    braille_signage: 10,
    sign_language_support: 10,
    quiet_workspace: 0, // present but no score weight (comfort feature)
};

/**
 * Dynamically calculates an accessibility score (0–100)
 * based on the features present in the job's accessibility_features array.
 *
 * @param {string[]} features - Job's accessibility_features array
 * @returns {number} Score out of 100
 */
export const calculateAccessibilityScore = (features = []) => {
    let score = 0;
    for (const feature of features) {
        const weight = SCORE_WEIGHTS[feature];
        if (weight) score += weight;
    }
    return Math.min(score, 100);
};

/**
 * Detects accessibility barriers — features the user requires that the job lacks.
 *
 * @param {string[]} userNeeds  - DB-mapped accessibility features the user needs
 * @param {string[]} jobFeatures - Job's accessibility_features array
 * @returns {string[]} List of barrier strings, e.g. ["no_elevator", "no_accessible_restroom"]
 */
export const detectBarriers = (userNeeds = [], jobFeatures = []) => {
    const barriers = [];
    for (const need of userNeeds) {
        if (!jobFeatures.includes(need)) {
            barriers.push(`no_${need}`);
        }
    }
    return barriers;
};

/**
 * Parses a natural language query and extracts structured filters.
 *
 * Returns:
 *  - role:        job title keywords to search
 *  - location:    extracted city/location string
 *  - accessibilityNeeds: array of DB-mapped feature names
 *  - remote:      boolean, whether remote was requested
 *
 * @param {string} query
 * @returns {{ role: string, location: string, accessibilityNeeds: string[], remote: boolean }}
 */
export const parseNaturalLanguageQuery = (query = "") => {
    const lower = query.toLowerCase();

    // ── Detect Location ──────────────────────────────────────────────────────
    // Look for patterns like "in Bangalore", "in New York", "at Mumbai"
    let location = "";
    const locationMatch = lower.match(/\b(?:in|at|near|from)\s+([a-z][a-z\s]{1,30}?)(?:\s+with|\s+and|\s+for|$)/);
    if (locationMatch) {
        location = locationMatch[1].trim();
    }

    // ── Detect Remote ────────────────────────────────────────────────────────
    const remote = /\bremote\b/.test(lower);

    // ── Detect Accessibility Needs ───────────────────────────────────────────
    const accessibilityNeeds = [];
    for (const [label, dbField] of Object.entries(FRONTEND_TO_DB_MAP)) {
        if (lower.includes(label) && !accessibilityNeeds.includes(dbField)) {
            // Don't double-add remote_option here since we handle it separately
            if (dbField !== "remote_option") {
                accessibilityNeeds.push(dbField);
            }
        }
    }

    // ── Extract Role ─────────────────────────────────────────────────────────
    // Strip known filler words and location/accessibility phrases to isolate the role
    let role = lower
        .replace(/\b(?:i need|i want|find me|show me|looking for|search for|need a|a\s+)\b/g, "")
        .replace(/\b(?:in|at|near|from)\s+[a-z][a-z\s]{1,30}?(?=\s+with|\s+and|\s+for|$)/g, "")
        .replace(/\bwith\s+[a-z\s]+$/g, "")
        .replace(/\b(?:job|role|position|opening)\b/g, "")
        .replace(/\b(?:remote|accessibility|accessible|wheelchair|elevator|braille|sign language|quiet|restroom|parking)\b/g, "")
        .replace(/\s{2,}/g, " ")
        .trim();

    return { role, location, accessibilityNeeds, remote };
};
