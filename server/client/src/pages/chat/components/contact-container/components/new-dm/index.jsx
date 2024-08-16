import React, { useState } from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

import { FaPlus } from "react-icons/fa";
import { Input } from "@/components/ui/input";
import Lottie from "react-lottie";
import { animationDefaultOptions, getColor } from "@/lib/utils";
import { useAppStore } from "@/store";
import axios from "axios";
import { API_URI, SEARCH_CONTACT_ROUTE } from "@/utils/constants";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarImage } from "@/components/ui/avatar";

const NewDM = () => {
  const [openNewDMModal, setOpenNewDMModal] = useState(false);
  const { userInfo, setSelectedChatType, setSelectedChatData } = useAppStore();
  const [searchedContacts, setSearchedContacts] = useState([]);
  const searchContacts = async (searchTerm) => {
    try {
      if (searchTerm.length > 0) {
        const response = await axios.post(
          SEARCH_CONTACT_ROUTE,
          { searchTerm },
          { withCredentials: true }
        );

        if (response.status === 200 && response.data.contacts) {
          setSearchedContacts(response.data.contacts);
        } else {
          setSearchedContacts([]);
        }
      }
    } catch (error) {}
  };

  const searchNewContact = async (contact) => {
    setOpenNewDMModal(false);
    setSelectedChatType("contact");
    setSelectedChatData(contact);
    setSearchedContacts([]);
  };

  return (
    <>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger>
            <FaPlus
              className="text-neutral-400 text-opacity-90 font-light text-start hover:text-neutral-100 cursor-pointer transition-all duration-300"
              onClick={() => setOpenNewDMModal(true)}
            />
          </TooltipTrigger>
          <TooltipContent className="bg-[#1c1b1e] text-white border-none">
            <p>Select New Contact</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
      <Dialog open={openNewDMModal} onOpenChange={setOpenNewDMModal}>
        <DialogTrigger></DialogTrigger>
        <DialogContent className="bg-[#1c1d25] text-white border-none w-[400px] h-[400px] flex flex-col  ">
          <DialogHeader>
            <DialogTitle className="text-center">
              Please select a Contact
            </DialogTitle>
            <DialogDescription></DialogDescription>
          </DialogHeader>
          <div>
            <Input
              placeholder="Search Contacts"
              className="rounded-lg p-6 bg-[#2c2e3b] border-none"
              onChange={(e) => searchContacts(e.target.value)}
            />
          </div>
          {searchedContacts.length > 0 && (
            <ScrollArea className=" h-[250px] ">
              <div className="flex flex-col gap-5">
                {searchedContacts?.map((contact) => {
                  return (
                    <div
                      key={contact._id}
                      onClick={(e) => searchNewContact(contact)}
                      className="flex gap-3 items-center cursor-pointer"
                    >
                      <div className="h-12 w-12 rounded-full overflow-hidden">
                        <Avatar className="h-12 w-12  rounded-full overflow-hidden ">
                          {userInfo.image ? (
                            <AvatarImage
                              src={`${API_URI}/${contact.image}`} // Ensure this path is correct
                              alt="user image"
                              className="object-cover w-full h-full bg-black rounded-full"
                            />
                          ) : (
                            <div
                              className={`uppercase w-12 h-12  text-lg border-[1px] flex items-center justify-center rounded-full ${getColor(
                                contact.color
                              )}`}
                            >
                              {contact.firstName
                                ? contact.firstName.split("").shift()
                                : contact.email.split("").shift()}
                            </div>
                          )}
                        </Avatar>
                      </div>
                      <div className="flex flex-col">
                        <span>
                          {" "}
                          {contact.firstName
                            ? contact.firstName
                            : contact.email}
                        </span>
                        <span>{contact.email}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </ScrollArea>
          )}

          {searchedContacts.length <= 0 && (
            <div className="flex-1 flex mt-5 md:mt-0 flex-col bg-[#1c1d25] justify-center items-center duration-1000 transition-all">
              <Lottie
                isClickToPauseDisabled={true}
                height={100}
                width={100}
                options={animationDefaultOptions}
              />
              <div className="text-opacity-80 text-white flex flex-col gap-5 items-center mt-5 lg:text-4xl text-xl transition-all duration-300 text-center poppins-thin ">
                <h3 className="poppins-medium">
                  Search new
                  <span className="text-purple-500"> Contacts</span>
                </h3>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default NewDM;
