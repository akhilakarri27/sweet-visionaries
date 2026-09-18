import React, { useState } from 'react';
import { MapPin, Phone, Mail, Clock, Send, Sparkles, CheckCircle2 } from 'lucide-react';

export const Contact: React.FC = () => {
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({ name: '', phone: '', email: '', message: '' });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setFormData({ name: '', phone: '', email: '', message: '' });
    }, 4000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
      
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <div className="inline-flex items-center gap-1.5 text-xs font-bold text-brand-gold uppercase tracking-wider bg-brand-surface px-3.5 py-1 rounded-full border border-brand-border">
          <MapPin className="w-3.5 h-3.5" />
          <span>Locations & Bulk Orders</span>
        </div>
        <h1 className="font-serif font-black text-3xl sm:text-4xl text-brand-charcoal">
          Get in Touch with Kotaiah Sweets
        </h1>
        <p className="text-xs sm:text-sm text-stone-600 font-sans">
          Inquiries for wedding bulk orders, customized gift hampers, or express store deliveries.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left: Contact Info & Store Details */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-[#FFFDF9] rounded-3xl border border-brand-border p-6 shadow-soft space-y-4">
            <h3 className="font-serif font-bold text-lg text-brand-maroon">Main Flagship Store</h3>
            
            <div className="space-y-3 text-xs text-stone-600">
              <p className="flex items-start gap-3">
                <MapPin className="w-4 h-4 text-brand-gold shrink-0 mt-0.5" />
                <span>Main Bazaar Road, Near Clock Tower, Kakinada, Andhra Pradesh - 533001</span>
              </p>

              <p className="flex items-center gap-3">
                <Phone className="w-4 h-4 text-brand-gold shrink-0" />
                <span>+91 884 237 8999 / +91 94401 23456</span>
              </p>

              <p className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-brand-gold shrink-0" />
                <span>orders@kotaiahsweets.com</span>
              </p>

              <p className="flex items-center gap-3">
                <Clock className="w-4 h-4 text-brand-gold shrink-0" />
                <span>Open 7 Days a Week: 7:00 AM – 10:30 PM</span>
              </p>
            </div>
          </div>

          <div className="bg-brand-surface rounded-3xl border border-brand-border p-6 space-y-2 text-xs">
            <h4 className="font-serif font-bold text-sm text-brand-charcoal">🎉 Bulk Wedding & Corporate Orders</h4>
            <p className="text-stone-600 leading-relaxed">
              We provide custom festive packaging with customized family seals and bulk discounts for celebrations of 50kg or more.
            </p>
          </div>
        </div>

        {/* Right: Message Form */}
        <div className="lg:col-span-7 bg-[#FFFDF9] rounded-3xl border border-brand-border p-8 shadow-soft space-y-4">
          <h3 className="font-serif font-bold text-lg text-brand-charcoal">Send Us an Inquiry</h3>

          {submitted ? (
            <div className="p-6 bg-emerald-50 border border-emerald-200 rounded-2xl text-center space-y-2 text-xs text-emerald-900">
              <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
              <h4 className="font-bold text-sm">Message Sent Successfully!</h4>
              <p>Our store manager will get in touch with you shortly.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="font-semibold text-stone-700">Your Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. Anand V."
                    className="w-full bg-brand-surface p-2.5 rounded-xl border border-brand-border focus:outline-none focus:border-brand-gold"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-stone-700">Phone Number *</label>
                  <input
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+91 98765 43210"
                    className="w-full bg-brand-surface p-2.5 rounded-xl border border-brand-border focus:outline-none focus:border-brand-gold"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-stone-700">Email Address</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="name@example.com"
                  className="w-full bg-brand-surface p-2.5 rounded-xl border border-brand-border focus:outline-none focus:border-brand-gold"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-stone-700">Your Message / Bulk Inquiry *</label>
                <textarea
                  rows={4}
                  required
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  placeholder="Tell us about the sweet varieties and quantities needed..."
                  className="w-full bg-brand-surface p-2.5 rounded-xl border border-brand-border focus:outline-none focus:border-brand-gold"
                />
              </div>

              <button
                type="submit"
                className="bg-gradient-to-r from-brand-maroon to-brand-maroon-dark text-brand-gold-light px-8 py-3 rounded-2xl font-bold text-xs shadow-soft hover:scale-[1.02] transition-all flex items-center gap-2"
              >
                <Send className="w-4 h-4" />
                <span>Submit Inquiry</span>
              </button>
            </form>
          )}
        </div>

      </div>

    </div>
  );
};
