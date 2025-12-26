import { Request, Response, NextFunction } from "express";

const notFound = (req: Request, res: Response, next: NextFunction) => {
  res.status(404).json({
    error: 'Not Found',
    message: `Route ${req.originalUrl} does not exist`,
  });
};

export default notFound;
