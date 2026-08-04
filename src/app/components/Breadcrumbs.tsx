import { ChevronRight, Home } from "lucide-react";
import { Link } from "react-router";

type BreadcrumbItem = {
  label: string;
  path?: string;
};

type BreadcrumbsProps = {
  items: BreadcrumbItem[];
  className?: string;
};

export default function Breadcrumbs({ items, className = "" }: BreadcrumbsProps) {
  return (
    <nav className={`flex items-center gap-2 text-sm ${className}`} aria-label="Breadcrumb">
      <Link to="/home" className="flex items-center gap-1 text-gray-500 hover:text-gray-700 transition-colors">
        <Home className="h-4 w-4" />
      </Link>
      {items.map((item, index) => {
        const isLast = index === items.length - 1;
        return (
          <div key={index} className="flex items-center gap-2">
            <ChevronRight className="h-4 w-4 text-gray-400" />
            {item.path && !isLast ? (
              <Link
                to={item.path}
                className="text-gray-500 hover:text-gray-700 transition-colors truncate max-w-[120px]"
              >
                {item.label}
              </Link>
            ) : (
              <span className="text-gray-800 font-medium truncate max-w-[120px]">
                {item.label}
              </span>
            )}
          </div>
        );
      })}
    </nav>
  );
}
