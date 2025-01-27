import React, { useState } from "react";
import {
  arrayUnion,
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
} from "firebase/firestore";
import { db } from "../../lib/firebase";
import { useUserStore } from "../../lib/userStore";

const AddUser = () => {
  const [user, setUser] = useState(null);
  const [error, setError] = useState("");
  const { currentUser } = useUserStore();

  const handleSearch = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const username = formData.get("username");

    try {
      const userRef = collection(db, "users");
      const q = query(userRef, where("username", "==", username));

      const querySnapShot = await getDocs(q);

      if (!querySnapShot.empty) {
        setUser(querySnapShot.docs[0].data());
        setError("");
      } else {
        setError("User does not exist");
      }
    } catch (error) {
      console.log("Error fetching user:", error);
    }
  };

  const handleAdd = async () => {
    const chatRef = collection(db, "chats");
    const userChatsRef = collection(db, "userchats");

    try {
      const newChatRef = doc(chatRef);

      await setDoc(newChatRef, {
        createdAt: serverTimestamp(),
        messages: [],
      });

      await updateDoc(doc(userChatsRef, user.id), {
        chats: arrayUnion({
          chatId: newChatRef.id,
          lastMessage: "",
          receiverId: currentUser.id,
          updatedAt: Date.now(),
        }),
      });

      await updateDoc(doc(userChatsRef, currentUser.id), {
        chats: arrayUnion({
          chatId: newChatRef.id,
          lastMessage: "",
          receiverId: user.id,
          updatedAt: Date.now(),
        }),
      });

      console.log(newChatRef.id);
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className="">
      {/* <div className="w-full h-screen absolute "> */}
      <div className="w-max h-max p-[30px] bg-[rgba(17,25,40,0.781)] rounded-[18px] absolute z-10 top-0 bottom-0 left-0 right-0 m-auto">
        <form className="flex gap-[20px]" onSubmit={handleSearch}>
          <input
            className="p-[20px] rounded-[10px] border-none outline-none  "
            type="text"
            placeholder="Username..."
            name="username"
          />
          <button className="p-[20px] rounded-[10px] bg-[#7879f1]">
            Search
          </button>
        </form>

        {error && <p style={{ color: "red" }}>{error}</p>}
        {user && (
          <div className="mt-[50px] flex items-center justify-between  ">
            <div className=" flex items-center gap-[20px] ">
              <img
                src={user.avatar}
                alt=""
                className="w-[50px] h-[50px] rounded-[50%] object-cover "
              />
              <span>{user.username}</span>
            </div>
            <button
              className="p-[20px] rounded-[10px] bg-[#7879f1] hover:bg-[#7979da] cursor-pointer border-none "
              onClick={handleAdd}
            >
              Add User
            </button>
          </div>
        )}
      </div>
      {/* </div> */}
    </div>
  );
};

export default AddUser;
