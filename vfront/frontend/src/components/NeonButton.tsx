import React from 'react';

type Props = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  children: React.ReactNode;
};

const NeonButton: React.FC<Props> = ({ children, ...rest }) => {
  return (
    <button className="neon-btn" {...rest}>
      <span className="neon-text">{children}</span>
    </button>
  );
};

export default NeonButton;
