function stringToUint8Array(str: string): Uint8Array {
  return new TextEncoder().encode(str);
}

// Helper function to convert ArrayBuffer to hex string
function arrayBufferToHex(buffer: ArrayBuffer): string {
  const byteArray = new Uint8Array(buffer);
  const hexCodes = [...byteArray].map((value) => {
    const hexCode = value.toString(16);
    const paddedHexCode = hexCode.padStart(2, "0");
    return paddedHexCode;
  });
  return hexCodes.join("");
}

// SHA256 hash using Web Crypto API
async function sha256(data: string): Promise<ArrayBuffer> {
  const encoder = new TextEncoder();
  return await crypto.subtle.digest("SHA-256", encoder.encode(data));
}

// HMAC-SHA256 using Web Crypto API
async function hmacSha256(
  key: ArrayBuffer | Uint8Array,
  data: string
): Promise<ArrayBuffer> {
  const cryptoKey = await crypto.subtle.importKey(
    "raw",
    key,
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );

  const encoder = new TextEncoder();
  return await crypto.subtle.sign("HMAC", cryptoKey, encoder.encode(data));
}

// Get signing key
async function getSignatureKey(
  key: string,
  dateStamp: string,
  regionName: string,
  serviceName: string
): Promise<ArrayBuffer> {
  const kDate = await hmacSha256(stringToUint8Array("AWS4" + key), dateStamp);
  const kRegion = await hmacSha256(kDate, regionName);
  const kService = await hmacSha256(kRegion, serviceName);
  const kSigning = await hmacSha256(kService, "aws4_request");
  return kSigning;
}

export async function createSignedHeaders(
  url: string,
  method: string,
  payload: string,
  accessKeyId: string,
  secretAccessKey: string,
  region: string,
  service: string
): Promise<Record<string, string>> {
  const urlObj = new URL(url);
  const host = urlObj.hostname;
  const pathname = urlObj.pathname;
  const search = urlObj.search;

  const now = new Date();
  const amzDate = now.toISOString().replace(/[:\-]|\.\d{3}/g, "");
  const dateStamp = amzDate.substring(0, 8);
  const payloadHash = arrayBufferToHex(await sha256(payload));
  const contentLength = new TextEncoder().encode(payload).length.toString();

  const canonicalHeaders =
    `content-length:${contentLength}\n` +
    `content-type:application/json\n` +
    `host:${host}\n` +
    `x-amz-content-sha256:${payloadHash}\n` +
    `x-amz-date:${amzDate}\n`;

  const signedHeaders =
    "content-length;content-type;host;x-amz-content-sha256;x-amz-date";

  const canonicalRequest = [
    method,
    pathname,
    search.slice(1),
    canonicalHeaders,
    signedHeaders,
    payloadHash,
  ].join("\n");

  const algorithm = "AWS4-HMAC-SHA256";
  const credentialScope = `${dateStamp}/${region}/${service}/aws4_request`;
  const stringToSign = [
    algorithm,
    amzDate,
    credentialScope,
    arrayBufferToHex(await sha256(canonicalRequest)),
  ].join("\n");

  const signingKey = await getSignatureKey(
    secretAccessKey,
    dateStamp,
    region,
    service
  );

  const signature = arrayBufferToHex(
    await hmacSha256(signingKey, stringToSign)
  );

  const authorizationHeader = `${algorithm} Credential=${accessKeyId}/${credentialScope}, SignedHeaders=${signedHeaders}, Signature=${signature}`;

  return {
    "Content-Type": "application/json",
    "Content-Length": contentLength,
    "X-Amz-Content-Sha256": payloadHash,
    "X-Amz-Date": amzDate,
    Authorization: authorizationHeader,
  };
}

export const apiConfig = () => {
  const aiConversationUrl = `https://mdv3qwfi2j.execute-api.us-east-1.amazonaws.com/dev/api/bedrock/invoke/stream`;
  const xAPIKey = "BJBtjpPkqGatuoa3qJqdR8aHXSsHkgvGaootbubi";
  const serverUrl = "https://auras-server.vercel.app/";
  // const serverUrl = "http://localhost:4001/";

  return { aiConversationUrl, xAPIKey, serverUrl };
};
