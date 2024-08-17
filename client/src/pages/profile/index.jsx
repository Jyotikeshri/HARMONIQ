import { useAppStore } from "@/store";
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { IoArrowBack } from "react-icons/io5";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { colors, getColor } from "@/lib/utils";
import { FaPlus, FaTrash } from "react-icons/fa";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import axios from "axios";
import {
  ADD_PROFILE_IMAGE,
  API_URI,
  REMOVE_PROFILE_IMAGE,
  UPDATE_USER_INFO,
} from "@/utils/constants";

const Profile = () => {
  const navigate = useNavigate();
  const { userInfo, setUserInfo } = useAppStore();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [image, setImage] = useState(null);
  const [hovered, setHovered] = useState(false);
  const [selectedColor, setSelectedColor] = useState(0);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (userInfo.profileSetup) {
      setFirstName(userInfo.firstName);
      setLastName(userInfo.lastName);
      setSelectedColor(userInfo.color);
      setImage(userInfo.image); // Ensure the image is set here
    }
    console.log(userInfo.image);
    if (userInfo.image) {
      setImage(`${API_URI}/${userInfo.image}`);
      console.log(image);
    }
  }, [userInfo]);

  const handleNavigate = () => {
    if (userInfo.profileSetup) {
      navigate("/chat");
    } else {
      toast.error("Please Setup the profile");
    }
  };

  const validateChanges = () => {
    if (!firstName) {
      toast.error("FirstName is required");
      return false;
    }
    if (!lastName) {
      toast.error("LastName is required");
      return false;
    }

    return true;
  };

  const handleFileInput = () => {
    fileInputRef.current.click();
  };

  const handleImageChange = async (event) => {
    const file = event.target.files[0];
    console.log(file);
    if (file) {
      const formdata = new FormData();
      formdata.append("profile-image", file);

      try {
        const response = await axios.post(ADD_PROFILE_IMAGE, formdata, {
          withCredentials: true,
        });
        console.log("res:", response);
        if (response.status === 200 && response.data.image) {
          setImage(`${response.data.image}`);
          userInfo.image = response.data.image;
          setUserInfo({ ...userInfo });
          console.log("user-info", userInfo);
          toast.success("Image updated successfully");
        }
      } catch (error) {
        console.error(error);
        toast.error("Failed to upload image");
      }
    }
  };

  const handleDeleteImage = async () => {
    try {
      const response = await axios.delete(REMOVE_PROFILE_IMAGE, {
        withCredentials: true,
      });
      if (response.status === 200) {
        toast.success("Image removed successfully");
      }
      setImage(null);
    } catch (error) {
      console.error(error);
    }
  };

  const saveChanges = async () => {
    if (validateChanges()) {
      try {
        const response = await axios.post(
          UPDATE_USER_INFO,
          { firstName, lastName, color: selectedColor },
          {
            withCredentials: true,
          }
        );
        if (response.status == 200 && response.data) {
          setUserInfo({ ...response.data });
          toast.success("Profile Updated Successfully");
          navigate("/chat");
        }
        console.log(response);
      } catch (error) {
        console.error(error);
      }
    }
  };

  return (
    <div className="bg-[#1b1c24] h-[100vh] flex items-center justify-center flex-col gap-10">
      <div
        className="flex flex-col gap-10 w-[80vw] md:w-max"
        onClick={handleNavigate}
      >
        <IoArrowBack className="text-4xl lg:text-6xl text-white/90 cursor-pointer" />
      </div>
      <div className="grid grid-cols-2">
        <div
          className="h-full w-32 md:w-48 md:h-48 relative flex items-center justify-center"
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
        >
          <Avatar className="h-32 w-32 md:w-48 md:h-48 rounded-full overflow-hidden ">
            {image ? (
              <AvatarImage
                src={`${image}`} // Ensure this path is correct
                alt="user image"
                className="object-cover w-full h-full bg-black"
              />
            ) : (
              <div
                className={`uppercase w-32 h-32 md:w-48 md:h-48 text-5xl border-[1px] flex items-center justify-center rounded-full ${getColor(
                  selectedColor
                )}`}
              >
                {firstName
                  ? firstName.split("").shift()
                  : userInfo.email.split("").shift()}
              </div>
            )}
          </Avatar>
          {hovered && (
            <div
              className="absolute inset-0 flex justify-center items-center bg-black/50 ring-fuchsia-50 rounded-full"
              onClick={image ? handleDeleteImage : handleFileInput}
            >
              {image ? (
                <FaTrash className="text-white/50 text-3xl cursor-pointer" />
              ) : (
                <FaPlus className="text-white/50 text-3xl cursor-pointer" />
              )}
            </div>
          )}
          <Input
            ref={fileInputRef}
            type="file"
            onChange={handleImageChange}
            name="profile-image"
            accept=".png ,.jpg ,.jpeg ,.svg ,.webp"
            className=" hidden"
          />
        </div>
        <div className="flex min-w-32 md:min-w-64 flex-col gap-5 items-center justify-center text-white">
          <div className="w-full">
            <Input
              placeholder="Email"
              type="email"
              disabled
              value={userInfo.email}
              className="rounded-lg p-6 bg-[#2c2e3b]"
            />
          </div>
          <div className="w-full">
            <Input
              placeholder="Fisrt Name"
              type="text"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              className="rounded-lg p-6 bg-[#2c2e3b]"
            />
          </div>
          <div className="w-full">
            <Input
              placeholder="Last Name"
              type="text"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              className="rounded-lg p-6 bg-[#2c2e3b]"
            />
          </div>
          <div className="w-full flex gap-5">
            {colors.map((color, index) => (
              <div
                className={`${color} h-8 w-8 rounded-full cursor-pointer transition-all duration-300
                ${
                  selectedColor === index
                    ? "outline outline-white/50 outline-1"
                    : ""
                }`}
                key={index}
                onClick={() => setSelectedColor(index)}
              ></div>
            ))}
          </div>
          <div className="w-full">
            <Button
              className="h-10 w-1/2 bg-purple-500 hover:bg-purple-700 transition-all duration-300"
              onClick={saveChanges}
            >
              Save Changes
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
