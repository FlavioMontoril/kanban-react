import { Route, Routes } from "react-router-dom";
import Login from "./pages/login";
import { AppLayout } from "./layout/AppLayout";
import { Home } from "./components/Home";
import { ProtectedRoute } from "./ProtectedRoute";

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route element={<ProtectedRoute />}>
        <Route element={<AppLayout />}>
          <Route path="/" element={<Home />} />
        </Route>
      </Route>
    </Routes>
  );
}
