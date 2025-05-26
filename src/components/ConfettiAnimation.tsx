
interface ConfettiAnimationProps {
  isVisible: boolean;
}

export const ConfettiAnimation = ({ isVisible }: ConfettiAnimationProps) => {
  if (!isVisible) return null;

  const createConfetti = () => {
    const colors = ['#FDE047', '#84CC16', '#10B981', '#06B6D4', '#8B5CF6', '#F59E0B', '#EF4444'];
    const confettiElements = [];
    
    for (let i = 0; i < 50; i++) {
      const delay = Math.random() * 0.3;
      const duration = 1.5 + Math.random() * 1;
      const xMovement = (Math.random() - 0.5) * 300;
      const yMovement = -200 - Math.random() * 100;
      
      confettiElements.push(
        <div
          key={i}
          className="absolute w-3 h-3 rounded-full opacity-0"
          style={{
            backgroundColor: colors[Math.floor(Math.random() * colors.length)],
            left: `${45 + Math.random() * 10}%`,
            top: `${40 + Math.random() * 20}%`,
            animation: `confetti-fall ${duration}s ease-out ${delay}s forwards`,
            transform: `translate(${xMovement}px, ${yMovement}px) rotate(${Math.random() * 360}deg)`
          }}
        />
      );
    }
    return confettiElements;
  };

  return (
    <>
      <style>{`
        @keyframes confetti-fall {
          0% {
            opacity: 1;
            transform: translate(0, 0) rotate(0deg);
          }
          100% {
            opacity: 0;
            transform: translate(var(--x-movement, 0), var(--y-movement, 200px)) rotate(720deg);
          }
        }
      `}</style>
      
      <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
        {createConfetti()}
      </div>
    </>
  );
};
