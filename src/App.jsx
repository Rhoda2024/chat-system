import { Route, Routes } from "react-router-dom";
import PagesHolder from "./PagesHolder/PagesHolder";
import "./App.css";
import Register from "./RegisrerPage/Register";
import Login from "./Login/Login";
import { useUserStore } from "./lib/userStore";

function App() {
  const { currentUser } = useUserStore();
  console.log(currentUser);

  return (
    <Routes>
      <Route path="/" element={currentUser ? <PagesHolder /> : <Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/login" element={<Login />} />
    </Routes>
  );
}

export default App;
