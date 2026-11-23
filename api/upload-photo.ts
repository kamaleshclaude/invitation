import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || '';

const supabase = (supabaseUrl && supabaseKey) ? createClient(supabaseUrl, supabaseKey) : null;

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '12mb',
    },
  },
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { imageBase64, filename, contentType } = req.body || {};

  if (!imageBase64 || typeof imageBase64 !== 'string') {
    return res.status(400).json({ error: 'No image data provided.' });
  }

  // Validate format
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
  const mimeType = contentType || 'image/jpeg';
  if (!allowedTypes.includes(mimeType) && !imageBase64.startsWith('data:image/')) {
    return res.status(400).json({ error: 'Invalid image format. Please upload JPG, PNG, or WebP.' });
  }

  try {
    // If Supabase Storage is available, upload to persistent storage bucket
    if (supabase) {
      const bucketName = 'student-photos';
      
      // Clean base64 string
      const rawBase64 = imageBase64.replace(/^data:image\/\w+;base64,/, '');
      const buffer = Buffer.from(rawBase64, 'base64');

      if (buffer.length > 10 * 1024 * 1024) {
        return res.status(400).json({ error: 'Image file size exceeds 10MB limit.' });
      }

      const ext = mimeType.includes('png') ? 'png' : mimeType.includes('webp') ? 'webp' : 'jpg';
      const storagePath = `student_${Date.now()}_${Math.random().toString(36).substring(2, 8)}.${ext}`;

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from(bucketName)
        .upload(storagePath, buffer, {
          contentType: mimeType,
          upsert: true
        });

      if (!uploadError && uploadData) {
        const { data: publicUrlData } = supabase.storage
          .from(bucketName)
          .getPublicUrl(storagePath);

        if (publicUrlData?.publicUrl) {
          return res.status(200).json({
            success: true,
            photoUrl: publicUrlData.publicUrl,
            storageType: 'supabase_storage'
          });
        }
      }
    }

    // Fallback: If Supabase Storage bucket is not created or available,
    // return persistent data URI (safe, permanent, will never expire on page refresh or deployment)
    const persistentDataUrl = imageBase64.startsWith('data:') 
      ? imageBase64 
      : `data:${mimeType};base64,${imageBase64}`;

    return res.status(200).json({
      success: true,
      photoUrl: persistentDataUrl,
      storageType: 'persistent_base64'
    });

  } catch (err: any) {
    console.error('Upload photo error:', err);
    return res.status(500).json({ error: 'Failed to process image upload.', message: err?.message });
  }
}
