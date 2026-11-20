
import Image from "next/image";

const WHATSAPP_LINK =
    "https://wa.me/919000937222?text=HI%20i%20wanted%20to%20know%20more%20about%20Alpha%20Male";

export default function WhatsAppFloat() {
    return (
        <a
            href={WHATSAPP_LINK}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Chat with Alpha Male on WhatsApp"
            title="Chat with us on WhatsApp"
            className="
        fixed bottom-[max(1rem,env(safe-area-inset-bottom))] right-[max(1rem,env(safe-area-inset-right))] z-[9999]
        flex h-[52px] w-[52px]
        items-center justify-center
        overflow-visible
        transition-transform duration-300
        hover:scale-110
        focus-visible:outline-none
        focus-visible:ring-2
        focus-visible:ring-[#176348]
        focus-visible:ring-offset-4
        sm:bottom-6 sm:right-6 sm:h-[52px] sm:w-[52px]
      "
        >
            <Image
                src="/images/icons/wp.png"
                alt="WhatsApp"
                width={128}
                height={128}
                priority
                unoptimized
                className="
          h-full w-full
          object-contain
          drop-shadow-[0_4px_8px_rgba(0,0,0,0.22)]
        "
            />
        </a>
    );
}
