import React, { useState, useEffect } from "react";
import moment from "moment";
import kConverter from "k-convert";
import { assets } from "../assets/assets";
import { MapPin, Clock, User, CheckCircle2, Volume2, Square } from "lucide-react";
import { useNavigate } from "react-router-dom";

const JobCard = ({ job }) => {
  const navigate = useNavigate();
  const [isSpeaking, setIsSpeaking] = useState(false);

  // Generate consistent pseudo-random accessibility badges based on job ID
  const getBadges = (id) => {
    const badges = [];
    const charCode = id ? id.charCodeAt(id.length - 1) : 0;
    if (charCode % 2 === 0) badges.push({ text: "Remote", color: "bg-[var(--badge-blue-bg)] text-[var(--badge-blue-text)]" });
    if (charCode % 3 === 0) badges.push({ text: "Wheelchair Accessible", color: "bg-[var(--badge-green-bg)] text-[var(--badge-green-text)]" });
    if (charCode % 4 === 0) badges.push({ text: "Screen Reader Friendly", color: "bg-[var(--badge-purple-bg)] text-[var(--badge-purple-text)]" });
    if (charCode % 5 === 0) badges.push({ text: "Flexible Hours", color: "bg-[var(--badge-teal-bg)] text-[var(--badge-teal-text)]" });
    if (badges.length === 0) badges.push({ text: "Inclusive Employer", color: "bg-[var(--badge-orange-bg)] text-[var(--badge-orange-text)]" });
    return badges;
  };

  const accessibilityBadges = getBadges(job._id);

  const handleCardClick = (e) => {
    // Don't navigate if clicking the listen button
    if (e.target.closest('.listen-btn')) return;
    navigate(`/apply-job/${job._id}`);
    window.scrollTo(0, 0);
  };

  const handleSpeech = (e) => {
    e.stopPropagation();

    if (!window.speechSynthesis) {
      alert("Text-to-speech is not supported in your browser.");
      return;
    }

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    // Cancel any ongoing speech from other cards
    window.speechSynthesis.cancel();

    const companyName = job.companyId?.name || "Unknown Company";
    const salaryText = job.salary ? kConverter.convertTo(job.salary) : "Not disclosed";
    const badgesText = accessibilityBadges.map(b => b.text).join(", ");

    const textToRead = `${job.title} at ${companyName}. 
      Location: ${job.location}. 
      Level: ${job.level}. 
      Salary: ${salaryText}. 
      Accessibility features: ${badgesText}.`;

    const utterance = new SpeechSynthesisUtterance(textToRead);

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.speak(utterance);
  };

  // Clean up speech if component unmounts
  useEffect(() => {
    return () => {
      if (isSpeaking) {
        window.speechSynthesis.cancel();
      }
    };
  }, [isSpeaking]);

  return (
    <div
      role="button"
      tabIndex={0}
      aria-label={`View details for ${job.title} at ${job.companyId?.name || "Company"}`}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          handleCardClick(e);
        }
      }}
      onClick={handleCardClick}
      className="flex flex-col sm:flex-row gap-4 rounded-lg border border-[var(--border-color)] p-5 hover:shadow transition cursor-pointer bg-[var(--card-bg)] focus:outline-none focus-visible:ring-4 focus-visible:ring-[var(--primary-color)] relative"
    >
      <img
        className="w-[50px] h-[50px] object-contain shrink-0 rounded-md bg-white p-1"
        src={job.companyId?.image || assets.company_icon}
        alt={`${job.companyId?.name || "Company"} Logo`}
      />
      <div className="flex-1 w-full m-0 p-0">
        <div className="flex justify-between items-start gap-2">
          <h2 className="text-xl text-[var(--text-primary)] font-semibold mb-1">
            {job.title}
          </h2>
          <button
            onClick={handleSpeech}
            aria-label={isSpeaking ? "Stop listening to job description" : "Listen to job description"}
            className="listen-btn shrink-0 flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-[var(--primary-color)] bg-[var(--border-color)] hover:opacity-80 rounded-md transition-opacity focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary-color)] z-10"
          >
            {isSpeaking ? (
              <>
                <Square size={16} aria-hidden="true" />
                <span>Stop</span>
              </>
            ) : (
              <>
                <Volume2 size={16} aria-hidden="true" />
                <span>Listen</span>
              </>
            )}
          </button>
        </div>
        <div className="flex flex-wrap items-center gap-4 text-[var(--text-color)] mt-2 mb-3">
          <div className="flex items-center gap-2">
            <img src={assets.suitcase_icon} alt="Company" aria-hidden="true" className="opacity-70 dark:invert" />
            <span>{job.companyId?.name || "Unknown Company"}</span>
          </div>
          <div className="flex items-center gap-2 text-[var(--text-muted)]">
            <User size={20} aria-hidden="true" />
            <span>{job.level}</span>
          </div>
          <div className="flex items-center gap-2 text-[var(--text-muted)]">
            <MapPin size={19} aria-hidden="true" />
            <span>{job.location}</span>
          </div>
          <div className="flex items-center gap-2 text-[var(--text-muted)]">
            <Clock size={19} aria-hidden="true" />
            <span>{moment(job.date).fromNow()}</span>
          </div>
          <div className="flex items-center gap-2 text-[var(--text-muted)]">
            <img src={assets.money_icon} alt="Salary" aria-hidden="true" className="opacity-70 dark:invert" />
            <span>
              CTC:{" "}
              {job.salary ? kConverter.convertTo(job.salary) : "Not disclosed"}
            </span>
          </div>
        </div>

        {/* Accessibility Badges */}
        <div className="flex flex-wrap gap-2 mt-3 pt-3 border-t border-[var(--border-color)]" aria-label="Accessibility Features">
          {accessibilityBadges.map((badge, idx) => (
            <span
              key={idx}
              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${badge.color}`}
            >
              <CheckCircle2 size={12} aria-hidden="true" />
              {badge.text}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};

export default JobCard;
