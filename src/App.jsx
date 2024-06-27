import AdminPage from "./routes/adminPage"
import ClientPage from "./routes/clientPage"
import LoginPage from "./routes/loginPage";
import RegPage from "./routes/regPage";
import { BrowserRouter, Routes, Route } from "react-router-dom";

export default function Home () {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<ClientPage />} />
        <Route path="/admin" element={<AdminPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegPage />} />
      </Routes>
    </BrowserRouter>
  )
}