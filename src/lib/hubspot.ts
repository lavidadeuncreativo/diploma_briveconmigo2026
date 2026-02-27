// src/lib/hubspot.ts

/**
 * Synchronizes a contact to HubSpot using the Forms Submission API (v3).
 * This method does NOT require a Private App Token, only the Portal ID and Form ID.
 */
export async function syncContactToHubSpot(data: {
    email: string;
    firstName?: string;
    lastName?: string;
    company?: string;
    eventTitle?: string;
}) {
    const portalId = process.env.HUBSPOT_PORTAL_ID;
    const formId = process.env.HUBSPOT_FORM_ID;

    if (!portalId || !formId) {
        console.warn("[HubSpot] HUBSPOT_PORTAL_ID or HUBSPOT_FORM_ID is not set. Skipping sync.");
        return;
    }

    const { email, firstName, lastName, company, eventTitle } = data;

    try {
        const response = await fetch(`https://api.hsforms.com/submissions/v3/integration/submit/${portalId}/${formId}`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                fields: [
                    { name: "email", value: email },
                    { name: "firstname", value: firstName || "" },
                    { name: "lastname", value: lastName || "" },
                    { name: "company", value: company || "" },
                ],
                context: {
                    pageUri: process.env.APP_BASE_URL || "https://brive.mx",
                    pageName: `Diploma Generator - ${eventTitle}`,
                }
            }),
        });

        if (!response.ok) {
            const errorData = await response.json();
            console.error("[HubSpot] Error submitting form:", errorData);
            return;
        }

        console.log("[HubSpot] Form submitted successfully");
    } catch (error) {
        console.error("[HubSpot] Network error during form submission:", error);
    }
}
