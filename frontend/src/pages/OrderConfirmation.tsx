import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  CheckCircle2,
  Clock,
  Package,
  Truck,
  Sparkles,
  ArrowRight,
  MapPin,
  Calendar,
  FileText,
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { Order, OrderStatus } from '../types/database';
import { Skeleton } from '../components/ui/Skeleton';

export const OrderConfirmation: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchOrder = async () => {
      if (!id) return;
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from('orders')
          .select('*, order_items(*)')
          .eq('id', id)
          .single();

        if (!error && data) {
          setOrder(data as Order);
        }
      } catch (err) {
        console.error('Error fetching order receipt:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchOrder();
  }, [id]);

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16">
        <Skeleton className="w-full h-80 rounded-3xl" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center space-y-4">
        <h2 className="font-serif font-bold text-2xl text-brand-charcoal">Order Not Found</h2>
        <p className="text-xs text-stone-500">We couldn't locate this order receipt in our records.</p>
        <Link to="/" className="inline-block bg-brand-maroon text-brand-gold-light text-xs font-bold px-6 py-2.5 rounded-xl">
          Return to Home
        </Link>
      </div>
    );
  }

  const statuses: { key: OrderStatus; label: string; icon: any }[] = [
    { key: 'confirmed', label: 'Order Confirmed', icon: CheckCircle2 },
    { key: 'preparing', label: 'Artisans Preparing Fresh', icon: Clock },
    { key: 'ready', label: 'Fresh Pack Sealed', icon: Package },
    { key: 'out_for_delivery', label: 'Out for Delivery', icon: Truck },
    { key: 'delivered', label: 'Delivered', icon: CheckCircle2 },
  ];

  const currentStatusIndex = statuses.findIndex((s) => s.key === order.status);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10 space-y-8">
      
      {/* Success Banner */}
      <div className="bg-gradient-to-r from-brand-maroon via-brand-maroon-dark to-stone-900 text-[#FFFDF9] rounded-3xl p-6 sm:p-10 border-2 border-brand-gold/50 shadow-float text-center space-y-4">
        <div className="w-16 h-16 rounded-full bg-brand-gold/20 border-2 border-brand-gold flex items-center justify-center mx-auto text-brand-gold-light">
          <Sparkles className="w-8 h-8 animate-pulse" />
        </div>
        
        <h1 className="font-serif font-black text-2xl sm:text-3xl text-[#FFFDF9]">
          Thank You! Your Order is Confirmed
        </h1>
        <p className="text-xs sm:text-sm text-stone-300 max-w-md mx-auto">
          Our sweet artisans at Kotaiah Sweets, Kakinada are now preparing your fresh delicacies.
        </p>

        <div className="inline-block bg-black/40 px-4 py-2 rounded-xl border border-brand-gold/40">
          <span className="text-xs text-stone-400">Order ID: </span>
          <span className="font-mono font-bold text-sm text-brand-gold-light tracking-wider">
            {order.order_number}
          </span>
        </div>
      </div>

      {/* Live Order Tracking Stepper */}
      <div className="bg-[#FFFDF9] rounded-3xl border border-brand-border p-6 shadow-soft space-y-6">
        <h3 className="font-serif font-bold text-base text-brand-charcoal">
          Live Order Status
        </h3>

        <div className="relative flex flex-col sm:flex-row justify-between gap-4">
          {statuses.map((step, idx) => {
            const isCompleted = currentStatusIndex >= idx;
            const isCurrent = currentStatusIndex === idx;
            const StepIcon = step.icon;

            return (
              <div key={step.key} className="flex sm:flex-col items-center gap-3 text-left sm:text-center flex-1">
                <div
                  className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 transition-all ${
                    isCurrent
                      ? 'bg-brand-maroon text-brand-gold-light shadow-gold ring-4 ring-brand-gold/30'
                      : isCompleted
                      ? 'bg-emerald-600 text-white'
                      : 'bg-stone-100 text-stone-400 border border-stone-200'
                  }`}
                >
                  <StepIcon className="w-5 h-5" />
                </div>
                <div>
                  <h4 className={`text-xs font-bold ${isCurrent ? 'text-brand-maroon' : isCompleted ? 'text-emerald-900' : 'text-stone-400'}`}>
                    {step.label}
                  </h4>
                  {isCurrent && (
                    <span className="inline-block text-[10px] text-brand-gold-dark font-semibold">
                      In Progress
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Order Details Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Customer & Shipping Summary */}
        <div className="bg-[#FFFDF9] rounded-3xl border border-brand-border p-6 shadow-soft space-y-3 text-xs">
          <h4 className="font-serif font-bold text-sm text-brand-charcoal border-b border-brand-border pb-2 flex items-center gap-2">
            <MapPin className="w-4 h-4 text-brand-gold" />
            <span>Delivery Information</span>
          </h4>

          <div>
            <span className="text-stone-500">Recipient Name:</span>
            <div className="font-bold text-brand-charcoal">{order.customer_name}</div>
          </div>

          <div>
            <span className="text-stone-500">Contact Phone & Email:</span>
            <div className="font-medium text-brand-charcoal">{order.customer_phone} • {order.customer_email}</div>
          </div>

          <div>
            <span className="text-stone-500">Delivery Mode:</span>
            <div className="font-bold text-brand-maroon capitalize">{order.delivery_type}</div>
          </div>

          {order.delivery_type === 'delivery' && order.shipping_address && (
            <div>
              <span className="text-stone-500">Address:</span>
              <div className="font-medium text-stone-700">
                {order.shipping_address.addressLine1}, {order.shipping_address.addressLine2 || ''}
                <br />
                {order.shipping_address.city}, {order.shipping_address.state} - {order.shipping_address.pincode}
              </div>
            </div>
          )}
        </div>

        {/* Order Receipt Summary */}
        <div className="bg-[#FFFDF9] rounded-3xl border border-brand-border p-6 shadow-soft space-y-3 text-xs">
          <h4 className="font-serif font-bold text-sm text-brand-charcoal border-b border-brand-border pb-2 flex items-center gap-2">
            <FileText className="w-4 h-4 text-brand-gold" />
            <span>Receipt Breakdown</span>
          </h4>

          <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
            {order.order_items?.map((item) => (
              <div key={item.id} className="flex justify-between items-center">
                <div>
                  <span className="font-bold text-brand-charcoal">{item.product_name}</span>
                  <div className="text-[10px] text-stone-500">
                    {item.quantity} x {item.weight}
                  </div>
                </div>
                <span className="font-serif font-bold text-brand-maroon">₹{item.subtotal}</span>
              </div>
            ))}
          </div>

          <div className="pt-3 border-t border-brand-border space-y-1.5 text-stone-600">
            <div className="flex justify-between">
              <span>Subtotal:</span>
              <span className="font-bold text-brand-charcoal">₹{order.subtotal}</span>
            </div>
            {order.discount > 0 && (
              <div className="flex justify-between text-emerald-700 font-medium">
                <span>Discount:</span>
                <span>- ₹{order.discount}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span>Delivery:</span>
              <span>{order.delivery_fee === 0 ? 'FREE' : `₹${order.delivery_fee}`}</span>
            </div>
            <div className="pt-2 border-t border-brand-border flex justify-between items-baseline">
              <span className="font-serif font-bold text-sm text-brand-charcoal">Paid Total:</span>
              <span className="font-serif font-black text-xl text-brand-maroon">
                ₹{order.total_amount}
              </span>
            </div>
          </div>
        </div>

      </div>

      {/* Footer Navigation */}
      <div className="flex flex-wrap items-center justify-between gap-4 pt-4">
        <Link
          to="/account?tab=orders"
          className="bg-brand-surface border border-brand-border text-brand-charcoal px-5 py-2.5 rounded-xl font-bold text-xs hover:border-brand-gold transition-colors"
        >
          View in My Orders
        </Link>

        <Link
          to="/products"
          className="flex items-center gap-2 bg-gradient-to-r from-brand-maroon to-brand-maroon-dark text-brand-gold-light px-6 py-2.5 rounded-xl font-bold text-xs shadow-soft hover:scale-105 transition-all"
        >
          <span>Continue Shopping</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

    </div>
  );
};
