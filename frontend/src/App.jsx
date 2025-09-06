import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import Home from "./pages/Home";
import CartPage from "./pages/CartPage";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import { setAuth } from "./api";

function App(){
  const token = localStorage.getItem("token");
  if(token) setAuth(token);
  return (
    <BrowserRouter>
      <main className="p-6"><Routes>
        <Route path="/" element={<Home/>}/>
        <Route path="/cart" element={<CartPage/>}/>
        <Route path="/login" element={<Login/>}/>
        <Route path="/signup" element={<Signup/>}/>
      </Routes></main>
    </BrowserRouter>
  );
}
export default App;