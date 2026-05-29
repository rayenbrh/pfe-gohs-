declare global {
  namespace Express {
    interface Request {
      id?: string;
      user?: {
        _id: string;
        name: string;
        email: string;
        role: 'super_admin' | 'admin' | 'agent';
      };
      cookies?: {
        token?: string;
      };
    }
  }
}

export {};
