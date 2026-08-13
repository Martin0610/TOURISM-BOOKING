import Link from 'next/link';
import Navbar from '@/components/Navbar';
import { Globe, Shield, CreditCard, Star } from 'lucide-react';

export default function Home() {
  return (
    <>
      <Navbar />
      {/* Hero */}
      <section className="bg-gradient-to-br from-blue-600 to-indigo-700 text-white py-24 px-4 text-center">
        <h1 className="text-5xl font-bold mb-4">Explore the World with TourEase</h1>
        <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
          Discover handpicked tourism packages, book instantly, and pay securely online.
        </p>
        <Link href="/packages" className="bg-white text-blue-600 font-semibold px-8 py-3 rounded-full hover:bg-blue-50 transition text-lg">
          Browse Packages
        </Link>
      </section>

      {/* Features */}
      <section className="py-20 px-4 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-gray-800 mb-12">Why Choose TourEase?</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {[
              { icon: Globe, title: 'Top Destinations', desc: 'Curated packages to the world\'s best destinations.' },
              { icon: Shield, title: 'Safe Booking', desc: 'Your data and payments are always protected.' },
              { icon: CreditCard, title: 'Easy Payments', desc: 'Pay securely via Razorpay in seconds.' },
              { icon: Star, title: 'Best Value', desc: 'Competitive prices with no hidden fees.' },
            ].map(({ icon: Icon, title, desc }) => (
              <div key={title} className="bg-white p-6 rounded-2xl shadow-sm text-center hover:shadow-md transition">
                <Icon className="w-10 h-10 text-blue-600 mx-auto mb-3" />
                <h3 className="font-semibold text-lg text-gray-800 mb-2">{title}</h3>
                <p className="text-gray-500 text-sm">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-blue-600 text-white text-center px-4">
        <h2 className="text-3xl font-bold mb-4">Ready for your next adventure?</h2>
        <p className="text-blue-100 mb-6">Sign up now and start booking your dream trip.</p>
        <div className="flex justify-center gap-4">
          <Link href="/register" className="bg-white text-blue-600 font-semibold px-6 py-3 rounded-full hover:bg-blue-50 transition">
            Get Started
          </Link>
          <Link href="/packages" className="border border-white text-white font-semibold px-6 py-3 rounded-full hover:bg-blue-700 transition">
            View Packages
          </Link>
        </div>
      </section>

      <footer className="bg-gray-900 text-gray-400 text-center py-6 text-sm">
        © 2024 TourEase. All rights reserved.
      </footer>
    </>
  );
}
