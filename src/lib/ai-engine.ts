import { GoogleGenerativeAI } from '@google/generative-ai';

export interface AIAnalysisResult {
  assessmentStatus: 'SUFFICIENT' | 'LIMITED' | 'INSUFFICIENT';

  imageQuality: {
    overall: 'GOOD' | 'FAIR' | 'POOR';
    visibleAreas: string[];
    limitations: string[];
  };

  norwoodStage: string;
  norwoodDescription: string;

  hairLossPattern:
    | 'ANDROGENETIC'
    | 'DIFFUSE'
    | 'PATCHY'
    | 'SCARRING_SUSPECTED'
    | 'UNCERTAIN';

  hairLossSeverity:
    | 'MILD'
    | 'MODERATE'
    | 'SEVERE'
    | 'EXTENSIVE'
    | 'UNCERTAIN';

  donorArea: {
    densityEstimateGraftsPerCm2: number | null;
    qualityScore: number | null;
    rating: 'EXCELLENT' | 'GOOD' | 'MODERATE' | 'POOR' | 'NOT_ASSESSABLE';
    observations: string;
  };

  estimatedGraftRequirement: {
    minimumGrafts: number | null;
    maximumGrafts: number | null;
    estimatedRangeDescription: string;
  };

  procedureAssessment: {
    preliminaryRecommendation:
      | 'FUE'
      | 'DHI'
      | 'FUT'
      | 'COMBINATION'
      | 'NOT_ENOUGH_INFORMATION';

    rationale: string;

    importantFactorsRequiringClinicalAssessment: string[];
  };

  zoneBreakdown: {
    frontalRecession: string;
    midScalpDensity: string;
    crownVertex: string;
    temporalPeaks: string;
  };

  clinicalObservations: string[];

  recommendedNextSteps: string[];

  confidenceScore: number;

  disclaimer: string;

  analysisDate: string;
}

interface PhotoInput {
  frontPhoto?: string;
  topPhoto?: string;
  leftPhoto?: string;
  rightPhoto?: string;
  backPhoto?: string;
}

/**
 * Convert:
 *
 * data:image/jpeg;base64,/9j/4AAQ...
 *
 * Into Gemini inlineData format.
 */
function parseBase64Image(dataURI: string) {
  if (!dataURI) {
    return null;
  }

  // If it starts with data:, parse it as a standard data URI
  if (dataURI.startsWith('data:')) {
    const matches = dataURI.match(
      /^data:([a-zA-Z0-9]+\/[a-zA-Z0-9-.+]+);base64,(.+)$/
    );

    if (!matches || matches.length !== 3) {
      console.warn('Invalid image data URI');
      return null;
    }

    return {
      inlineData: {
        data: matches[2],
        mimeType: matches[1],
      },
    };
  }

  // Otherwise, assume it is a raw base64 string
  let mimeType = 'image/jpeg';
  if (dataURI.startsWith('iVBOR')) {
    mimeType = 'image/png';
  }

  return {
    inlineData: {
      data: dataURI,
      mimeType,
    },
  };
}

/**
 * Create a safe result when the AI service cannot analyze the images.
 *
 * IMPORTANT:
 * This does NOT invent medical findings.
 */
function createInsufficientResult(
  reason: string
): AIAnalysisResult {
  const analysisDate = new Date()
    .toISOString()
    .split('T')[0];

  return {
    assessmentStatus: 'INSUFFICIENT',

    imageQuality: {
      overall: 'POOR',
      visibleAreas: [],
      limitations: [reason],
    },

    norwoodStage: 'UNCERTAIN',

    norwoodDescription:
      'A reliable Norwood classification could not be determined from the available analysis.',

    hairLossPattern: 'UNCERTAIN',

    hairLossSeverity: 'UNCERTAIN',

    donorArea: {
      densityEstimateGraftsPerCm2: null,
      qualityScore: null,
      rating: 'NOT_ASSESSABLE',
      observations:
        'The donor area could not be reliably assessed.',
    },

    estimatedGraftRequirement: {
      minimumGrafts: null,
      maximumGrafts: null,
      estimatedRangeDescription:
        'Graft requirements cannot be reliably estimated from the available analysis.',
    },

    procedureAssessment: {
      preliminaryRecommendation: 'NOT_ENOUGH_INFORMATION',

      rationale:
        'A procedure recommendation cannot be made without a reliable image analysis and appropriate clinical assessment.',

      importantFactorsRequiringClinicalAssessment: [
        'DONOR_DENSITY',
        'DONOR_LAXITY',
        'HAIR_CALIBER',
        'HAIR_CHARACTERISTICS',
        'MEDICAL_HISTORY',
        'SCALP_EXAMINATION',
        'PATIENT_GOALS',
      ],
    },

    zoneBreakdown: {
      frontalRecession: 'NOT_ASSESSABLE',
      midScalpDensity: 'NOT_ASSESSABLE',
      crownVertex: 'NOT_ASSESSABLE',
      temporalPeaks: 'NOT_ASSESSABLE',
    },

    clinicalObservations: [],

    recommendedNextSteps: [
      'Upload clear standardized scalp photographs.',
      'Consult a qualified hair restoration surgeon for clinical evaluation.',
    ],

    confidenceScore: 0,

    disclaimer:
      'AI-assisted visual estimate only. This analysis is not a diagnosis or a substitute for an in-person evaluation by a qualified hair restoration surgeon or medical professional. Final diagnosis, graft planning, and treatment decisions must be made after appropriate clinical assessment.',

    analysisDate,
  };
}

/**
 * Validate the most important parts of the AI response.
 */
function validateAIResult(
  result: any
): result is AIAnalysisResult {
  if (!result || typeof result !== 'object') {
    return false;
  }

  if (
    ![
      'SUFFICIENT',
      'LIMITED',
      'INSUFFICIENT',
    ].includes(result.assessmentStatus)
  ) {
    return false;
  }

  if (!result.imageQuality) {
    return false;
  }

  if (!result.donorArea) {
    return false;
  }

  if (!result.estimatedGraftRequirement) {
    return false;
  }

  if (!result.procedureAssessment) {
    return false;
  }

  if (!result.zoneBreakdown) {
    return false;
  }

  if (
    typeof result.confidenceScore !== 'number'
  ) {
    return false;
  }

  return true;
}

/**
 * Main AI Hair Analysis Function
 */
export async function runAIHairAnalysis(
  photos: PhotoInput
): Promise<AIAnalysisResult> {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    console.error(
      'GEMINI_API_KEY is missing'
    );

    return createInsufficientResult(
      'AI analysis service is not configured.'
    );
  }

  try {
    const genAI =
      new GoogleGenerativeAI(apiKey);

    const model =
      genAI.getGenerativeModel({
        model: 'gemini-2.5-flash',

        systemInstruction: `
You are an AI-assisted hair restoration image analysis system.

Your job is to analyze scalp photographs and provide a preliminary visual assessment.

You MUST return exactly ONE valid JSON object.

The response MUST:
- Start with {
- End with }
- Contain no Markdown
- Contain no explanation outside JSON
- Contain no introductory sentence
- Contain no conclusion outside JSON
- Contain no conversational text

Never invent information that cannot be visually assessed.

All measurements are visual estimates only and must not be presented as clinically measured facts.

Donor density, donor quality, and graft requirements are approximate estimates only.

If the donor area is not sufficiently visible:
- densityEstimateGraftsPerCm2 must be null
- qualityScore must be null
- rating must be NOT_ASSESSABLE
- confidenceScore must be reduced

If the image quality is insufficient:
- assessmentStatus must be LIMITED or INSUFFICIENT
- use UNCERTAIN or NOT_ASSESSABLE where appropriate

The final treatment decision must always be made by a qualified hair restoration surgeon.
        `,

        generationConfig: {
          responseMimeType:
            'application/json',

          temperature: 0.1,

          maxOutputTokens: 4000,
        },
      });

    const imageParts: any[] = [];

    const photoEntries = [
      {
        name: 'FRONT',
        value: photos.frontPhoto,
      },
      {
        name: 'TOP',
        value: photos.topPhoto,
      },
      {
        name: 'LEFT',
        value: photos.leftPhoto,
      },
      {
        name: 'RIGHT',
        value: photos.rightPhoto,
      },
      {
        name: 'BACK',
        value: photos.backPhoto,
      },
    ];

    for (const photo of photoEntries) {
      if (!photo.value) {
        continue;
      }

      const parsedImage =
        parseBase64Image(photo.value);

      if (parsedImage) {
        imageParts.push(parsedImage);
      }
    }

    if (imageParts.length === 0) {
      return createInsufficientResult(
        'No valid scalp photographs were provided.'
      );
    }

    const analysisDate =
      new Date()
        .toISOString()
        .split('T')[0];

    const prompt = `
Analyze ALL attached scalp photographs together.

The photographs may represent:
- Front view
- Top view
- Left side
- Right side
- Back/donor area

Do not analyze only one image.

Analyze the following visual characteristics:

1. Hairline shape and recession
2. Frontal scalp loss
3. Mid-scalp density
4. Crown and vertex loss
5. Temporal peak recession
6. Visible donor area density
7. Visible donor area quality
8. Hair shaft caliber if visually assessable
9. Diffuse thinning
10. Visible scalp abnormalities such as redness, scaling, inflammation, scarring, or unusual lesions

NORWOOD CLASSIFICATION:

Use the Hamilton-Norwood scale only when reasonably supported by the images.

Possible values include:
- Norwood I
- Norwood II
- Norwood III
- Norwood III Vertex
- Norwood IV
- Norwood V
- Norwood VI
- Norwood VII
- UNCERTAIN

DONOR AREA RULES:

Do not claim that donor density is clinically measured.

If the donor area is unclear, blurry, poorly lit, obstructed, or not visible:

densityEstimateGraftsPerCm2 = null

qualityScore = null

rating = NOT_ASSESSABLE

Do not assign EXCELLENT donor quality unless the donor area is clearly visible and the image supports that assessment.

GRAFT ESTIMATION RULES:

Graft numbers must be approximate visual estimates only.

Do not pretend to know the exact surgical graft requirement.

If the affected area or donor area cannot be reasonably assessed:

minimumGrafts = null

maximumGrafts = null

PROCEDURE RULES:

The procedure recommendation is preliminary only.

Do not claim that FUE, DHI, or FUT is definitively required based only on photographs.

The final procedure decision requires clinical assessment of:

- Donor density
- Donor laxity
- Hair caliber
- Hair characteristics
- Medical history
- Scalp examination
- Patient goals

CONFIDENCE RULES:

Confidence must reflect the quality and completeness of the images.

Do not give a high confidence score when:
- Images are blurry
- Lighting is poor
- The donor area is not clearly visible
- Important scalp regions are missing
- The photographs are inconsistent

Return ONLY the following JSON structure.

Do not add any text before or after the JSON.

{
  "assessmentStatus": "SUFFICIENT",
  "imageQuality": {
    "overall": "GOOD",
    "visibleAreas": [
      "FRONTAL",
      "MID_SCALP",
      "CROWN",
      "TEMPORAL",
      "DONOR"
    ],
    "limitations": []
  },
  "norwoodStage": "Norwood IV",
  "norwoodDescription": "",
  "hairLossPattern": "UNCERTAIN",
  "hairLossSeverity": "UNCERTAIN",
  "donorArea": {
    "densityEstimateGraftsPerCm2": null,
    "qualityScore": null,
    "rating": "NOT_ASSESSABLE",
    "observations": ""
  },
  "estimatedGraftRequirement": {
    "minimumGrafts": null,
    "maximumGrafts": null,
    "estimatedRangeDescription": ""
  },
  "procedureAssessment": {
    "preliminaryRecommendation": "NOT_ENOUGH_INFORMATION",
    "rationale": "",
    "importantFactorsRequiringClinicalAssessment": [
      "DONOR_DENSITY",
      "DONOR_LAXITY",
      "HAIR_CALIBER",
      "HAIR_CHARACTERISTICS",
      "MEDICAL_HISTORY",
      "SCALP_EXAMINATION",
      "PATIENT_GOALS"
    ]
  },
  "zoneBreakdown": {
    "frontalRecession": "",
    "midScalpDensity": "",
    "crownVertex": "",
    "temporalPeaks": ""
  },
  "clinicalObservations": [],
  "recommendedNextSteps": [],
  "confidenceScore": 0,
  "disclaimer": "AI-assisted visual estimate only. This analysis is not a diagnosis or a substitute for an in-person evaluation by a qualified hair restoration surgeon or medical professional. Final diagnosis, graft planning, and treatment decisions must be made after appropriate clinical assessment.",
  "analysisDate": "${analysisDate}"
}
`;

    console.log(
      'Starting Gemini hair analysis...'
    );

    const response =
      await model.generateContent([
        prompt,
        ...imageParts,
      ]);

    const rawText =
      response.response.text();

    console.log(
      '========== GEMINI RAW RESPONSE =========='
    );

    console.log(rawText);

    console.log(
      '=========================================='
    );

    if (!rawText) {
      return createInsufficientResult(
        'Gemini returned an empty response.'
      );
    }

    let parsedResult: unknown;

    try {
      parsedResult =
        JSON.parse(rawText.trim());
    } catch (jsonError) {
      console.error(
        'Gemini returned invalid JSON:',
        jsonError
      );

      console.error(
        'Invalid Gemini response:',
        rawText
      );

      return createInsufficientResult(
        'The AI returned an invalid analysis format.'
      );
    }

    if (
      !validateAIResult(parsedResult)
    ) {
      console.error(
        'Gemini returned an invalid analysis structure:',
        parsedResult
      );

      return createInsufficientResult(
        'The AI returned an incomplete analysis structure.'
      );
    }

    return parsedResult;
  } catch (error: any) {
    console.error(
      '========== GEMINI AI ERROR =========='
    );

    console.error(error);

    console.error(
      '====================================='
    );

    return createInsufficientResult(
      'The AI analysis service is currently unavailable.'
    );
  }
}