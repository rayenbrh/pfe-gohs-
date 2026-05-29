declare module 'multer-storage-cloudinary' {
  import type { v2 as CloudinaryV2 } from 'cloudinary';
  import type { StorageEngine } from 'multer';

  export class CloudinaryStorage implements StorageEngine {
    constructor(options: {
      cloudinary: typeof CloudinaryV2;
      params?:
        | Record<string, unknown>
        | ((
            req: Express.Request,
            file: Express.Multer.File,
          ) => Record<string, unknown> | Promise<Record<string, unknown>>);
    });
  }
}
