/**
 * Extraction API Integration
 * Handles communication with the document extraction service
 */

const API_URL = 'https://extraction-api-e54a.onrender.com';

/**
 * Map UI proof types to API proof types
 */
export const proofTypeMapping = {
  'certificates': 'certificate',
  'job_history': 'job',
  'skills': 'skill',
  'milestones': 'milestone',
  'community_contributions': 'contribution'
};

/**
 * Check if a proof type supports extraction
 * @param {string} proofType - The UI proof type
 * @returns {boolean} - True if extraction is supported
 */
export const supportsExtraction = (proofType) => {
  return proofType in proofTypeMapping;
};

/**
 * Extract data from a document using the extraction API
 * @param {File} file - The file to extract data from
 * @param {string} proofType - The UI proof type (e.g., 'certificates', 'skills')
 * @returns {Promise<Object>} - The extracted data
 */
export const extractDocumentData = async (file, proofType) => {
  if (!supportsExtraction(proofType)) {
    console.log(`Extraction not supported for proof type: ${proofType}`);
    return null;
  }

  const apiProofType = proofTypeMapping[proofType];

  const formData = new FormData();
  formData.append('file', file);
  formData.append('proof_type', apiProofType);

  try {
    const response = await fetch(`${API_URL}/api/extract/`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Extraction failed with status ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Extraction API error:', error);
    throw error;
  }
};

/**
 * Get the API proof type from UI proof type
 * @param {string} proofType - The UI proof type
 * @returns {string} - The API proof type
 */
export const getApiProofType = (proofType) => {
  return proofTypeMapping[proofType] || proofType;
};