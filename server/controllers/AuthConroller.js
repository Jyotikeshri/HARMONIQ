import jwt from "jsonwebtoken";
import User from "../models/UserModel.js";
import dotenv from "dotenv";
import { compare } from "bcrypt";
import { uploadImage } from "../config/cloudinaryConfig.js";
import { existsSync, renameSync, unlinkSync } from "fs";
import path from "path";

dotenv.config();

const maxAge = 3 * 24 * 60 * 60 * 1000;

const createToken = (email, userId) => {
  return jwt.sign({ email, userId }, process.env.JWT_SECRET, {
    expiresIn: maxAge,
  });
};

export const signup = async (request, response, next) => {
  try {
    const { email, password } = request.body;
    if (!email || !password) {
      return response.status(400).send("Email and Password is required.");
    }
    const user = await User.create({ email, password });
    response.cookie("jwt", createToken(email, user.id), {
      maxAge,
      secure: true,
      sameSite: "None",
    });
    return response.status(201).json({
      user: {
        id: user.id,
        email: user.email,
        profileSetup: user.profileSetup,
      },
    });
  } catch (error) {
    console.log({ error });
    return response.status(500).send("Internal Server Error");
  }
};

export const login = async (request, response, next) => {
  try {
    const { email, password } = request.body;
    if (!email || !password) {
      return response.status(400).send("Email and Password is required.");
    }
    const user = await User.findOne({ email });
    if (!user) {
      return response.status(404).send("User with the given email not found.");
    }
    const auth = await compare(password, user.password);
    if (!auth) {
      return response.status(401).send("Invalid Email or Password");
    }
    response.cookie("jwt", createToken(email, user.id), {
      maxAge,
      secure: true,
      sameSite: "None",
    });
    return response.status(201).json({
      user: {
        id: user.id,
        email: user.email,
        profileSetup: user.profileSetup,
        firstName: user.firstName,
        lastName: user.lastName,
        image: user.image,
        color: user.color,
      },
    });
  } catch (error) {
    console.log({ error });
    return response.status(500).send("Internal Server Error");
  }
};

export const getUserInfo = async (request, response, next) => {
  try {
    const userData = await User.findById(request.userId);
    if (!userData)
      return response.status(404).send("User with the give id is not found");

    return response.status(200).json({
      id: userData.id,
      email: userData.email,
      profileSetup: userData.profileSetup,
      firstName: userData.firstName,
      lastName: userData.lastName,
      image: userData.image,
      color: userData.color,
    });
  } catch (error) {
    console.log({ error });
    return response.status(500).send("Internal Server Error");
  }
};

export const updateUserInfo = async (request, response, next) => {
  try {
    const { userId } = request;
    const { firstName, lastName, color } = request.body;
    if (!firstName || !lastName) {
      return response.status(401).send("FirstName , LastName  is required!");
    }

    const userData = await User.findByIdAndUpdate(
      userId,
      {
        firstName,
        lastName,
        color,
        profileSetup: true,
      },
      {
        new: true,
        runValidators: true,
      }
    );

    return response.status(200).json({
      id: userData.id,
      email: userData.email,
      profileSetup: userData.profileSetup,
      firstName: userData.firstName,
      lastName: userData.lastName,
      image: userData.image,
      color: userData.color,
    });
  } catch (error) {
    console.log({ error });
    return response.status(500).send("Internal Server Error");
  }
};

// export const logout = async (request, response, next) => {
//   try {
//     const { userId } = request;

//     response.cookie("jwt", createToken(email, user.id), {
//       maxAge,
//       secure: true,
//       sameSite: "None",
//     });
//     return response.status(201).json({
//       user: {
//         id: user.id,
//         email: user.email,
//         profileSetup: user.profileSetup,
//         firstName: user.firstName,
//         lastName: user.lastName,
//         image: user.image,
//         color: user.color,
//       },
//     });
//   } catch (error) {
//     console.log({ error });
//     return response.status(500).send("Internal Server Error");
//   }
// };

// Assuming your config is in config/cloudinaryConfig.js

export const updateUserImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const userId = req.userId;
    const imageUrl = req.file.path; // This path is the URL returned by Cloudinary

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { image: imageUrl },
      {
        new: true,
        runValidators: true,
      }
    );

    return res.status(200).json({
      image: updatedUser.image,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).send("Internal Server Error");
  }
};

export const removeUserImage = async (request, response, next) => {
  try {
    const { userId } = request;
    const user = await User.findById(userId);
    if (!user) {
      return response.status(404).send("User Not Found");
    }

    if (user.image) {
      unlinkSync(user.image); // Corrected the typo here
    }

    user.image = null;
    await user.save();

    return response.status(200).send("Profile image removed successfully");
  } catch (error) {
    console.log({ error });
    return response.status(500).send("Internal Server Error");
  }
};

export const logout = async (request, response, next) => {
  try {
    const { userId } = request;
    response.cookie("jwt", "", { maxAge: 1, secure: true, sameSite: "None" });

    return response.status(200).send("Logged Out Successfully");
  } catch (error) {
    console.log({ error });
    return response.status(500).send("Internal Server Error");
  }
};
