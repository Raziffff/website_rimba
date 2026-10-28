"use client";

import { useState, useEffect } from "react";
import { Copy, Check, MessageCircle, Share2 } from "lucide-react";

interface ShareButtonProps {
  slug: string;
  title: string;
}

export default function ShareButton({ slug, title }: ShareButtonProps) {
  const [copied, setCopied] = useState(false);
  const [url, setUrl] = useState("");

  // Ambil URL dari browser secara otomatis, bukan dari env
  useEffect(() => {
    if (typeof window !== "undefined") {
      setUrl(window.location.href);
    }
  }, []);

  // slug is kept for props compatibility
  const _slug = slug;

  const handleCopy = () => {
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleShareWA = () => {
    const text = `📰 *${title}*\n\nBaca selengkapnya di sini:\n${url}`;
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, "_blank");
  };

  return (
    <div className="flex items-center gap-2">
      <span className="text-xs font-bold text-text/60 flex items-center gap-1.5">
        <Share2 className="w-3.5 h-3.5" />
        Bagikan:
      </span>

      {/* Salin Link */}
      <button
        onClick={handleCopy}
        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${
          copied
            ? "bg-emerald-100 text-emerald-700 border-emerald-300"
            : "bg-background text-text/70 border-border/60 hover:border-primary/40 hover:text-primary"
        }`}
      >
        {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
        {copied ? "Tersalin!" : "Salin Link"}
      </button>

      {/* Bagikan ke WA */}
      <button
        onClick={handleShareWA}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white border border-emerald-600 transition-all"
      >
        <MessageCircle className="w-3.5 h-3.5" />
        WhatsApp
      </button>
    </div>
  );
}
