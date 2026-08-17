'use client';

import Link from 'next/link';
import Navbar from '@/components/Navbar';
import { Globe, Shield, CreditCard, Star, MapPin, Users, Clock, Phone, Gift, Percent, Tag } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import WhatsAppButton from '@/components/WhatsAppButton';

const featuredDestinations = [
  { name: 'Goa Beach Paradise', state: 'Goa', price: 15500, duration: '5D/4N', category: 'Beach', image: 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=600' },
  { name: 'Kashmir Paradise', state: 'J&K', price: 31500, duration: '7D/6N', category: 'Hill Station', image: 'https://images.unsplash.com/photo-1597074866923-dc0589150358?w=600' },
  { name: 'Rajasthan Heritage', state: 'Rajasthan', price: 27800, duration: '7D/6N', category: 'Heritage', image: 'https://images.unsplash.com/photo-1599661046289-e31897846e41?w=600' },
];

export default function Home() {
  const { user } = useAuth();
  
  return (
    <>
      <Navbar />
      <WhatsAppButton />

      {/* Hero Section */}
      <section className="relative min-h-[92vh] flex items-center justify-center overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1600"
            alt="hero"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-purple-900/70 via-blue-900/60 to-pink-900/70" />
        </div>

        {/* Hero Content */}
        <div className="relative z-10 text-center text-white px-4 max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-500/20 to-pink-500/20 backdrop-blur-md border border-white/30 rounded-full px-4 py-2 text-sm mb-6">
            <Globe className="w-4 h-4 text-yellow-300" />
            <span className="bg-gradient-to-r from-yellow-200 to-pink-200 bg-clip-text text-transparent font-semibold">10 Handpicked Indian Destinations</span>
          </div>
          <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
            Explore India's<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-pink-300 to-purple-300">
              Most Beautiful
            </span>{' '}Destinations
          </h1>
          <p className="text-xl text-white/90 mb-10 max-w-2xl mx-auto leading-relaxed">
            Handpicked packages with curated itineraries, departure city selection, and seamless payments.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/packages"
              className="bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-white font-bold px-8 py-4 rounded-full transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-orange-500/50 text-lg"
            >
              Explore Packages
            </Link>
            <Link
              href={user ? "/my-bookings" : "/register"}
              className="bg-white/10 backdrop-blur-md border-2 border-white/40 text-white font-semibold px-8 py-4 rounded-full hover:bg-white/20 transition-all duration-300 text-lg hover:border-white/60"
            >
              {user ? "My Bookings" : "Get Started"}
            </Link>
          </div>

          {/* Stats */}
          <div className="flex flex-wrap justify-center gap-8 mt-16">
            {[
              { value: '10+', label: 'Destinations', color: 'from-purple-500 to-pink-500' },
              { value: '4+1', label: 'Free Ticket Offer', color: 'from-yellow-500 to-orange-500' },
              { value: '20%', label: 'Group Discount', color: 'from-green-500 to-teal-500' },
            ].map(({ value, label, color }) => (
              <div key={label} className={`bg-gradient-to-br ${color} rounded-2xl px-6 py-4 text-center shadow-xl`}>
                <div className="text-3xl font-bold text-white">{value}</div>
                <div className="text-white/90 text-sm mt-1">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-24 px-4 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">Why Choose TripEase?</h2>
            <p className="text-gray-500 dark:text-gray-400 max-w-xl mx-auto">Everything you need for a perfect trip, from discovery to confirmation.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: MapPin, title: 'Choose Destination', desc: 'Browse 10+ handpicked destinations across India.', color: 'from-purple-500 to-pink-500' },
              { icon: Gift, title: 'Special Offers', desc: 'Book 4 tickets, get 1 FREE! Plus 20% off for groups of 3+.', color: 'from-yellow-500 to-orange-500' },
              { icon: Tag, title: 'Apply Coupons', desc: 'Save more with exclusive discount codes at checkout.', color: 'from-green-500 to-teal-500' },
              { icon: CreditCard, title: 'Secure Payments', desc: 'Pay safely with UPI, cards, or net banking.', color: 'from-blue-500 to-indigo-500' },
            ].map(({ icon: Icon, title, desc, color }) => (
              <div key={title} className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-2 border border-gray-100 dark:border-gray-700 group">
                <div className={`bg-gradient-to-br ${color} w-14 h-14 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                  <Icon className="w-7 h-7 text-white" />
                </div>
                <h3 className="font-bold text-gray-800 dark:text-white text-lg mb-2">{title}</h3>
                <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Packages */}
      <section className="py-24 px-4 bg-white dark:bg-gray-950">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-end justify-between mb-12">
            <div>
              <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">Featured Packages</h2>
              <p className="text-gray-500 dark:text-gray-400">Most popular destinations this season</p>
            </div>
            <Link href="/packages" className="text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1 text-sm">
              View all →
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {featuredDestinations.map((pkg) => (
              <Link key={pkg.name} href="/packages"
                className="group rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-500 hover:-translate-y-2 border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-800">
                <div className="relative h-56 overflow-hidden">
                  <img src={pkg.image} alt={pkg.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <span className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm text-blue-700 text-xs font-semibold px-3 py-1 rounded-full">
                    {pkg.category}
                  </span>
                </div>
                <div className="p-5">
                  <h3 className="font-bold text-gray-800 dark:text-white text-lg mb-1">{pkg.name}</h3>
                  <div className="flex items-center gap-1 text-gray-500 dark:text-gray-400 text-sm mb-3">
                    <MapPin className="w-3.5 h-3.5 text-blue-500" />{pkg.state}
                    <span className="mx-2">·</span>
                    <Clock className="w-3.5 h-3.5 text-blue-500" />{pkg.duration}
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-2xl font-bold text-blue-600">₹{pkg.price.toLocaleString()}</span>
                      <span className="text-gray-400 text-xs ml-1">/ person</span>
                    </div>
                    <span className="bg-blue-50 dark:bg-blue-900/40 text-blue-600 dark:text-blue-300 text-xs font-semibold px-3 py-1.5 rounded-full group-hover:bg-blue-600 group-hover:text-white transition-colors">
                      View →
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-24 px-4 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">How It Works</h2>
          <p className="text-gray-500 dark:text-gray-400 mb-16">Book your dream trip in 4 simple steps</p>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[
              { step: '01', title: 'Browse', desc: 'Explore packages by destination, category, or budget.', icon: Globe },
              { step: '02', title: 'Customise', desc: 'Select travel date, people, and your departure city.', icon: Users },
              { step: '03', title: 'Book', desc: 'Review your booking details and confirm your trip.', icon: Star },
              { step: '04', title: 'Pay', desc: 'Complete payment securely and get instant confirmation.', icon: CreditCard },
            ].map(({ step, title, desc, icon: Icon }) => (
              <div key={step} className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
                <div className="text-4xl font-black text-blue-100 dark:text-blue-900 mb-3">{step}</div>
                <Icon className="w-6 h-6 text-blue-600 mb-3" />
                <h3 className="font-bold text-gray-800 dark:text-white mb-2">{title}</h3>
                <p className="text-gray-500 dark:text-gray-400 text-sm">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative py-24 px-4 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img src="https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1600" alt="cta" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-r from-purple-900/90 via-pink-900/85 to-orange-900/90 backdrop-blur-sm" />
        </div>
        <div className="relative z-10 max-w-3xl mx-auto text-center text-white">
          <h2 className="text-4xl font-bold mb-4">Ready for Your Next Adventure?</h2>
          <p className="text-purple-100 text-lg mb-10">Join thousands of travellers who book with TripEase.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/packages"
              className="bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-white font-bold px-8 py-4 rounded-full transition-all hover:scale-105 duration-300 shadow-xl">
              Explore Packages
            </Link>
            <Link href={user ? "/wishlist" : "/login"}
              className="bg-white/20 backdrop-blur-md border-2 border-white/40 text-white font-bold px-8 py-4 rounded-full hover:bg-white/30 transition-all duration-300 shadow-xl">
              {user ? "View Wishlist" : "Sign In"}
            </Link>
          </div>
        </div>
      </section>

      <footer className="bg-gray-900 text-gray-400 py-12 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-center gap-2 text-white font-bold text-xl mb-4">
            <Globe className="w-5 h-5 text-blue-400" /> TripEase
          </div>
          <p className="text-sm text-center mb-6 text-gray-400">
            Your trusted partner for exploring India's most beautiful destinations. Curated packages, secure payments, and seamless booking experience.
          </p>
          
          <div className="text-center mb-6">
            <p className="text-sm text-gray-400 mb-3">For queries, contact us:</p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <a href="tel:+917200336447" className="text-blue-400 hover:text-blue-300 font-medium flex items-center gap-2">
                <Phone className="w-4 h-4" /> +91 72003 36447
              </a>
              <span className="hidden sm:block text-gray-600">|</span>
              <a href="mailto:mjv3140@gmail.com" className="text-blue-400 hover:text-blue-300 font-medium">
                mjv3140@gmail.com
              </a>
            </div>
          </div>

          <div className="border-t border-gray-800 pt-6 text-center">
            <p className="text-xs text-gray-500">© 2026 TripEase. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </>
  );
}
