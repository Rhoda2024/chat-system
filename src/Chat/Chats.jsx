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
import { FaCamera, FaCircleInfo } from "react-icons/fa6";
import { BsEmojiWink } from "react-icons/bs";
import { format } from "timeago.js";
import axios from "axios";
import { IoMdSend } from "react-icons/io";
import { MdAttachFile, MdOutlineKeyboardBackspace } from "react-icons/md";

const Chats = () => {
  const [chat, setChat] = useState();
  const [open, setOpen] = useState(false);
  const [text, setText] = useState("");
  const [img, setImg] = useState({
    file: null,
    url: "",
  });
  const [view, setView] = useState(false);
  const [view1, setView1] = useState(false);
  const [tooltip, setTooltip] = useState("");
  const detailsRef = useRef(null);
  const { currentUser } = useUserStore();
  const { chatId, user, isCurrentUserBlocked, isReceiverBlocked } =
    useChatStore();

  const toggleView = () => {
    setView((prev) => !prev);
  };
  const toggleView1 = () => {
    setView1((prev) => !prev);
  };

  // Close detailed view when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (detailsRef.current && !detailsRef.current.contains(event.target)) {
        setView(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const endRef = useRef(null);

  // scroll into view
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
    if (text.trim() === "" && !img.file) return; // Prevent sending empty messages

    let imgUrl = null;

    try {
      //  Upload image to Cloudinary if it exists
      if (img.file) {
        const formData = new FormData();
        formData.append("file", img.file);
        formData.append("upload_preset", "chatapp");
        formData.append("cloud_name", "ds3vaxiod");

        const response = await axios.post(
          "https://api.cloudinary.com/v1_1/ds3vaxiod/image/upload",
          formData
        );

        imgUrl = response.data.secure_url; // Get the image URL from Cloudinary response
      }

      // Send message to Firestore
      await updateDoc(doc(db, "chats", chatId), {
        messages: arrayUnion({
          senderId: currentUser.id,
          text,
          createdAt: new Date(),
          ...(imgUrl && { img: imgUrl }), // Add image URL if available
        }),
      });

      //  Update user chats
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

      // Reset input field and image
      setText(""); // Clear text input
      setImg({ file: null, url: "" }); // Clear image
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  return (
    <div className=" h-full w-full flex flex-col ">
      <div className=" p-[20px] flex items-center justify-between border-b border-b-[#7879f1] ">
        <div className="flex items-center gap-[20px]">
          <button
            onClick={() => useChatStore.setState({ chatId: null })}
            className=" we:hidden "
          >
            <MdOutlineKeyboardBackspace size={25} className="text-blue-700" />
          </button>
          {user?.avatar && user?.avatar.includes("http") ? (
            <img
              src={user.avatar}
              alt="Profile"
              className="w-[50px] h-[50px] object-cover rounded-full"
            />
          ) : (
            <div className="w-[100px] h-[100px] flex items-center justify-center bg-gray-500 text-white text-3xl font-bold rounded-full">
              {user?.username ? user.username.charAt(0).toUpperCase() : "?"}
            </div>
          )}

          <div className=" flex flex-col gap-[5px] ">
            <span className=" text-[18px] font-bold ">{user?.username}</span>
          </div>
        </div>

        <div className="flex gap-[20px]">
          <div className="relative inline-block">
            <FaCircleInfo
              size={20}
              color="#7879f1"
              onClick={toggleView}
              onMouseEnter={() => setTooltip("info")}
              onMouseLeave={() => setTooltip("")}
              className="cursor-pointer de:w-[25px] de:h-[25px]"
            />

            {view && (
              <div
                ref={detailsRef}
                className="absolute bg-white text-black shadow-2xl h-[60vh] z-10 w-[80vw] sm:w-[50vw] we:w-[30vw] xl:w-[25vw] top-[3.7rem]  right-[-1.3rem] rounded-[10px]"
              >
                <Detailss />
              </div>
            )}

            {tooltip && (
              <div className="absolute top-[-30px] left-[10%] bg-[#7879f1] text-white text-sm rounded-md px-2 py-1 z-10">
                {tooltip}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="p-[20px] flex flex-col gap-[20px] scrollbar-none overflow-y-scroll bg-chatimg h-full ">
        <div className="w-full">
          {chat?.messages.map((message, index) => (
            <div
              key={index}
              className={`flex w-full pb-[0.5rem] ${
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
                    className="w-[200px] h-[200px] de:w-[300px] de:h-[300px] overflow-hidden object-cover rounded-[10px]"
                  />
                )}
                {message.text && (
                  <p
                    className={`w-fit px-[15px] py-[10px]  text-white rounded-[10px] ${
                      message.senderId === currentUser?.id
                        ? "bg-[#7879f1] rounded-r-3xl "
                        : "bg-[#16167a] rounded-l-3xl "
                    }`}
                  >
                    {message.text}
                  </p>
                )}
                <span
                  className={`flex text-[12px] text-gray-500 ${
                    message.senderId === currentUser?.id
                      ? "justify-end"
                      : "justify-start"
                  }`}
                >
                  {format(message.createdAt.toDate())}
                </span>
              </div>
            </div>
          ))}
        </div>

        {img.url && (
          <div className="">
            <div className=" w-[200px] h-[200px] de:w-[400px] de:h-[400px] ">
              <img src={img.url} alt="" />
            </div>
          </div>
        )}

        <div ref={endRef}></div>
      </div>

      <div className="p-[20px] flex items-center justify-center gap-[15px] sm:gap-[25px] border border-t-[#7879f1] mt-auto ">
        <div className=" hidden de:flex gap-[20px]">
          <label htmlFor="file">
            <FaCamera size={25} color="#7879f1" className="cursor-pointer" />
            <input
              type="file"
              id="file"
              accept="image/*"
              style={{ display: "none" }}
              onChange={handleImg}
              className="w-[50px] h-[50px]"
            />
          </label>
          <div className="relative ">
            <BsEmojiWink
              className="w-[25px] h-[25px] cursor-pointer text-[#7879f1]"
              alt=""
              onClick={() => setOpen((prev) => !prev)}
            />
            <div className=" absolute w-[100px] shadow-lg bottom-[3rem] left-0 ">
              <EmojiPicker open={open} onEmojiClick={handleEmoji} />
            </div>
          </div>
        </div>

        <input
          className="bg-transparent border border-[#7879f1] outline-[#7879f1] w-[220px] de:w-[700px] p-[10px] rounded-[20px] text-[16px] disabled:cursor-not-allowed "
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
        <div className="flex items-center gap-[20px] de:hidden ">
          <label htmlFor="file">
            <FaCamera size={25} color="#7879f1" className="cursor-pointer" />
            <input
              type="file"
              id="file"
              accept="image/*"
              style={{ display: "none" }}
              onChange={handleImg}
              className="w-[50px] h-[50px]"
            />
          </label>
        </div>
        <div
          className=" sm:hidden bg-[#7879f1] hover:bg-[#3e3edd] text-white p-[5px] rounded-full border-[none] cursor-pointer disabled:cursor-not-allowed  disabled:bg-[rgba(220,20,60,0.88)] "
          onClick={handleSend}
          disabled={isCurrentUserBlocked || isReceiverBlocked}
        >
          <IoMdSend size={15} className=" de:size-[25px] " />
        </div>
        <button
          className=" hidden sm:block bg-[#7879f1] hover:bg-[#3e3edd]  text-white px-[30px] py-[10px] border-[none] rounded-[5px] cursor-pointer disabled:cursor-not-allowed  disabled:bg-[rgba(220,20,60,0.88)] "
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
