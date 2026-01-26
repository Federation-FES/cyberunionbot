import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import TelegramApp from "./pages/TelegramApp";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import AdminDashboard from "./pages/admin/Dashboard";
import AdminLogin from "./pages/admin/Login";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

const App = () => {
  // Отладочный вывод
  console.log('App component rendering...');
  
  return (
    <ErrorBoundary>
     <QueryClientProvider client={queryClient}>
      <TooltipProvider>
       <BrowserRouter>
        <Routes>
         {/* Test route - простой тест для проверки рендеринга */}
         <Route path="/test" element={
           <div style={{ padding: '20px', color: 'white', background: '#1a1a1a', minHeight: '100vh' }}>
             <h1>Тест работает!</h1>
             <p>Если вы видите это сообщение, значит приложение рендерится правильно.</p>
             <a href="/" style={{ color: '#3b82f6' }}>Вернуться на главную</a>
           </div>
         } />
         
         {/* Auth routes */}
         <Route path="/login" element={<LoginPage />} />
         <Route path="/register" element={<RegisterPage />} />
         <Route path="/forgot-password" element={<ForgotPasswordPage />} />
         
         {/* Telegram Mini App - main route */}
         <Route path="/" element={<TelegramApp />} />
         
         {/* Admin panel routes */}
         <Route path="/admin" element={<AdminDashboard />} />
         <Route path="/admin/login" element={<AdminLogin />} />
         
         {/* Catch-all */}
         <Route path="*" element={<NotFound />} />
        </Routes>
       </BrowserRouter>
       <Toaster />
       <Sonner />
      </TooltipProvider>
     </QueryClientProvider>
    </ErrorBoundary>
  );
};

export default App;
