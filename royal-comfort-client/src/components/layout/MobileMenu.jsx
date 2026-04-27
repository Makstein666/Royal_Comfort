import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { CloseIcon } from '../ui/Icons';

const MobileMenu = ({ isOpen, onClose, navLinks }) => {
  const location = useLocation();

  const menuVariants = {
    closed: {
      opacity: 0,
      height: 0,
      transition: { duration: 0.3, ease: "easeInOut" }
    },
    open: {
      opacity: 1,
      height: "100vh", // На весь экран
      transition: { duration: 0.4, ease: "easeInOut" }
    }
  };

  const itemVariants = {
    closed: { x: -20, opacity: 0 },
    open: (i) => ({
      x: 0,
      opacity: 1,
      transition: { delay: i * 0.1, duration: 0.3 }
    })
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial="closed"
          animate="open"
          exit="closed"
          variants={menuVariants}
          className="fixed inset-0 top-0 left-0 z-40 bg-background flex flex-col pt-24 px-6 md:hidden overflow-hidden"
        >
          {/* Кнопка закрытия дублируется здесь для удобства, если хедер скрыт */}
          <button onClick={onClose} className="absolute top-6 right-6 p-2 text-text">
             <CloseIcon className="w-8 h-8" />
          </button>

          <nav className="flex flex-col space-y-6">
            {navLinks.map((link, i) => {
              const isActive = location.pathname === link.path;
              return (
                <motion.div key={link.path} custom={i} variants={itemVariants}>
                  <Link
                    to={link.path}
                    onClick={onClose}
                    className={`text-3xl font-medium block ${
                      isActive ? 'text-accent' : 'text-text'
                    }`}
                  >
                    {link.label}
                  </Link>
                </motion.div>
              );
            })}
          </nav>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default MobileMenu;