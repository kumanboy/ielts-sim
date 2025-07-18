// lib/makeCode.ts
export function makeCode(): string {
    const now = new Date();
    const hourBlock = Math.floor(now.getTime() / (1000 * 60 * 60)); // 1-hour window

    const seed = `${hourBlock}-IELTS-SECURE-CODE`;
    let hash = 0;
    for (let i = 0; i < seed.length; i++) {
        hash = (hash << 5) - hash + seed.charCodeAt(i);
        hash |= 0; // Convert to 32bit integer
    }

    // Ensure a positive 4-digit code
    return Math.abs(hash % 10000).toString().padStart(4, "0");
}
