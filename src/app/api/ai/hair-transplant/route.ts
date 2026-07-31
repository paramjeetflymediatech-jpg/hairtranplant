import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

// ============================================================================
// CONSTANTS & CONFIGURATION
// ============================================================================
const DEFAULT_STRENGTH = 0.25;
const MIN_STRENGTH = 0.15;
const MAX_STRENGTH = 0.35;
const MAX_IMAGE_SIZE_BYTES = 15 * 1024 * 1024; // 15MB
const ALLOWED_MIME_TYPES = new Set(['image/jpeg', 'image/jpg', 'image/png', 'image/webp']);

const BFL_BASE_URL = 'https://api.bfl.ai/v1';
const BFL_ALT_BASE_URL = 'https://api.bfl.ml/v1';
const BFL_MODELS = {
  pro: 'flux-kontext-pro',
  max: 'flux-kontext-max',
  fallback: 'flux-2-flex',
} as const;

// Polling with exponential backoff
const INITIAL_POLL_INTERVAL_MS = 1000;
const MAX_POLL_INTERVAL_MS = 3000;
const BACKOFF_FACTOR = 1.3;
const MAX_POLL_DURATION_MS = 45000; // 45 seconds timeout

// ============================================================================
// TYPES & INTERFACES
// ============================================================================
export type QualityMode = 'pro' | 'max';

export interface HairTransplantRequest {
  photo: string;
  hairlineStyle?: string;
  quality?: QualityMode;
  strength?: number;
}

export interface HairTransplantSuccessResponse {
  success: true;
  provider: 'black-forest-labs';
  model: string;
  image: string;
  durationMs: number;
  jobId: string;
}

export interface HairTransplantErrorResponse {
  success: false;
  error: string;
  code?: string;
}

interface PreparedImage {
  photoUrl: string;
  mimeType: string;
  sizeBytes: number;
}

interface BFLSubmitResponse {
  id?: string;
  polling_url?: string;
  status?: string;
  detail?: string | Array<{ msg: string }>;
}

interface BFLPollResponse {
  status: 'Pending' | 'Processing' | 'Ready' | 'Failed';
  result?: {
    sample?: string;
    prompt?: string;
  };
  detail?: string | Array<{ msg: string }>;
}

// Custom API Error Class
class ApiError extends Error {
  constructor(
    message: string,
    public statusCode: number = 500,
    public code: string = 'INTERNAL_ERROR'
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

// ============================================================================
// MODULAR HELPER FUNCTIONS
// ============================================================================

/**
 * Validates and retrieves the Black Forest Labs API Key from environment.
 * Strict check: Uses process.env.BFL_API_KEY only.
 */
function getValidatedApiKey(): string {
  const apiKey = process.env.BFL_API_KEY;
  if (!apiKey || !apiKey.trim()) {
    throw new ApiError('Black Forest Labs API key (BFL_API_KEY) is missing or unconfigured.', 401, 'UNAUTHORIZED');
  }
  return apiKey.trim();
}

/**
 * Validates and sanitizes the incoming request body.
 */
function validateInput(body: unknown): HairTransplantRequest {
  if (!body || typeof body !== 'object') {
    throw new ApiError('Invalid JSON request body.', 400, 'BAD_REQUEST');
  }

  const req = body as Partial<HairTransplantRequest>;

  if (!req.photo || typeof req.photo !== 'string' || !req.photo.trim()) {
    throw new ApiError('The "photo" field is required and must be a valid string.', 400, 'MISSING_PHOTO');
  }

  let quality: QualityMode = 'pro';
  if (req.quality !== undefined) {
    if (req.quality !== 'pro' && req.quality !== 'max') {
      throw new ApiError('Invalid "quality" mode. Allowed values: "pro", "max".', 400, 'INVALID_QUALITY');
    }
    quality = req.quality;
  }

  let strength = DEFAULT_STRENGTH;
  if (req.strength !== undefined) {
    if (typeof req.strength !== 'number' || isNaN(req.strength)) {
      throw new ApiError('The "strength" parameter must be a valid number.', 400, 'INVALID_STRENGTH');
    }
    // Clamp strength strictly between 0.15 and 0.35
    strength = Math.max(MIN_STRENGTH, Math.min(MAX_STRENGTH, req.strength));
  }

  const hairlineStyle = typeof req.hairlineStyle === 'string' ? req.hairlineStyle.trim() : undefined;

  return {
    photo: req.photo.trim(),
    hairlineStyle,
    quality,
    strength,
  };
}

/**
 * Validates image format, MIME type, and size bounds.
 */
function prepareImage(photo: string): PreparedImage {
  // If photo is already a public HTTP/HTTPS URL
  if (photo.startsWith('http://') || photo.startsWith('https://')) {
    return {
      photoUrl: photo,
      mimeType: 'image/jpeg',
      sizeBytes: 0,
    };
  }

  let base64Data = photo;
  let mimeType = 'image/jpeg';

  if (photo.startsWith('data:')) {
    const matches = photo.match(/^data:([^;]+);base64,(.+)$/);
    if (!matches) {
      throw new ApiError('Invalid Data URL format for "photo".', 400, 'INVALID_IMAGE_FORMAT');
    }
    mimeType = matches[1].toLowerCase();
    base64Data = matches[2];
  }

  if (!ALLOWED_MIME_TYPES.has(mimeType)) {
    throw new ApiError(
      `Unsupported image format: "${mimeType}". Allowed formats: JPEG, PNG, WEBP.`,
      400,
      'UNSUPPORTED_IMAGE_TYPE'
    );
  }

  const estimatedSizeBytes = Math.ceil((base64Data.length * 3) / 4);
  if (estimatedSizeBytes > MAX_IMAGE_SIZE_BYTES) {
    throw new ApiError(
      `Image size exceeds maximum limit of 15MB (Estimated size: ${(estimatedSizeBytes / (1024 * 1024)).toFixed(2)}MB).`,
      400,
      'IMAGE_TOO_LARGE'
    );
  }

  const photoUrl = photo.startsWith('data:') ? photo : `data:${mimeType};base64,${base64Data}`;

  return {
    photoUrl,
    mimeType,
    sizeBytes: estimatedSizeBytes,
  };
}

/**
 * Constructs the specialized medical prompt for hair transplant simulation.
 */
function buildPrompt(hairlineStyle?: string): string {
  const styleClause = hairlineStyle ? ` with a natural ${hairlineStyle} hairline` : '';
  return `Create a realistic hair transplant simulation${styleClause} with natural hair density, matching the existing hair color, texture, hairline, lighting, and facial features. Preserve facial identity. Do not modify the face, beard, eyes, skin tone, or background.`;
}

/**
 * Submits the generation request to Black Forest Labs REST API.
 */
async function submitGeneration(
  apiKey: string,
  modelName: string,
  prompt: string,
  photoUrl: string,
  strength: number
): Promise<{ jobId: string; pollingUrl: string; modelUsed: string }> {
  let endpoint = `${BFL_BASE_URL}/${modelName}`;
  let modelUsed = modelName;

  let response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'x-key': apiKey,
      'Content-Type': 'application/json',
      accept: 'application/json',
    },
    body: JSON.stringify({
      prompt,
      input_image: photoUrl,
      strength,
    }),
  });

  let data: BFLSubmitResponse = await response.json().catch(() => ({ detail: 'Failed to parse BFL response' }));

  // Fallback to flux-2-flex if specialized endpoint returns 404
  if (!response.ok && (response.status === 404 || JSON.stringify(data).includes('Not Found'))) {
    console.warn(`[BFL Engine] Primary endpoint '${endpoint}' returned 404. Trying fallback '${BFL_MODELS.fallback}'...`);
    endpoint = `${BFL_BASE_URL}/${BFL_MODELS.fallback}`;
    modelUsed = BFL_MODELS.fallback;

    response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'x-key': apiKey,
        'Content-Type': 'application/json',
        accept: 'application/json',
      },
      body: JSON.stringify({
        prompt,
        input_image: photoUrl,
        strength,
      }),
    });

    data = await response.json().catch(() => ({ detail: 'Failed to parse BFL fallback response' }));
  }

  if (!response.ok) {
    const rawDetail = data.detail;
    const errorMsg = Array.isArray(rawDetail) ? rawDetail[0]?.msg : rawDetail || 'BFL job submission failed';
    throw new ApiError(`BFL Submission Error: ${errorMsg}`, response.status, 'BFL_SUBMIT_FAILED');
  }

  if (!data.id) {
    throw new ApiError('No task ID returned from Black Forest Labs API', 500, 'INVALID_JOB_ID');
  }

  const pollingUrl = data.polling_url || `${BFL_BASE_URL}/get_result?id=${data.id}`;

  return { jobId: data.id, pollingUrl, modelUsed };
}

/**
 * Polls Black Forest Labs status endpoint using exponential backoff until completion or timeout.
 * Automatically handles domain fallbacks (api.bfl.ai <-> api.bfl.ml) if polling returns 404.
 */
async function pollGeneration(
  apiKey: string,
  jobId: string,
  initialPollingUrl: string
): Promise<{ imageUrl: string; attempts: number }> {
  const startTime = Date.now();
  let pollInterval = INITIAL_POLL_INTERVAL_MS;
  let attempts = 0;
  let currentPollUrl = initialPollingUrl;

  while (Date.now() - startTime < MAX_POLL_DURATION_MS) {
    attempts++;
    await new Promise((resolve) => setTimeout(resolve, pollInterval));

    let pollResponse = await fetch(currentPollUrl, {
      method: 'GET',
      headers: {
        'x-key': apiKey,
        accept: 'application/json',
      },
    });

    // Auto-fallback domain if poll URL returned 404
    if (!pollResponse.ok && pollResponse.status === 404) {
      const altUrl = currentPollUrl.includes('api.bfl.ai') 
        ? currentPollUrl.replace('api.bfl.ai', 'api.bfl.ml')
        : `${BFL_ALT_BASE_URL}/get_result?id=${jobId}`;
      
      if (altUrl !== currentPollUrl) {
        console.warn(`[BFL Engine] Poll returned 404 on ${currentPollUrl}. Retrying alternate host ${altUrl}...`);
        currentPollUrl = altUrl;
        pollResponse = await fetch(currentPollUrl, {
          method: 'GET',
          headers: {
            'x-key': apiKey,
            accept: 'application/json',
          },
        });
      }
    }

    if (!pollResponse.ok) {
      if (pollResponse.status === 429) {
        console.warn(`[BFL Engine] Rate limit hit on poll attempt ${attempts}. Backing off...`);
        pollInterval = Math.min(MAX_POLL_INTERVAL_MS, Math.round(pollInterval * 1.8));
        continue;
      }
      throw new ApiError(`BFL Poll Error: Status ${pollResponse.status}`, pollResponse.status, 'BFL_POLL_FAILED');
    }

    const pollData: BFLPollResponse = await pollResponse.json().catch(() => ({ status: 'Failed' as const }));

    console.log(`[BFL Engine] Job ${jobId} | Poll Attempt ${attempts} | Status: ${pollData.status}`);

    if (pollData.status === 'Ready') {
      const sampleUrl = pollData.result?.sample;
      if (!sampleUrl) {
        throw new ApiError('BFL reported job Ready, but no image sample URL was returned.', 500, 'NO_IMAGE_SAMPLE');
      }
      return { imageUrl: sampleUrl, attempts };
    }

    if (pollData.status === 'Failed') {
      const detail = typeof pollData.detail === 'string' ? pollData.detail : 'Image generation job failed';
      throw new ApiError(`Black Forest Labs generation failed: ${detail}`, 500, 'BFL_GENERATION_FAILED');
    }

    // Exponential backoff
    pollInterval = Math.min(MAX_POLL_INTERVAL_MS, Math.round(pollInterval * BACKOFF_FACTOR));
  }

  throw new ApiError(
    `Generation timed out after ${(MAX_POLL_DURATION_MS / 1000).toFixed(0)} seconds (${attempts} polling attempts).`,
    408,
    'POLL_TIMEOUT'
  );
}

// ============================================================================
// MAIN HTTP POST ROUTE HANDLER
// ============================================================================
export async function POST(req: NextRequest) {
  const startTime = Date.now();

  try {
    // 1. Validate API Key
    const apiKey = getValidatedApiKey();

    // 2. Parse & Validate Request JSON Body
    const rawBody = await req.json().catch(() => {
      throw new ApiError('Invalid or unparseable JSON request body.', 400, 'BAD_JSON');
    });

    const input = validateInput(rawBody);
    const preparedImage = prepareImage(input.photo);
    const prompt = buildPrompt(input.hairlineStyle);
    const requestedQuality = input.quality ?? 'pro';
    const modelName = BFL_MODELS[requestedQuality];

    console.log(`[BFL Engine] Request received | Model: ${modelName} | Quality: ${requestedQuality} | Strength: ${input.strength}`);

    // 3. Submit Generation Job to BFL API
    const { jobId, pollingUrl, modelUsed } = await submitGeneration(
      apiKey,
      modelName,
      prompt,
      preparedImage.photoUrl,
      input.strength!
    );

    // 4. Poll Result with Exponential Backoff and Dual-Domain Fallback
    const { imageUrl, attempts } = await pollGeneration(apiKey, jobId, pollingUrl);

    const durationMs = Date.now() - startTime;
    console.log(`[BFL Engine] Generation Successful | Job: ${jobId} | Model: ${modelUsed} | Duration: ${durationMs}ms | Attempts: ${attempts}`);

    // 5. Return Clean Production Response
    return NextResponse.json<HairTransplantSuccessResponse>({
      success: true,
      provider: 'black-forest-labs',
      model: modelUsed,
      image: imageUrl,
      durationMs,
      jobId,
    });
  } catch (error: unknown) {
    const durationMs = Date.now() - startTime;
    const statusCode = error instanceof ApiError ? error.statusCode : 500;
    const errorMessage = error instanceof Error ? error.message : 'An unexpected internal error occurred.';
    const errorCode = error instanceof ApiError ? error.code : 'INTERNAL_SERVER_ERROR';

    console.error(`[BFL Engine] Request Failed [${statusCode}] (${durationMs}ms):`, errorMessage);

    return NextResponse.json<HairTransplantErrorResponse>(
      {
        success: false,
        error: errorMessage,
        code: errorCode,
      },
      { status: statusCode }
    );
  }
}
