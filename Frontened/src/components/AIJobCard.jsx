import React, { useState, useEffect } from "react";
import {
    MapPin,
    User,
    Volume2,
    Square,
    CheckCircle2,
    AlertTriangle,
    ShieldCheck,
    Briefcase,
    DollarSign,
    Wifi,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

// ─── Label maps ───────────────────────────────────────────────────────────────
const FEATURE_LABELS = {
    wheelchair_access: "Wheelchair Access",
    elevator: "Elevator Available",
    accessible_restroom: "Accessible Restroom",
    accessible_parking: "Accessible Parking",
    braille_signage: "Braille Signage",
    sign_language_support: "Sign Language Support",
    quiet_workspace: "Quiet Workspace",
};

const BARRIER_LABELS = {
    no_wheelchair_access: "No Wheelchair Access",
    no_elevator: "No Elevator",
    no_accessible_restroom: "No Accessible Restroom",
    no_accessible_parking: "No Accessible Parking",
    no_braille_signage: "No Braille Signage",
    no_sign_language_support: "No Sign Language Support",
    no_quiet_workspace: "No Quiet Workspace",
};

// ─── Score colour helper ──────────────────────────────────────────────────────
const getScoreStyle = (score) => {
    if (score >= 80) return {
        bar: "bg-green-500",
        text: "text-green-700",
        bg: "bg-green-50",
        border: "border-green-200",
        label: "High",
    };
    if (score >= 60) return {
        bar: "bg-yellow-400",
        text: "text-yellow-700",
        bg: "bg-yellow-50",
        border: "border-yellow-200",
        label: "Medium",
    };
    return {
        bar: "bg-red-400",
        text: "text-red-700",
        bg: "bg-red-50",
        border: "border-red-200",
        label: "Low",
    };
};

// ─── Component ────────────────────────────────────────────────────────────────
const AIJobCard = ({ job }) => {
    const navigate = useNavigate();
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [showAccommodations, setShowAccommodations] = useState(false);

    const {
        job_title,
        company,
        location,
        level,
        salary,
        remote_option,
        accessibility_score = 0,
        accessibility_features = [],
        barriers_detected = [],
        match_reason = "",
        accommodations_available = [],
        inclusive_hiring_policy,
        _id,
    } = job;

    const s = getScoreStyle(accessibility_score);

    // ── Navigation ────────────────────────────────────────────────────────────
    const goToJob = () => {
        if (_id) { navigate(`/apply-job/${_id}`); window.scrollTo(0, 0); }
    };

    const handleCardClick = (e) => {
        if (e.target.closest(".no-nav")) return;
        goToJob();
    };

    // ── Text-to-speech ────────────────────────────────────────────────────────
    const handleSpeech = (e) => {
        e.stopPropagation();
        if (!window.speechSynthesis) { alert("Text-to-speech is not supported in your browser."); return; }
        if (isSpeaking) { window.speechSynthesis.cancel(); setIsSpeaking(false); return; }
        window.speechSynthesis.cancel();
        const featuresText = accessibility_features.map(f => FEATURE_LABELS[f] || f).join(", ") || "none listed";
        const barriersText = barriers_detected.map(b => BARRIER_LABELS[b] || b).join(", ") || "none";
        const utt = new SpeechSynthesisUtterance(
            `${job_title} at ${company}. Location: ${location}. Level: ${level || "not specified"}. ` +
            `Accessibility score: ${accessibility_score} out of 100. Features: ${featuresText}. Barriers: ${barriersText}.`
        );
        utt.onstart = () => setIsSpeaking(true);
        utt.onend = () => setIsSpeaking(false);
        utt.onerror = () => setIsSpeaking(false);
        window.speechSynthesis.speak(utt);
    };

    useEffect(() => () => { if (isSpeaking) window.speechSynthesis.cancel(); }, [isSpeaking]);

    return (
        <article
            role="button"
            tabIndex={0}
            aria-label={`${job_title} at ${company}. Accessibility score ${accessibility_score} out of 100.`}
            onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); goToJob(); } }}
            onClick={handleCardClick}
            className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 overflow-hidden"
        >
            {/* ── Accessibility Score Banner ──────────────────────────────── */}
            <div className={`px-6 py-3 flex items-center justify-between ${s.bg} border-b ${s.border}`}>
                <div className="flex items-center gap-2">
                    <ShieldCheck size={15} className={s.text} aria-hidden="true" />
                    <span className={`text-sm font-medium ${s.text}`}>
                        Accessibility Score — <span className="font-semibold">{accessibility_score}/100</span>
                        <span className="ml-1.5 font-normal opacity-70">({s.label})</span>
                    </span>
                </div>
                {/* Slim progress bar */}
                <div className="hidden sm:flex items-center gap-2 w-32">
                    <div
                        className="flex-1 h-1.5 bg-gray-200 rounded-full overflow-hidden"
                        role="progressbar"
                        aria-valuenow={accessibility_score}
                        aria-valuemin={0}
                        aria-valuemax={100}
                        aria-label={`Accessibility score ${accessibility_score} of 100`}
                    >
                        <div
                            className={`h-full ${s.bar} rounded-full transition-all duration-500`}
                            style={{ width: `${accessibility_score}%` }}
                        />
                    </div>
                    <span className={`text-xs font-semibold ${s.text} w-8 text-right`}>{accessibility_score}%</span>
                </div>
            </div>

            {/* ── Card Body ──────────────────────────────────────────────── */}
            <div className="p-6">

                {/* Header: title + listen button */}
                <div className="flex items-start justify-between gap-3 mb-1">
                    <h2 className="text-lg font-semibold text-gray-900 leading-snug">{job_title}</h2>
                    <button
                        onClick={handleSpeech}
                        aria-label={isSpeaking ? "Stop listening" : "Listen to job summary"}
                        className="no-nav shrink-0 flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                    >
                        {isSpeaking
                            ? <><Square size={13} aria-hidden="true" /><span>Stop</span></>
                            : <><Volume2 size={13} aria-hidden="true" /><span>Listen</span></>}
                    </button>
                </div>

                {/* Company + meta line */}
                <p className="text-sm text-gray-500 mb-3">{company}</p>

                <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-gray-500 mb-4">
                    {location && (
                        <span className="flex items-center gap-1.5">
                            <MapPin size={13} aria-hidden="true" />{location}
                        </span>
                    )}
                    {level && (
                        <span className="flex items-center gap-1.5">
                            <User size={13} aria-hidden="true" />{level}
                        </span>
                    )}
                    {salary && (
                        <span className="flex items-center gap-1.5">
                            <DollarSign size={13} aria-hidden="true" />₹{(salary / 1000).toFixed(0)}K CTC
                        </span>
                    )}
                    {remote_option && (
                        <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 text-xs font-medium">
                            <Wifi size={12} aria-hidden="true" />Remote
                        </span>
                    )}
                    {inclusive_hiring_policy && (
                        <a
                            href={inclusive_hiring_policy}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={e => e.stopPropagation()}
                            className="no-nav flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200 text-xs font-medium hover:bg-indigo-100 transition-colors"
                        >
                            <Briefcase size={12} aria-hidden="true" />Inclusion Policy
                        </a>
                    )}
                </div>

                {/* Match reason */}
                {match_reason && (
                    <p className="text-xs text-gray-400 italic mb-4 leading-relaxed">
                        {match_reason}
                    </p>
                )}

                {/* ── Accessible Features ─────────────────────────────────── */}
                {accessibility_features.length > 0 && (
                    <div className="mb-3">
                        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                            Accessible Features
                        </h3>
                        <div className="flex flex-wrap gap-1.5">
                            {accessibility_features.map((f, i) => (
                                <span
                                    key={i}
                                    className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-green-50 text-green-700 border border-green-200"
                                >
                                    <CheckCircle2 size={11} aria-hidden="true" />
                                    {FEATURE_LABELS[f] || f}
                                </span>
                            ))}
                        </div>
                    </div>
                )}

                {/* ── Barriers ───────────────────────────────────────────── */}
                {barriers_detected.length > 0 && (
                    <div className="mb-3">
                        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                            Barriers Detected
                        </h3>
                        <div className="flex flex-wrap gap-1.5">
                            {barriers_detected.map((b, i) => (
                                <span
                                    key={i}
                                    className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-red-50 text-red-700 border border-red-200"
                                >
                                    <AlertTriangle size={11} aria-hidden="true" />
                                    {BARRIER_LABELS[b] || b.replace(/_/g, " ")}
                                </span>
                            ))}
                        </div>
                    </div>
                )}

                {/* ── Accommodations ─────────────────────────────────────── */}
                {accommodations_available.length > 0 && (
                    <div className="mb-4 pt-3 border-t border-gray-100">
                        <button
                            className="no-nav text-xs font-medium text-blue-600 hover:text-blue-800 hover:underline focus:outline-none focus-visible:underline transition-colors"
                            onClick={(e) => { e.stopPropagation(); setShowAccommodations(v => !v); }}
                            aria-expanded={showAccommodations}
                        >
                            {showAccommodations ? "Hide" : "View"} accommodations ({accommodations_available.length})
                        </button>
                        {showAccommodations && (
                            <ul className="mt-2 space-y-1 list-disc list-inside text-xs text-gray-500">
                                {accommodations_available.map((a, i) => <li key={i}>{a}</li>)}
                            </ul>
                        )}
                    </div>
                )}

                {/* ── Footer: Apply button ───────────────────────────────── */}
                <div className="flex justify-end pt-3 border-t border-gray-100">
                    <button
                        aria-label={`Apply for ${job_title}`}
                        className="no-nav px-5 py-2 bg-[var(--primary-color)] hover:opacity-90 text-white text-sm font-semibold rounded-lg transition-opacity focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary-color)] focus-visible:ring-offset-2"
                        onClick={(e) => { e.stopPropagation(); goToJob(); }}
                    >
                        Apply Now
                    </button>
                </div>
            </div>
        </article>
    );
};

export default AIJobCard;
