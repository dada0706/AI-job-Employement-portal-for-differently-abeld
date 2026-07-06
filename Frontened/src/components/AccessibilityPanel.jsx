import React, { useContext, useState, useRef, useEffect } from "react";
import { AccessibilityContext } from "../context/AccessibilityContext";
import { Settings, X, Moon, Sun, Type, Eye, VolumeX, Volume2 } from "lucide-react";

const AccessibilityPanel = () => {
    const [isOpen, setIsOpen] = useState(false);
    const panelRef = useRef(null);

    const {
        highContrast,
        setHighContrast,
        darkMode,
        setDarkMode,
        largeText,
        setLargeText,
        ttsEnabled,
        setTtsEnabled,
    } = useContext(AccessibilityContext);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (panelRef.current && !panelRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        document.addEventListener("touchstart", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
            document.removeEventListener("touchstart", handleClickOutside);
        };
    }, []);

    // Text-to-Speech Hover Logic
    useEffect(() => {
        if (!ttsEnabled) {
            window.speechSynthesis.cancel();
            return;
        }

        const handleMouseEnter = (e) => {
            const target = e.target;
            const validTags = ['P', 'H1', 'H2', 'H3', 'H4', 'H5', 'H6', 'SPAN'];
            // Also matching elements with class names typical for descriptions/titles as requested
            const isValidClass = target.classList?.contains('job-description') || target.classList?.contains('job-title');

            if (validTags.includes(target.tagName) || isValidClass) {
                const text = target.innerText?.trim();
                // Ensure it's not empty, not just whitespace, and not just a single character icon/symbol.
                if (text && text.length > 1) {
                    window.speechSynthesis.cancel(); // Stop any current speech
                    const utterance = new SpeechSynthesisUtterance(text);
                    window.speechSynthesis.speak(utterance);
                }
            }
        };

        const handleMouseLeave = (e) => {
            const target = e.target;
            const validTags = ['P', 'H1', 'H2', 'H3', 'H4', 'H5', 'H6', 'SPAN'];
            const isValidClass = target.classList?.contains('job-description') || target.classList?.contains('job-title');

            if (validTags.includes(target.tagName) || isValidClass) {
                window.speechSynthesis.cancel();
            }
        };

        // Attach globally
        document.addEventListener('mouseenter', handleMouseEnter, true);
        document.addEventListener('mouseleave', handleMouseLeave, true);

        return () => {
            document.removeEventListener('mouseenter', handleMouseEnter, true);
            document.removeEventListener('mouseleave', handleMouseLeave, true);
            window.speechSynthesis.cancel();
        };
    }, [ttsEnabled]);

    return (
        <div className="relative z-50">
            <button
                onClick={() => setIsOpen(!isOpen)}
                aria-label="Toggle Accessibility Panel"
                aria-expanded={isOpen}
                className="bg-blue-600 hover:bg-blue-700 text-white rounded-full p-4 shadow-lg flex items-center justify-center transition focus:outline-none focus-visible:ring-4 focus-visible:ring-blue-300"
            >
                {isOpen ? <X size={24} /> : <Settings size={24} />}
            </button>

            {isOpen && (
                <div
                    ref={panelRef}
                    role="dialog"
                    aria-label="Accessibility Settings"
                    className="absolute bottom-16 right-0 bg-white border border-gray-200 rounded-lg shadow-xl w-72 p-5 text-gray-800"
                >
                    <div className="flex justify-between items-center mb-4 border-b pb-2">
                        <h2 className="text-lg font-bold">Accessibility</h2>
                        <button
                            onClick={() => setIsOpen(false)}
                            aria-label="Close Accessibility Panel"
                            className="text-gray-500 hover:text-gray-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded"
                        >
                            <X size={20} />
                        </button>
                    </div>

                    <div className="space-y-4">
                        {/* Dark Mode */}
                        <div className="flex items-center justify-between">
                            <span className="flex items-center gap-2 text-sm font-medium">
                                {darkMode ? <Moon size={18} /> : <Sun size={18} />}
                                Dark Mode
                            </span>
                            <button
                                role="switch"
                                aria-checked={darkMode}
                                onClick={() => setDarkMode(!darkMode)}
                                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${darkMode ? "bg-blue-600" : "bg-gray-300"
                                    }`}
                            >
                                <span
                                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${darkMode ? "translate-x-6" : "translate-x-1"
                                        }`}
                                />
                            </button>
                        </div>

                        {/* High Contrast */}
                        <div className="flex items-center justify-between">
                            <span className="flex items-center gap-2 text-sm font-medium">
                                <Eye size={18} />
                                High Contrast
                            </span>
                            <button
                                role="switch"
                                aria-checked={highContrast}
                                onClick={() => setHighContrast(!highContrast)}
                                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${highContrast ? "bg-blue-600" : "bg-gray-300"
                                    }`}
                            >
                                <span
                                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${highContrast ? "translate-x-6" : "translate-x-1"
                                        }`}
                                />
                            </button>
                        </div>

                        {/* Large Text */}
                        <div className="flex items-center justify-between">
                            <span className="flex items-center gap-2 text-sm font-medium">
                                <Type size={18} />
                                Large Text
                            </span>
                            <button
                                role="switch"
                                aria-checked={largeText}
                                onClick={() => setLargeText(!largeText)}
                                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${largeText ? "bg-blue-600" : "bg-gray-300"
                                    }`}
                            >
                                <span
                                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${largeText ? "translate-x-6" : "translate-x-1"
                                        }`}
                                />
                            </button>
                        </div>

                        {/* Text-to-Speech */}
                        <div className="flex items-center justify-between">
                            <span className="flex items-center gap-2 text-sm font-medium">
                                {ttsEnabled ? <Volume2 size={18} /> : <VolumeX size={18} />}
                                Text to Speech
                            </span>
                            <button
                                role="switch"
                                aria-checked={ttsEnabled}
                                onClick={() => setTtsEnabled(!ttsEnabled)}
                                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${ttsEnabled ? "bg-blue-600" : "bg-gray-300"
                                    }`}
                            >
                                <span
                                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${ttsEnabled ? "translate-x-6" : "translate-x-1"
                                        }`}
                                />
                            </button>
                        </div>
                    </div>
                    {ttsEnabled && (
                        <p className="text-xs text-gray-500 mt-4 leading-tight">
                            Hover over text to hear it aloud.
                        </p>
                    )}
                </div>
            )}
        </div>
    );
};

export default AccessibilityPanel;
