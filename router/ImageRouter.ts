import express from 'express'
import fs from "fs";
import path from "path";
import multer from 'multer'
import { uploadImage, transformImage, listImages, getImageById, deleteImage} from '../Controller/ImageCtrl'
import { auth } from '../middleware/auth'

const router = express.Router()

const uploadPath = path.join(process.cwd(), "uploads");

if (!fs.existsSync(uploadPath)) {
  fs.mkdirSync(uploadPath, { recursive: true });
  console.log("📁 Created uploads folder:", uploadPath);
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const upload = multer({ storage })

router.post('/upload', auth ,upload.single('image'), uploadImage)
router.post('/:id/transform', auth, transformImage)
router.get('/', auth, listImages)
router.get('/:id', auth, getImageById)
router.delete('/:id', auth, deleteImage)

export default router
