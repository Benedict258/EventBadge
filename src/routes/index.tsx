import { useEffect, useRef, useState, useCallback } from "react";
import { toast } from "sonner";
import templateUrl from "@/assets/template.jpg";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Download,
  Share2,
  RefreshCw,
  Facebook,
  Linkedin,
  Link as LinkIcon,
  Upload,
  CheckCircle2,
} from "lucide-react";
import Loader from "@/components/loader";

// Custom X (formerly Twitter) Icon
const XIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" aria-hidden="true" className={className} fill="currentColor">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);

// Palette
const C = {
  blue: "#003875",
  ice: "#DCE2E6",
  orange: "#DC7527",
  red: "#C41230",
  green: "#00A859",
  ink: "#0A2540",
  white: "#FFFFFF",
};

const TEMPLATE_W = 1920;
const TEMPLATE_H = 1920;
const PHOTO_BOX = { x: 168, y: 346, w: 754 - 168, h: 1064 - 346 };
const NAME_BOX = { x: 168, y: 1066, w: 754 - 168, h: 1275 - 1066 };

const PREVIEW_SCALE = 1.5;
const EXPORT_SCALE = 4;

function renderToCanvas(
  canvas: HTMLCanvasElement,
  template: HTMLImageElement,
  photo: HTMLImageElement | null,
  name: string,
  scale: number,
) {
  const W = TEMPLATE_W * scale;
  const H = TEMPLATE_H * scale;
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";

  ctx.drawImage(template, 0, 0, W, H);

  if (photo) {
    const bx = PHOTO_BOX.x * scale;
    const by = PHOTO_BOX.y * scale;
    const bw = PHOTO_BOX.w * scale;
    const bh = PHOTO_BOX.h * scale;
    const iw = photo.naturalWidth;
    const ih = photo.naturalHeight;
    const boxRatio = bw / bh;
    const imgRatio = iw / ih;
    let sx = 0,
      sy = 0,
      sw = iw,
      sh = ih;
    if (imgRatio > boxRatio) {
      sw = ih * boxRatio;
      sx = (iw - sw) / 2;
    } else {
      sh = iw / boxRatio;
      sy = (ih - sh) / 2;
    }
    ctx.save();
    ctx.beginPath();
    ctx.rect(bx, by, bw, bh);
    ctx.clip();
    ctx.drawImage(photo, sx, sy, sw, sh, bx, by, bw, bh);
    ctx.restore();
  }

  if (name.trim()) {
    const bx = NAME_BOX.x * scale;
    const by = NAME_BOX.y * scale;
    const bw = NAME_BOX.w * scale;
    const bh = NAME_BOX.h * scale;
    const padX = 30 * scale;
    const padY = 20 * scale;
    const maxW = bw - padX * 2;
    const maxH = bh - padY * 2;

    const words = name.trim().split(/\s+/);
    let lines: string[];
    if (words.length === 1) lines = [words[0]];
    else {
      const mid = Math.ceil(words.length / 2);
      lines = [words.slice(0, mid).join(" "), words.slice(mid).join(" ")];
    }

    ctx.fillStyle = "#ffffff";
    ctx.textBaseline = "top";
    ctx.textAlign = "left";

    const fontFamily = '"Geist Mono", "JetBrains Mono", monospace';
    let lo = 10,
      hi = 220 * scale,
      best = 10;
    while (lo <= hi) {
      const m = Math.floor((lo + hi) / 2);
      ctx.font = `700 ${m}px ${fontFamily}`;
      const lineH = m * 1.15;
      const totalH = lineH * lines.length;
      const widest = Math.max(...lines.map((l) => ctx.measureText(l).width));
      if (widest <= maxW && totalH <= maxH) {
        best = m;
        lo = m + 1;
      } else {
        hi = m - 1;
      }
    }
    ctx.font = `700 ${best}px ${fontFamily}`;
    const lineH = best * 1.15;
    const totalH = lineH * lines.length;
    let y = by + (bh - totalH) / 2;
    for (const line of lines) {
      ctx.fillText(line, bx + padX, y);
      y += lineH;
    }
  }
}

export function Index() {
  const [name, setName] = useState("");
  const [photo, setPhoto] = useState<HTMLImageElement | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [template, setTemplate] = useState<HTMLImageElement | null>(null);
  const [generated, setGenerated] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => setTemplate(img);
    img.src = templateUrl;
  }, []);

  const handleFile = useCallback((file: File | null) => {
    if (!file) return;
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      setPhoto(img);
      setPhotoPreview(url);
    };
    img.src = url;
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !template) return;
    renderToCanvas(canvas, template, photo, name, PREVIEW_SCALE);
  }, [template, photo, name, generated]);

  const downloadHighRes = async () => {
    if (!template) return;
    const off = document.createElement("canvas");
    renderToCanvas(off, template, photo, name, EXPORT_SCALE);
    await new Promise<void>((resolve) =>
      off.toBlob(
        (blob) => {
          if (!blob) return resolve();
          const url = URL.createObjectURL(blob);
          const a = document.createElement("a");
          a.href = url;
          const safe = (name.trim() || "primeCTF-2026").replace(/[^a-z0-9]+/gi, "-");
          a.download = `${safe}-primeCTF-2026.png`;
          a.click();
          URL.revokeObjectURL(url);
          resolve();
        },
        "image/png",
        1.0,
      ),
    );
  };

  const handleGenerate = () => {
    if (!photo || !name.trim() || !template) return;
    setGenerated(true);
  };

  const handleReset = () => {
    setGenerated(false);
    setName("");
    setPhoto(null);
    setPhotoPreview(null);
  };

  const shareUrl = typeof window !== "undefined" ? window.location.href : "";
  const shareText = `I'll be at the primeCTF 2026 Award Ceremony! Get your DP →`;

  const copyLink = async () => {
    await navigator.clipboard.writeText(shareUrl);
    toast.success("Link copied to clipboard");
  };

  const canGenerate = !!photo && !!name.trim() && !!template;

  const sans = '"Inter", system-ui, sans-serif';
  const mono = '"Geist Mono", monospace';
  const space = '"Space Mono", monospace';

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ background: C.ice, color: C.ink, fontFamily: sans }}
    >
      {/* Top bar */}
      <div className="w-full" style={{ background: C.blue, color: C.white }}>
        <div className="mx-auto max-w-6xl px-6 py-3 flex flex-col sm:flex-row items-center justify-between text-[10px] sm:text-xs gap-2 sm:gap-0">
          <span
            style={{ color: C.orange, letterSpacing: "0.15em", fontFamily: space }}
            className="uppercase font-semibold text-center sm:text-left"
          >
            Date | Time · Award Ceremony
          </span>
          <span className="uppercase tracking-widest opacity-80" style={{ fontFamily: space }}>
            primeCTF 2026
          </span>
        </div>
      </div>

      <main className="flex-1">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 py-8 md:py-14">
          <header className="mb-8 md:mb-10 text-center md:text-left">
            <div
              className="uppercase text-[10px] sm:text-xs font-semibold mb-3"
              style={{ color: C.orange, letterSpacing: "0.2em", fontFamily: space }}
            >
              Attendee DP Generator
            </div>
            <h1
              style={{
                color: C.blue,
                fontFamily: space,
                fontWeight: 700,
                fontSize: "clamp(24px, 6vw, 42px)",
                lineHeight: 1.1,
              }}
            >
              Hello, I'll Be Attending
            </h1>
            <div
              style={{
                color: C.blue,
                fontFamily: space,
                fontWeight: 700,
                fontSize: "clamp(30px, 8vw, 56px)",
                letterSpacing: "-0.02em",
                lineHeight: 0.9,
              }}
              className="mt-2 uppercase"
            >
              Award Ceremony
            </div>
            <div className="mt-5 flex flex-wrap items-center justify-center md:justify-start gap-3 text-[10px] sm:text-sm">
              <span
                className="px-2.5 py-1.5 font-bold"
                style={{ background: C.blue, color: C.white, fontFamily: space }}
              >
                primeCTF 2026
              </span>
              <span
                className="px-2.5 py-1.5 font-bold"
                style={{ background: C.orange, color: C.white, fontFamily: space }}
              >
                CyLab × Upanzi × Nihub
              </span>
            </div>
            <p
              className="mt-6 max-w-2xl text-sm sm:text-base mx-auto md:mx-0"
              style={{ color: C.ink, fontFamily: space }}
            >
              Generate your official primeCTF 2026 Award Ceremony display picture. Upload a photo,
              type your name, and share with the community.
            </p>
          </header>

          <div className="mx-auto max-w-[1000px]">
            <div className="grid gap-8 md:grid-cols-2 items-start">
              {/* Controls */}
              <div
                className="p-6 sm:p-8 space-y-6 w-full max-w-[460px] mx-auto md:mx-0"
                style={{
                  background: C.white,
                  border: `1px solid ${C.blue}`,
                  borderTop: `4px solid ${C.orange}`,
                }}
              >
                <div className="space-y-2">
                  <label
                    htmlFor="name"
                    className="text-[10px] sm:text-xs font-semibold uppercase"
                    style={{ color: C.orange, letterSpacing: "0.15em", fontFamily: space }}
                  >
                    Full Name
                  </label>
                  <input
                    id="name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Benedict Isaac"
                    className="w-full px-4 py-3.5 text-sm outline-none transition"
                    style={{
                      fontFamily: mono,
                      background: C.white,
                      border: `1px solid ${C.blue}`,
                      color: C.ink,
                      borderRadius: 0,
                    }}
                    maxLength={60}
                  />
                </div>

                <div className="space-y-2">
                  <label
                    className="text-[10px] sm:text-xs font-semibold uppercase"
                    style={{ color: C.orange, letterSpacing: "0.15em", fontFamily: space }}
                  >
                    Your Photo
                  </label>
                  <label
                    htmlFor="photo"
                    className="flex cursor-pointer flex-col items-center justify-center gap-3 px-4 py-10 text-center transition"
                    style={{
                      border: `2px dashed ${C.blue}`,
                      background: C.ice,
                    }}
                  >
                    {photoPreview ? (
                      <>
                        <img
                          src={photoPreview}
                          alt="preview"
                          className="h-24 w-24 object-cover"
                          style={{ border: `2px solid ${C.orange}` }}
                        />
                        <span className="text-xs" style={{ color: C.ink, fontFamily: space }}>
                          Click to replace
                        </span>
                      </>
                    ) : (
                      <>
                        <div
                          className="flex items-center justify-center"
                          style={{
                            background: C.orange,
                            width: 54,
                            height: 54,
                          }}
                        >
                          <Upload className="h-6 w-6" color={C.white} />
                        </div>
                        <div>
                          <p
                            className="text-sm font-semibold"
                            style={{ color: C.blue, fontFamily: space }}
                          >
                            Upload your selfie
                          </p>
                          <p
                            className="mt-1 text-xs"
                            style={{ color: C.ink, opacity: 0.7, fontFamily: space }}
                          >
                            PNG or JPG, square works best
                          </p>
                        </div>
                      </>
                    )}
                    <input
                      id="photo"
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleFile(e.target.files?.[0] ?? null)}
                      className="hidden"
                    />
                  </label>
                </div>

                <button
                  type="button"
                  onClick={handleGenerate}
                  disabled={!canGenerate}
                  className="w-full px-4 py-4 text-sm font-bold uppercase tracking-wider transition disabled:cursor-not-allowed disabled:opacity-40"
                  style={{
                    background: C.blue,
                    color: C.white,
                    borderRadius: 0,
                    letterSpacing: "0.1em",
                    fontFamily: space,
                  }}
                >
                  {generated ? "Update My DP" : "Generate My DP"}
                </button>

                {generated && (
                  <div className="space-y-4 pt-2 border-t border-blue-100">
                    <div
                      className="flex items-center gap-2 justify-center text-[10px] uppercase font-bold"
                      style={{ color: C.green, fontFamily: space }}
                    >
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      DP Ready!
                    </div>
                    <div className="flex flex-row gap-2">
                      <button
                        onClick={downloadHighRes}
                        className="flex-1 flex items-center justify-center gap-2 px-2 py-3 text-[10px] font-bold uppercase tracking-tight"
                        style={{
                          background: C.blue,
                          color: C.white,
                          borderRadius: 0,
                          fontFamily: space,
                        }}
                      >
                        <Download className="h-3.5 w-3.5" />
                        Download
                      </button>
                      <button
                        onClick={() => setShareOpen(true)}
                        className="flex-1 flex items-center justify-center gap-2 px-2 py-3 text-[10px] font-bold uppercase tracking-tight"
                        style={{
                          background: C.orange,
                          color: C.white,
                          borderRadius: 0,
                          fontFamily: space,
                        }}
                      >
                        <Share2 className="h-3.5 w-3.5" />
                        Share
                      </button>
                      <button
                        onClick={handleReset}
                        className="flex-1 flex items-center justify-center gap-2 px-2 py-3 text-[10px] font-bold uppercase tracking-tight"
                        style={{
                          background: C.white,
                          color: C.blue,
                          border: `1px solid ${C.blue}`,
                          borderRadius: 0,
                          fontFamily: space,
                        }}
                      >
                        <RefreshCw className="h-3.5 w-3.5" />
                        Reset
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Preview — no box */}
              <div className="relative w-full max-w-[460px] mx-auto md:mx-0">
                <canvas
                  ref={canvasRef}
                  className="block w-full h-auto shadow-2xl"
                  style={{ visibility: template ? "visible" : "hidden" }}
                />
                {!template && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Loader label="Loading preview..." />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>

      <footer className="w-full mt-12" style={{ background: C.blue, color: C.white }}>
        <div className="mx-auto max-w-6xl px-6 py-8 text-[10px] sm:text-xs flex flex-col md:flex-row items-center justify-between gap-6 md:gap-2 text-center md:text-left">
          <span
            style={{ color: C.orange, fontFamily: space }}
            className="uppercase tracking-widest font-semibold"
          >
            primeCTF 2026
          </span>
          <span className="opacity-80 leading-relaxed" style={{ fontFamily: space }}>
            CyLab Security Academy × Upanzi Network × Nihub
          </span>
          <span className="opacity-80" style={{ fontFamily: space }}>
            100% client-side · your photo never leaves your device
          </span>
        </div>
      </footer>

      <Dialog open={shareOpen} onOpenChange={setShareOpen}>
        <DialogContent
          className="sm:max-w-md w-[95vw] sm:w-full mx-auto"
          style={{
            background: C.white,
            color: C.ink,
            border: `1px solid ${C.blue}`,
            borderTop: `4px solid ${C.orange}`,
            borderRadius: 0,
          }}
        >
          <DialogHeader>
            <DialogTitle style={{ color: C.blue, fontFamily: space, fontWeight: 700 }}>
              Share Your DP
            </DialogTitle>
            <DialogDescription style={{ color: C.ink, fontFamily: space }}>
              Your DP is live and ready to share! Let everyone know you'll be at the primeCTF 2026
              Award Ceremony.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-2">
            <div>
              <p
                className="mb-3 text-[10px] sm:text-xs font-semibold uppercase"
                style={{ color: C.orange, letterSpacing: "0.15em", fontFamily: space }}
              >
                Share Image
              </p>
              <div className="grid grid-cols-3 gap-2">
                {[
                  {
                    href: `https://x.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`,
                    icon: XIcon,
                    label: "X",
                  },
                  {
                    href: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`,
                    icon: Facebook,
                    label: "Facebook",
                  },
                  {
                    href: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`,
                    icon: Linkedin,
                    label: "LinkedIn",
                  },
                ].map(({ href, icon: Icon, label }) => (
                  <a
                    key={label}
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex flex-col items-center gap-2 p-3 sm:p-4 text-[10px] sm:text-xs font-semibold transition hover:opacity-80"
                    style={{
                      background: C.ice,
                      color: C.blue,
                      border: `1px solid ${C.blue}`,
                      borderRadius: 0,
                    }}
                  >
                    <Icon className="h-5 w-5" />
                    {label}
                  </a>
                ))}
              </div>
            </div>

            <div>
              <p
                className="mb-3 text-[10px] sm:text-xs font-semibold uppercase"
                style={{ color: C.orange, letterSpacing: "0.15em", fontFamily: space }}
              >
                Copy Share Link
              </p>
              <div className="flex flex-col sm:flex-row gap-2">
                <input
                  readOnly
                  value={shareUrl}
                  className="flex-1 px-3 py-2.5 text-xs outline-none"
                  style={{
                    fontFamily: mono,
                    background: C.ice,
                    color: C.ink,
                    border: `1px solid ${C.blue}`,
                    borderRadius: 0,
                  }}
                />
                <button
                  onClick={copyLink}
                  className="flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-bold uppercase"
                  style={{
                    background: C.blue,
                    color: C.white,
                    borderRadius: 0,
                  }}
                >
                  <LinkIcon className="h-4 w-4" />
                  Copy Link
                </button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
