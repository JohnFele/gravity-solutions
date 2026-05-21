import { useEffect, useState } from 'react';
// eslint-disable-next-line no-unused-vars
import { motion } from 'framer-motion';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  AiOutlineMenu,
  AiOutlineClose,
  AiOutlineCheckCircle,
  AiOutlineFilePdf,
  AiOutlineHome,
} from 'react-icons/ai';
import { FiMail } from 'react-icons/fi';

import Sidebar from '../components/dashboard/sidebar/Sidebar';
import Header from '../components/dashboard/header/Header';
import { useAuth } from '../context/AuthContext';
import { useQuotation } from '../context/QuotationContext';
import { downloadQuotePdf } from '../api/quotation';
import { useAlert } from '../context/AlertContext';

const QuoteThankYou = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { profileData: user } = useAuth();
  const { resetQuote } = useQuotation();
  const { showAlert } = useAlert();

  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isDownloading, setIsDownloading] = useState(false);

  const { quoteRef, customerEmail } = location.state || {
    quoteRef: `Q-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
    customerEmail: 'your email',
  };

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (mobile) {
        setSidebarCollapsed(true);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleBuildAnotherQuote = () => {
    resetQuote();
    const nextPath = String(user?.role || '') === 'Admin' ? '/admin/quote/builder' : '/user/quote/builder';
    navigate(nextPath, { replace: true });
  };

  const handleDownloadQuote = async () => {
    if (!quoteRef) {
      showAlert('Quote reference is missing. Reload the page and try again.', {
        type: 'warning',
        duration: 4500,
      });
      return;
    }

    setIsDownloading(true);
    try {
      const response = await downloadQuotePdf(quoteRef);
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const downloadUrl = window.URL.createObjectURL(blob);
      const anchor = document.createElement('a');
      anchor.href = downloadUrl;
      anchor.download = `${quoteRef}.pdf`;
      document.body.appendChild(anchor);
      anchor.click();
      document.body.removeChild(anchor);
      window.URL.revokeObjectURL(downloadUrl);
    } catch (error) {
      showAlert(error?.message || 'Failed to download quote PDF.', {
        type: 'error',
        duration: 5000,
      });
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {isMobile && (
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="fixed top-2 right-4 z-50 md:hidden bg-slate-800/95 backdrop-blur-xl border border-slate-700/50 p-3 rounded-xl text-white shadow-lg"
        >
          {mobileMenuOpen ? <AiOutlineClose size={20} /> : <AiOutlineMenu size={20} />}
        </motion.button>
      )}

      <Sidebar
        isMobile={isMobile}
        mobileMenuOpen={mobileMenuOpen}
        setMobileMenuOpen={setMobileMenuOpen}
        sidebarCollapsed={sidebarCollapsed}
        setSidebarCollapsed={setSidebarCollapsed}
        userRole={user?.role}
      />

      <div className={`transition-all duration-300 ${isMobile ? 'ml-0' : sidebarCollapsed ? 'ml-16' : 'ml-60'}`}>
        <Header searchQuery={searchQuery} setSearchQuery={setSearchQuery} searchPlaceholder="Search" />

        <div className="p-4 md:p-6 min-h-[calc(100vh-80px)] flex items-center justify-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="max-w-2xl w-full"
          >
            <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-8 md:p-12 text-center">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
                className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-r from-emerald-500 to-teal-600 flex items-center justify-center"
              >
                <AiOutlineCheckCircle className="w-12 h-12 text-white" />
              </motion.div>

              <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">Thank You!</h1>
              <p className="text-lg text-slate-300 mb-6">Your quotation request has been sent successfully.</p>

              <div className="bg-slate-700/30 rounded-xl p-6 mb-8">
                <p className="text-sm text-slate-400 mb-2">Quote Reference</p>
                <p className="text-2xl font-mono font-bold text-emerald-400 mb-4">{quoteRef}</p>

                <div className="flex items-center justify-center space-x-2 text-slate-300">
                  <FiMail className="text-emerald-400" />
                  <p className="text-sm">
                    A copy has been sent to <span className="text-white font-medium">{customerEmail}</span>
                  </p>
                </div>
              </div>

              <div className="text-left mb-8">
                <h3 className="text-lg font-bold text-white mb-4">What happens next?</h3>
                <div className="space-y-4">
                  <div className="flex items-start">
                    <div className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-sm mr-3 mt-0.5">
                      1
                    </div>
                    <p className="text-slate-300">
                      <span className="text-white font-medium">Check your inbox</span> for your quotation copy.
                    </p>
                  </div>
                  <div className="flex items-start">
                    <div className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-sm mr-3 mt-0.5">
                      2
                    </div>
                    <p className="text-slate-300">
                      <span className="text-white font-medium">Review period</span> - our team will contact you within 24 hours.
                    </p>
                  </div>
                  <div className="flex items-start">
                    <div className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-sm mr-3 mt-0.5">
                      3
                    </div>
                    <p className="text-slate-300">
                      <span className="text-white font-medium">Follow-up call</span> to finalize your deployment options.
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  type="button"
                  onClick={handleBuildAnotherQuote}
                  className="flex-1 bg-slate-700/50 hover:bg-slate-700/70 text-white px-6 py-3 rounded-xl font-medium transition-colors flex items-center justify-center"
                >
                  <AiOutlineHome className="mr-2" />
                  Build Another Quote
                </button>
                <button
                  type="button"
                  onClick={handleDownloadQuote}
                  disabled={isDownloading}
                  className="flex-1 bg-gradient-to-r from-emerald-500 to-teal-600 text-white px-6 py-3 rounded-xl font-medium hover:from-emerald-600 hover:to-teal-700 transition-all flex items-center justify-center disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <AiOutlineFilePdf className="mr-2" />
                  {isDownloading ? 'Downloading PDF...' : 'Download Quote'}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default QuoteThankYou;

