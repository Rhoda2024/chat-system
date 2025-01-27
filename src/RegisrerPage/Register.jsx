import React, { useState } from "react";
import img from "../assets/avatar.png";
import { toast, ToastContainer } from "react-toastify";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth, db } from "../lib/firebase";
import { doc, getDocs, setDoc } from "firebase/firestore";
import { Link, useNavigate } from "react-router-dom";
import chat from "../assets/chatimg.svg";

const Register = () => {
  const [avatar, setAvatar] = useState({
    file: null,
    url: "",
  });
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleAvatar = (e) => {
    if (e.target.files[0]) {
      setAvatar({
        file: e.target.files[0],
        url: URL.createObjectURL(e.target.files[0]),
      });
    } 
  };

  const uploadToCloudinary = async (file) => {
    const cloudinaryUrl = `https://api.cloudinary.com/v1_1/ds3vaxiod/image/upload`;
    const formData = new FormData();

    formData.append("file", file);
    formData.append("upload_preset", "chatapp"); // Set up an unsigned preset in Cloudinary.

    try {
      const response = await fetch(cloudinaryUrl, {
        method: "POST",
        body: formData,
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error.message);

      return data.secure_url; // Return the uploaded image's URL.
    } catch (error) {
      console.error("Cloudinary Upload Error:", error);
      throw error;
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.target);
    const { username, email, password } = Object.fromEntries(formData);

    try {
      const res = await createUserWithEmailAndPassword(auth, email, password);
      navigate("/");

      // Upload avatar to Cloudinary
      const imgUrl = avatar.file
        ? await uploadToCloudinary(avatar.file)
        : "DEFAULT_AVATAR_URL"; // Provide a default avatar URL if no file is uploaded.

      // Add user to Firestore
      await setDoc(doc(db, "users", res.user.uid), {
        username,
        email,
        avatar: imgUrl,
        id: res.user.uid,
        blocked: [],
      });

      // Create an empty chat structure
      await setDoc(doc(db, "userchats", res.user.uid), {
        chats: [],
      });

      toast.success("Account created! You can login now");
    } catch (error) {
      console.error("Registration Error:", error);
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center gap-[10rem]">
      <div className="w-[700px]">
        <img src={chat} alt="" />
      </div>

      <div className="flex flex-col gap-[20px] items-center">
        <h2 className=" font-medium text-white text-[50px]">
          Create an Account
        </h2>
        <form onSubmit={handleRegister} className="flex flex-col gap-[20px]">
          <label htmlFor="file" className="flex items-center gap-[15px]">
            <img
              src={avatar.url || img}
              alt=""
              className=" rounded-[1rem] w-[90px]"
            />
            <p className="text-[24px] cursor-pointer hover:text-blue-200 ">
              Upload an image
            </p>
          </label>
          <input
            type="file"
            id="file"
            style={{ display: "none" }}
            onChange={handleAvatar}
          />
          <input
            type="text"
            placeholder="Username..."
            name="username"
            className="w-[500px] p-[20px] text-[20px] rounded-[1rem] outline-none text-black"
          />
          <input
            type="email"
            placeholder="Email..."
            name="email"
            className="w-[500px] p-[20px] text-[20px] rounded-[1rem] outline-none text-black"
          />
          <input
            type="password"
            placeholder="Password..."
            name="password"
            className="w-[500px] p-[20px] text-[20px] rounded-[1rem] outline-none text-black"
          />

          <button
            className="bg-transparent border-2 text-white text-[20px] border-blue-900 hover:bg-blue-950 p-[10px] rounded-[12px]"
            disabled={loading}
          >
            {loading ? "Loading..." : "Sign Up"}
          </button>
        </form>
        <p className="text-blue-950 text-[20px]">
          Already have an account? Login{" "}
          <Link to="/login" className="underline hover:text-blue-200 ">
            here
          </Link>
        </p>

        <ToastContainer />
      </div>
    </div>
  );
};

export default Register;
