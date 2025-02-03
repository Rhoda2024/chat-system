import { Route, Routes } from "react-router-dom";
import PagesHolder from "./PagesHolder/PagesHolder";
import "./App.css";
import Register from "./RegisrerPage/Register";
import Login from "./Login/Login";
import { useUserStore } from "./lib/userStore";
import { Riple } from "react-loading-indicators";

function App() {
  const { currentUser, isLoading } = useUserStore();
  console.log(currentUser);

  if (isLoading)
    return (
      <div className=" bg-white px-[40px] py-[20px] rounded-[1rem] shadow-xl ">
        <Riple color="#32cd32" size="large" text="" textColor="blue" />
      </div>
    );

  return (
    <Routes>
      <Route path="/" element={currentUser ? <PagesHolder /> : <Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/login" element={<Login />} />
    </Routes>
  );
}

export default App;
