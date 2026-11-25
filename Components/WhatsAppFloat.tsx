
import Image from "next/image";
import { WHATSAPP_LINK } from "@/lib/contact";

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
        focus-visible:ring-success-green
        focus-visible:ring-offset-4
        sm:bottom-6 sm:right-6 sm:h-[52px] sm:w-[52px]
      "
        >
            <Image
                src="/images/icons/wp.png"
                alt="WhatsApp"
                width={128}
                height={128}
                // Resized/converted by next/image (was the full 1.2 MB PNG on every page).
                sizes="52px"
                className="
          h-full w-full
          object-contain
          drop-shadow-[0_4px_8px_rgba(0,0,0,0.22)]
        "
            />
        </a>
    );
}
