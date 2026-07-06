import React, { createContext, useState, useEffect } from "react";

export const AccessibilityContext = createContext();

export const AccessibilityProvider = ({ children }) => {
    const [highContrast, setHighContrast] = useState(false);
    const [darkMode, setDarkMode] = useState(false);
    const [largeText, setLargeText] = useState(false);
    const [ttsEnabled, setTtsEnabled] = useState(false);

    useEffect(() => {
        const root = document.documentElement;
        if (highContrast) {
            root.classList.add("theme-high-contrast");
        } else {
            root.classList.remove("theme-high-contrast");
        }

        if (darkMode) {
            root.classList.add("theme-dark");
        } else {
            root.classList.remove("theme-dark");
        }

        if (largeText) {
            root.classList.add("text-large");
        } else {
            root.classList.remove("text-large");
        }
    }, [highContrast, darkMode, largeText]);

    // Simple TTS function
    const speak = (text) => {
        if (!ttsEnabled || !window.speechSynthesis) return;
        window.speechSynthesis.cancel(); // Cancel any ongoing speech
        const utterance = new SpeechSynthesisUtterance(text);
        window.speechSynthesis.speak(utterance);
    };

    const value = {
        highContrast,
        setHighContrast,
        darkMode,
        setDarkMode,
        largeText,
        setLargeText,
        ttsEnabled,
        setTtsEnabled,
        speak,
    };

    return (
        <AccessibilityContext.Provider value={value}>
            {children}
        </AccessibilityContext.Provider>
    );
};
