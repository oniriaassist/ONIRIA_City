const defaultPhone = "+255777221121";
const defaultWhatsAppNumber = "255777221121";

export const contactDetails = {
  location: "ONIRIA City, Fumba, Zanzibar",
  phoneDisplay: process.env.NEXT_PUBLIC_SALES_PHONE || defaultPhone,
  phoneHref: `tel:${(process.env.NEXT_PUBLIC_SALES_PHONE || defaultPhone).replace(/[^+\d]/g, "")}`,
  email: process.env.NEXT_PUBLIC_SALES_EMAIL || "oniriaassist@gmail.com",
  whatsappNumber:
    (process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || defaultWhatsAppNumber).replace(/\D/g, ""),
};

export function buildWhatsAppLink(
  message = "Hello ONIRIA City, I would like to receive more information."
) {
  return `https://wa.me/${contactDetails.whatsappNumber}?text=${encodeURIComponent(message)}`;
}
