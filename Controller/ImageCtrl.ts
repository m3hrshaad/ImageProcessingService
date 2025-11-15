import { Request, Response } from 'express'
import { ImageModel } from '../models/ImageModels'
import sharp from 'sharp'
import fs from 'fs'
import path from 'path'

export const uploadImage = async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      res.status(400).json({ msg: 'No Iamge uploaded' })
      return
    }

    const image = await ImageModel.create({
      owner: req.user?.id,
      filename: req.file.filename,
      originalName: req.file.originalname,
      mimeType: req.file.mimetype,
      size: req.file.size,
      path: req.file.path,
      url: `/uploads/${req.file.filename}`,
    })

    res.status(201).json({
      msg: 'Image uploaded successfully',
      image,
    })
  } catch (err) {
    console.error('Error uploading image: ', err)
    res.status(500).json({ msg: 'server error' })
  }
}

export const transformImage = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const { action, width, height, angle } = req.body

    const image = await ImageModel.findById(id)
    if (!image) {
      res.status(404).json({ msg: 'Image not found' })
      return
    }

    const filePath = path.join(process.cwd(), "uploads", image.filename);

    const tempPath = path.join(process.cwd(), "uploads", `temp-${Date.now()}-${image.filename}`);
  
    let transformer = sharp(filePath)

    switch (action) {
      case 'resize':
        transformer = transformer.resize(
          Number(width) || 300,
          Number(height) || 300
        )
        break

      case 'rotate':
        transformer = transformer.rotate(Number(angle) || 90)
        break

      case 'crop':
        transformer = transformer.extract({
          left: 0,
          top: 0,
          width: Number(width) || 200,
          height: Number(height) || 200,
        })
        break

      default:
        res.status(400).json({ msg: 'Invalid action type' })
        return
    }

    await transformer.toFile(tempPath)

    fs.renameSync(tempPath, filePath);

    image.transformations.push({
      type: action,
      details: { width, height, angle },
      date: new Date(),
      file: image.filename,
    })

    await image.save()

    res.json({
      msg: `Image transformed succesfully (${action})`,
      filename: image.filename,
    })
  } catch (err) {
    console.error('Error transforming image', err)
    res.status(500).json({ msg: 'Server error', err })
  }
}

export const listImages = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id

    if (!userId) {
      res.status(401).json({ msg: 'Unauthorized' })
      return
    }

    //get all user Images
    const images = await ImageModel.find({ owner: userId }).sort({
      createdAt: -1,
    })

    res.json({
      msg: 'Images fetched successfully',
      count: images.length,
      images,
    })
  } catch (err) {
    console.error('Error fetching images:', err)
    res.status(500).json({ msg: 'Server error', err })
  }
}

export const getImageById = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id
    const { id } = req.params

    const image = await ImageModel.findOne({ _id: id, owner: userId })

    if (!image) {
      res.status(404).json({ msg: 'Image not found or access denied' })
      return
    }

    res.json({
      msg: 'Image fetched successfully',
      image,
    })
  } catch (err) {
    console.error('Error fetching image by ID: ', err)
    res.status(500).json({ msg: 'Server error', err })
  }
}

export const deleteImage = async (req: Request, res: Response) => {
  try {
    const { id } = req.params

    const image = await ImageModel.findById(id)
    if (!image) {
      res.status(404).json({ msg: 'Images not found' })
      return
    }

    // if( image.owner.toString() !== req.user?.id ) {
    //   res.status(403).json({ msg: "Not authorized to delete this image"})
    //   return
    // }

    //file path
    // const filePath = path.join(process.cwd(), "uploads", image.filename)

    //delete file
    // if(fs.existsSync(filePath)) {
    //   fs.unlinkSync(filePath)
    //   console.log("File deleted:", filePath);
    // } else {
    //   console.log("File does not exist:", filePath);
    // }

    const mainFile = path.join(process.cwd(), 'uploads', image.filename)
    if (fs.existsSync(mainFile)) fs.unlinkSync(mainFile)

    if (image.transformations && image.transformations.length > 0) {
      image.transformations.forEach((t) => {
        if (t.file) {
          const transformedPath = path.join(process.cwd(), t.file)
          if (fs.existsSync(transformedPath)) {
            fs.unlinkSync(transformedPath)
          }
        }
      })
    }

    await image.deleteOne()

    res.json({ msg: 'Image deleted successfully' })
  } catch (err) {
    console.error('Error deleting image: ', err)
    res.status(500).json({ msg: 'Server error', err })
  }
}
