import React, { useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { WishlistProvider } from './context/WishlistContext';
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import { FloatingChatbot } from './components/chatbot/FloatingChatbot';
import { Toast } from './components/ui/Toast';

// Pages
import { Home } from './pages/Home';
import { Products } from './pages/Products';
import { ProductDetails } from './pages/ProductDetails';
import { Cart } from './pages/Cart';
import { Checkout } from './pages/Checkout';
import { OrderConfirmation } from './pages/OrderConfirmation';
import { Account } from './pages/Account';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { OwnerDashboard } from './pages/OwnerDashboard';
import { AdminDashboard } from './pages/AdminDashboard';
import { About } from './pages/About';
import { Offers } from './pages/Offers';
import { Reviews } from './pages/Reviews';
import { Contact } from './pages/Contact';

export const App: React.FC = () => {
  const [chatbotOpen, setChatbotOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
  };

  return (
    <AuthProvider>
      <CartProvider>
        <WishlistProvider>
          <div className="min-h-screen flex flex-col bg-brand-bg text-brand-charcoal">
            {/* Header / Navigation */}
            <Navbar onOpenChatbot={() => setChatbotOpen(true)} />

            {/* Main Application Body */}
            <main className="flex-1">
              <Routes>
                <Route path="/" element={<Home onOpenChatbot={() => setChatbotOpen(true)} onToast={showToast} />} />
                <Route path="/products" element={<Products onToast={showToast} onOpenChatbot={() => setChatbotOpen(true)} />} />
                <Route path="/products/:id" element={<ProductDetails onToast={showToast} />} />
                <Route path="/cart" element={<Cart />} />
                <Route path="/checkout" element={<Checkout />} />
                <Route path="/order-confirmation/:id" element={<OrderConfirmation />} />
                <Route path="/account" element={<Account />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/owner" element={<OwnerDashboard />} />
                <Route path="/admin" element={<AdminDashboard />} />
                <Route path="/about" element={<About />} />
                <Route path="/offers" element={<Offers />} />
                <Route path="/reviews" element={<Reviews />} />
                <Route path="/contact" element={<Contact />} />
              </Routes>
            </main>

            {/* Global Footer */}
            <Footer />

            {/* Floating RAG AI Shopping Assistant */}
            <FloatingChatbot
              isOpen={chatbotOpen}
              onOpen={() => setChatbotOpen(true)}
              onClose={() => setChatbotOpen(false)}
            />

            {/* Global Toast Notification */}
            {toastMessage && (
              <Toast
                message={toastMessage}
                type="success"
                onClose={() => setToastMessage(null)}
              />
            )}
          </div>
        </WishlistProvider>
      </CartProvider>
    </AuthProvider>
  );
};

export default App;
