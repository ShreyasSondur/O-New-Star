
import { query } from "../lib/db";
// Mocking the fetch since we are running in node
// But actually we want to hit the localhost API if it's running? 
// Or better, just invoke the DB query directly to see if DB fails?
// No, we want to test the ROUTE logic (which I can't easily import if it expects Request).
// So we will use 'fetch' against localhost:3000.

async function run() {
    const BASE_URL = "http://localhost:3000/api/admin/rooms";

    // 1. Create a dummy floor if needed, or query one.
    // We'll assume floor with ID 1 exists (or query it).
    console.log("Fetching floors...");
    const floorsRes = await fetch("http://localhost:3000/api/admin/floors");
    const floorsData = await floorsRes.json();
    if (!floorsData.floors || floorsData.floors.length === 0) {
        console.error("No floors found. Cannot test.");
        return;
    }
    const floorId = floorsData.floors[0].id;
    console.log("Using Floor ID:", floorId);

    // 2. Create a Room
    const roomNum = "TEST-" + Math.floor(Math.random() * 1000);
    console.log("Creating Room:", roomNum);
    const createRes = await fetch(BASE_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            floor_id: floorId,
            room_number: roomNum,
            room_name: "Test Room",
            price_per_night: 500,
            max_guests: 2,
            image_url: "", // Start empty
            has_wifi: true,
            has_tv: false,
            has_ac: true,
            has_bar: false
        })
    });

    if (!createRes.ok) {
        console.error("Create Failed:", await createRes.text());
        return;
    }
    const createdRoom = (await createRes.json()).room;
    console.log("Room Created:", createdRoom.id);

    // 3. Update the Room
    console.log("Updating Room...");
    const updateUrl = `${BASE_URL}/${createdRoom.id}`;
    const updateRes = await fetch(updateUrl, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            floor_id: floorId,
            room_number: roomNum, // Same number
            room_name: "Test Room Updated",
            price_per_night: 600.50, // Float
            max_guests: 3,
            is_active: true, // Explicit
            image_url: "a".repeat(6 * 1024 * 1024), // 6MB dummy string
            has_wifi: false,
            has_tv: true,
            has_ac: true,
            has_bar: true
        })
    });

    if (!updateRes.ok) {
        console.error("Update Failed Status:", updateRes.status);
        console.error("Update Failed Body:", await updateRes.text());
    } else {
        console.log("Update Success:", await updateRes.json());
    }
}

run().catch(console.error);
