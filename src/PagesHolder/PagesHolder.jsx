import React, { useEffect, useState } from "react";
import ListPage from "../Pages/ListPage";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../lib/firebase";
import { useUserStore } from "../lib/userStore";
import { useChatStore } from "../lib/chatStore";
import ChatWindow from "../List/ChatWindow";
import Chats from "../Chat/Chats";

const PagesHolder = () => {
  const { currentUser, isLoading, fetchUserInfo } = useUserStore();
  const { chatId } = useChatStore();

  useEffect(() => {
    const unSub = onAuthStateChanged(auth, (user) => {
      fetchUserInfo(user?.uid);
    });

    return () => {
      unSub();
    };
  }, [fetchUserInfo]);

  console.log(currentUser);

  if (isLoading)
    return (
      <div className=" p-[50px] text-[36px] rounded-[10px] bg-[rgba(17,25,40,0.9)] ">
        Loading...
      </div>
    );

  return (
    <div className="flex bg-white text-black max-w-fit h-[90vh] rounded-[12px] border border-[#7879f1]">
      <ListPage />
      <div className="flex-grow w-[50vw]">
        {chatId ? <Chats /> : <ChatWindow />}
      </div>
    </div>
  );
};

export default PagesHolder;
