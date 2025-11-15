Image Processing Service
Overview

Image Processing Service is a Node.js backend built with Express, MongoDB, and TypeScript.
It allows users to upload images, apply transformations (resize, crop, rotate), retrieve images, and track transformations.
This project demonstrates a complete RESTful API for image management with authentication

--------------------------------------------------------------------------------------------------------------------------------------

Features

User Authentication
JWT-based authentication with login and registration.

Image Upload
Users can upload images to the server (uploads/ folder).

Image Transformations
Transformations are applied directly to the original image:

Resize

Crop

Rotate
Transformation details are logged in the database.

Retrieve Images

Get image by ID

List all images uploaded by a user

Delete Images
Delete images from the server and database.

TypeScript Support
All models, routes, and controllers use TypeScript

--------------------------------------------------------------------------------------------------------------------------------------

API Endpoints
User

POST /user/register – Register a new user

POST /user/login – Login and receive JWT token

Image

POST /image/upload – Upload a new image

POST /image/transform/:id – Transform an uploaded image (overwrite original)

GET /image/:id – Get image by ID

GET /image/list – List all images uploaded by authenticated user

DELETE /image/:id – Delete an image


--------------------------------------------------------------------------------------------------------------------------------------

Dependencies

express – Web framework

mongoose – MongoDB ORM

multer – File upload handling

sharp – Image processing

bcrypt – Password hashing

jsonwebtoken – JWT authentication

typescript – Type safety

--------------------------------------------------------------------------------------------------------------------------------------

License

MIT License
