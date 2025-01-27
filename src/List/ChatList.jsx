import React, { useEffect, useState } from "react";
import avatar from "../assets/avatar.png";
import AddUser from "./addUser/AddUser";
import { useUserStore } from "../lib/userStore";
import { doc, getDoc, onSnapshot, updateDoc } from "firebase/firestore";
import { db } from "../lib/firebase";
import { useChatStore } from "../lib/chatStore";
import { GoSearch } from "react-icons/go";
// import { FaTimes } from "react-icons/fa";
import { TiTimes } from "react-icons/ti";
import { AiOutlinePlus } from "react-icons/ai";

const ChatList = () => {
  const [chats, setChats] = useState([]);
  const [addMode, setAddMode] = useState(false);
  const [input, setInput] = useState("");
  const [tooltip, setTooltip] = useState("");

  const { currentUser } = useUserStore();
  const { chatId, changeChat } = useChatStore();

  useEffect(() => {
    const unSub = onSnapshot(
      doc(db, "userchats", currentUser.id),
      async (res) => {
        const items = res.data().chats;

        const promises = items.map(async (item) => {
          const userDocRef = doc(db, "users", item.receiverId);
          const userDocSnap = await getDoc(userDocRef);

          const user = userDocSnap.data();

          return { ...item, user };
        });

        const chatData = await Promise.all(promises);
        setChats(chatData.sort((a, b) => b.updatedAt - a.updatedAt));
      }
    );

    return () => {
      unSub();
    };
  }, [currentUser.id]);

  const handleSelect = async (chat) => {
    const userChats = chats.map((item) => {
      const { user, ...rest } = item;
      return rest;
    });

    const chatIndex = userChats.findIndex(
      (item) => item.chatId === chat.chatId
    );

    userChats[chatIndex].isSeen = true;

    const userChatsRef = doc(db, "userchats", currentUser.id);

    try {
      await updateDoc(userChatsRef, {
        chats: userChats,
      });

      changeChat(chat.chatId, chat.user);
    } catch (error) {
      console.log(error);
    }
  };

  const filteredChats = chats.filter((c) =>
    c.user.username.toLowerCase().includes(input.toLowerCase())
  );

  return (
    <div className=" max-h-[800px] scrollbar-none overflow-y-scroll border-l border-l-[#7879f1]">
      <div className="flex items-center gap-[20px] p-[20px] ">
        <div className=" border-[#7879f1] border-2 flex items-center gap-[20px] rounded-[10px] p-[10px] ">
          <GoSearch color="#7879f1" className="w-[20px] h-[20px]" />
          <input
            type="text"
            className=" border-none outline-none bg-transparent "
            placeholder="Search"
            onChange={(e) => setInput(e.target.value)}
          />
        </div>

        <div className="relative inline-block">
          <div
            className="w-[36px] h-[36px] bg-[#7879f1] cursor-pointer rounded-[10px] p-[5px] flex items-center justify-center"
            onClick={() => setAddMode((prev) => !prev)}
            onMouseEnter={() => setTooltip(addMode ? "Close" : "Add User")}
            onMouseLeave={() => setTooltip("")}
          >
            {addMode ? (
              <TiTimes className="text-white w-[25px] h-[25px]" />
            ) : (
              <AiOutlinePlus className="text-white w-[20px] h-[20px]" />
            )}
          </div>

          {/* Tooltip */}
          {tooltip && (
            <div className="absolute top-[-26px] left-[95%]  text-white rounded-[10px] bg-[#7879f1] p-[5px] text-[10px]">
              {tooltip}
            </div>
          )}
        </div>
      </div>

      <div>
        {filteredChats.map((chat) => (
          <div
            className=" flex items-center gap-[20px] p-[20px] cursor-pointer  border-b-[#7879f1] border-b-[1px]"
            key={chat.chatId}
            onClick={() => handleSelect(chat)}
            style={{
              backgroundColor: chat?.isSeen ? "transparent" : "#7879f9",
            }}
          >
            <img
              src={
                chat.user.blocked.includes(currentUser.id)
                  ? avatar
                  : chat.user.avatar || avatar
              }
              alt=""
              className=" w-[60px] h-[60px] rounded-[50%] object-cover"
            />
            <div className="flex flex-col gap-[10px] ">
              <span className="font-medium ">
                {chat.user.blocked.includes(currentUser.id)
                  ? "User"
                  : chat.user.username}
              </span>
              <p className=" text-[14px] font-light "> {chat.lastMessage}</p>
            </div>
          </div>
        ))}
      </div>

      {addMode && <AddUser />}
    </div>
  );
};

export default ChatList;
