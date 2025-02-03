import React, { useEffect, useState } from "react";
import avatar from "../assets/avatar.png";
import AddUser from "./addUser/AddUser";
import { useUserStore } from "../lib/userStore";
import { doc, getDoc, onSnapshot, updateDoc } from "firebase/firestore";
import { db } from "../lib/firebase";
import { useChatStore } from "../lib/chatStore";
import { GoSearch } from "react-icons/go";
import {
  IoCheckmarkDoneOutline,
  IoCheckmarkOutline,
  IoTrashBinOutline,
} from "react-icons/io5";
import { format } from "timeago.js";
import { writeBatch } from "firebase/firestore"; // Import writeBatch

const ChatList = () => {
  const [chats, setChats] = useState([]);
  const [addMode, setAddMode] = useState(false);
  const [input, setInput] = useState("");
  const [tooltip, setTooltip] = useState("");
  const batch = writeBatch(db);
  const { currentUser } = useUserStore();
  const { chatId, changeChat } = useChatStore();

  useEffect(() => {
    if (!currentUser?.id) return;

    const userChatsRef = doc(db, "userchats", currentUser.id);

    const unSub = onSnapshot(userChatsRef, async (res) => {
      if (!res.exists()) {
        setChats([]);
        return;
      }

      const items = res.data().chats;

      if (!items.length) {
        setChats([]);
        return;
      }

      // Fetch all user details in a single batch
      const userIds = items.map((item) => item.receiverId);
      const userDocs = await Promise.all(
        userIds.map((id) => getDoc(doc(db, "users", id)))
      );

      const chatData = items.map((item, index) => ({
        ...item,
        user: userDocs[index].exists() ? userDocs[index].data() : {},
      }));

      setChats(chatData.sort((a, b) => b.updatedAt - a.updatedAt));
    });

    return () => unSub();
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
      console.log("Error updating chat:", error);
    }
  };

  const handleDelete = async (chatIdToDelete, receiverId) => {
    try {
      const currentUserChatsRef = doc(db, "userchats", currentUser.id);
      const receiverChatsRef = doc(db, "userchats", receiverId);

      const currentUserDoc = await getDoc(currentUserChatsRef);
      const receiverUserDoc = await getDoc(receiverChatsRef);

      if (!currentUserDoc.exists() || !receiverUserDoc.exists()) {
        console.log("One of the users does not exist in Firestore.");
        return;
      }

      const currentUserChats = currentUserDoc.data().chats || [];
      const receiverUserChats = receiverUserDoc.data().chats || [];

      // Remove the chat manually instead of using `arrayRemove`
      const updatedCurrentUserChats = currentUserChats.filter(
        (chat) => chat.chatId !== chatIdToDelete
      );
      const updatedReceiverUserChats = receiverUserChats.filter(
        (chat) => chat.chatId !== chatIdToDelete
      );

      // Perform batch write
      const batch = writeBatch(db);

      batch.update(currentUserChatsRef, { chats: updatedCurrentUserChats });
      batch.update(receiverChatsRef, { chats: updatedReceiverUserChats });

      await batch.commit();

      // Update local state
      setChats(updatedCurrentUserChats);

      console.log("Chat deleted successfully for both users.");
    } catch (error) {
      console.error("Error deleting chat:", error);
    }
  };

  // Fixed search filter (prevents "Cannot read properties of undefined")
  const filteredChats = chats.filter((c) =>
    c.user?.username?.toLowerCase().includes(input.toLowerCase())
  );

  console.log("search", filteredChats);

  return (
    <div className="max-w-[100%] max-h-[800px] scrollbar-none overflow-y-scroll pt-[2rem]">
      <p className="text-[25px] pl-[1rem]">Chats</p>

      <div className="flex items-center justify-between gap-[10px] p-[20px]">
        <div className="border-[#7879f1] w-[200px] de:w-[85%] we:w-[300px] border-2 flex items-center gap-[10px] rounded-[10px] p-[10px]">
          <GoSearch color="#7879f1" className="w-[20px] h-[20px]" />
          <input
            type="text"
            className="border-none outline-none bg-transparent"
            placeholder="Search for chat..."
            onChange={(e) => setInput(e.target.value)}
          />
        </div>

        <div
          className="w-fit h-fit bg-[#7879f1] cursor-pointer p-[10px] rounded-[10px] flex items-center justify-center"
          onClick={() => setAddMode(true)}
        >
          <p className="text-white text-[12px]">Add User</p>
        </div>
      </div>

      <div>
        {filteredChats.map((chat) => (
          <div
            className="flex items-center gap-[20px] p-[20px] cursor-pointer border-b-[#7879f1] border-b-[1px]"
            key={chat.chatId}
            onClick={() => handleSelect(chat)}
          >
            {chat?.user?.avatar && chat?.user?.avatar.includes("http") ? (
              <img
                src={chat.user.avatar}
                alt="Profile"
                className="w-[75px] h-[55px] object-cover rounded-[100%]"
              />
            ) : (
              <div className="w-[75px] h-[55px] flex items-center justify-center bg-gray-500 text-white text-3xl font-bold rounded-[100%]">
                {chat?.user?.username
                  ? chat.user.username.charAt(0).toUpperCase()
                  : "?"}
              </div>
            )}

            <div className="flex flex-col gap-[10px] w-full">
              <span className="font-medium">
                {chat.user.blocked.includes(currentUser.id)
                  ? "User"
                  : chat.user.username}
              </span>

              <p className="text-[14px] font-light flex justify-between items-center">
                {chat?.lastMessage?.slice(0, 20)}
                {chat?.lastMessage?.length > 20 && "..."}
                <span>
                  {chat?.isSeen ? (
                    <IoCheckmarkDoneOutline
                      size={20}
                      className="text-[#7879f1]"
                    />
                  ) : (
                    <IoCheckmarkOutline size={20} className="text-[red]" />
                  )}
                </span>
              </p>

              {chat?.lastMessage?.createdAt && (
                <span className="text-[12px] text-gray-500">
                  {format(chat.lastMessage.createdAt.toDate())}
                </span>
              )}
            </div>

            <button
              onClick={(e) => {
                e.stopPropagation(); // Prevent chat selection from triggering
                handleDelete(chat.chatId, chat.user.id); // Pass receiverId
              }}
              className="text-red-500 hover:text-red-700"
            >
              <IoTrashBinOutline />
            </button>
          </div>
        ))}
      </div>

      {addMode && <AddUser setAddMode={setAddMode} />}
    </div>
  );
};

export default ChatList;
