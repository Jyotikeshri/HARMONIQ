import { useAppStore } from "@/store";
import { API_URI } from "@/utils/constants";
import React, { createContext, useContext, useEffect, useRef } from "react";
import { io } from "socket.io-client";

const SocketContext = createContext(null);

export const useSocket = () => {
  return useContext(SocketContext);
};

export const SocketProvider = ({ children }) => {
  const socket = useRef(null);
  const { userInfo } = useAppStore();

  useEffect(() => {
    if (userInfo) {
      socket.current = io(API_URI, {
        withCredentials: true,
        query: {
          userId: userInfo.id,
        },
      });

      socket.current.on("connect", () => {
        console.log("socket connected");
      });

      const handleReceiveMessage = (message) => {
        const {
          selectedChatType,
          selectedChatData,
          addMessage,
          addContactsInDMCOntacts,
        } = useAppStore.getState();
        if (
          selectedChatType !== undefined &&
          (selectedChatData._id === message.sender._id ||
            selectedChatData._id === message.recipient._id)
        ) {
          console.log("message received ", message);
          addMessage(message);
        }
        addContactsInDMCOntacts(message);
      };

      const handleChannelReceiveMessage = (message) => {
        const {
          selectedChatType,
          selectedChatData,
          addMessage,
          addChannelInChannelList,
        } = useAppStore.getState();
        console.log(message);
        if (
          selectedChatType !== undefined &&
          selectedChatData._id === message.channelId
        ) {
          console.log("message received ", message);
          addMessage(message);
        }
        addChannelInChannelList(message);
      };

      socket.current.on("recieveMessage", handleReceiveMessage);
      socket.current.on("recieve-channel-message", handleChannelReceiveMessage);

      return () => {
        socket.current.disconnect();
      };
    }
  }, [userInfo]);

  return (
    <SocketContext.Provider value={socket.current}>
      {children}
    </SocketContext.Provider>
  );
};
