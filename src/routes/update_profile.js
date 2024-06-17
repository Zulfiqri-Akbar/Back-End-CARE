const Joi = require("joi");
const bcrypt = require("bcrypt");
const Boom = require("@hapi/boom");
const User = require("../models/user");
const storage = require("../config/storage");
const uuid = require("uuid");
const path = require("path");
const { checkRevokedToken } = require("../middleware/checkRevokedToken");

const bucketName = "bucket-capstone-care";
const folderName = "user_image_profile";

module.exports = {
  method: "PUT",
  path: "/update_profile",
  options: {
    auth: "jwt",
    pre:[{method: checkRevokedToken}],
    validate: {
      payload: Joi.object({
        profile_picture: Joi.any()
          .optional()
          .meta({ swaggerType: "file" })
          .description("Image file"),
        username: Joi.string().required().messages({
          "any.required": "Username is required",
          "string.empty": "Username cannot be empty",
        }),
        email: Joi.string().email().required().messages({
          "any.required": "Email is required",
          "string.email": "Email must be a valid email address",
          "string.empty": "Email cannot be empty",
        }),
        password: Joi.string().min(6).required().messages({
          "any.required": "Password is required",
          "string.min": "Password must be at least 6 characters long",
          "string.empty": "Password cannot be empty",
        }),
        confirm_password: Joi.string()
          .required()
          .valid(Joi.ref("password"))
          .messages({
            "any.required": "Confirm password is required",
            "any.only": "Password and confirm password must match",
            "string.empty": "Confirm password cannot be empty",
          }),
      }),
      options: {
        allowUnknown: true,
      },
      failAction: async (request, h, err) => {
        const errorDetails = err.details.map((detail) => detail.message);
        throw Boom.badRequest(`${errorDetails.join(", ")}`);
      },
    },
    payload: {
      maxBytes: 10485760,
      output: "stream",
      parse: true,
      multipart: true,
      allow: "multipart/form-data",
    },
  },
  handler: async (request, h) => {
    const { profile_picture, username, email, password } = request.payload;
    const { email: currentEmail } = request.auth.credentials;

    try {
      console.log(`Update profile request received for user: ${currentEmail}`);

      const user = await User.findOne({ where: { email: currentEmail } });

      if (!user) {
        console.log(`User not found: ${currentEmail}`);
        throw Boom.notFound("User not found");
      }

      user.username = username;
      user.email = email;

      const hashedPassword = await bcrypt.hash(password, 10);
      user.password = hashedPassword;

      if (profile_picture && profile_picture.hapi && profile_picture.hapi.filename) {
        const supportedFileTypes = ['image/jpeg', 'image/png', 'image/jpg'];
        if (!supportedFileTypes.includes(profile_picture.hapi.headers['content-type'])) {
          throw Boom.badRequest('Unsupported file type. Please upload an image file (jpg, jpeg, png)');
        }

        const gcsFileName = `${uuid.v4()}${path.extname(profile_picture.hapi.filename)}`;
        const gcsFilePath = `${folderName}/${gcsFileName}`;

        const bucket = storage.bucket(bucketName);
        const file = bucket.file(gcsFilePath);

        // Create a writable stream and upload the file to GCS
        const writeStream = file.createWriteStream({
          metadata: {
            contentType: profile_picture.hapi.headers['content-type'],
          },
          resumable: false,
        });

        // Ensure to wait for the write stream to finish
        await new Promise((resolve, reject) => {
          writeStream.on('error', (err) => {
            console.error('Error uploading to GCS:', err);
            reject(Boom.internal(`Error uploading to GCS: ${err.message}`));
          });

          writeStream.on('finish', resolve);

          // Pipe the file data into the writable stream
          profile_picture.pipe(writeStream);
        });

        // File uploaded successfully, now save the public URL to MySQL
        const publicUrl = `https://storage.googleapis.com/${bucketName}/${gcsFilePath}`;
        user.profile_picture = publicUrl;

        await user.save();

        console.log(`Profile updated successfully for user: ${currentEmail}`);
        return h.response({ message: "Profile updated successfully" }).code(200);
      } else {
        // If no profile_picture was provided, save user details without updating the picture
        await user.save();
        console.log(`Profile updated successfully for user: ${currentEmail}`);
        return h.response({ message: "Profile updated successfully" }).code(200);
      }
    } catch (err) {
      console.error("Error updating profile:", err);
      
      if (err.isBoom && err.output.statusCode === 400) {
        return h.response({ message: err.message }).code(400);
      }
      
      throw Boom.internal(`An error occurred: ${err.message}`);
    }
  },
};
