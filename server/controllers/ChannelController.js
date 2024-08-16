import mongoose from "mongoose";
import Channel from "../models/ChannelModel.js";
import User from "../models/UserModel.js";

export const createChannel = async (request, response, next) => {
  try {
    const { name, members } = request.body;
    const userId = request.userId;

    const admin = await User.findById(userId);

    if (!admin) {
      return response.status(400).send("Admin user not found.");
    }

    const validMembers = await User.find({ _id: { $in: members } });

    if (validMembers.length !== members.length) {
      return response.status(400).send("Some members are not valid users.");
    }

    const newChannel = new Channel({
      name,
      members,
      admin: userId,
    });

    await newChannel.save();
    return response.status(201).json({ channel: newChannel });
  } catch (error) {
    console.log({ error });
    return response.status(500).send("Internal Server Error");
  }
};

export const getUserChannels = async (request, response, next) => {
  try {
    const userId = new mongoose.Types.ObjectId(request.userId);
    const channels = await Channel.find({
      $or: [{ admin: userId }, { members: userId }],
    }).sort({ updatedAt: -1 });

    return response.status(201).json({ channels });
  } catch (error) {
    console.log({ error });
    return response.status(500).send("Internal Server Error");
  }
};

export const getChannelMessages = async (request, response, next) => {
  try {
    const { channelId } = request.params; // Using `request` for consistency
    const channel = await Channel.findById(channelId).populate({
      path: "messages",
      populate: {
        path: "sender",
        select: "firstName lastName email image color", // Corrected `email_id` to `email`
      },
    });

    if (!channel) {
      return response.status(404).json({ message: "Channel not found." }); // Use `json` for consistency
    }

    const messages = channel.messages;
    return response.status(200).json({ messages }); // Use `200 OK` for successful data retrieval
  } catch (error) {
    console.error("Error fetching channel messages:", error); // More descriptive error logging
    return response.status(500).json({ message: "Internal Server Error" }); // Return JSON response for consistency
  }
};
