import { useAppStore } from "@/store";
import React from "react";
import { Avatar, AvatarImage } from "./avatar";
import { API_URI } from "@/utils/constants";
import { getColor } from "@/lib/utils";

const ContactsList = ({ contacts, isChannel = false }) => {
  const {
    setSelectedChatMessages,
    setSelectedChatType,
    setSelectedChatData,
    selectedChatData,
  } = useAppStore();

  const handleClick = (contact) => {
    if (isChannel) {
      setSelectedChatType("group");
    } else {
      setSelectedChatType("contact");
    }
    if (selectedChatData && selectedChatData._id !== contact._id) {
      setSelectedChatMessages([]);
    }
    setSelectedChatData(contact);
  };

  return (
    <div className="mt-5">
      {contacts.map((contact) => (
        <div
          key={contact._id}
          className={`pl-10 py-2 transition-all duration-300 cursor-pointer ${
            selectedChatData && selectedChatData._id === contact._id
              ? "bg-[#8417ff] hover:bg-[$8417ff]"
              : "hover:bg-[#f1f1f111]"
          }`}
          onClick={() => handleClick(contact)}
        >
          <div className="flex items-center justify-start gap-5 text-neutral-300">
            {!isChannel && (
              <Avatar className="h-10 w-10 rounded-full overflow-hidden">
                {contact.image ? (
                  <AvatarImage
                    src={`${API_URI}/${contact.image}`}
                    alt="user image"
                    className="object-cover w-full h-full bg-black rounded-full"
                  />
                ) : (
                  <div
                    className={`
                        ${
                          selectedChatData &&
                          selectedChatData._id === contact._id
                            ? "bg-[#ffffff22] border-white/50 border-2"
                            : getColor(contact.color)
                        }
                        uppercase w-10 h-10 text-lg border-[1px] flex items-center justify-center rounded-full 
                    }`}
                  >
                    {contact.firstName
                      ? contact.firstName.charAt(0)
                      : contact.email.charAt(0)}
                  </div>
                )}
              </Avatar>
            )}
            {isChannel && (
              <div className="bg-[#ffffff22] h-10 w-10 flex items-center justify-center rounded-full">
                #
              </div>
            )}
            <span>
              {isChannel
                ? contact.name
                : `${contact.firstName} ${contact.lastName}`}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ContactsList;
