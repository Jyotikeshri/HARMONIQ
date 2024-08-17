import { useAppStore } from "@/store";
import { API_URI, GET_CHANNEL_MESSAGES, GET_MESSAGES } from "@/utils/constants";
import moment from "moment";
import React, { useEffect, useRef, useState } from "react";
import axios from "axios";
import { MdFolderZip } from "react-icons/md";
import { IoMdArrowRoundDown } from "react-icons/io";
import { IoCloseSharp } from "react-icons/io5";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { getColor } from "@/lib/utils";

const MessageContainer = () => {
  const scrollRef = useRef();
  const {
    selectedChatType,
    selectedChatData,
    selectedChatMessages,
    setSelectedChatMessages,
    setFileDownloadProgress,
    setIsDownloading,
    userInfo,
  } = useAppStore();

  const [showImage, setShowImage] = useState(false);
  const [imageURL, setImageURL] = useState(null);

  useEffect(() => {
    const getMessages = async () => {
      try {
        const response = await axios.post(
          GET_MESSAGES,
          { id: selectedChatData._id },
          { withCredentials: true }
        );
        if (response.data.messages) {
          console.log("Fetched messages:", response.data.messages); // Log messages
          setSelectedChatMessages(response.data.messages);
        }
      } catch (error) {
        console.log({ error });
      }
    };
    const getChannelMessages = async () => {
      try {
        const response = await axios.get(
          `${GET_CHANNEL_MESSAGES}/${selectedChatData._id}`,
          { withCredentials: true }
        );
        if (response.data.messages) {
          setSelectedChatMessages(response.data.messages);
        }
      } catch (error) {
        console.log({ error });
      }
    };
    if (selectedChatData._id) {
      if (selectedChatType === "contact") getMessages();
      else if (selectedChatType === "group") getChannelMessages();
    }
  }, [selectedChatData, selectedChatType, setSelectedChatMessages]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [selectedChatMessages]);

  const checkIfImage = (filePath) => {
    const imageRegex =
      /\.(jpg|jpeg|png|gif|bmp|tiff|tif|webp|svg|ico|heic|heif)$/i;
    return imageRegex.test(filePath);
  };

  const downloadFile = async (url) => {
    setIsDownloading(true);
    setFileDownloadProgress(0);
    const response = await axios.get(`${API_URI}/${url}`, {
      responseType: "blob",
      onDownloadProgress: (progressEvent) => {
        const { loaded, total } = ProgressEvent;
        const percentageComplete = Math.round((loaded * 100) / total);
        setFileDownloadProgress(percentageComplete);
      },
    });
    const urlBlob = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement("a");
    link.href = urlBlob;
    link.setAttribute("download", url.split("/").pop());
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(urlBlob);
    setIsDownloading(false);
    setFileDownloadProgress(0);
  };

  const renderDMMessages = (message) => (
    <div
      key={message._id}
      className={`${
        message.sender === selectedChatData._id ? "text-left" : "text-right"
      }`}
    >
      {message.messageType === "text" && (
        <div
          className={`${
            message.sender !== selectedChatData._id
              ? "bg-[#8417ff]/5 text-[#8417ff]/90 border-[#8417ff]/50"
              : "bg-[#2a2b33]/5 text-white/80 border-white/20"
          } border inline-block p-4 rounded my-1 max-w-[50%] break-words`}
        >
          {message.content}
        </div>
      )}
      {message.messageType === "file" && (
        <div
          className={`${
            message.sender !== selectedChatData._id
              ? "bg-[#8417ff]/5 text-[#8417ff]/90 border-[#8417ff]/50"
              : "bg-[#2a2b33]/5 text-white/80 border-[#ffffff]/20"
          } border inline-block p-4 rounded my-1 max-w-[50%] break-words`}
        >
          {checkIfImage(message.fileUrl) ? (
            <div
              className="cursor-pointer"
              onClick={() => {
                setShowImage(true);
                setImageURL(message.fileUrl);
              }}
            >
              <img
                src={`${message.fileUrl}`}
                alt={`Image file: ${message.fileUrl.split("/").pop()}`}
                height={300}
                width={300}
              />
            </div>
          ) : (
            <div className="flex justify-center items-center gap-4">
              <span className="text-white/8 text-3xl rounded-full bg-black/20 p-3">
                <MdFolderZip />
              </span>
              {console.log("message : ", message)}
              <span>{message.fileUrl.split("/").pop()}</span>
              <span
                className="bg-black/20 text-2xl hover:bg-black/50  p-3 rounded-full cursor-pointer transition-all duration-300  "
                onClick={() => downloadFile(message.fileUrl)}
              >
                <IoMdArrowRoundDown />
              </span>
            </div>
          )}
        </div>
      )}

      <div className="text-xs text-gray-600">
        {moment(message.timestamp).format("LT")}
      </div>
    </div>
  );

  const renderChannelMessages = (message) => {
    // Determine if the message is from the current user
    const isCurrentUser = message.sender._id === userInfo.id;

    // Define styles for messages based on sender
    const messageStyle = isCurrentUser
      ? "bg-[#2a2b33]/5 text-white/80 border-[#ffffff]/20"
      : "bg-[#8417ff]/5 text-[#8417ff]/90 border-[#8417ff]/50";

    // Determine alignment based on sender
    const alignmentClass = isCurrentUser ? "text-right" : "text-left";
    const marginClass = isCurrentUser ? "ml-auto" : "mr-auto";

    {
      console.log("message channel : ", message);
    }
    // Check if file URL is for an image
    const isImage = checkIfImage(message.fileUrl);

    return (
      <div className={`mt-5 ${alignmentClass}`}>
        {message.messageType === "text" && (
          <div
            className={`${messageStyle} border inline-block p-4 rounded my-1 max-w-[50%] break-words ${marginClass}`}
          >
            {message.content}
          </div>
        )}

        {message.messageType === "file" && (
          <div
            className={`${messageStyle} border inline-block p-4 rounded my-1 max-w-[50%] break-words ${marginClass}`}
          >
            {isImage ? (
              <div
                className="cursor-pointer"
                onClick={() => {
                  setShowImage(true);
                  setImageURL(message.fileUrl);
                }}
              >
                <img
                  src={`${message.fileUrl}`}
                  alt={`Image file: ${message.fileUrl.split("/").pop()}`}
                  height={300}
                  width={300}
                />
              </div>
            ) : (
              <div className="flex justify-center items-center gap-4">
                <span className="text-white/8 text-3xl rounded-full bg-black/20 p-3">
                  <MdFolderZip />
                </span>
                <span>{message.fileUrl.split("/").pop()}</span>
                <span
                  className="bg-black/20 text-2xl hover:bg-black/50 p-3 rounded-full cursor-pointer transition-all duration-300"
                  onClick={() => downloadFile(message.fileUrl)}
                >
                  <IoMdArrowRoundDown />
                </span>
              </div>
            )}
          </div>
        )}

        <div
          className={`flex items-center ${
            isCurrentUser ? "justify-end" : "justify-start"
          } gap-3`}
        >
          {!isCurrentUser && (
            <Avatar className="h-8 w-8 rounded-full overflow-hidden">
              {message.sender.image ? (
                <AvatarImage
                  src={`${API_URI}/${message.sender.image}`}
                  alt="user image"
                  className="object-cover w-full h-full bg-black"
                />
              ) : (
                <div
                  className={`uppercase w-12 h-12 text-lg border-[1px] flex items-center justify-center rounded-full ${getColor(
                    message.sender.color
                  )}`}
                >
                  {message.sender.firstName
                    ? message.sender.firstName.charAt(0)
                    : message.sender.email.charAt(0)}
                </div>
              )}
            </Avatar>
          )}
          <span className="text-sm text-white/60">{`${message.sender.firstName} ${message.sender.lastName}`}</span>
          <span className="text-xs text-white/60">
            {moment(message.timestamp).format("LT")}
          </span>
        </div>
      </div>
    );
  };

  const renderMessages = () => {
    let lastDate = null;
    return selectedChatMessages.map((message, index) => {
      const messageDate = moment(message.timestamp).format("YYYY-MM-DD");
      const showDate = messageDate !== lastDate;
      lastDate = messageDate;
      return (
        <div key={index}>
          {showDate && (
            <div className="text-center text-gray-500 my-2">
              {moment(message.timestamp).format("LL")}
            </div>
          )}
          {selectedChatType === "contact" && renderDMMessages(message)}
          {selectedChatType === "group" && renderChannelMessages(message)}
        </div>
      );
    });
  };

  return (
    <div className="flex-1 overflow-y-auto scrollbar-hidden p-4 px-8 md:w-[65vw] lg:w-[75vw] xl:w-[80vw] w-full">
      {renderMessages()}
      <div className="" ref={scrollRef} />
      {showImage && (
        <div className="fixed z-[1000] top-0 left-0 h-[100vh] w-[100vw] flex items-center justify-center backdrop-blur-lg">
          <div>
            <img
              src={`${imageURL}`}
              className="h-[80vh] w-full object-cover"
              alt="Displayed Content" // Always include alt text for images
            />
          </div>
          <div className="flex gap-5 fixed top-0 mt-5">
            <button
              className="bg-black/20 p-3 text-2xl rounded-full hover:bg-black/50 cursor-pointer transition-all duration-300"
              onClick={() => downloadFile(imageURL)}
            >
              <IoMdArrowRoundDown />
            </button>
            <button
              className="bg-black/20 p-3 text-2xl rounded-full hover:bg-black/50 cursor-pointer transition-all duration-300"
              onClick={() => {
                setShowImage(false);
                setImageURL(null);
              }}
            >
              <IoCloseSharp />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default MessageContainer;
