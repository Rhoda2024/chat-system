import React, { useState } from "react";
import img from "../assets/avatar.png";
import { auth, db } from "../lib/firebase";
import { useChatStore } from "../lib/chatStore";
import { arrayRemove, arrayUnion, doc, updateDoc } from "firebase/firestore";
import { useUserStore } from "../lib/userStore";
import { MdKeyboardArrowUp, MdOutlineKeyboardArrowDown } from "react-icons/md";

const Detailss = () => {
  const { chatId, user, isCurrentUserBlocked, isReceiverBlocked, changeBlock } =
    useChatStore();
  const [view, setView] = useState(false);
  const { currentUser } = useUserStore();

  const toggleView = () => {
    setView(!view);
  };

  const handleBlock = async () => {
    if (!user) return;

    const userDocRef = doc(db, "users", currentUser.id);

    try {
      await updateDoc(userDocRef, {
        blocked: isReceiverBlocked ? arrayRemove(user.id) : arrayUnion(user.id),
      });
      changeBlock();
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className="detail">
      <div className=" py-[30px] px-[10px] flex flex-col items-center gap-[10px] border-b-[#7879f1] border-b  ">
        <img
          src={user?.avatar || img}
          alt=""
          className="w-[100px] h-[100px] object-cover rounded-[50%]  "
        />
        <h3 className="text-[24px] ">{user?.username}</h3>
        <p className="text-[16px]">{user?.email}</p>
      </div>

      <div className=" p-[30px] flex flex-col gap-[25px]  ">
        <div className="">
          <div className=" flex items-center justify-between ">
            <span>Chat Settings</span>
            <MdKeyboardArrowUp
              size={30}
              color="white"
              alt=""
              className="w-[30px] h-[30px] bg-[#7879f1] cursor-pointer rounded-[50%] p-[2px] "
            />
          </div>
        </div>

        <div className="">
          <div className=" flex items-center justify-between ">
            <span>Privacy & help</span>
            <div
              className="w-[30px] h-[30px] bg-[#7879f1] flex items-center cursor-pointer rounded-[50%] p-[2px]"
              onClick={toggleView}
            >
              {view ? (
                <MdOutlineKeyboardArrowDown color="white" size={30} />
              ) : (
                <MdKeyboardArrowUp size={30} color="white" />
              )}
            </div>
          </div>
        </div>

        {view && (
          <button
            onClick={handleBlock}
            className="p-[10px] border border-[#7879f1] text-white rounded-[5px] cursor-pointer hover:bg-[rgba(220,20,60,0.88)] hover:text-white hover:border-none "
          >
            {isCurrentUserBlocked
              ? "You are Blocked"
              : isReceiverBlocked
              ? "User blocked"
              : "Block User"}
          </button>
        )}
      </div>
    </div>
  );
};

export default Detailss;
