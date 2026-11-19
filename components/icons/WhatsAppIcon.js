/**
 * WhatsApp brand icon. Used in Footer and floating action button.
 * @param {{ size?: number }} props
 */
export default function WhatsAppIcon({ size = 20 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
      focusable="false"
    >
      <path d="M20.5 3.5A11 11 0 0 0 3.2 17.2L2 22l4.9-1.3A11 11 0 1 0 20.5 3.5Zm-8.4 17a9 9 0 0 1-4.6-1.3l-.3-.2-2.9.8.8-2.8-.2-.3a9 9 0 1 1 7.2 3.8Zm5-6.7c-.3-.1-1.6-.8-1.9-.9s-.4-.1-.6.1l-.8 1c-.1.2-.3.2-.6.1a7.3 7.3 0 0 1-3.6-3.1c-.3-.4.3-.4.8-1.4.1-.2 0-.3 0-.5l-.9-2c-.2-.5-.4-.4-.6-.4h-.5a1 1 0 0 0-.7.3 3 3 0 0 0-.9 2.2c0 1.3.9 2.5 1 2.7s1.8 2.8 4.4 3.9c1.6.7 2.3.8 3.1.7.5-.1 1.6-.7 1.8-1.3.2-.6.2-1.1.2-1.3s-.2-.2-.5-.3Z" />
    </svg>
  );
}
