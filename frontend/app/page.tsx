import Link from 'next/link';
import Navbar from '@/components/Navbar';
import HeroButtons from '@/components/HeroButtons';
import { Globe, Shield, CreditCard, Star, MapPin, Users, Clock, Phone } from 'lucide-react';

const featuredDestinations = [
  { name: 'Goa Beach Paradise', state: 'Goa', price: 15500, duration: '5D/4N', category: 'Beach', image: 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=600' },
  { name: 'Kashmir Paradise', state: 'J&K', price: 31500, duration: '7D/6N', category: 'Hill Station', image: 'https://images.unsplash.com/photo-1597074866923-dc0589150358?w=600' },
  { name: 'Rajasthan Heritage', state: 'Rajasthan', price: 27800, duration: '7D/6N', category: 'Heritage', image: 'https://images.unsplash.com/photo-1599661046289-e31897846e41?w=600' },
];

export default function Home() {
  return (
    <>
      <Navbar />

      {/* Hero Section */}
      <section className="relative min-h-[92vh] flex items-center justify-center overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1600"
            alt="hero"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/70" />
        </div>

        {/* Hero Content */}
        <div className="relative z-10 text-center text-white px-4 max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md border border-white/20 rounded-full px-4 py-2 text-sm mb-6">
            <Globe className="w-4 h-4 text-blue-300" />
            <span>10 Handpicked Indian Destinations</span>
          </div>
          <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
            Explore India's<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-300">
              Most Beautiful
            </span>{' '}Destinations
          </h1>
          <p className="text-xl text-white/80 mb-10 max-w-2xl mx-auto leading-relaxed">
            Handpicked packages with curated itineraries, departure city selection, and seamless Razorpay payments.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/packages"
              className="bg-blue-600 hover:bg-blue-500 text-white font-semibold px-8 py-4 rounded-full transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-blue-500/30 text-lg"
            >
              Browse Packages
            </Link>
            <HeroButtons />
          </div>

          {/* Stats */}
          <div className="flex flex-wrap justify-center gap-8 mt-16">
            {[
              { value: '10+', label: 'Destinations' },
              { value: '66', label: 'Departure Routes' },
              { value: '100%', label: 'Secure Payments' },
            ].map(({ value, label }) => (
              <div key={label} className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl px-6 py-4 text-center">
                <div className="text-3xl font-bold text-white">{value}</div>
                <div className="text-white/60 text-sm mt-1">{label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 animate-bounce">
          <div className="w-6 h-10 border-2 border-white/40 rounded-full flex justify-center pt-2">
            <div className="w-1 h-3 bg-white/60 rounded-full" />
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
              { icon: Globe, title: 'Top Destinations', desc: 'Curated packages across India from beaches to mountains.', color: 'bg-blue-500' },
              { icon: MapPin, title: 'Departure City', desc: 'Select your city — we calculate exact travel cost per person.', color: 'bg-emerald-500' },
              { icon: CreditCard, title: 'Razorpay Payments', desc: 'Pay securely with UPI, cards, or net banking via Razorpay.', color: 'bg-violet-500' },
              { icon: Shield, title: 'Secure & Reliable', desc: 'JWT auth, backend price validation. Your data is safe.', color: 'bg-orange-500' },
            ].map(({ icon: Icon, title, desc, color }) => (
              <div key={title} className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1 border border-gray-100 dark:border-gray-700">
                <div className={`${color} w-12 h-12 rounded-xl flex items-center justify-center mb-4`}>
                  <Icon className="w-6 h-6 text-white" />
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
              { step: '03', title: 'Book', desc: 'Backend calculates exact cost — no hidden fees.', icon: Star },
              { step: '04', title: 'Pay', desc: 'Pay securely via Razorpay and get confirmation.', icon: CreditCard },
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
          <div className="absolute inset-0 bg-blue-900/80 backdrop-blur-sm" />
        </div>
        <div className="relative z-10 max-w-3xl mx-auto text-center text-white">
          <h2 className="text-4xl font-bold mb-4">Ready for Your Next Adventure?</h2>
          <p className="text-blue-100 text-lg mb-10">Join thousands of travellers who book with TripEase.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/packages"
              className="bg-white text-blue-700 font-bold px-8 py-4 rounded-full hover:bg-blue-50 transition-all hover:scale-105 duration-300">
              Explore Packages
            </Link>
            <Link href="/packages"
              className="bg-white/10 backdrop-blur-md border border-white/30 text-white font-bold px-8 py-4 rounded-full hover:bg-white/20 transition-all duration-300">
              View All Destinations
            </Link>
          </div>
        </div>
      </section>

      <footer className="bg-gray-900 text-gray-400 py-10 px-4 text-center">
        <div className="flex items-center justify-center gap-2 text-white font-bold text-xl mb-3">
          <Globe className="w-5 h-5 text-blue-400" /> TripEase
        </div>
        <p className="text-sm mb-2">© 2026 TripEase. Built with Next.js, Express, Supabase & Razorpay.</p>
        <a href="tel:+917200336447" className="text-blue-400 hover:text-blue-300 text-sm font-medium flex items-center justify-center gap-1">
          <Phone className="w-4 h-4" /> +91 72003 36447
        </a>
      </footer>
    </>
  );
}
