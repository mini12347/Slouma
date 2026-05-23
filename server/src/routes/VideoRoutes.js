import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { getVideos, createVideo, deleteVideo } from '../controllers/VideoController.js';

const uploadDir = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});
const upload = multer({ storage: storage });

const router = express.Router();

router.get('/', getVideos);
router.post('/', upload.single('videoFile'), createVideo);
router.delete('/:id', deleteVideo);

export default router;
