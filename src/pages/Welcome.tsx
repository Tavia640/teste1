import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
const gavLogo = 'https://cdn.builder.io/api/v1/image/assets%2Fc8c896b761d24232b80a27a492248c56%2F39e6e168fc74423b8d3b78807d7eef5f?format=webp&width=800';

const Welcome = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Navegar para a próxima página após 6 segundos
    const timerNavigate = setTimeout(() => {
      navigate('/cadastro-cliente');
    }, 6000);

    return () => {
      clearTimeout(timerNavigate);
    };
  }, [navigate]);

  return (
    <div 
      className="fixed top-0 left-0 w-full h-full flex flex-col items-center justify-center text-white z-50 animate-fade-out"
      style={{
        background: 'linear-gradient(135deg, #0d1b2a, #1b263b, #415a77, #0d1b2a)',
        backgroundSize: '400% 400%',
        animation: 'gradient-bg 8s ease infinite, fade-out 1s ease-in-out 5s forwards'
      }}
    >
      <img 
        src={gavLogo} 
        alt="Logo GAV Resorts" 
        className="w-32 h-32 animate-pulse-logo"
        style={{ 
          filter: 'drop-shadow(0 0 15px rgba(255, 255, 255, 0.3))',
          transition: 'all 0.3s ease'
        }}
      />
      
      <h1 
        className="mt-6 text-3xl font-light opacity-0 animate-fade-in-up tracking-wide"
        style={{ letterSpacing: '1px' }}
      >
        Parabéns, <span className="font-semibold text-[#58e1c1]" style={{ textShadow: '0 0 10px rgba(88, 225, 193, 0.6)' }}>300 do Sul!</span>
      </h1>
    </div>
  );
};

export default Welcome;
