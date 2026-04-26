import type { Request, Response } from 'express';
export declare const getComments: (req: Request, res: Response) => Promise<void>;
export declare const createComment: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
//# sourceMappingURL=commentController.d.ts.map