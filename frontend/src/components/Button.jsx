import React from "react";

function Button({
  children,
  onClick,
  type = "button",
  variant = "primary",
  size = "medium",
  disabled = false,
  loading = false,
  fullWidth = false,
  icon = null,
}) {
  const className = [
    "custom-button",
    `button-${variant}`,
    `button-${size}`,
    fullWidth ? "button-full" : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <button
      type={type}
      className={className}
      onClick={onClick}
      disabled={disabled || loading}
    >
      {loading ? (
        <>
          <span className="button-spinner"></span>

          <span>
            {children || "Loading..."}
          </span>
        </>
      ) : (
        <>
          {icon && (
            <span className="button-icon">
              {icon}
            </span>
          )}

          <span>
            {children}
          </span>
        </>
      )}
    </button>
  );
}

export default Button;