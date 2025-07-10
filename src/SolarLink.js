import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Parallax, ParallaxProvider } from 'react-scroll-parallax';
import { Link } from 'react-router-dom';

/**
 * Theme configuration using the original spacing values.
 */
const theme = {
  colors: {
    menuBg: '#C8AB83',
    contentBg: '#7F636E',
    featureBg: '#55868C',
    pageBg: '#CACAAA'
  },
  spacing: {
    menuPadding: 'px-20 py-6', // Original values
    contentPadding: 'p-16',     // Original values
    gap: 'gap-20'               // Original values
  },
  typography: {
    heading: 'font-bold tracking-tight font-sans',
    body: 'font-normal leading-relaxed font-sans'
  },
  roundedness: 'rounded-none'
};

const SolarLink = () => {
  // Smooth scroll to a section by its id
  const scrollToSection = (id) => {
    const section = document.getElementById(id);
    if (section) {
      section.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // State to manage mobile menu open/close
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <ParallaxProvider>
      <div className="min-h-screen bg-white p-4">
        <div className="rounded-xl overflow-hidden shadow-2xl">
          <div className="scroll-smooth" style={{ backgroundColor: theme.colors.pageBg }}>
            {/* Navigation */}
            <nav
              className={`shadow-md ${theme.roundedness}`}
              style={{ backgroundColor: theme.colors.menuBg }}
            >
              <div className={`flex justify-between items-center ${theme.spacing.menuPadding}`}>
                <div className={`text-white ${theme.typography.heading} text-2xl`}>SOLARLINK</div>
                {/* Desktop Menu */}
                <div className="hidden md:flex space-x-8">
                  {['home', 'about', 'services', 'contact'].map((page) => (
                    <button
                      key={page}
                      onClick={() => {
                        scrollToSection(page);
                        setIsMobileMenuOpen(false);
                      }}
                      className="text-white hover:opacity-80 text-2xl font-medium capitalize"
                    >
                      {page}
                    </button>
                  ))}
                </div>
                {/* Desktop Client Portal */}
                <div className="hidden md:block text-white text-2xl font-medium capitalize">
                  Client Portal
                </div>
                {/* Mobile Menu Toggle */}
                <button
                  className="md:hidden text-white"
                  onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-8 w-8"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16" />
                  </svg>
                </button>
              </div>
              {/* Mobile Menu */}
              {isMobileMenuOpen && (
                <div className="md:hidden flex flex-col space-y-4 px-6 pb-4">
                  {['home', 'about', 'services', 'contact'].map((page) => (
                    <button
                      key={page}
                      onClick={() => {
                        scrollToSection(page);
                        setIsMobileMenuOpen(false);
                      }}
                      className="text-white hover:opacity-80 text-xl font-medium capitalize text-left"
                    >
                      {page}
                    </button>
                  ))}
                  <button
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="text-white hover:opacity-80 text-xl font-medium capitalize text-left"
                  >
                    Client Portal
                  </button>
                </div>
              )}
            </nav>

            {/* Home Section */}
            <section id="home" className="py-16" style={{ backgroundColor: theme.colors.contentBg }}>
              <div className="flex flex-col md:flex-row items-center justify-center container mx-auto px-6">
                <motion.div
                  className={`flex-1 ${theme.spacing.contentPadding}`}
                  initial={{ opacity: 0, x: -50 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.8 }}
                  viewport={{ once: true }}
                >
                  <h1 className={`text-5xl ${theme.typography.heading} mb-8 tracking-wide text-white max-w-2xl`}>
                    Power Your Business with Zero Upfront Cost Solar Financing
                  </h1>
                  <p className={`text-lg ${theme.typography.body} mb-12 text-white/90 max-w-2xl`}>
                    Transform your commercial property roofspace into a electricity generating asset with cost-free solar installation. We provide flexible private credit financing 
                    for solar rooftop installations, enabling businesses to cut energy costs and meet sustainability goals—without upfront investment.
                  </p>
                  <div className="space-y-4 mb-12">
                    <p className={`text-lg ${theme.typography.body} text-white/90 max-w-2xl flex items-start gap-2`}>
                      <span className="text-white">✔️</span> Lower your electricity bills
                    </p>
                    <p className={`text-lg ${theme.typography.body} text-white/90 max-w-2xl flex items-start gap-2`}>
                      <span className="text-white">✔️</span> Boost property value and sustainability
                    </p>
                    <p className={`text-lg ${theme.typography.body} text-white/90 max-w-2xl flex items-start gap-2`}>
                      <span className="text-white">✔️</span> Enjoy seamless installation with top-tier solar providers
                    </p>
                  </div>
                  <p className={`text-lg ${theme.typography.body} max-w-2xl font-medium`}>
  <Link
    to="/tool"
    className="
      inline-block                    /* so padding works */
      rounded-md
      bg-amber-500                    /* <<< background colour */
      px-5 py-3                       /* button padding */
      text-white
      hover:bg-amber-600              /* darker on hover */
      focus:outline-none focus:ring-2 focus:ring-amber-400 focus:ring-offset-2
      transition                       /* smooth colour change */
    "
  >
    Solar Savings Calculator
  </Link>
</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8 max-w-2xl">
                    {[
                      {
                        title: "Flexible Financing",
                        description: "Customized credit solutions designed specifically for commercial solar projects."
                      },
                      {
                        title: "Expert Guidance",
                        description: "Deep industry expertise in both solar technology and structured finance."
                      }
                    ].map(({ title, description }) => (
                      <motion.div
                        key={title}
                        className={`p-8 shadow-[0_8px_30px_rgba(0,0,0,0.3)] ${theme.roundedness}`}
                        style={{ backgroundColor: theme.colors.featureBg }}
                        initial={{ opacity: 0, y: 50 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.2 }}
                        viewport={{ once: true }}
                      >
                        <h3 className={`text-xl ${theme.typography.heading} mb-4 text-white`}>{title}</h3>
                        <p className="text-white/90">{description}</p>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
                <motion.div
                  className={`flex-1 ${theme.spacing.contentPadding}`}
                  initial={{ opacity: 0, x: 50 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.8 }}
                  viewport={{ once: true }}
                >
                  <Parallax y={[20, -20]}>
                    <img
                      src="/solar1.png"
                      alt="Solar Installation"
                      className="w-full h-full object-cover rounded-lg shadow-[0_20px_50px_rgba(0,0,0,0.5)]"
                    />
                  </Parallax>
                </motion.div>
              </div>
            </section>

            {/* About Section */}
            <section id="about" className="py-16" style={{ backgroundColor: theme.colors.contentBg }}>
              <div className="max-w-5xl mx-auto px-4">
                <motion.h2
                  className={`text-5xl ${theme.typography.heading} mb-8 tracking-wide text-white text-center`}
                  initial={{ opacity: 0, y: -50 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8 }}
                  viewport={{ once: true }}
                >
                  About SolarLink
                </motion.h2>
                <motion.h3
                  className={`text-3xl ${theme.typography.body} mb-8 text-white/80 text-center`}
                  initial={{ opacity: 0, y: -30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.2 }}
                  viewport={{ once: true }}
                >
                  Financing the Future of Clean Energy
                </motion.h3>
                <div className="grid md:grid-cols-2 gap-16">
                  <motion.div
                    className="w-full"
                    initial={{ opacity: 0, x: -50 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.8 }}
                    viewport={{ once: true }}
                  >
                    <p className={`text-lg ${theme.typography.body} mb-6 text-white/90`}>
                    80% of commercial rooftops remain unused for solar—unlock yours with zero upfront cost. No business 
                    should be held back from adopting solar due to financial constraints.
                    With a £1.6 billion market opportunity, the South UK region is leading the charge in commercial 
                    solar, and we're here to help businesses access it.                </p>
                    <p className={`text-lg ${theme.typography.body} text-white/90 mb-6`}>
                      While banks and traditional lenders focus on large-scale utility projects, SMEs and commercial 
                      property owners are left underserved. That's where we come in.
                    </p>
                    <p className={`text-lg ${theme.typography.body} text-white/90`}>
                      Our private credit financing solutions empower SMEs, warehouse owners, and commercial landlords 
                      to install solar with zero upfront cost, reducing energy expenses while boosting sustainability.
                    </p>
                    <p className={`text-lg ${theme.typography.heading} mt-6 text-white`}>
                      Join us in reshaping the future of commercial energy—one rooftop at a time.
                    </p>
                  </motion.div>
                  <motion.div
                    className="overflow-visible"
                    initial={{ opacity: 0, x: 50 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.8 }}
                    viewport={{ once: true }}
                  >
                    <Parallax y={[30, -30]}>
                      <div className="p-1 bg-gradient-to-b from-white/10 to-transparent rounded-lg">
                        <img
                          src="/solar2.png"
                          alt="Our Team"
                          className="w-full h-full object-cover rounded-lg shadow-[0_20px_50px_rgba(0,0,0,0.5)] scale-x-[-1]"
                        />
                      </div>
                    </Parallax>
                  </motion.div>
                </div>
              </div>
            </section>

            {/* Services Section */}
            <section id="services" className="py-16" style={{ backgroundColor: theme.colors.contentBg }}>
              <div className="max-w-4xl mx-auto px-4">
                <motion.h2
                  className={`text-5xl ${theme.typography.heading} mb-8 tracking-wide text-white text-center`}
                  initial={{ opacity: 0, y: -50 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8 }}
                  viewport={{ once: true }}
                >
                  Our Services
                </motion.h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  {[
                    {
                      title: "Power Purchase Agreements (PPAs)",
                      desc: "We fully fund your solar installation, and you pay only for the electricity you use—at a lower rate than the grid, with no upfront costs."
                    },
                    {
                      title: "Asset-Backed Solar Loans",
                      desc: "Secure financing for your solar project with structured repayments aligned to your energy savings, giving you ownership without financial strain."
                    },
                    {
                      title: "Solar Leasing",
                      desc: "Use solar power with fixed monthly payments, reducing energy costs while maintaining financial flexibility with no capital investment required."
                    }
                  ].map((service, index) => (
                    <motion.div
                      key={service.title}
                      className={`p-6 shadow-[0_8px_30px_rgba(0,0,0,0.3)] ${theme.roundedness} mx-auto`}
                      style={{ backgroundColor: theme.colors.featureBg }}
                      initial={{ opacity: 0, y: 50 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.8, delay: index * 0.2 }}
                      viewport={{ once: true }}
                    >
                      <h3 className={`text-xl ${theme.typography.heading} mb-4 text-white`}>
                        {service.title}
                      </h3>
                      <p className="text-white/90">{service.desc}</p>
                    </motion.div>
                  ))}
                </div>
                <motion.p
                  className={`text-lg ${theme.typography.body} text-white/90 max-w-2xl mx-auto text-center mt-12`}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8 }}
                  viewport={{ once: true }}
                >
                  Not sure which option is right for you? Our team of experts will analyze your energy usage 
                  and property to recommend the perfect financing solution for your business.
                </motion.p>
              </div>
            </section>

            {/* Contact Section */}
            <section id="contact" className="py-16" style={{ backgroundColor: theme.colors.contentBg }}>
              <div className="max-w-4xl mx-auto px-4">
                <motion.h2
                  className={`text-5xl ${theme.typography.heading} mb-8 tracking-wide text-white text-center`}
                  initial={{ opacity: 0, y: -50 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8 }}
                  viewport={{ once: true }}
                >
                  Contact Us
                </motion.h2>
                <div className="grid md:grid-cols-2 gap-12">
                  <motion.div
                    className="max-w-md mx-auto"
                    initial={{ opacity: 0, x: -50 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.8 }}
                    viewport={{ once: true }}
                  >
                    <p className="text-lg text-white/90 mb-8">
                      Ready to discuss your solar project financing needs? Fill out the form or email us directly.
                    </p>
                    <a 
                      href="mailto:felix.walton03@gmail.com" 
                      className="inline-block px-8 py-3 bg-white text-gray-800 rounded-md hover:bg-white/90 transition-colors"
                    >
                      Email Us Directly
                    </a>
                  </motion.div>
                  <motion.div
                    className="max-w-md mx-auto bg-white/10 p-8 shadow-md rounded-md"
                    initial={{ opacity: 0, x: 50 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.8 }}
                    viewport={{ once: true }}
                  >
                    <form 
                      className="space-y-4"
                      onSubmit={(e) => {
                        e.preventDefault();
                        const formData = new FormData(e.target);
                        const subject = "Solar Financing Inquiry";
                        const body = `
                          Name: ${formData.get('name')}
                          Email: ${formData.get('email')}
                          Message: ${formData.get('message')}
                        `;
                        window.location.href = `mailto:felix.walton03@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
                      }}
                    >
                      <input
                        type="text"
                        name="name"
                        placeholder="Your Name"
                        className="w-full p-2 rounded bg-white/20 text-white placeholder-white/60"
                        required
                      />
                      <input
                        type="email"
                        name="email"
                        placeholder="Your Email"
                        className="w-full p-2 rounded bg-white/20 text-white placeholder-white/60"
                        required
                      />
                      <textarea
                        name="message"
                        placeholder="Tell us about your property and energy needs"
                        rows={4}
                        className="w-full p-2 rounded bg-white/20 text-white placeholder-white/60"
                        required
                      />
                      <button 
                        type="submit"
                        className="w-full px-6 py-3 bg-white text-gray-800 rounded-md hover:bg-white/90 transition-colors"
                      >
                        Send Message
                      </button>
                    </form>
                  </motion.div>
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>
    </ParallaxProvider>
  );
};

export default SolarLink;
