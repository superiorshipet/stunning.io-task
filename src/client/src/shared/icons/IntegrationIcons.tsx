import React from 'react';

interface IconProps extends React.SVGProps<SVGSVGElement> {
  className?: string;
  colored?: boolean;
}

export function StripeIcon({ className = 'w-4 h-4', colored = false, ...props }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} {...props}>
      {colored ? (
        <path
          d="M13.976 9.15c-2.172-.806-3.356-1.426-3.356-2.409 0-.831.683-1.305 1.901-1.305 2.227 0 4.515.858 6.09 1.631l.89-5.494C18.252.973 15.697.432 12.396.432 6.643.432 2.5 3.398 2.5 8.165c0 6.697 9.176 5.617 9.176 8.528 0 1.05-.968 1.487-2.316 1.487-2.61 0-5.494-1.205-7.368-2.348l-.946 5.62c1.928 1.05 5.093 1.716 8.441 1.716 6.012 0 10.457-2.82 10.457-7.79 0-7.214-9.336-5.836-9.336-8.528 0-.832.684-1.306 1.901-1.306 1.83 0 3.753.649 5.076 1.341l.946-5.835c-1.32-.587-3.076-1.077-4.87-1.077z"
          fill="#635BFF"
        />
      ) : (
        <path
          d="M13.976 9.15c-2.172-.806-3.356-1.426-3.356-2.409 0-.831.683-1.305 1.901-1.305 2.227 0 4.515.858 6.09 1.631l.89-5.494C18.252.973 15.697.432 12.396.432 6.643.432 2.5 3.398 2.5 8.165c0 6.697 9.176 5.617 9.176 8.528 0 1.05-.968 1.487-2.316 1.487-2.61 0-5.494-1.205-7.368-2.348l-.946 5.62c1.928 1.05 5.093 1.716 8.441 1.716 6.012 0 10.457-2.82 10.457-7.79 0-7.214-9.336-5.836-9.336-8.528 0-.832.684-1.306 1.901-1.306 1.83 0 3.753.649 5.076 1.341l.946-5.835c-1.32-.587-3.076-1.077-4.87-1.077z"
          fill="currentColor"
        />
      )}
    </svg>
  );
}

export function ShopifyIcon({ className = 'w-4 h-4', colored = false, ...props }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} {...props}>
      <path
        d="M20.215 6.015c-.11-.08-.255-.098-.382-.047-.127.05-.213.167-.23.303l-1.07 8.55-3.66-9.52c-.066-.17-.225-.285-.407-.291-.183-.008-.348.093-.427.26L11.53 10.5 9.19 3.42C9.11 3.17 8.87 3 8.6 3H5.5c-.32 0-.6.23-.65.54l-2.33 14.8c-.04.25.07.5.28.64l8.5 5.8c.2.14.46.14.66 0l8.5-5.8c.21-.14.32-.39.28-.64l-1.5-12.3c-.02-.14-.1-.26-.225-.325z"
        fill={colored ? "#96BF48" : "currentColor"}
      />
    </svg>
  );
}

export function GmailIcon({ className = 'w-4 h-4', colored = false, ...props }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} {...props}>
      {colored ? (
        <>
          <path d="M2.5 6.5L12 13.5L21.5 6.5V18.5C21.5 19.6 20.6 20.5 19.5 20.5H4.5C3.4 20.5 2.5 19.6 2.5 18.5V6.5Z" fill="#EA4335" />
          <path d="M21.5 5.5V6.5L12 13.5L2.5 6.5V5.5C2.5 4.4 3.4 3.5 4.5 3.5H19.5C20.6 3.5 21.5 4.4 21.5 5.5Z" fill="#C5221F" />
        </>
      ) : (
        <path
          d="M3 5C3 3.9 3.9 3 5 3H19C20.1 3 21 3.9 21 5V19C21 20.1 20.1 21 19 21H5C3.9 21 3 20.1 3 19V5ZM5 5V7.5L12 12L19 7.5V5H5ZM19 9.5L12 14L5 9.5V19H19V9.5Z"
          fill="currentColor"
        />
      )}
    </svg>
  );
}

export function SlackIcon({ className = 'w-4 h-4', colored = false, ...props }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} {...props}>
      {colored ? (
        <>
          <path d="M5.042 15.165a2.528 2.528 0 0 1-2.52 2.523A2.528 2.528 0 0 1 0 15.165a2.527 2.527 0 0 1 2.522-2.52h2.52v2.52zM6.313 15.165a2.527 2.527 0 0 1 2.521-2.52 2.527 2.527 0 0 1 2.521 2.52v6.313A2.528 2.528 0 0 1 8.834 24a2.528 2.528 0 0 1-2.521-2.522v-6.313z" fill="#E01E5A" />
          <path d="M8.834 5.042a2.528 2.528 0 0 1-2.521-2.52A2.528 2.528 0 0 1 8.834 0a2.528 2.528 0 0 1 2.521 2.522v2.52H8.834zM8.834 6.313a2.528 2.528 0 0 1 2.521 2.521 2.528 2.528 0 0 1-2.521 2.521H2.522A2.528 2.528 0 0 1 0 8.834a2.528 2.528 0 0 1 2.522-2.521h6.312z" fill="#36C5F0" />
          <path d="M18.956 8.834a2.528 2.528 0 0 1 2.522-2.521A2.528 2.528 0 0 1 24 8.834a2.528 2.528 0 0 1-2.522 2.521h-2.522V8.834zM17.688 8.834a2.528 2.528 0 0 1-2.523 2.521 2.527 2.527 0 0 1-2.52-2.521V2.522A2.527 2.527 0 0 1 15.165 0a2.528 2.528 0 0 1 2.523 2.522v6.312z" fill="#2EB67D" />
          <path d="M15.165 18.956a2.528 2.528 0 0 1 2.523 2.522A2.528 2.528 0 0 1 15.165 24a2.527 2.527 0 0 1-2.52-2.522v-2.522h2.52zM15.165 17.688a2.527 2.527 0 0 1-2.52-2.523 2.526 2.526 0 0 1 2.52-2.52h6.313A2.527 2.527 0 0 1 24 15.165a2.528 2.528 0 0 1-2.522 2.523h-6.313z" fill="#ECB22E" />
        </>
      ) : (
        <path
          d="M6 15a3 3 0 0 1-3 3 3 3 0 0 1-3-3 3 3 0 0 1 3-3h3v3zm2 0a3 3 0 0 1 3-3 3 3 0 0 1 3 3v6a3 3 0 0 1-3 3 3 3 0 0 1-3-3v-6zm3-9a3 3 0 0 1-3-3 3 3 0 0 1 3-3 3 3 0 0 1 3 3v3h-3zm0 2a3 3 0 0 1 3 3 3 3 0 0 1-3 3H5a3 3 0 0 1-3-3 3 3 0 0 1 3-3h6zm8 3a3 3 0 0 1 3-3 3 3 0 0 1 3 3 3 3 0 0 1-3 3h-3v-3zm-2 0a3 3 0 0 1-3 3 3 3 0 0 1-3-3V5a3 3 0 0 1 3-3 3 3 0 0 1 3 3v6zm-3 9a3 3 0 0 1 3 3 3 3 0 0 1-3 3 3 3 0 0 1-3-3v-3h3zm0-2a3 3 0 0 1-3-3 3 3 0 0 1 3-3h6a3 3 0 0 1 3 3 3 3 0 0 1-3 3h-6z"
          fill="currentColor"
        />
      )}
    </svg>
  );
}

export function GoogleSheetsIcon({ className = 'w-4 h-4', colored = false, ...props }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} {...props}>
      {colored ? (
        <>
          <path d="M14.5 2H6C4.9 2 4 2.9 4 4V20C4 21.1 4.9 22 6 22H18C19.1 22 20 21.1 20 20V7.5L14.5 2Z" fill="#0F9D58" />
          <path d="M14 2V8H20L14 2Z" fill="#87CEAB" />
          <path d="M8 12H16V14H8V12ZM8 15.5H16V17.5H8V15.5Z" fill="#FFFFFF" />
        </>
      ) : (
        <path
          d="M14 2H6C4.9 2 4 2.9 4 4V20C4 21.1 4.9 22 6 22H18C19.1 22 20 21.1 20 20V8L14 2ZM18 20H6V4H13V9H18V20ZM8 12H16V14H8V12ZM8 16H16V18H8V16Z"
          fill="currentColor"
        />
      )}
    </svg>
  );
}

export function getIntegrationIcon(id: string, colored = false, className = 'w-4 h-4') {
  switch (id.toLowerCase()) {
    case 'stripe':
      return <StripeIcon className={className} colored={colored} />;
    case 'shopify':
      return <ShopifyIcon className={className} colored={colored} />;
    case 'gmail':
      return <GmailIcon className={className} colored={colored} />;
    case 'slack':
      return <SlackIcon className={className} colored={colored} />;
    case 'google-sheets':
    case 'sheets':
      return <GoogleSheetsIcon className={className} colored={colored} />;
    default:
      return null;
  }
}
