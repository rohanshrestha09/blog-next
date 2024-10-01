import { supabase } from 'server/lib/supabase';
import { ISupabaseService } from 'server/ports/supabase';

export class SupabaseService implements ISupabaseService {
  async uploadFile(path: 'users' | 'blogs', filename: string, file: Buffer): Promise<string> {
    const { data: uploadedFile, error } = await supabase.storage
      .from('blogsansar')
      .upload(`${path}/${filename}`, file);

    if (error) throw new Error(error.message);

    return uploadedFile.path;
  }

  async downloadFile(path: 'users' | 'blogs', filename: string): Promise<string> {
    const { data: preview } = supabase.storage
      .from('blogsansar')
      .getPublicUrl(`${path}/${filename}`);

    return preview.publicUrl;
  }

  async deleteFile(path: 'users' | 'blogs', filenames: string[]): Promise<void> {
    if (!filenames.length) return;

    const { error } = await supabase.storage
      .from('blogsansar')
      .remove(filenames.map((filename) => `${path}/${filename}`));

    if (error) throw new Error(error.message);
  }
}
