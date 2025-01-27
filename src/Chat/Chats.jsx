import React, { useEffect, useRef, useState } from "react";
import EmojiPicker from "emoji-picker-react";
import {
  arrayUnion,
  doc,
  getDoc,
  onSnapshot,
  updateDoc,
} from "firebase/firestore";
import { db } from "../lib/firebase";
import avatar from "../assets/avatar.png";
import { useChatStore } from "../lib/chatStore";
import { useUserStore } from "../lib/userStore";
import Detailss from "../Detail/Detailss";
import { FaCamera, FaCircleInfo, FaPhone, FaVideo } from "react-icons/fa6";
import { BsEmojiWink } from "react-icons/bs";
import { MdKeyboardVoice } from "react-icons/md";
import { format } from "timeago.js";
import axios from "axios";

const Chats = () => {
  const [chat, setChat] = useState();
  const [open, setOpen] = useState(false);
  const [text, setText] = useState("");
  const [img, setImg] = useState({
    file: null,
    url: "",
  });
  const [view, setView] = useState(false);
  const [tooltip, setTooltip] = useState("");

  const toggleView = () => {
    setView(!view);
  };

  const { currentUser } = useUserStore();
  const { chatId, user, isCurrentUserBlocked, isReceiverBlocked } =
    useChatStore();

  const endRef = useRef(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [chat?.messages]);

  useEffect(() => {
    const unSub = onSnapshot(doc(db, "chats", chatId), (res) => {
      setChat(res.data());
    });

    return () => {
      unSub();
    };
  }, [chatId]);

  // console.log(chat);

  const handleEmoji = (e) => {
    setText((prev) => prev + e.emoji);
    setOpen(false);
  };

  const handleImg = (e) => {
    if (e.target.files[0]) {
      setImg({
        file: e.target.files[0],
        url: URL.createObjectURL(e.target.files[0]),
      });
    }
  };

  const handleSend = async () => {
    if (text === "" && !img.file) return; // Prevent sending empty messages

    let imgUrl = null;

    try {
      // Step 1: Upload image to Cloudinary if it exists
      if (img.file) {
        const formData = new FormData();
        formData.append("file", img.file);
        formData.append("upload_preset", "chatapp"); // Replace with your Cloudinary preset
        formData.append("cloud_name", "ds3vaxiod"); // Replace with your Cloudinary cloud name

        const response = await axios.post(
          "https://api.cloudinary.com/v1_1/ds3vaxiod/image/upload",
          formData
        );

        imgUrl = response.data.secure_url; // Get the image URL from Cloudinary response
      }

      await updateDoc(doc(db, "chats", chatId), {
        messages: arrayUnion({
          senderId: currentUser.id,
          text,
          createdAt: new Date(),
          ...(imgUrl && { img: imgUrl }), // Add image URL if available
        }),
      });

      const userIDs = [currentUser.id, user.id];

      userIDs.forEach(async (id) => {
        const userChatsRef = doc(db, "userchats", id);
        const userChatsSnapshot = await getDoc(userChatsRef);

        if (userChatsSnapshot.exists()) {
          const userChatsData = userChatsSnapshot.data();

          const chatIndex = userChatsData.chats.findIndex(
            (c) => c.chatId === chatId
          );

          userChatsData.chats[chatIndex].lastMessage = text || "Image";
          userChatsData.chats[chatIndex].isSeen =
            id === currentUser.id ? true : false;
          userChatsData.chats[chatIndex].updatedAt = Date.now();

          await updateDoc(userChatsRef, {
            chats: userChatsData.chats,
          });
        }
      });
    } catch (error) {
      console.error("Error sending message:", error);
    }

    // Reset the input fields
    setText("");
    setImg({
      file: null,
      url: "",
    });
  };

  console.log(text);

  return (
    <div className=" border border-r-[#7879f1] h-full flex flex-col ">
      <div className=" p-[20px] flex items-center justify-between border-b border-b-[#7879f1] ">
        <div className="flex items-center gap-[20px]">
          <img
            src={user?.avatar || avatar}
            alt=""
            className="w-[60px] h-[60px] rounded-[50%] object-cover "
          />
          <div className=" flex flex-col gap-[5px] ">
            <span className=" text-[18px] font-bold ">{user?.username}</span>
          </div>
        </div>

        <div className="flex gap-[20px]">
          <FaPhone size={20} color="#7879f1" />
          <FaVideo size={20} color="#7879f1" />

          <div className=" relative inline-block">
            <FaCircleInfo
              size={20}
              color="#7879f1"
              onClick={toggleView}
              onMouseEnter={() => setTooltip("info")}
              onMouseLeave={() => setTooltip("")}
            />
            {view && (
              <div className="absolute bg-[#333333] text-white h-[79.7vh] z-10 w-[23.5vw] top-[3.7rem] right-[-1.3rem] rounded-[10px]">
                <Detailss />
              </div>
            )}

            {/* Tooltip */}
            {tooltip && (
              <div className="absolute top-[-30px] left-1/2 transform -translate-x-1/2 bg-[#7879f1] text-bg-black text-white text-sm rounded-md px-2 py-1 z-10">
                {tooltip}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="p-[20px] flex flex-col gap-[20px] scrollbar-none overflow-y-scroll ">
        <div className="w-full">
          {chat?.messages.map((message, index) => (
            <div
              key={index}
              className={`flex w-full ${
                message.senderId === currentUser?.id
                  ? "justify-end"
                  : "justify-start"
              }`}
            >
              <div>
                {message.img && (
                  <img
                    src={message.img}
                    alt="Message"
                    className="w-[400px] h-[400px] object-cover rounded-[10px]"
                  />
                )}
                {message.text && (
                  <p
                    className={`p-[20px] text-white rounded-[10px] ${
                      message.senderId === currentUser?.id
                        ? "bg-[#7879f1]"
                        : "bg-[#16167a]"
                    }`}
                  >
                    {message.text}
                  </p>
                )}
                <span>{format(message.createdAt.toDate())}</span>
              </div>
            </div>
          ))}
        </div>

        {img.url && (
          <div className="">
            <div className="">
              <img src={img.url} alt="" />
            </div>
          </div>
        )}

        <div ref={endRef}></div>
      </div>

      <div className="p-[20px] flex items-center justify-center gap-[25px] border border-t-[#7879f1] mt-auto ">
        <div className="flex items-center gap-[25px]">
          <label htmlFor="file">
            <FaCamera size={25} color="#7879f1" className="cursor-pointer" />
            <input
              type="file"
              id="file"
              accept="image/*"
              style={{ display: "none" }}
              onChange={handleImg}
            />
          </label>
          <MdKeyboardVoice size={25} color="#7879f1" />
        </div>

        <input
          className="bg-transparent border border-[#7879f1] outline-[#7879f1] w-[700px] p-[15px] rounded-[20px] text-[16px] disabled:cursor-not-allowed "
          type="text"
          placeholder={
            isCurrentUserBlocked || isReceiverBlocked
              ? "You cannot send a message"
              : "Type a message..."
          }
          value={text}
          onChange={(e) => setText(e.target.value)}
          disabled={isCurrentUserBlocked || isReceiverBlocked}
        />
        <div className="relative ">
          <BsEmojiWink
            className="w-[25px] h-[25px] cursor-pointer text-[#7879f1]"
            alt=""
            onClick={() => setOpen((prev) => !prev)}
          />
          <div className=" absolute bottom-[50px] left-[0] ">
            <EmojiPicker open={open} onEmojiClick={handleEmoji} />
          </div>
        </div>
        <button
          className=" bg-[#7879f1] hover:bg-[#3e3edd]  text-white px-[30px] py-[10px] border-[none] rounded-[5px] cursor-pointer disabled:cursor-not-allowed  disabled:bg-[rgba(220,20,60,0.88)] "
          onClick={handleSend}
          disabled={isCurrentUserBlocked || isReceiverBlocked}
        >
          Send
        </button>
      </div>
    </div>
  );
};

export default Chats;
