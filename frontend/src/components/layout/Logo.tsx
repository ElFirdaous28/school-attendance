interface LogoProps {
  isExpanded?: boolean;
  size?: string;
  className?: string; // add this
}

const Logo = ({ isExpanded = true, size = 'text-sm md:text-xl', className = '' }: LogoProps) => {
  return (
    <div
      className={`
        ${size}
        font-bold
        whitespace-nowrap
        tracking-wider
        transition-all
        duration-200
        ${isExpanded ? 'opacity-100' : 'opacity-0 w-0 overflow-hidden'}
        ${className}
      `}
    >
      EdTech
    </div>
  );
};

export default Logo;