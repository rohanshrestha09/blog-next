type Path = 'users' | 'blogs';

export interface ISupabaseService {
  uploadFile(path: Path, filename: string, file: Buffer): Promise<string>;
  downloadFile(path: Path, filename: string): Promise<string>;
  deleteFile(path: Path, filenames: string[]): Promise<void>;
}
