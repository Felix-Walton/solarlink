import React from 'react';
import { motion } from 'framer-motion';
import { Parallax, ParallaxProvider } from 'react-scroll-parallax';

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

  return (
    <ParallaxProvider>
      <div className="overflow-y-scroll scroll-smooth" style={{ backgroundColor: theme.colors.pageBg }}>
        {/* Navigation */}
        <nav className={`shadow-md ${theme.roundedness}`} style={{ backgroundColor: theme.colors.menuBg }}>
          <div className={`flex justify-between items-center ${theme.spacing.menuPadding}`}>
            <div className={`text-white ${theme.typography.heading} text-2xl`}>SOLARLINK</div>
            <div className={`flex ${theme.spacing.gap}`}>
              {['home', 'about', 'services', 'contact'].map(page => (
                <button
                  key={page}
                  onClick={() => scrollToSection(page)}
                  className="text-white hover:opacity-80 text-2xl font-medium capitalize"
                >
                  {page}
                </button>
              ))}
            </div>
            <div className="text-white text-2xl font-medium capitalize">Client Portal</div>
          </div>
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
              Powering Solar Innovation<br />Through Private Credit
            </h1>
            <p className={`text-lg ${theme.typography.body} mb-12 text-white/90 max-w-2xl`}>
              Transform your commercial property into a sustainable asset. We provide tailored financing solutions for solar rooftop installations,
              helping businesses across the UK overcome high energy costs while contributing to a net‑zero future.
            </p>
            <p className={`text-lg ${theme.typography.body} text-white/90 max-w-2xl`}>
              We are a new startup looking to expand rapidly, eager to finance, research and execute commercial rooftop solar installations on your businesses.
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
                  className={`p-8 shadow-md ${theme.roundedness}`}
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
                className="w-full h-full object-cover rounded-lg shadow-lg"
              />
            </Parallax>
          </motion.div>
        </div>
      </section>

        {/* About Section */}
        <section id="about" className="py-16" style={{ backgroundColor: theme.colors.contentBg }}>
          <div className="max-w-3xl mx-auto px-4">
            <motion.h2
              className={`text-3xl ${theme.typography.heading} mb-8 tracking-wide text-white text-center`}
              initial={{ opacity: 0, y: -50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              About SolarLink
            </motion.h2>
            <div className="grid md:grid-cols-2 gap-12">
              <motion.div
                className="max-w-md mx-auto"
                initial={{ opacity: 0, x: -50 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8 }}
                viewport={{ once: true }}
              >
                <p className={`text-lg ${theme.typography.body} mb-6 text-white/90`}>
                  We are pioneers in private credit financing for commercial solar rooftop projects, dedicated to unlocking the UK’s vast underutilized roof space.
                </p>
                <p className={`text-lg ${theme.typography.body} text-white/90`}>
                  Driven by a vision for a greener future, our team leverages expertise to offer flexible, risk‑mitigated financing solutions for solar rooftop installations.
                </p>
              </motion.div>
              <motion.div
                className={theme.roundedness + " overflow-hidden"}
                initial={{ opacity: 0, x: 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8 }}
                viewport={{ once: true }}
              >
                <Parallax y={[30, -30]}>
                  <img
                    src="/solar2.png"
                    alt="Our Team"
                    className="w-full h-full object-cover"
                  />
                </Parallax>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Services Section */}
        <section id="services" className="py-16" style={{ backgroundColor: theme.colors.contentBg }}>
          <div className="max-w-4xl mx-auto px-4">
            <motion.h2
              className={`text-3xl ${theme.typography.heading} mb-8 tracking-wide text-white text-center`}
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
                  title: "Project Finance",
                  desc: "Structured financing solutions for large-scale solar installations."
                },
                {
                  title: "Bridge Loans",
                  desc: "Short-term financing to bridge project development phases."
                },
                {
                  title: "Equipment Finance",
                  desc: "Specialized lending for solar equipment and infrastructure."
                }
              ].map((service, index) => (
                <motion.div
                  key={service.title}
                  className={`p-6 shadow-md ${theme.roundedness} mx-auto`}
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
          </div>
        </section>

        {/* Contact Section */}
        <section id="contact" className="py-16" style={{ backgroundColor: theme.colors.contentBg }}>
          <div className="max-w-4xl mx-auto px-4">
            <motion.h2
              className={`text-3xl ${theme.typography.heading} mb-8 tracking-wide text-white text-center`}
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
                  Ready to discuss your solar project financing needs? Our team of experts is here to help.
                </p>
                <div className="space-y-4">
                  <div className="text-white">
                    <div className="font-medium mb-1">Main Office</div>
                    <div className="font-light">123 Solar Street, Suite 100</div>
                    <div className="font-light">New York, NY 10001</div>
                  </div>
                  <div className="text-white">
                    <div className="font-medium mb-1">Contact</div>
                    <div className="font-light">info@solarlink.com</div>
                    <div className="font-light">(555) 123-4567</div>
                  </div>
                </div>
              </motion.div>
              <motion.div
                className="max-w-md mx-auto bg-white/10 p-8 shadow-md"
                initial={{ opacity: 0, x: 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8 }}
                viewport={{ once: true }}
              >
                <form className="space-y-4">
                  <input
                    type="text"
                    placeholder="Name"
                    className="w-full p-2 rounded bg-white/20 text-white placeholder-white/60"
                  />
                  <input
                    type="email"
                    placeholder="Email"
                    className="w-full p-2 rounded bg-white/20 text-white placeholder-white/60"
                  />
                  <textarea
                    placeholder="Message"
                    rows={4}
                    className="w-full p-2 rounded bg-white/20 text-white placeholder-white/60"
                  />
                  <button className="w-full px-6 py-2 bg-white text-gray-800 rounded">
                    Send Message
                  </button>
                </form>
              </motion.div>
            </div>
          </div>
        </section>
      </div>
    </ParallaxProvider>
  );
};

export default SolarLink;
