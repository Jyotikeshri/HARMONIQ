import mongoose from "mongoose";
import Message from "../models/MessageModel.js";
import { uploadFile as uploadToCloudinary } from "../config/cloudinaryConfig.js";
import { mkdirSync, renameSync } from "fs";
import User from "../models/UserModel.js";

export const getMessages = async (request, response, next) => {
  try {
    const user1 = request.userId;
    const user2 = request.body.id;

    if (!user1 || !user2) {
      return response.status(400).send("Both user ID's are required.");
    }

    const messages = await Message.find({
      $or: [
        { sender: user1, recipient: user2 },
        { sender: user2, recipient: user1 },
      ],
    }).sort({ timestamp: 1 });

    return response.status(200).json({ messages });
  } catch (error) {
    console.log({ error });
    return response.status(500).send("Internal Server Error");
  }
};

export const getContactsForDMList = async (request, response, next) => {
  try {
    let { userId } = request;

    // Ensure userId is an ObjectId
    userId = new mongoose.Types.ObjectId(userId);

    // Run the aggregation pipeline
    const contacts = await Message.aggregate([
      {
        $match: {
          $or: [{ sender: userId }, { recipient: userId }],
        },
      },
      {
        $sort: { timestamp: -1 },
      },
      {
        $group: {
          _id: {
            $cond: {
              if: { $eq: ["$sender", userId] },
              then: "$recipient",
              else: "$sender",
            },
          },
          lastMessageTime: { $first: "$timestamp" },
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "_id",
          as: "contactInfo",
        },
      },
      {
        $unwind: "$contactInfo",
      },
      {
        $project: {
          _id: 1,
          lastMessageTime: 1,
          email: "$contactInfo.email",
          firstName: "$contactInfo.firstName", // Fixed typo
          lastName: "$contactInfo.lastName",
          image: "$contactInfo.image",
          color: "$contactInfo.color",
        },
      },
      {
        $sort: { lastMessageTime: -1 },
      },
    ]);

    // Check if contacts were found
    if (contacts.length === 0) {
      console.log("No contacts found for user:", userId);
    }

    // Return the result
    response.json({ contacts });
  } catch (error) {
    console.error("Error fetching contacts:", error);
    next(error);
  }
};

export const uploadFile = async (req, res, next) => {
  try {
    console.log(req.file);
    if (!req.file) {
      return res.status(400).send("File is required");
    }

    const filePath = req.file.path; // URL returned by Cloudinary

    return res.status(200).json({ filePath });
  } catch (error) {
    console.log({ error });
    return res.status(500).send("Internal Server Error");
  }
};

export const getAllContacts = async (request, response, next) => {
  try {
    const users = await User.find(
      { _id: { $ne: request.userId } },
      "firstName lastName _id email"
    );
    const contacts = users.map((user) => ({
      label: user.firstName ? `${user.firstName} ${user.lastName}` : user.email,
      value: user._id,
    }));
    return response.status(200).json({ contacts });
  } catch (error) {
    console.log({ error });
    return response.status(500).send("Internal Server Error");
  }
};
