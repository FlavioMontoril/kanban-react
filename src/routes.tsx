import { lazy, Suspense } from "react";
import { Route, Routes } from "react-router-dom";
import { AppLayout } from "./layout/AppLayout";
import { ProtectedRoute } from "./ProtectedRoute";

const Login = lazy(() => import("./pages/login"));
const Home = lazy(() =>
  import("./components/Home").then((m) => ({ default: m.Home })),
);
const ChatPage = lazy(() => import("./pages/chatPage"));
const PageNotFound = lazy(() => import("./pages/PageNotFound"));

function PageFallback() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-slate-50 dark:bg-slate-950 text-indigo-600 dark:text-indigo-400">
      <div className="w-8 h-8 border-3 border-indigo-600/30 border-t-indigo-600 rounded-full animate-spin" />
    </div>
  );
}

export function AppRoutes() {
  return (
    <Suspense fallback={<PageFallback />}>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route element={<ProtectedRoute />}>
          <Route element={<AppLayout />}>
            <Route path="/" element={<Home />} />
            <Route path="/chat" element={<ChatPage />} />
          </Route>
          <Route path="*" element={<PageNotFound />} />
        </Route>
      </Routes>
    </Suspense>
  );
}
