
import cloudinary
import cloudinary.uploader
import os

cloudinary.config(
    cloud_name=os.getenv("CLOUDINARY_CLOUD_NAME"),
    api_key=os.getenv("CLOUDINARY_API_KEY"),
    api_secret=os.getenv("CLOUDINARY_API_SECRET"),
    secure=True
)

def upload_image_to_cloudinary(file_stream, public_id=None, folder=None):
    upload_options = {"resource_type": "image"}
    if public_id:
        upload_options["public_id"] = public_id
    if folder:
        upload_options["folder"] = folder
    response = cloudinary.uploader.upload(file_stream, **upload_options)
    return response.get("secure_url")
