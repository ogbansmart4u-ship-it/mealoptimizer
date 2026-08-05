import { useNavigate } from "react-router";
import { ArrowLeft, Home } from "lucide-react";
import { ReactNode } from "react";

type PageHeaderProps = {
  title?: string;
  showBack?: boolean;
  showHome?: boolean;
  onBack?: () => void;
  actions?: ReactNode;
  className?: string;
  titleClassName?: string;
};

export default function PageHeader({
  title,
  showBack = true,
  showHome = false,
  onBack,
  actions,
  className = "bg-[#1f7a8c]",
  titleClassName = "text-white",
}: PageHeaderProps) {
  const navigate = useNavigate();

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      navigate(-1);
    }
  };

  const handleHome = () => {
    navigate("/home");
  };

  return (
    <div className={`px-6 pt-12 pb-6 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          {showBack && (
            <button
              onClick={handleBack}
              className="p-2 hover:bg-white/10 rounded-full transition-colors"
              aria-label="Go back"
            >
              <ArrowLeft className="h-6 w-6 text-white" />
            </button>
          )}
          {showHome && (
            <button
              onClick={handleHome}
              className="p-2 hover:bg-white/10 rounded-full transition-colors"
              aria-label="Go to home"
            >
              <Home className="h-6 w-6 text-white" />
            </button>
          )}
        </div>

        {actions && <div className="flex items-center gap-2">{actions}</div>}
      </div>

      {title && (
        <h1 className={`text-3xl font-semibold ${titleClassName}`}>{title}</h1>
      )}
    </div>
  );
}
