// File: src/App.tsx

import React, { useState, useEffect, useCallback, useRef } from 'react';
import Header from './components/Header';
import Dashboard from './components/Dashboard';
import AdminDashboard from './components/admin/AdminDashboard';
import Notification from './components/Notification';
import SettingsModal from './components/SettingsModal';
import LoginModal from './components/LoginModal'; // Importing the file you just created
import type { EarthquakeEvent, Language, Settings, Severity, SentAlert } from './types';
import { INITIAL_EVENTS, INDIAN_CITIES, TRANSLATIONS } from './constants';
import { subscribeToSmsAlerts, unsubscribeFromSmsAlerts } from './services/smsService';


const SETTINGS_STORAGE_KEY = 'earthquake_alert_settings';
const THEME_STORAGE_KEY = 'earthquake_alert_theme';
const EVENTS_CACHE_STORAGE_KEY = 'earthquake_events_cache';
const PHONE_NUMBER_STORAGE_KEY = 'earthquake_alert_phone_number';


interface AppNotification {
    message: string;
    type: 'success' | 'alert';
}

type Theme = 'light' | 'dark';
type MapLoadingStatus = 'loading' | 'success' | 'error';
export type SmsSubscriptionStatus = 'idle' | 'subscribing' | 'subscribed' | 'unsubscribing' | 'error';


const App: React.FC = () => {
    const [events, setEvents] = useState<EarthquakeEvent[]>(INITIAL_EVENTS);
    const [selectedEvent, setSelectedEvent] = useState<EarthquakeEvent | null>(INITIAL_EVENTS[0]);
    const [language, setLanguage] = useState<Language>('en');
    const [sentAlertsLog, setSentAlertsLog] = useState<SentAlert[]>([]);
    const [notification, setNotification] = useState<AppNotification | null>(null);
    const [isMapNavigating, setIsMapNavigating] = useState(false);

    // --- AUTH STATES ---
    const [view, setView] = useState<'user' | 'admin'>('user');
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
    // -------------------

    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const [settings, setSettings] = useState<Settings>({
        alertThreshold: 6.0,
        alertSound: 'beep',
    });
    const [theme, setTheme] = useState<Theme>('dark');
    const [mapLoadingStatus, setMapLoadingStatus] = useState<MapLoadingStatus>('loading');
    const [alertsFeedTrigger, setAlertsFeedTrigger] = useState(0);
    const [severeAlert, setSevereAlert] = useState<EarthquakeEvent | null>(null);
    const [ntfyTopic, setNtfyTopic] = useState<string>('');
    const [userPhoneNumber, setUserPhoneNumber] = useState<string | null>(null);
    const [smsSubscriptionStatus, setSmsSubscriptionStatus] = useState<SmsSubscriptionStatus>('idle');
    const audioContextRef = useRef<AudioContext | null>(null);
    const severeAlertTimerRef = useRef<number | null>(null);


    // Google Maps Loading Logic
    useEffect(() => {
        (window as any).gm_authFailure = () => {
            console.error("Google Maps authentication failed. Check API key and project settings.");
            setMapLoadingStatus('error');
        };

        if (window.google?.maps) {
            setMapLoadingStatus('success');
            return;
        }

        if (document.querySelector('script[src*="maps.googleapis.com"]')) {
            return;
        }

        const script = document.createElement('script');
        script.src = `https://maps.googleapis.com/maps/api/js?libraries=visualization`;
        script.async = true;
        script.defer = true;

        script.onload = () => {
            setMapLoadingStatus(prev => prev === 'error' ? 'error' : 'success');
        };
        script.onerror = () => {
            console.error("Failed to load the Google Maps script. Check network connection.");
            setMapLoadingStatus('error');
        };

        document.head.appendChild(script);

        return () => {
            delete (window as any).gm_authFailure;
        };
    }, []);

    // Load Local Storage Data
    useEffect(() => {
        try {
            const storedEvents = localStorage.getItem(EVENTS_CACHE_STORAGE_KEY);
            if (storedEvents) {
                const parsedEvents = JSON.parse(storedEvents);
                if (Array.isArray(parsedEvents) && parsedEvents.length > 0) {
                    setEvents(parsedEvents);
                }
            }

            const storedSettings = localStorage.getItem(SETTINGS_STORAGE_KEY);
            if (storedSettings) {
                setSettings(prevSettings => ({ ...prevSettings, ...JSON.parse(storedSettings) }));
            }
            const storedTheme = localStorage.getItem(THEME_STORAGE_KEY) as Theme | null;
            if (storedTheme) {
                setTheme(storedTheme);
            } else if (window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches) {
                setTheme('light');
            }
            const storedPhoneNumber = localStorage.getItem(PHONE_NUMBER_STORAGE_KEY);
            if (storedPhoneNumber) {
                setUserPhoneNumber(storedPhoneNumber);
                setSmsSubscriptionStatus('subscribed');
            }
        } catch (error) {
            console.error("Failed to load data from local storage", error);
        }
    }, []);

    // Theme Handling
    useEffect(() => {
        const root = window.document.documentElement;
        if (theme === 'dark') {
            root.classList.add('dark');
        } else {
            root.classList.remove('dark');
        }
        try {
            localStorage.setItem(THEME_STORAGE_KEY, theme);
        } catch (error) {
            console.error("Failed to save theme to local storage", error);
        }
    }, [theme]);

    // Save Events Cache
    useEffect(() => {
        try {
            localStorage.setItem(EVENTS_CACHE_STORAGE_KEY, JSON.stringify(events));
        } catch (error) {
            console.error("Failed to save events to local storage", error);
        }
    }, [events]);

    const playAlertSound = useCallback(() => {
        if (!settings.alertSound || settings.alertSound === 'none') return;

        if (!audioContextRef.current) {
            audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
        }
        const audioContext = audioContextRef.current;
        if (!audioContext) return;

        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);

        gainNode.gain.setValueAtTime(0, audioContext.currentTime);
        gainNode.gain.linearRampToValueAtTime(0.3, audioContext.currentTime + 0.01);

        switch (settings.alertSound) {
            case 'beep':
                oscillator.type = 'sine';
                oscillator.frequency.setValueAtTime(880, audioContext.currentTime);
                break;
            case 'chime':
                oscillator.type = 'triangle';
                oscillator.frequency.setValueAtTime(1046.50, audioContext.currentTime);
                break;
            case 'urgent':
                oscillator.type = 'sawtooth';
                oscillator.frequency.setValueAtTime(1200, audioContext.currentTime);
                oscillator.frequency.linearRampToValueAtTime(1000, audioContext.currentTime + 0.1);
                break;
        }

        oscillator.start(audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.00001, audioContext.currentTime + 0.5);
        oscillator.stop(audioContext.currentTime + 0.5);
    }, [settings.alertSound]);

    // Live Event Polling
    const fetchEvents = useCallback(async () => {
        try {
            const response = await fetch('/api/events?limit=50');
            if (!response.ok) return;
            const data: EarthquakeEvent[] = await response.json();

            setEvents(prevEvents => {
                // Check if the latest event is new and severe to trigger alert
                if (data.length > 0 && prevEvents.length > 0) {
                    const latestNew = data[0];
                    const latestOld = prevEvents[0];
                    if (latestNew.id !== latestOld.id && latestNew.magnitude >= settings.alertThreshold) {
                        // Trigger Notification
                        setNotification({ message: `New Alert: M${latestNew.magnitude.toFixed(1)} near ${latestNew.location.city}!`, type: 'alert' });
                        setSevereAlert(latestNew);
                        playAlertSound();

                        if (severeAlertTimerRef.current) clearTimeout(severeAlertTimerRef.current);
                        severeAlertTimerRef.current = window.setTimeout(() => setSevereAlert(null), 30000);
                    }
                }
                return data;
            });
        } catch (error) {
            console.error("Failed to fetch events", error);
        }
    }, [settings.alertThreshold, playAlertSound]);

    useEffect(() => {
        fetchEvents();
        const interval = setInterval(fetchEvents, 30000); // Poll every 30 seconds
        return () => {
            clearInterval(interval);
            if (severeAlertTimerRef.current) clearTimeout(severeAlertTimerRef.current);
        };
    }, [fetchEvents]);

    // --- AUTH & NAVIGATION HANDLERS ---

    const handleViewChangeClick = () => {
        if (view === 'user') {
            // If trying to access Admin, check if authenticated
            if (isAuthenticated) {
                setView('admin');
            } else {
                setIsLoginModalOpen(true);
            }
        } else {
            // Returning to User view is always allowed
            setView('user');
        }
    };

    const handleLogin = (success: boolean) => {
        if (success) {
            setIsAuthenticated(true);
            setView('admin');
            setIsLoginModalOpen(false);
            setNotification({ message: 'Welcome back, Admin.', type: 'success' });
        }
    };

    // ----------------------------------

    const handleSendBroadcast = useCallback(async (alertId: number) => {
        const alertToSend = sentAlertsLog.find(alert => alert.id === alertId);
        if (!alertToSend || !ntfyTopic) {
            setNotification({ message: `Notification channel not configured. Please wait a moment.`, type: 'alert' });
            return;
        }

        setSentAlertsLog(prev => prev.map(alert =>
            alert.id === alertId ? { ...alert, status: 'sending' } : alert
        ));

        try {
            const response = await fetch(`https://ntfy.sh/${ntfyTopic}`, {
                method: 'POST',
                body: alertToSend.message,
                headers: {
                    'Title': `🚨 SEVERE EARTHQUAKE: M${alertToSend.event.magnitude.toFixed(1)} near ${alertToSend.event.location.city}`,
                    'Priority': 'urgent',
                    'Tags': 'warning,earthquake'
                }
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({ detail: 'Failed to send broadcast.' }));
                throw new Error(errorData.detail || 'Failed to send broadcast.');
            }

            setSentAlertsLog(prev => prev.map(alert =>
                alert.id === alertId ? { ...alert, status: 'sent', timestamp: new Date().toISOString() } : alert
            ));

        } catch (error) {
            console.error("Broadcast failed:", error);
            setSentAlertsLog(prev => prev.map(alert =>
                alert.id === alertId ? { ...alert, status: 'failed' } : alert
            ));
            setNotification({ message: `Broadcast failed for alert near ${alertToSend.event.location.city}. Please check your connection and retry.`, type: 'alert' });
        }
    }, [sentAlertsLog, ntfyTopic]);

    const handleSelectEvent = useCallback((event: EarthquakeEvent, isNavigation = false) => {
        setSelectedEvent(event);
        if (isNavigation) {
            setIsMapNavigating(true);
            setTimeout(() => setIsMapNavigating(false), 1000);
        }
    }, []);

    const handleDismissSevereAlert = useCallback(() => {
        if (severeAlertTimerRef.current) {
            clearTimeout(severeAlertTimerRef.current);
        }
        setSevereAlert(null);
    }, []);

    const handleSettingsChange = (newSettings: Partial<Settings>) => {
        setSettings(prev => {
            const updated = { ...prev, ...newSettings };
            localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(updated));
            return updated;
        });
    };

    const handleRetrainComplete = useCallback((success: boolean, accuracy?: number) => {
        if (success) {
            const message = TRANSLATIONS[language].retrainSuccess.replace('{accuracy}', accuracy?.toFixed(2) ?? 'N/A');
            setNotification({ message, type: 'success' });
        } else {
            setNotification({ message: TRANSLATIONS[language].retrainFailed, type: 'alert' });
        }
    }, [language]);

    const handleSmsSent = useCallback((success: boolean) => {
        if (success) {
            setNotification({ message: TRANSLATIONS[language].smsSentSuccess, type: 'success' });
        } else {
            setNotification({ message: TRANSLATIONS[language].smsSentFailed, type: 'alert' });
        }
    }, [language]);

    const handleSmsSubscribe = useCallback(async (phoneNumber: string) => {
        setSmsSubscriptionStatus('subscribing');
        try {
            await subscribeToSmsAlerts(phoneNumber);
            localStorage.setItem(PHONE_NUMBER_STORAGE_KEY, phoneNumber);
            setUserPhoneNumber(phoneNumber);
            setSmsSubscriptionStatus('subscribed');
            setNotification({ message: TRANSLATIONS[language].subscriptionSuccessful, type: 'success' });
        } catch (error) {
            setSmsSubscriptionStatus('error');
            setNotification({ message: TRANSLATIONS[language].subscriptionFailed, type: 'alert' });
        }
    }, [language]);

    const handleSmsUnsubscribe = useCallback(async () => {
        if (!userPhoneNumber) return;
        setSmsSubscriptionStatus('unsubscribing');
        try {
            await unsubscribeFromSmsAlerts(userPhoneNumber);
            localStorage.removeItem(PHONE_NUMBER_STORAGE_KEY);
            setUserPhoneNumber(null);
            setSmsSubscriptionStatus('idle');
        } catch (error) {
            setSmsSubscriptionStatus('error');
            setNotification({ message: TRANSLATIONS[language].unsubscribeFailed, type: 'alert' });
        }
    }, [userPhoneNumber, language]);

    const latestAlert = sentAlertsLog.filter(a => a.status === 'sent').sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())[0] || null;

    return (
        <div className={`min-h-screen font-sans transition-colors duration-300 ${theme === 'dark' ? 'dark bg-gray-900 text-gray-100' : 'bg-white text-gray-900'}`}>
            <Header
                currentLanguage={language}
                onLanguageChange={(lang) => setLanguage(lang as Language)}
                currentView={view}
                onViewChange={handleViewChangeClick} // Updated handler
                onOpenSettings={() => setIsSettingsOpen(true)}
                theme={theme}
                onThemeChange={() => setTheme(t => t === 'light' ? 'dark' : 'light')}
                events={events}
                onAlertsIconClick={() => setAlertsFeedTrigger(Date.now())}
            />
            <main className="p-4 sm:p-6 lg:p-8">
                {view === 'user' ? (
                    <Dashboard
                        events={events}
                        selectedEvent={selectedEvent}
                        onSelectEvent={handleSelectEvent}
                        language={language}
                        sentAlertsLog={sentAlertsLog}
                        onSendBroadcast={handleSendBroadcast}
                        onTopicGenerated={setNtfyTopic}
                        latestAlert={latestAlert}
                        isMapNavigating={isMapNavigating}
                        mapLoadingStatus={mapLoadingStatus}
                        alertsFeedTrigger={alertsFeedTrigger}
                        severeAlert={severeAlert}
                        onDismissSevereAlert={handleDismissSevereAlert}
                        smsSubscriptionStatus={smsSubscriptionStatus}
                        userPhoneNumber={userPhoneNumber}
                        onSmsSubscribe={handleSmsSubscribe}
                        onSmsUnsubscribe={handleSmsUnsubscribe}
                    />
                ) : (
                    <AdminDashboard
                        language={language}
                        events={events}
                        theme={theme}
                        onRetrainComplete={handleRetrainComplete}
                        onSmsSent={handleSmsSent}
                    />
                )}
            </main>
            {notification && (
                <Notification
                    message={notification.message}
                    type={notification.type}
                    onClose={() => setNotification(null)}
                />
            )}
            <SettingsModal
                isOpen={isSettingsOpen}
                onClose={() => setIsSettingsOpen(false)}
                settings={settings}
                onSettingsChange={handleSettingsChange}
                language={language}
            />

            {/* The Login Modal is added here */}
            <LoginModal
                isOpen={isLoginModalOpen}
                onClose={() => setIsLoginModalOpen(false)}
                onLogin={handleLogin}
                language={language}
            />
        </div>
    );
};

export default App;