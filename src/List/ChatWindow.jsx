import React from "react";
import { IoChatbubbleEllipses } from "react-icons/io5";

const ChatWindow = () => {
  return (
    <div className=" bg-chatimg w-full h-full flex flex-col items-center justify-center ">
      <div className="bg-white rounded-[15px] p-[40px] flex flex-col items-center text-center ">
        <div>
          {" "}
          <IoChatbubbleEllipses size={100} className=" text-[#7879f1] " />
        </div>
        <p className="text-gray-500 text-[30px]">Welcome to Chatify</p>
        <p className="text-gray-500 text-[18px]">
          Select a chat to start messaging and enjoy smooth,
        </p>
        <p className="text-gray-500 text-[18px]">
          {" "}
          intuitive conversations with a seamless connection.
        </p>
      </div>
    </div>
  );
};

export default ChatWindow;
