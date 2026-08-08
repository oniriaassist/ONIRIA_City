import { buildWhatsAppLink } from "../data/contactDetails";

export default function WhatsAppButton() {
  const whatsappLink = buildWhatsAppLink(
    "Hello ONIRIA City, I would like to receive more information."
  );

  return (
    <a
      href={whatsappLink}
      target="_blank"
      rel="noopener noreferrer"
      className="oniriaWhatsappFabV2"
      aria-label="Chat with ONIRIA City on WhatsApp"
      title="Chat with us on WhatsApp"
    >
      <svg
        className="oniriaWhatsappFabV2Icon"
        viewBox="0 0 32 32"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <path
          fill="currentColor"
          d="M16.04 3C8.86 3 3.02 8.78 3.02 15.9c0 2.28.6 4.5 1.74 6.45L3 29l6.84-1.79a13.1 13.1 0 0 0 6.2 1.58h.01C23.22 28.79 29 23 29 15.9 29 8.78 23.22 3 16.04 3Zm0 23.61a10.9 10.9 0 0 1-5.56-1.52l-.4-.24-4.06 1.06 1.08-3.94-.26-.4a10.62 10.62 0 0 1-1.65-5.67c0-5.92 4.86-10.74 10.85-10.74 5.98 0 10.84 4.82 10.84 10.74 0 5.91-4.86 10.71-10.84 10.71Zm5.95-8.04c-.33-.16-1.94-.95-2.24-1.06-.3-.11-.52-.16-.74.16-.22.33-.85 1.06-1.04 1.28-.19.22-.38.25-.71.08-.33-.16-1.38-.5-2.63-1.61a9.8 9.8 0 0 1-1.82-2.25c-.19-.33-.02-.51.14-.67.15-.15.33-.38.49-.57.16-.19.22-.33.33-.55.11-.22.05-.41-.03-.57-.08-.16-.74-1.77-1.01-2.42-.27-.64-.54-.55-.74-.56h-.63c-.22 0-.57.08-.87.41-.3.33-1.14 1.11-1.14 2.71s1.17 3.14 1.33 3.36c.16.22 2.31 3.5 5.59 4.91.78.34 1.39.54 1.87.69.78.25 1.49.21 2.05.13.63-.09 1.94-.79 2.21-1.55.27-.76.27-1.41.19-1.55-.08-.13-.3-.21-.63-.38Z"
        />
      </svg>
    </a>
  );
}
