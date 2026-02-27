// src/lib/hubspot.ts

/**
 * Synchronizes a contact to HubSpot using a Private App Token.
 * It will create the contact if it doesn't exist or update it if it does.
 */
export async function syncContactToHubSpot(data: {
    email: string;
    firstName?: string;
    lastName?: string;
    company?: string;
    eventTitle?: string;
}) {
    const token = process.env.HUBSPOT_PRIVATE_APP_TOKEN;

    if (!token) {
        console.warn("[HubSpot] HUBSPOT_PRIVATE_APP_TOKEN is not set. Skipping sync.");
        return;
    }

    const { email, firstName, lastName, company, eventTitle } = data;

    try {
        const response = await fetch("https://api.hubapi.com/crm/v3/objects/contacts/upsert", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
                idProperty: "email",
                objectWriteProperties: {
                    email,
                    firstname: firstName,
                    lastname: lastName,
                    company: company,
                    // If you have a custom property for the event, you can add it here
                    // last_event_attended: eventTitle 
                },
            }),
        });

        if (!response.ok) {
            const errorData = await response.json();
            console.error("[HubSpot] Error syncing contact:", errorData);
            return;
        }

        const result = await response.json();
        console.log("[HubSpot] Contact synced successfully:", result.id);
    } catch (error) {
        console.error("[HubSpot] Network error during sync:", error);
    }
}
