import { Server as SocketIoServer } from "socket.io";
import Message from "./models/MessageModel.js";
import Channel from "./models/ChannelModel.js";

const setupSocket = async (server) => {
  const io = new SocketIoServer(server, {
    cors: {
      origin: [process.env.ORIGIN],
      methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
      credentials: true,
    },
  });

  const userSocketMap = new Map();

  const sendMessage = async (message) => {
    try {
      const senderSocketId = userSocketMap.get(message.sender);
      const recipientSocketId = userSocketMap.get(message.recipient);

      console.log("Sender Socket ID:", senderSocketId);
      console.log("Recipient Socket ID:", recipientSocketId);

      const createdMessage = await Message.create(message);
      console.log("Message created:", createdMessage);

      const messageData = await Message.findById(createdMessage._id)
        .populate("sender", "id email firstName lastName image color")
        .populate("recipient", "id email firstName lastName image color");

      console.log("Populated message data:", messageData);

      if (recipientSocketId) {
        console.log("Emitting message to recipient:", recipientSocketId);
        io.to(recipientSocketId).emit("recieveMessage", messageData);
      } else {
        console.log("Recipient is not connected.");
      }

      if (senderSocketId) {
        console.log("Emitting message to sender:", senderSocketId);
        io.to(senderSocketId).emit("recieveMessage", messageData);
      } else {
        console.log("Sender is not connected.");
      }
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  const sendChannelMessage = async (message) => {
    const { channelId, sender, content, messageType, fileUrl } = message;
    const createdMessage = await Message.create({
      sender,
      recipient: null,
      content,
      messageType,
      timestamp: new Date(),
      fileUrl,
    });

    const messageData = await Message.findById(createdMessage._id)
      .populate("sender", "id email firstName lastName image color")
      .exec();

    await Channel.findByIdAndUpdate(channelId, {
      $push: { messages: createdMessage._id },
    });

    const channel = await Channel.findById(channelId).populate("members");

    const finalData = { ...messageData._doc, channelId: channel._id };

    if (channel && channel.members) {
      channel.members.forEach((member) => {
        const memberSocketId = userSocketMap.get(member._id.toString());
        if (memberSocketId) {
          io.to(memberSocketId).emit("recieve-channel-message", finalData);
        }
      });
      const adminSocketId = userSocketMap.get(channel.admin._id.toString());
      if (adminSocketId) {
        io.to(adminSocketId).emit("recieve-channel-message", finalData);
      }
    }
  };

  // const sendChannelMessage = async (message) => {
  //   try {
  //     const createdMessage = await Message.create({
  //       sender,
  //       recipient: null,
  //       content,
  //       messageType,
  //       timestamp: new Date(),
  //       fileUrl,
  //     });

  //     console.log("Message created:", createdMessage);

  //     const messageData = await Message.findById(createdMessage._id)
  //       .populate("sender", "id email firstName lastName image color")
  //       .exec();

  //     console.log("Populated message data:", messageData);

  //     await Channel.findByIdAndUpdate(channelId, {
  //       $push: { messages: createdMessage._id },
  //     });

  //     const channel = await Channel.findById(channelId).populate("members");

  //     console.log("Channel members:", channel.members);

  //     const finalData = { ...messageData._doc, channelId: channel._id };

  //     if (channel && channel.members) {
  //       // Log the userSocketMap contents
  //       console.log(
  //         "Current userSocketMap entries:",
  //         Array.from(userSocketMap.entries())
  //       );

  //       channel.members.forEach((member) => {
  //         const memberSocketId = userSocketMap.get(member._id.toString());
  //         console.log(`Member ID: ${member._id}, Socket ID: ${memberSocketId}`);

  //         if (memberSocketId) {
  //           console.log("Emitting message to member:", memberSocketId);
  //           io.to(memberSocketId).emit("recieve-channel-message", finalData);
  //         } else {
  //           console.log(`Member ${member._id} is not connected.`);
  //         }
  //       });
  //     } else {
  //       console.log("No members found in the channel.");
  //     }
  //   } catch (error) {
  //     console.error("Error sending channel message:", error);
  //   }
  // };

  const disconnect = (socket) => {
    // console.log(`User Disconnected with client ${socket.id}`);
    for (const [userId, socketId] of userSocketMap.entries()) {
      if (socketId === socket.id) {
        userSocketMap.delete(userId);
        // console.log(`Removed userId ${userId} from userSocketMap`);
        break;
      }
    }
  };

  io.on("connection", (socket) => {
    const userId = socket.handshake.query.userId;
    if (userId) {
      userSocketMap.set(userId, socket.id);
      console.log(`User Connected: ${userId} with socket id: ${socket.id}`);
    } else {
      console.log("User Connected with no userId");
    }

    console.log(
      "Current userSocketMap entries:",
      Array.from(userSocketMap.entries())
    );

    socket.on("sendMessage", (message) => {
      console.log("Received sendMessage event:", message);
      sendMessage(message);
    });

    socket.on("send-channel-message", sendChannelMessage);

    socket.on("disconnect", () => {
      console.log(`User Disconnected with client ${socket.id}`);
      disconnect(socket);
      console.log(
        "Current userSocketMap entries after disconnect:",
        Array.from(userSocketMap.entries())
      );
    });
  });
};

export default setupSocket;
