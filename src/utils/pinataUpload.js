/**
 * Pinata IPFS Upload Utility
 * Uploads document data to Pinata's IPFS service via REST API
 * Uses the Pinata JWT from environment variables
 */

/**
 * Upload document metadata to Pinata IPFS
 * @param {Object} documentData - The document extraction data to upload
 * @param {string} fileName - Optional file name for the upload
 * @returns {Promise<{hash: string, url: string}>} IPFS hash and gateway URL
 */
export const uploadToPinata = async (documentData, fileName = 'document-proof') => {
  try {
    const pinataJwt = process.env.REACT_APP_PINATA_JWT;

    if (!pinataJwt) {
      throw new Error('REACT_APP_PINATA_JWT environment variable is not set');
    }

    console.log('[v0] Uploading to Pinata IPFS:', fileName);

    // Prepare the metadata as JSON
    const jsonData = JSON.stringify(documentData);
    const blob = new Blob([jsonData], { type: 'application/json' });

    // Create FormData for multipart upload
    const formData = new FormData();
    formData.append('file', blob, `${fileName}.json`);

    // Optional: Add metadata about the upload
    const metadata = {
      name: fileName,
      keyvalues: {
        uploadedAt: new Date().toISOString(),
        type: 'document-proof',
      },
    };
    formData.append('pinataMetadata', JSON.stringify(metadata));

    // Optional: Set file options (how long to keep the file)
    const options = {
      cidVersion: 0, // Use CIDv0 for compatibility
    };
    formData.append('pinataOptions', JSON.stringify(options));

    // Make the API request to Pinata
    const response = await fetch('https://uploads.pinata.cloud/pinning/pinFileToIPFS', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${pinataJwt}`,
      },
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('[v0] Pinata upload error:', errorData);
      throw new Error(`Pinata upload failed: ${errorData.error?.reason || response.statusText}`);
    }

    const result = await response.json();

    console.log('[v0] Pinata upload successful:', {
      hash: result.IpfsHash,
      url: `https://gateway.pinata.cloud/ipfs/${result.IpfsHash}`,
    });

    return {
      hash: result.IpfsHash,
      url: `https://gateway.pinata.cloud/ipfs/${result.IpfsHash}`,
      timestamp: result.Timestamp,
    };
  } catch (error) {
    console.error('[v0] Pinata upload error:', error);
    throw error;
  }
};

/**
 * Upload document with additional metadata
 * @param {Object} documentData - The document data
 * @param {Object} metadata - Additional metadata (userId, walletAddress, etc.)
 * @returns {Promise<{hash: string, url: string}>}
 */
export const uploadDocumentWithMetadata = async (documentData, metadata = {}) => {
  const enrichedData = {
    ...documentData,
    metadata: {
      uploadedAt: new Date().toISOString(),
      ...metadata,
    },
  };

  return uploadToPinata(enrichedData, `document-${Date.now()}`);
};

/**
 * Retrieve a file from IPFS via Pinata gateway
 * @param {string} ipfsHash - The IPFS hash (CID)
 * @returns {Promise<Object>} The retrieved document data
 */
export const retrieveFromPinata = async (ipfsHash) => {
  try {
    const url = `https://gateway.pinata.cloud/ipfs/${ipfsHash}`;

    console.log('[v0] Retrieving from Pinata:', url);

    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Failed to retrieve from Pinata: ${response.statusText}`);
    }

    const data = await response.json();
    console.log('[v0] Retrieved from Pinata successfully');
    return data;
  } catch (error) {
    console.error('[v0] Error retrieving from Pinata:', error);
    throw error;
  }
};

/**
 * Generate a Pinata gateway URL from IPFS hash
 * @param {string} ipfsHash - The IPFS hash
 * @returns {string} The gateway URL
 */
export const getPinataGatewayUrl = (ipfsHash) => {
  return `https://gateway.pinata.cloud/ipfs/${ipfsHash}`;
};

/**
 * Alternative gateway URLs if Pinata gateway is down
 * @param {string} ipfsHash - The IPFS hash
 * @returns {Array<string>} Array of alternative gateway URLs
 */
export const getAlternativeGatewayUrls = (ipfsHash) => {
  return [
    `https://ipfs.io/ipfs/${ipfsHash}`,
    `https://cloudflare-ipfs.com/ipfs/${ipfsHash}`,
    `https://dweb.link/ipfs/${ipfsHash}`,
  ];
};
