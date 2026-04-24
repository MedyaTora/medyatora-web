export const CONTACT = {
    whatsapp: "+905530739292",
    telegram: "https://t.me/medyatora",
    instagram: "https://www.instagram.com/medyatora/",
    email: "alicandogu2@gmail.com",
  };
  
  export function getWhatsappLink(message?: string) {
    const text = encodeURIComponent(
      message || "Merhaba, MedyaTora üzerinden size ulaşıyorum."
    );
  
    return `https://wa.me/${CONTACT.whatsapp.replace(/\D/g, "")}?text=${text}`;
  }