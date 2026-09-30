import type { HTMLAttributes, ReactNode } from "react";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  title?: string;
  description?: string;
}

const Card = ({
  children,
  title,
  description,
  className = "",
  ...props
}: CardProps) => {
  return (
    <div
      className={`rounded-xl border border-gray-200 bg-white shadow-sm ${className}`}
      {...props}
    >
      {(title || description) && (
        <div className="border-b border-gray-100 px-5 py-4">
          {title && (
            <h2 className="text-base font-semibold text-gray-900">
              {title}
            </h2>
          )}

          {description && (
            <p className="mt-1 text-sm text-gray-500">
              {description}
            </p>
          )}
        </div>
      )}

      <div className="p-5">
        {children}
      </div>
    </div>
  );
};

export default Card;