import {
  supabase,
  PROOF_FILES_BUCKET,
  getPublicUrl,
} from "../config/supabaseClient";

/**
 * Proof Management API
 */

// Upload a proof with files
export const uploadProof = async (
  proofData,
  referenceFiles = [],
  supportingFiles = []
) => {
  try {
    const user = await supabase.auth.getUser();

    if (!user.data.user) {
      throw new Error("User not authenticated");
    }

    // 1. Insert proof record with IPFS and transaction data
    const { data: proof, error: proofError } = await supabase
      .from("proofs")
      .insert({
        user_id: user.data.user.id,
        proof_type: proofData.proofType,
        proof_name: proofData.proofName,
        summary: proofData.summary,
        reference_link: proofData.referenceLink || null,
        ipfs_hash: proofData.ipfsHash || null,
        ipfs_url: proofData.ipfsUrl || null,
        transaction_hash: proofData.transactionHash || null,
        status: "verified",
        verified_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (proofError) throw proofError;

    // 2. Upload reference files
    const referenceFileRecords = await uploadFiles(
      proof.id,
      referenceFiles,
      "reference",
      user.data.user.id
    );

    // 3. Upload supporting files
    const supportingFileRecords = await uploadFiles(
      proof.id,
      supportingFiles,
      "supporting",
      user.data.user.id
    );

    return {
      proof,
      referenceFiles: referenceFileRecords,
      supportingFiles: supportingFileRecords,
    };
  } catch (error) {
    console.error("Upload proof error:", error);
    throw error;
  }
};

// Helper function to upload files to Supabase Storage
const uploadFiles = async (proofId, files, fileType, userId) => {
  const uploadedFiles = [];

  for (const file of files) {
    try {
      // Generate unique filename
      const timestamp = Date.now();
      const filename = `${userId}/${proofId}/${timestamp}-${file.name}`;

      // Upload to Supabase Storage
      const { data: storageData, error: storageError } = await supabase.storage
        .from(PROOF_FILES_BUCKET)
        .upload(filename, file, {
          cacheControl: "3600",
          upsert: false,
        });

      if (storageError) throw storageError;

      // Get public URL
      const fileUrl = getPublicUrl(PROOF_FILES_BUCKET, storageData.path);

      // Save file record to database
      const { data: fileRecord, error: fileError } = await supabase
        .from("files")
        .insert({
          proof_id: proofId,
          file_type: fileType,
          filename: file.name,
          file_url: fileUrl,
          file_path: storageData.path,
          mime_type: file.type,
          size: file.size,
          uploaded_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (fileError) throw fileError;

      uploadedFiles.push(fileRecord);
    } catch (error) {
      console.error(`Error uploading file ${file.name}:`, error);
      // Continue with other files even if one fails
    }
  }

  return uploadedFiles;
};

// Get all proofs for a user
export const getUserProofs = async (userId) => {
  const { data, error } = await supabase
    .from("proofs")
    .select(
      `
      *,
      files(*)
    `
    )
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data;
};

// Get a single proof by ID
export const getProof = async (proofId) => {
  const { data, error } = await supabase
    .from("proofs")
    .select(
      `
      *,
      files(*),
      users(wallet_address, email)
    `
    )
    .eq("id", proofId)
    .single();

  if (error) throw error;
  return data;
};

// Update proof
export const updateProof = async (proofId, updates) => {
  const { data, error } = await supabase
    .from("proofs")
    .update({
      ...updates,
      updated_at: new Date().toISOString(),
    })
    .eq("id", proofId)
    .select()
    .single();

  if (error) throw error;
  return data;
};

// Delete proof
export const deleteProof = async (proofId) => {
  // First, get all files associated with this proof
  const { data: files, error: filesError } = await supabase
    .from("files")
    .select("file_path")
    .eq("proof_id", proofId);

  if (filesError) throw filesError;

  // Delete files from storage
  if (files && files.length > 0) {
    const filePaths = files.map((f) => f.file_path);
    const { error: storageError } = await supabase.storage
      .from(PROOF_FILES_BUCKET)
      .remove(filePaths);

    if (storageError)
      console.error("Error deleting files from storage:", storageError);
  }

  // Delete file records from database (cascade should handle this, but being explicit)
  const { error: deleteFilesError } = await supabase
    .from("files")
    .delete()
    .eq("proof_id", proofId);

  if (deleteFilesError) throw deleteFilesError;

  // Delete proof record
  const { error: deleteProofError } = await supabase
    .from("proofs")
    .delete()
    .eq("id", proofId);

  if (deleteProofError) throw deleteProofError;

  return true;
};

// Update proof status (for admin/verification)
export const updateProofStatus = async (proofId, status, verifierId = null) => {
  const updates = {
    status,
    updated_at: new Date().toISOString(),
  };

  if (status === "verified") {
    updates.verified_at = new Date().toISOString();
    if (verifierId) updates.verifier_id = verifierId;
  }

  const { data, error } = await supabase
    .from("proofs")
    .update(updates)
    .eq("id", proofId)
    .select()
    .single();

  if (error) throw error;
  return data;
};
export const profileWithfileProofs = async () => {
  const { data: profile, error } = await supabase
    .from("profiles_with_proofs_files")
    .select(`
      *,
      users(wallet_address)
    `);
  if (error) throw error;
  return profile;
};
// Get proof statistics for a user
export const getProofStats = async (userId) => {
  const { data, error } = await supabase
    .from("proofs")
    .select("status, proof_type")
    .eq("user_id", userId);

  if (error) throw error;

  const stats = {
    total: data.length,
    verified: data.filter((p) => p.status === "verified").length,
    pending: data.filter((p) => p.status === "pending").length,
    rejected: data.filter((p) => p.status === "rejected").length,
    byType: {},
  };

  // Count by proof type
  data.forEach((proof) => {
    if (!stats.byType[proof.proof_type]) {
      stats.byType[proof.proof_type] = 0;
    }
    stats.byType[proof.proof_type]++;
  });

  return stats;
};

// Get system-wide proof statistics for the Admin Dashboard
export const getGlobalProofStats = async () => {
  try {
    const [totalResult, verifiedResult] = await Promise.all([
      supabase
        .from('proofs')
        .select('*', { count: 'exact', head: true }),
      supabase
        .from('proofs')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'verified')
    ]);

    if (totalResult.error) throw totalResult.error;
    if (verifiedResult.error) throw verifiedResult.error;

    return {
      total: totalResult.count || 0,
      verified: verifiedResult.count || 0
    };
  } catch (error) {
    console.error('Error fetching global stats:', error);
    throw error;
  }
};
