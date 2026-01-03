/**
 * File Storage
 *
 * Provides file upload and management using Supabase Storage.
 */

import { getSupabaseAdmin } from '@/lib/supabase';
import { logger } from '@/lib/logger';

// ============================================================================
// Types
// ============================================================================

export interface UploadOptions {
  bucket: string;
  path: string;
  file: File | Buffer;
  contentType?: string;
  upsert?: boolean;
}

export interface UploadResult {
  success: boolean;
  path?: string;
  url?: string;
  error?: string;
}

export interface DeleteResult {
  success: boolean;
  error?: string;
}

// ============================================================================
// Upload Functions
// ============================================================================

/**
 * Upload a file to Supabase Storage
 */
export async function uploadFile(options: UploadOptions): Promise<UploadResult> {
  const supabase = getSupabaseAdmin();
  const { bucket, path, file, contentType, upsert = false } = options;

  try {
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(path, file, {
        contentType,
        upsert,
      });

    if (error) {
      logger.error('File upload failed', { bucket, path, error: error.message });
      return { success: false, error: error.message };
    }

    const { data: urlData } = supabase.storage
      .from(bucket)
      .getPublicUrl(data.path);

    logger.info('File uploaded successfully', { bucket, path: data.path });
    return {
      success: true,
      path: data.path,
      url: urlData.publicUrl,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    logger.error('File upload error', { bucket, path, error: message });
    return { success: false, error: message };
  }
}

/**
 * Upload a file with a generated unique path
 */
export async function uploadFileWithUniquePath(
  bucket: string,
  file: File,
  folder: string = ''
): Promise<UploadResult> {
  const extension = file.name.split('.').pop() || '';
  const uniqueName = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
  const path = folder ? `${folder}/${uniqueName}.${extension}` : `${uniqueName}.${extension}`;

  return uploadFile({
    bucket,
    path,
    file,
    contentType: file.type,
  });
}

/**
 * Delete a file from Supabase Storage
 */
export async function deleteFile(bucket: string, path: string): Promise<DeleteResult> {
  const supabase = getSupabaseAdmin();

  try {
    const { error } = await supabase.storage.from(bucket).remove([path]);

    if (error) {
      logger.error('File delete failed', { bucket, path, error: error.message });
      return { success: false, error: error.message };
    }

    logger.info('File deleted successfully', { bucket, path });
    return { success: true };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    logger.error('File delete error', { bucket, path, error: message });
    return { success: false, error: message };
  }
}

/**
 * Get a public URL for a file
 */
export function getPublicUrl(bucket: string, path: string): string {
  const supabase = getSupabaseAdmin();
  const { data } = supabase.storage.from(bucket).getPublicUrl(path);
  return data.publicUrl;
}

/**
 * Get a signed URL for temporary access
 */
export async function getSignedUrl(
  bucket: string,
  path: string,
  expiresIn: number = 3600
): Promise<string | null> {
  const supabase = getSupabaseAdmin();

  const { data, error } = await supabase.storage
    .from(bucket)
    .createSignedUrl(path, expiresIn);

  if (error) {
    logger.error('Failed to create signed URL', { bucket, path, error: error.message });
    return null;
  }

  return data.signedUrl;
}

// ============================================================================
// Validation Helpers
// ============================================================================

const DEFAULT_MAX_SIZE = 10 * 1024 * 1024; // 10MB
const DEFAULT_ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];

export interface FileValidationOptions {
  maxSize?: number;
  allowedTypes?: string[];
}

export interface FileValidationResult {
  valid: boolean;
  error?: string;
}

/**
 * Validate a file before upload
 */
export function validateFile(
  file: File,
  options: FileValidationOptions = {}
): FileValidationResult {
  const maxSize = options.maxSize || DEFAULT_MAX_SIZE;
  const allowedTypes = options.allowedTypes || DEFAULT_ALLOWED_TYPES;

  if (file.size > maxSize) {
    const sizeMB = (maxSize / 1024 / 1024).toFixed(1);
    return { valid: false, error: `File size must be less than ${sizeMB}MB` };
  }

  if (!allowedTypes.includes(file.type)) {
    return {
      valid: false,
      error: `File type not allowed. Allowed types: ${allowedTypes.join(', ')}`,
    };
  }

  return { valid: true };
}

// ============================================================================
// API Route Helper
// ============================================================================

/**
 * Parse a FormData file upload from a request
 */
export async function parseFileFromRequest(
  request: Request,
  fieldName: string = 'file'
): Promise<File | null> {
  try {
    const formData = await request.formData();
    const file = formData.get(fieldName);

    if (!file || !(file instanceof File)) {
      return null;
    }

    return file;
  } catch {
    return null;
  }
}
