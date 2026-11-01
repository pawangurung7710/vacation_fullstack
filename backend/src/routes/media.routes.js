import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import * as mediaController from '../controllers/media.controller.js';
import * as mediaService from '../services/media.service.js';
import { authenticate } from '../middlewares/auth.middleware.js';
import { adminOnly } from '../middlewares/role.middleware.js';
import { sendSuccess, sendCreated } from '../utils/response.js';
import { optimizeImageInPlace, isSharpProcessableImage } from '../utils/image-processing.js';
import { fileHeaderMatchesExtension } from '../utils/file-signature.js';

const router = express.Router();

// Ensure uploads directory exists
const uploadsDir = process.env.UPLOAD_DIR || 'uploads';
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif|pdf|doc|docx|mp4|mov/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error('Invalid file type'));
  }
};

const upload = multer({
  storage,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE) || 5 * 1024 * 1024, // 5MB default
  },
  fileFilter,
});

/**
 * Upload media file
 */
router.post('/upload', authenticate, adminOnly, upload.single('file'), async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded',
      });
    }

    let fileSize = req.file.size;
    const ext = path.extname(req.file.originalname).toLowerCase().replace('.', '');

    try {
      if (isSharpProcessableImage(req.file.mimetype)) {
        // Resizes/recompresses in place and, as a side effect, validates the file is a
        // real, decodable image — not just something with a matching extension.
        fileSize = await optimizeImageInPlace(req.file.path, req.file.mimetype);
      } else if (!(await fileHeaderMatchesExtension(req.file.path, ext))) {
        const err = new Error('File content does not match its extension.');
        err.statusCode = 400;
        throw err;
      }
    } catch (validationError) {
      await fs.promises.unlink(req.file.path).catch(() => {});
      if (validationError.statusCode) throw validationError;
      const err = new Error('Uploaded file is not a valid image.');
      err.statusCode = 400;
      throw err;
    }

    const fileData = {
      filename: req.file.filename,
      originalName: req.file.originalname,
      mimeType: req.file.mimetype,
      size: fileSize,
      path: req.file.path,
      url: `/uploads/${req.file.filename}`,
      alt: req.body.alt || '',
      caption: req.body.caption || '',
      category: req.body.category || 'image',
    };

    const media = await mediaService.createMediaFile(fileData, req.user.id);
    return sendCreated(res, 'File uploaded successfully', media);
  } catch (error) {
    next(error);
  }
});

// Admin only routes
router.get('/', authenticate, adminOnly, mediaController.getMediaFiles);
router.get('/:id', authenticate, adminOnly, mediaController.getMediaFileById);
router.delete('/:id', authenticate, adminOnly, mediaController.deleteMediaFile);

export default router;

