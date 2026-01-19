
import { calculateNights } from "../lib/availability";

console.log("--- Date Parsing Reproduction ---");

const formats = [
    "2024-01-20", // ISO YYYY-MM-DD (Standard)
    "2024-1-20",  // Loose ISO
    "20-01-2024", // DD-MM-YYYY (Common in India)
    "01-20-2024", // MM-DD-YYYY (US)
    "2024/01/20", // YYYY/MM/DD
];

formats.forEach(dateStr => {
    try {
        const d = new Date(dateStr);
        console.log(`Input: "${dateStr}" -> Parsed: ${d.toString()} (Timestamp: ${d.getTime()})`);

        if (isNaN(d.getTime())) {
            console.error(`ERROR: "${dateStr}" resulted in Invalid Date`);
        }
    } catch (e) {
        console.error(`CRITICAL ERROR parsing "${dateStr}":`, e);
    }
});

console.log("\n--- calculateNights Test ---");

const ranges = [
    { start: "2024-01-20", end: "2024-01-22", label: "Standard ISO" },
    { start: "20-01-2024", end: "22-01-2024", label: "DD-MM-YYYY" }, // This is likely the breaker
];

ranges.forEach(range => {
    try {
        const nights = calculateNights(range.start, range.end);
        console.log(`[${range.label}] ${range.start} to ${range.end} -> Nights: ${nights}`);
    } catch (e) {
        console.log(`[${range.label}] Failed:`, e);
    }
});
