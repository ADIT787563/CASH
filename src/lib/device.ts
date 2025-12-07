export function getOrCreateDeviceId(): string {
    if (typeof window === 'undefined') return '';

    let deviceId = localStorage.getItem('device_id');
    if (!deviceId) {
        // Use crypto.randomUUID if available, otherwise fallback to a simple random string
        if (typeof crypto !== 'undefined' && crypto.randomUUID) {
            deviceId = crypto.randomUUID();
        } else {
            deviceId = Math.random().toString(36).substring(2) + Date.now().toString(36);
        }
        localStorage.setItem('device_id', deviceId);
    }
    return deviceId;
}

export function getDeviceName(): string {
    if (typeof window === 'undefined') return 'Unknown';
    const ua = window.navigator.userAgent;
    if (ua.indexOf("Win") != -1) return "Windows PC";
    if (ua.indexOf("Mac") != -1) return "Macintosh";
    if (ua.indexOf("Linux") != -1) return "Linux PC";
    if (ua.indexOf("Android") != -1) return "Android Device";
    if (ua.indexOf("like Mac") != -1) {
        if (ua.indexOf("iPhone") != -1) return "iPhone";
        if (ua.indexOf("iPad") != -1) return "iPad";
        return "iOS Device";
    }
    return "Unknown Device";
}
