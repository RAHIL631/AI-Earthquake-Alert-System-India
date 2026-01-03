export type Language = 'en' | 'hi' | 'kn' | 'ta' | 'te' | 'bn';

export type Severity = 'Low' | 'Moderate' | 'Severe';

export type AlertSound = 'none' | 'beep' | 'chime' | 'urgent';

// FIX: Add SafetyStatus type for the FamilySafetyTracker component.
export type SafetyStatus = 'safe' | 'needsHelp' | 'unknown';


export interface Location {
    lat: number;
    lon: number;
    city: string;
    state: string;
}

export interface EarthquakeEvent {
    id: number;
    magnitude: number;
    depth: number;
    location: Location;
    timestamp: string;
    severity: Severity;
    _key?: number; // Optional key to force re-renders
}

// FIX: Add FamilyMember interface for the FamilySafetyTracker component.
export interface FamilyMember {
    id: string;
    name: string;
    status: SafetyStatus;
    lastUpdate: string;
    isUser: boolean;
}

export interface WeatherData {
    temp: number;
    condition: string;
    wind: number;
}

export interface EvacuationRouteData {
    routeName: string;
    reasoning: string;
    googleMapsUrl: string;
}

export interface Settings {
    alertThreshold: number;
    alertSound: AlertSound;
}

export interface SentAlert {
    id: number;
    type: 'Broadcast';
    timestamp: string;
    message: string;
    status: 'pending' | 'sending' | 'sent' | 'failed';
    event: EarthquakeEvent;
}



// Admin Dashboard Types
export interface AdminStats {
    totalEvents: number;
    whatsappSubscribers: number;
    whatsappAlertsSent: number;
    smsSubscribers: number;
    smsAlertsSent: number;
}

export interface ServiceStatusDetail {
    status: 'Operational' | 'Degraded' | 'Outage';
    latency: number;
}

export interface SystemHealthStatus {
    apiService: ServiceStatusDetail;
    database: ServiceStatusDetail;
    whatsappGateway: ServiceStatusDetail;
    smsGateway: ServiceStatusDetail;
}


export interface AlertLogEntry {
    id: string;
    timestamp: string;
    magnitude: number;
    location: string;
    recipients: number;
    type: 'WhatsApp' | 'SMS';
}

export interface UserReport {
    id: string;
    timestamp: string;
    location: string;
    comment: string;
    status: 'New' | 'Acknowledged';
}


export interface Translations {
    [key: string]: {
        title: string;
        dashboardTitle: string;
        liveSeismicMap: string;
        realTimeAlerts: string;
        eventDetails: string;
        magnitude: string;
        depth: string;
        location: string;
        time: string;
        severity: string;
        generateAdvisory: string;
        generating: string;
        advisory: string;
        noEventSelected: string;
        recentEvents: string;
        highestMagnitude: string;
        mostActiveRegion: string;
        km: string;
        subscribe: string;
        subscribing: string;
        enterPhoneNumber: string;
        invalidPhoneNumber: string;
        subscriptionFailed: string;
        subscribed: string;
        unsubscribe: string;
        unsubscribeFailed: string;
        confirmUnsubscription: string;
        cancel: string;
        confirm: string;
        goToLocation: string;
        searchPlaceholder: string;
        filterBySeverity: string;
        filterByMagnitude: string;
        filterByTime: string;
        last24h: string;
        all: string;
        low: string;
        moderate: string;
        severe: string;
        moreInfo: string;
        feltReports: string;
        seismicWaveData: string;
        learnMore: string;
        weatherConditions: string;
        temperature: string;
        wind: string;
        loadingWeather: string;
        weatherError: string;
        suggestEvacuationRoute: string;
        suggestingRoute: string;
        evacuationRoute: string;
        viewOnMap: string;
        aiReasoning: string;
        toggleHeatmap: string;
        toggleFaultlines: string;
        generateSafetyTips: string;
        generatingTips: string;
        aiSafetyTips: string;
        settings: string;
        alertThreshold: string;
        alertSound: string;
        soundNone: string;
        soundBeep: string;
        soundChime: string;
        soundUrgent: string;
        close: string;
        liveDashboard: string;
        historicalExplorer: string;
        dateRange: string;
        magnitudeRange: string;
        applyFilters: string;
        noHistoricalData: string;
        theme: string;
        lightMode: string;
        darkMode: string;
        mapUnavailableTitle: string;
        mapUnavailableMessage: string;
        refresh: string;
        noAlertsSent: string;
        severeAlertTitle: string;
        dropCoverHold: string;
        broadcastControlCenter: string;
        pendingApproval: string;
        sendBroadcast: string;
        sending: string;
        broadcastSentTo: string;
        broadcastFailed: string;
        retry: string;
        noAlertsQueued: string;
        realtimePushNotifications: string;
        pushNotificationsDescription: string;
        yourUniqueChannel: string;
        ntfyInstructionsTitle: string;
        ntfyInstruction1: string;
        ntfyInstruction2: string;
        ntfyInstruction3: string;
        scanToSubscribe: string;
        // FIX: Add translation keys for MockPhoneDisplay component.
        alertPreview: string;
        officialChannel: string;
        waitingForAlert: string;
        // FIX: Add sentAlertsLog to provide the translation for the AlertsSentLog component title.
        sentAlertsLog: string;
        // FIX: Add missing translation keys for AlertsSentLog component.
        sentTo: string;
        recipients_plural: string;
        // Admin Dashboard Translations
        adminDashboardTitle: string;
        returnToUserDashboard: string;
        liveSystemStats: string;
        totalEvents: string;
        whatsappSubscribers: string;
        smsSubscribers: string;
        whatsappAlertsSent: string;
        smsAlertsSent: string;
        systemHealth: string;
        apiService: string;
        databaseConnection: string;
        whatsappGateway: string;
        smsGateway: string;
        operational: string;
        degraded: string;
        outage: string;
        latency: string;
        ms: string;
        alertLog: string;
        recipients: string;
        alertType: string;
        userReports: string;
        acknowledge: string;
        acknowledged: string;
        acknowledgeAll: string;
        mlModelStatus: string;
        modelAccuracy: string;
        lastTrained: string;
        retrainingInProgress: string;
        retrainModel: string;
        statusIdle: string;
        statusTrained: string;
        never: string;
        manualRetrain: string;
        exportData: string;
        exportAlertsOnly: string;
        exportReportsOnly: string;
        exportBoth: string;
        retrainSuccess: string;
        retrainFailed: string;
        smsAlertManager: string;
        selectEventForAlert: string;
        noSevereEvents: string;
        messagePreview: string;
        targetSubscribers: string;
        subscriberCount: string;
        sendSmsAlert: string;
        sendingSms: string;
        smsSentSuccess: string;
        smsSentFailed: string;
        communicationCenter: string;
        standardAlertTab: string;
        aiCounselorTab: string;
        generateAiAdvisory: string;
        generatingAiAdvisory: string;
        // FIX: Add translation keys for FamilySafetyTracker component.
        familySafetyTracker: string;
        markSafe: string;
        markHelp: string;
        gettingLocation: string;
        locationPermissionDenied: string;
        shareLocation: string;
        locationShared: string;
// FIX: Add translations for LoginModal.
        loginTitle: string;
        login: string;
        loginFailed: string;
        username: string;
        password: string;
        smsAlerts: string;
        smsDescription: string;
        unsubscribing: string;
        subscriptionSuccessful: string;
    }
}
