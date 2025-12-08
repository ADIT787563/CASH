
const CLOUDFLARE_ACCOUNT_ID = process.env.CLOUDFLARE_ACCOUNT_ID;
const CLOUDFLARE_API_TOKEN = process.env.CLOUDFLARE_API_TOKEN;
const CLOUDFLARE_GLOBAL_API_KEY = process.env.CLOUDFLARE_GLOBAL_API_KEY;
const CLOUDFLARE_EMAIL = process.env.CLOUDFLARE_EMAIL;

if (!CLOUDFLARE_ACCOUNT_ID) {
    console.warn("Missing CLOUDFLARE_ACCOUNT_ID");
}

/**
 * Gets the headers for Cloudflare API requests.
 * Prioritizes API Token, then Global API Key + Email.
 */
function getAuthHeaders(): Record<string, string> {
    if (CLOUDFLARE_API_TOKEN) {
        return {
            'Authorization': `Bearer ${CLOUDFLARE_API_TOKEN}`
        };
    } else if (CLOUDFLARE_GLOBAL_API_KEY && CLOUDFLARE_EMAIL) {
        return {
            'X-Auth-Key': CLOUDFLARE_GLOBAL_API_KEY,
            'X-Auth-Email': CLOUDFLARE_EMAIL
        };
    }
    throw new Error("Missing Cloudflare credentials (API Token or Global Key + Email)");
}

/**
 * Requests a Direct Creator Upload URL from Cloudflare Images.
 * This URL allows the frontend to upload files directly to Cloudflare without passing through our server.
 */
export async function getDirectUploadUrl() {
    const accountId = CLOUDFLARE_ACCOUNT_ID;
    if (!accountId) throw new Error("Cloudflare Account ID is missing");

    const url = `https://api.cloudflare.com/client/v4/accounts/${accountId}/images/v2/direct_upload`;

    try {
        const response = await fetch(url, {
            method: "POST",
            headers: {
                ...getAuthHeaders(),
                // Content-Type is not strictly required for this empty POST, but good practice
            },
        });

        const data = await response.json();

        if (!response.ok || !data.success) {
            console.error("Cloudflare Direct Upload Error:", data);
            throw new Error(data.errors?.[0]?.message || "Failed to get upload URL");
        }

        // result: { id, uploadURL }
        return data.result;
    } catch (error) {
        console.error("Failed to generate direct upload URL:", error);
        throw error;
    }
}

/**
 * (Optional) Deletes an image from Cloudflare Images
 */
export async function deleteImage(imageId: string) {
    const accountId = CLOUDFLARE_ACCOUNT_ID;
    if (!accountId) throw new Error("Cloudflare Account ID is missing");

    const url = `https://api.cloudflare.com/client/v4/accounts/${accountId}/images/v1/${imageId}`;

    const response = await fetch(url, {
        method: "DELETE",
        headers: getAuthHeaders(),
    });

    return response.ok;
}
