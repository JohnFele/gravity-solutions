// eslint-disable-next-line no-unused-vars
import { motion } from 'framer-motion'
import logo from '../../assets/img/U.png';

export const AuthFormWrapper = ({ children, title, subtitle }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-accent1 to-accent2 flex items-center justify-center p-4">
      {/* Background floating elements */}
      <motion.div 
        className="absolute top-1/4 left-1/4 w-16 h-16 rounded-full bg-primary/20 blur-xl"
        animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div 
        className="absolute bottom-1/3 right-1/4 w-24 h-24 rounded-full bg-primary/15 blur-xl"
        animate={{ scale: [1, 1.3, 1], opacity: [0.2, 0.4, 0.2] }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
      />
      
      {/* Main card */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="relative bg-white/10 backdrop-blur-lg rounded-2xl shadow-2xl overflow-hidden w-full max-w-md"
      >
        {/* Decorative elements */}
        <div className="absolute -top-20 -right-20 w-40 h-40 bg-primary/20 rounded-full blur-2xl"></div>
        <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-primary/15 rounded-full blur-2xl"></div>
        
        {/* Header section */}
        <div className="p-8 pb-0">
          <div className="flex justify-center mb-2">
            {/* <motion.div
              animate={{ rotateY: 360 }}
              transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
              className="text-5xl text-primary"
            > */}
              <div className="w-30 flex items-center justify-center">
                <img src={logo} alt="Logo" className="w-full" />
                {/* <span className="text-white font-bold text-xl">360</span> */}
              </div>
            {/* </motion.div> */}
          </div>
          <h1 className="text-3xl font-bold text-center text-white mb-2">{title}</h1>
          <p className="text-center text-sm text-white/80 mb-8">{subtitle}</p>
        </div>
        
        {children}
      </motion.div>
    </div>
  )
}