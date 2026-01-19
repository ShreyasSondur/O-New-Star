
import { GET } from "../app/api/admin/dashboard/guests/route";
import { db } from "@/lib/prisma";

// Mock Request
class MockRequest {
    url: string;
    constructor(url: string) {
        this.url = url;
    }
}

async function verifyAdminApi() {
    console.log("--- Verifying Admin Guests API Pagination ---");

    // Create some dummy data if needed, or just read existing
    // We assume some data exists or we just check structure

    const count = await db.booking.count();
    console.log(`Total Bookings in DB: ${count}`);

    const limit = 2;
    const url = `http://localhost:3000/api/admin/dashboard/guests?page=1&limit=${limit}&filter=month`;

    // @ts-ignore
    const response = await GET(new MockRequest(url));
    const data = await response.json();

    console.log("API Response Status:", response.status);
    if (data.pagination) {
        console.log("Pagination Metadata:", data.pagination);
        if (data.pagination.limit !== limit) console.error("FAIL: Limit mismatch");
        if (data.guests.length > limit) console.error("FAIL: Too many items returned");
    } else {
        console.error("FAIL: No pagination metadata found");
    }

    console.log(`Fetched ${data.guests?.length} guests`);

    if (data.guests && data.guests.length > 0) {
        console.log("First Guest:", data.guests[0].name);
    }
}

verifyAdminApi().catch(console.error);
