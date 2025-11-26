import React, { PropsWithChildren } from "react";
import "./neon.css";

type NeonGlassCardProps = PropsWithChildren<{
  title?: React.ReactNode;     // <— era string; agora aceita JSX
  right?: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
}>;

const NeonGlassCard: React.FC<NeonGlassCardProps> = ({
  title,
  right,
  footer,
  className,
  children,
}) => {
  return (
    <div className={`glass-card ${className ?? ""}`}>
      {(title || right) && (
        <div className="glass-header">
          {title && <h3 className="glass-title">{title}</h3>}
          {right && <div className="glass-right">{right}</div>}
        </div>
      )}
      <div className="glass-body">{children}</div>
      {footer && <div className="glass-footer">{footer}</div>}
    </div>
  );
};

export default NeonGlassCard;
