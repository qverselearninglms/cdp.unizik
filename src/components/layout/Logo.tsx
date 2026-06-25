import { SITE_TITLE } from "@/config";
import Image from "next/image";
import Link from "next/link";
import React from "react";

interface LogoProps {
  showText?: boolean;
  size?: "sm" | "md" | "lg";
}

export const Logo: React.FC<LogoProps> = ({
  showText = true,
  size = "md",
}) => {
  const sizes = {
    sm: "w-7 h-7",
    md: "w-9 h-9",
    lg: "w-12 h-12",
  };

  const textSizes = {
    sm: "text-sm",
    md: "text-base",
    lg: "text-lg",
  };

  return (
    <Link
      href="/"
      className="flex items-center gap-2 sm:gap-3 no-underline"
    >
      {/* LOGO BOX */}
      <div
        className={`
          relative flex-shrink-0
          ${sizes[size]}
          rounded-md overflow-hidden
          bg-gradient-to-br from-blue-800 to-blue-600
        `}
      >
        <Image
          src="/logo/logo.jpg"
          alt="Logo"
          fill
          priority
          className="object-cover"
        />
      </div>

      {/* TEXT */}
      {showText && (
        <span
          className={`
            font-bold text-gray-900 dark:text-white
            leading-none
            ${textSizes[size]}
            max-sm:text-sm
          `}
        >
          {SITE_TITLE}
        </span>
      )}
    </Link>
  );
};