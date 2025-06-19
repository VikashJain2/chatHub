import { useState, useEffect } from 'react';
import './App.css';
import AOS from 'aos';
import 'aos/dist/aos.css';

function App() {
  const [isLoggedIn] = useState(false); // Simulated auth state

  useEffect(() => {
    AOS.init({
      duration: 1000,
      once: true,
    });
  }, []);

  const handleGetStarted = () => {
    if (isLoggedIn) {
      window.location.href = '/chat';
    } else {
      window.location.href = '/login';
    }
  };

  const handleProfileClick = () => {
    if (!isLoggedIn) {
      window.location.href = '/login';
    }
  };

  return (
    <div className="app">
      {/* Header */}
      <header className="header">
        <div className="logo-container">
          <span className="logo">ChatSphere</span>
        </div>
        <div className="profile-icon" onClick={handleProfileClick}>
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 12a5 5 0 1 0 0-10 5 5 0 0 0 0 10Zm0 2c-5.33 0-16 2.67-16 8v2h32v-2c0-5.33-10.67-8-16-8Z" />
          </svg>
        </div>
      </header>

      {/* Hero Section */}
      <main className="hero">
        <div className="content" data-aos="fade-right">
          <h1>
            <span className="gradient-text">Connect</span> in Real-Time
          </h1>
          <p className="subtitle">
            Experience seamless messaging with end-to-end encryption and 
            lightning-fast delivery. Stay connected wherever you are.
          </p>
          
          <button className="cta-button" onClick={handleGetStarted}>
            Get Started
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
              <path d="m14.523 18.787 4.8-4.8-4.8-4.8-1.057 1.057 3.093 3.093H3.333v1.5h13.226l-3.093 3.093 1.057 1.057Z"/>
            </svg>
          </button>
          
          <div className="stats-container">
            <div className="stat">
              <div className="stat-value">10M+</div>
              <div className="stat-label">Active Users</div>
            </div>
            <div className="stat">
              <div className="stat-value">99.9%</div>
              <div className="stat-label">Uptime</div>
            </div>
            <div className="stat">
              <div className="stat-value">256-bit</div>
              <div className="stat-label">Encryption</div>
            </div>
          </div>
        </div>
        
        <div className="mockup" data-aos="fade-left" data-aos-delay="200">
          <div className="message left">
            <div className="avatar">
              <img src="https://i.pravatar.cc/40?img=5" alt="User" />
            </div>
            <div className="bubble">
              <div className="message-header">
                <span className="sender">Alex Johnson</span>
                <span className="time">2:45 PM</span>
              </div>
              <div className="message-content">Hey team, how's the project going?</div>
            </div>
          </div>
          
          <div className="message right">
            <div className="bubble">
              <div className="message-header">
                <span className="sender">You</span>
                <span className="time">2:47 PM</span>
              </div>
              <div className="message-content">Almost done! Will share the files tomorrow 👍</div>
            </div>
          </div>
          
          <div className="message left">
            <div className="avatar">
              <img src="https://i.pravatar.cc/40?img=11" alt="User" />
            </div>
            <div className="bubble">
              <div className="message-header">
                <span className="sender">Sarah Williams</span>
                <span className="time">2:48 PM</span>
              </div>
              <div className="message-content">Perfect! Let's meet at 10 AM tomorrow</div>
            </div>
          </div>
          
          <div className="typing-indicator">
            <span></span>
            <span></span>
            <span></span>
          </div>
        </div>
      </main>

      {/* Features Section */}
      <section className="features">
        <h2 className="section-title" data-aos="fade-up">Why Choose ChatSphere</h2>
        <p className="section-subtitle" data-aos="fade-up" data-aos-delay="100">
          Modern messaging for the modern world
        </p>
        
        <div className="features-grid">
          <div className="feature-card" data-aos="fade-up" data-aos-delay="200">
            <div className="icon">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                <path d="M15 12c0 1.657-1.343 3-3 3s-3-1.343-3-3 1.343-3 3-3 3 1.343 3 3Zm4-11v2h-18v-2h18Zm-18 22h18v-2h-18v2Zm0-6h18v-2h-18v2Zm0-6h18v-2h-18v2Z"/>
              </svg>
            </div>
            <h3>End-to-End Encryption</h3>
            <p>Military-grade encryption ensures your conversations stay private and secure</p>
          </div>
          
          <div className="feature-card" data-aos="fade-up" data-aos-delay="300">
            <div className="icon">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                <path d="m20.556 3.444-1.427 1.427c2.511 2.511 2.511 6.586 0 9.097l1.427 1.427c3.511-3.511 3.511-9.21 0-12.721Zm-4.945.283 1.426 1.426c1.511 1.511 1.511 3.96 0 5.471l-1.426 1.426c2.511-2.511 2.511-6.586 0-9.097Zm-12.306 8.72c-1.511-1.511-1.511-3.96 0-5.471l-1.426-1.426c-2.511 2.511-2.511 6.586 0 9.097l1.426-1.426Zm4.945 8.553c-2.511-2.511-2.511-6.586 0-9.097l-1.427-1.427c-3.511 3.511-3.511 9.21 0 12.721l1.427-1.427Z"/>
              </svg>
            </div>
            <h3>Lightning Fast</h3>
            <p>Real-time messaging with no delays, powered by WebSockets</p>
          </div>
          
          <div className="feature-card" data-aos="fade-up" data-aos-delay="400">
            <div className="icon">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                <path d="m12 2 9.3 3.32-1.418 12.31L12 22l-7.882-4.37L2.7 5.32 12 2Zm0 2.21L6.186 17.26h2.168l1.169-2.92h4.935l1.17 2.92h2.167L12 4.21Zm1.698 8.33h-3.396l1.7-4.24 1.696 4.24Z"/>
              </svg>
            </div>
            <h3>Cross-Platform</h3>
            <p>Access your messages from any device, anywhere in the world</p>
          </div>
          
          <div className="feature-card" data-aos="fade-up" data-aos-delay="500">
            <div className="icon">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2c5.523 0 10 4.477 10 10s-4.477 10-10 10S2 17.523 2 12 6.477 2 12 2Zm0 2a8 8 0 1 0 0 16 8 8 0 0 0 0-16Zm0 3a5 5 0 1 1 0 10 5 5 0 0 1 0-10Z"/>
              </svg>
            </div>
            <h3>Unlimited Storage</h3>
            <p>Never worry about deleting messages with our unlimited storage</p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <div className="cta-content">
          <h2 data-aos="fade-up">Ready to get started?</h2>
          <p data-aos="fade-up" data-aos-delay="100">
            Join millions of users communicating securely with ChatSphere
          </p>
          <button 
            className="cta-button large" 
            onClick={handleGetStarted}
            data-aos="fade-up" 
            data-aos-delay="200"
          >
            Get Started Now
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="footer-content">
          <div className="footer-logo">
            <span className="logo">ChatSphere</span>
            <p>Secure. Fast. Modern.</p>
          </div>
          
          <div className="footer-links">
            <div className="link-group">
              <h4>Product</h4>
              <a href="#">Features</a>
              <a href="#">Pricing</a>
              <a href="#">Download</a>
            </div>
            
            <div className="link-group">
              <h4>Resources</h4>
              <a href="#">Blog</a>
              <a href="#">Support</a>
              <a href="#">Developers</a>
            </div>
            
            <div className="link-group">
              <h4>Company</h4>
              <a href="#">About</a>
              <a href="#">Careers</a>
              <a href="#">Contact</a>
            </div>
          </div>
        </div>
        
        <div className="footer-bottom">
          <p>© 2023 ChatSphere. All rights reserved.</p>
          <div className="social-links">
            <a href="#">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                <path d="M22.675 0H1.325C.593 0 0 .593 0 1.325v21.351C0 23.407.593 24 1.325 24H12.82v-9.294H9.692v-3.622h3.128V8.413c0-3.1 1.893-4.788 4.659-4.788 1.325 0 2.463.099 2.795.143v3.24l-1.918.001c-1.504 0-1.795.715-1.795 1.763v2.313h3.587l-.467 3.622h-3.12V24h6.116c.73 0 1.323-.593 1.323-1.325V1.325C24 .593 23.407 0 22.675 0z"/>
              </svg>
            </a>
            <a href="#">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                <path d="M23.954 4.569c-.885.389-1.83.654-2.825.775 1.014-.611 1.794-1.574 2.163-2.723-.951.555-2.005.959-3.127 1.184-.896-.959-2.173-1.559-3.591-1.559-2.717 0-4.92 2.203-4.92 4.917 0 .39.045.765.127 1.124C7.691 8.094 4.066 6.13 1.64 3.161c-.427.722-.666 1.561-.666 2.475 0 1.71.87 3.213 2.188 4.096-.807-.026-1.566-.248-2.228-.616v.061c0 2.385 1.693 4.374 3.946 4.827-.413.111-.849.171-1.296.171-.314 0-.615-.03-.916-.086.631 1.953 2.445 3.377 4.604 3.417-1.68 1.319-3.809 2.105-6.102 2.105-.39 0-.779-.023-1.17-.067 2.189 1.394 4.768 2.209 7.557 2.209 9.054 0 14-7.503 14-13.999 0-.21 0-.42-.015-.63.961-.689 1.8-1.56 2.46-2.548l-.047-.02z"/>
              </svg>
            </a>
            <a href="#">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z"/>
              </svg>
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;