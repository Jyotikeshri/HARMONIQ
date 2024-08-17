import { animationDefaultOptions } from "@/lib/utils";
import { useAppStore } from "@/store";
import React from "react";
import Lottie from "react-lottie";

const EmptyChatContainer = () => {
  const { userInfo } = useAppStore();
  return (
    <div className="flex-1 flex flex-col bg-[#1c1d25] justify-center items-center duration-1000 transition-all">
      <Lottie
        isClickToPauseDisabled={true}
        height={200}
        width={200}
        options={animationDefaultOptions}
      />
      <div className="text-opacity-80 text-white flex flex-col gap-5 items-center mt-10 lg:text-4xl text-3xl transition-all duration-300 text-center poppins-thin ">
        <h3 className="poppins-medium">
          Hi <span className="text-purple-500">{userInfo.firstName}</span>
          <br />
          Welcome to <span className="text-purple-500">Harmoniq</span>
        </h3>
      </div>
    </div>
  );
};

export default EmptyChatContainer;
