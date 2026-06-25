const cloudinary = require('../config/cloudinary');
const { Employee } = require('../models');
const AppError = require('../utils/AppError');

const uploadProfileImage = async (employeeId, fileBuffer) => {
  const employee = await Employee.findById(employeeId);
  if (!employee) {
    throw new AppError('Employee not found', 404);
  }

  if (employee.cloudinaryId) {
    await cloudinary.uploader.destroy(employee.cloudinaryId);
  }

  const result = await new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: 'ems/profiles',
        transformation: [
          { width: 300, height: 300, crop: 'fill', gravity: 'face' },
        ],
      },
      (error, result) => {
        if (error) reject(new AppError('Image upload failed', 500));
        else resolve(result);
      }
    );
    uploadStream.end(fileBuffer);
  });

  employee.profileImage = result.secure_url;
  employee.cloudinaryId = result.public_id;
  await employee.save();

  return { url: result.secure_url, publicId: result.public_id };
};

const deleteProfileImage = async (employeeId) => {
  const employee = await Employee.findById(employeeId);
  if (!employee) {
    throw new AppError('Employee not found', 404);
  }

  if (!employee.cloudinaryId) {
    throw new AppError('No profile image to delete', 400);
  }

  await cloudinary.uploader.destroy(employee.cloudinaryId);

  employee.profileImage = '';
  employee.cloudinaryId = '';
  await employee.save();

  return { message: 'Profile image removed' };
};

module.exports = { uploadProfileImage, deleteProfileImage };
