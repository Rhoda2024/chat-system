import React, { useState } from "react";
import avatar from "../assets/avatar.png";
import { useUserStore } from "../lib/userStore";
import { auth } from "../lib/firebase";
import { TbLogout } from "react-icons/tb";
import { HiDotsHorizontal } from "react-icons/hi";
import { FaVideo } from "react-icons/fa";

const UserInfo = () => {
  const [tooltip, setTooltip] = useState("");
  const { currentUser } = useUserStore();

  return (
    <div className="p-[20px] flex items-center justify-between ">
      <div className=" flex items-center gap-[20px] ">
        <img
          src={currentUser.avatar || avatar}
          alt=""
          className=" w-[50px] h-[50px] rounded-[50%] object-cover "
        />
        <h3>{currentUser.username}</h3>
      </div>

      <div className="flex items-center gap-[20px] ">
        <HiDotsHorizontal size={25} color="#7879f1" />
        <FaVideo size={25} color="#7879f1" />
        <div className="relative inline-block ">
          <TbLogout
            size={25}
            color="#7879f1"
            onClick={() => auth.signOut()}
            className="cursor-pointer "
            onMouseEnter={() => setTooltip("Logout")}
            onMouseLeave={() => setTooltip("")}
          />

          {/* Tooltip */}
          {tooltip && (
            <div className="absolute top-[-30px] left-1/2 transform -translate-x-1/2 bg-[#7879f1] text-white text-sm rounded-md px-2 py-1 z-10">
              {tooltip}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserInfo;
