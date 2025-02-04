import React, { useState } from "react";
import { useUserStore } from "../lib/userStore";
import { auth } from "../lib/firebase";
import { IoSettingsOutline } from "react-icons/io5";
import AddUser from "./addUser/AddUser";

const UserInfo = () => {
  const { currentUser } = useUserStore();
  const [view, setView] = useState("");
  const [addMode, setAddMode] = useState(false);

  const toggleView = () => {
    setView((prev) => !prev);
  };

  return (
    <div className="p-[20px] border-b border-b-[#7879f1] we:border-none flex items-center justify-between">
      <div className="flex items-center gap-[20px]">
        {currentUser.avatar && currentUser.avatar.startsWith("http") ? (
          <img
            src={currentUser.avatar}
            alt=""
            className="w-[50px] h-[50px] rounded-full object-cover"
          />
        ) : (
          <div className="w-[50px] h-[50px] flex items-center justify-center bg-[#7879f1] text-white text-xl font-bold rounded-full">
            {currentUser.username
              ? currentUser.username.charAt(0).toUpperCase()
              : "?"}
          </div>
        )}
        <h3>{currentUser.username}</h3>
      </div>

      <div className="flex items-center gap-[10px]">
        <div
          className="w-fit h-fit bg-[#7879f1] cursor-pointer p-[7px] rounded-[10px] flex items-center justify-center"
          onClick={() => setAddMode(true)}
        >
          <p className="text-white text-[12px]">Add User</p>
        </div>

        <div>
          <IoSettingsOutline
            size={25}
            onClick={toggleView}
            className=" text-[#7879f1] cursor-pointer hover:text-[#34349b] "
          />
        </div>
        {view && (
          <div className=" bg-white shadow-2xl p-[20px] h-[50vh] z-10  w-[90%] fe:w-[70%] we:w-[30vw] le:w-[25vw] absolute top-[5.5rem] we:top-[8rem] fe:left-[10rem] we:left-[5.5rem] le:left-[13rem] ">
            <div>
              <p className="text-[24px]">Settings</p>
            </div>

            <div className=" flex flex-col gap-[20px] items-center justify-center ">
              <div
                size={30}
                color="#7879f1"
                onClick={() => auth.signOut()}
                className="cursor-pointer pt-[5rem]"
              >
                <button className="border border-[#7879f1] py-[10px] text-white bg-[#7879f1] hover:bg-[#212188] px-[3rem] ">
                  LogOut
                </button>
              </div>
            </div>
          </div>
        )}
        {addMode && <AddUser setAddMode={setAddMode} />}
      </div>
    </div>
  );
};

export default UserInfo;
