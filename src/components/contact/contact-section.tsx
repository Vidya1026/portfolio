"use client";
import { FadeIn } from "@/components/motion/FadeIn";
import { useState } from "react";

// Ensure the link we render is safe/valid-ish. If a user pastes a bare domain,
// prefix it with https:// so it still works as an anchor.
function normalizeUrl(u: string) {
  try {
    // If it parses, return as-is
    new URL(u);
    return u;
  } catch {
    // Add protocol fallback
    return `https://${u.replace(/^\/*/, "")}`;
  }
}

type Social = { label: string; url: string; icon?: string };

function MapPinIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M12 21s-7-6.268-7-11a7 7 0 1 1 14 0c0 4.732-7 11-7 11z"/>
      <circle cx="12" cy="10" r="3"/>
    </svg>
  );
}
function MailIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <rect x="3" y="5" width="18" height="14" rx="2"/>
      <path d="M3 7l9 6 9-6"/>
    </svg>
  );
}
function PhoneIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M5 4h3l2 4-2 2a14 14 0 0 0 6 6l2-2 4 2v3a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2z"/>
    </svg>
  );
}

export default function ContactSection({
  email,
  phone,
  location,
  socials = [],
}: {
  email?: string;
  phone?: string;
  location?: string;
  socials?: Social[];
}) {
  return (
    <FadeIn>
      {/* playful blobs background */}
      <div className="relative">
        <span aria-hidden className="blob blob-emerald" />
        <span aria-hidden className="blob blob-violet" />

        {/* Section header (matches other sections) */}
        <div className="text-center mb-10 md:mb-12">
          <h2 className="section-title">Contact</h2>
          <p className="section-subtitle">
            Hire me, collaborate on projects, or simply get to know more about me.
          </p>
          <div className="mx-auto mt-4 h-px w-40 bg-gradient-to-r from-transparent via-white/40 to-transparent" />
          <div className="mx-auto mt-1 h-1 w-28 rounded-full bg-gradient-to-r from-violet-400/70 to-cyan-400/70" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left: info card */}
          <FadeIn delay={0.05}>
            <div className="fancy-card relative group rounded-2xl p-[1px]">
              <div className="rounded-2xl ring-1 ring-white/10 bg-white/[0.06] backdrop-blur p-6 md:p-8 flex flex-col gap-5 transition-all duration-300 hover:-translate-y-0.5 hover:ring-white/20 hover:bg-white/[0.08]">
                <div className="flex items-center gap-2">
                  <span className="i-tabler-sparkles text-[20px] text-violet-300 animate-sparkle" />
                  <h3 className="text-xl font-semibold text-white/90">Get in touch</h3>
                </div>
                <p className="text-white/70">
                  Let’s talk about roles, projects, or anything interesting.
                </p>

                <div className="mt-2 space-y-4">
                  {location && (
                    <InfoRow icon={<MapPinIcon />} title="Location" value={location} />
                  )}
                  {email && (
                    <InfoRow
                      icon={<MailIcon />}
                      title="Email"
                      value={
                        <span className="inline-flex items-center gap-2">
                          <a
                            href={`mailto:${email}`}
                            className="hover:underline"
                            aria-label={`Email ${email}`}
                          >
                            {email}
                          </a>
                          <CopyBtn text={email} />
                        </span>
                      }
                    />
                  )}
                  {phone && (
                    <InfoRow
                      icon={<PhoneIcon />}
                      title="Phone"
                      value={
                        <span className="inline-flex items-center gap-2">
                          <a
                            href={`tel:${phone}`}
                            className="hover:underline"
                            aria-label={`Call ${phone}`}
                          >
                            {phone}
                          </a>
                          <CopyBtn text={phone} />
                        </span>
                      }
                    />
                  )}
                </div>

                {socials?.length > 0 && (
                  <div className="mt-4">
                    <div className="text-sm text-white/70 mb-2">Connect with me</div>
                    <div className="flex flex-wrap gap-2">
                      {socials.map((s, i) => (
                        <a
                          key={`${s.label}-${i}`}
                          href={normalizeUrl(s.url)}
                          target="_blank"
                          rel="noopener noreferrer"
                          aria-label={`Open ${s.label}`}
                          className="inline-flex items-center gap-2 rounded-full px-3 py-1.5 bg-white/[0.06] ring-1 ring-emerald-400/20 text-white/85 hover:bg-white/[0.12] transition hover:-translate-y-0.5 shadow-[0_0_0_rgba(16,185,129,0)] hover:shadow-[0_0_24px_rgba(16,185,129,.25)]"
                        >
                          {s.icon ? (
                            <span className={`text-[20px] text-emerald-300 ${s.icon}`} />
                          ) : (
                            <span className="i-tabler-external-link text-[20px] text-emerald-300" />
                          )}
                          <span className="text-sm">{s.label}</span>
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </FadeIn>

          {/* Right: lightweight message form (mailto compose) */}
          <FadeIn delay={0.1}>
            <div className="fancy-card relative group rounded-2xl p-[1px]">
              <div className="rounded-2xl ring-1 ring-white/10 bg-white/[0.04] backdrop-blur p-6 md:p-8 transition-all duration-300 hover:-translate-y-0.5 hover:ring-white/20 hover:bg-white/[0.06]">
                <div className="flex items-center gap-2 mb-4">
                  <span className="i-tabler-message-2 text-[20px] text-emerald-300 animate-bob" />
                  <h3 className="text-xl font-semibold text-white/90">Send a message</h3>
                </div>
                <ContactForm email={email} />
              </div>
            </div>
          </FadeIn>
        </div>

        {/* Section-local styles */}
        <style jsx>{`
          .section-title {
            @supports (background-clip: text) or (-webkit-background-clip: text) {
              background: linear-gradient(90deg, #c084fc 0%, #60a5fa 100%);
              -webkit-background-clip: text;
              background-clip: text;
              color: transparent;
            }
            font-weight: 800;
            font-size: clamp(28px, 5vw, 38px);
            letter-spacing: 0.3px;
          }
          .section-subtitle {
            color: rgba(255, 255, 255, 0.7);
            max-width: 60ch;
            margin: 12px auto 0;
            font-size: 0.98rem;
          }
          .blob {
            position: absolute;
            border-radius: 9999px;
            filter: blur(40px);
            opacity: 0.16;
            pointer-events: none;
          }
          .blob-emerald {
            width: 320px; height: 320px; left: -60px; top: -10px;
            background: radial-gradient(40% 40% at 50% 50%, rgba(16,185,129,0.9), rgba(16,185,129,0.05));
            animation: float 9s ease-in-out infinite;
          }
          .blob-violet {
            width: 260px; height: 260px; right: -40px; top: 80px;
            background: radial-gradient(40% 40% at 50% 50%, rgba(139,92,246,0.8), rgba(139,92,246,0.05));
            animation: float 10s ease-in-out infinite reverse;
          }
          @keyframes float {
            0%, 100% { transform: translateY(0) translateX(0); }
            50% { transform: translateY(-10px) translateX(6px); }
          }

          /* subtle animated border for cards */
          .fancy-card::before {
            content: "";
            position: absolute;
            inset: 0;
            border-radius: 16px;
            padding: 1px;
            background: linear-gradient(120deg, rgba(139,92,246,0.35), rgba(16,185,129,0.35), rgba(56,189,248,0.35)) border-box;
            -webkit-mask: 
              linear-gradient(#fff 0 0) padding-box, 
              linear-gradient(#fff 0 0);
            -webkit-mask-composite: xor;
                    mask-composite: exclude;
            opacity: 0.6;
            transition: opacity .3s ease;
          }
          .fancy-card:hover::before { opacity: 1; }

          .animate-sparkle { animation: sparkle 2.2s linear infinite; }
          @keyframes sparkle { 
            0%, 100% { transform: rotate(0deg) scale(1); opacity: .9; }
            50% { transform: rotate(8deg) scale(1.1); opacity: 1; }
          }
          .animate-bob { animation: bob 2.8s ease-in-out infinite; }
          @keyframes bob {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-3px); }
          }
        `}</style>
      </div>
    </FadeIn>
  );
}

function InfoRow({
  icon,
  title,
  value,
}: {
  icon: React.ReactNode;
  title: string;
  value: React.ReactNode;
}) {
  return (
    <div className="flex items-start gap-3">
      <span aria-hidden className="shrink-0 inline-grid place-items-center size-9 rounded-lg ring-1 ring-white/10 bg-white/[0.06] text-emerald-300">
        {icon}
      </span>
      <div>
        <div className="text-sm text-white/60">{title}</div>
        <div className="text-white/85">{value}</div>
      </div>
    </div>
  );
}

function CopyBtn({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(text);
          setCopied(true);
          setTimeout(() => setCopied(false), 1200);
        } catch {}
      }}
      className="inline-flex items-center justify-center rounded-md border border-white/10 bg-white/[0.06] px-1.5 py-1 text-xs text-white/70 hover:text-white/90 hover:bg-white/[0.12] transition"
      aria-label="Copy to clipboard"
      title="Copy"
    >
      <span className={`i-tabler-copy text-[20px] ${copied ? "hidden" : ""}`} />
      <span className={`i-tabler-check text-[20px] text-emerald-400 ${copied ? "" : "hidden"}`} />
    </button>
  );
}

function ContactForm({ email }: { email?: string }) {
  const [sent, setSent] = useState(false);
  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const data = new FormData(form);
    const name = (data.get("name") as string) || "";
    const fromEmail = (data.get("fromEmail") as string) || "";
    const subject = (data.get("subject") as string) || "Portfolio Inquiry";
    const message = (data.get("message") as string) || "";

    const body = encodeURIComponent(
      `${message}\n\n— ${name}${fromEmail ? ` • ${fromEmail}` : ""}`
    );
    const mailto = `mailto:${email || "hello@example.com"}?subject=${encodeURIComponent(
      subject
    )}&body=${body}`;
    window.location.href = mailto;

    setSent(true);
    setTimeout(() => setSent(false), 2800);

    // reset the form after opening the compose window
    form.reset();
  };

  return (
    <form
      onSubmit={onSubmit}
      className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4"
      aria-label="Contact form"
    >
      <input
        name="name"
        placeholder="Full name"
        className="col-span-1 input"
        autoComplete="name"
        aria-label="Full name"
      />
      <input
        name="fromEmail"
        placeholder="Email address"
        className="col-span-1 input"
        type="email"
        autoComplete="email"
        aria-label="Your email address"
      />
      <input
        name="subject"
        placeholder="Subject"
        className="md:col-span-2 input"
        aria-label="Subject"
      />
      <textarea
        name="message"
        placeholder="Message"
        rows={5}
        className="md:col-span-2 input resize-y"
        aria-label="Message"
      />
      <div className="md:col-span-2">
        <button
          type="submit"
          className="group relative overflow-hidden rounded-xl btn-green-glow px-5 py-2.5 font-semibold"
        >
          <span className="relative z-10 inline-flex items-center gap-2">
            <span aria-hidden className="i-tabler-send text-[20px] group-hover:translate-x-0.5 transition-transform" />
            Send Message
          </span>
          <span className="pointer-events-none absolute inset-0 -translate-x-1/2 bg-gradient-to-r from-transparent via-white/35 to-transparent opacity-0 group-hover:opacity-100 transition duration-700 group-hover:translate-x-[120%]" />
        </button>
        {sent && (
          <div
            role="status"
            aria-live="polite"
            className="mt-3 inline-flex items-center gap-2 text-sm text-emerald-300/90 animate-fade-in"
          >
            <span className="i-tabler-mail-opened text-[20px]" />
            Opening your mail app…
          </div>
        )}
      </div>

      <style jsx>{`
        .input {
          background: rgba(255, 255, 255, 0.04);
          border-radius: 12px;
          padding: 12px 14px;
          color: #fff;
          border: 1px solid rgba(255, 255, 255, 0.1);
          outline: none;
          transition: border-color 0.2s ease, background 0.2s ease, transform 0.2s ease;
        }
        .input::placeholder {
          color: rgba(255, 255, 255, 0.45);
        }
        .input:focus {
          border-color: rgba(167, 139, 250, 0.8);
          box-shadow: 0 0 0 4px rgba(167, 139, 250, 0.12),
            inset 0 0 0 1px rgba(255, 255, 255, 0.02);
          background: rgba(255, 255, 255, 0.06);
          transform: translateY(-1px);
        }
        .btn-green-glow {
          background: radial-gradient(
              120% 120% at 50% 120%,
              rgba(16, 185, 129, 0.25) 0%,
              rgba(16, 185, 129, 0.12) 35%,
              rgba(16, 185, 129, 0.06) 60%,
              rgba(16, 185, 129, 0.02) 100%
            ),
            rgba(255, 255, 255, 0.04);
          border: 1px solid rgba(16, 185, 129, 0.35);
          box-shadow: 0 0 0 0 rgba(16, 185, 129, 0);
        }
        .btn-green-glow:hover {
          box-shadow: 0 0 40px 0 rgba(16, 185, 129, 0.25);
        }
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(4px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in {
          animation: fade-in 300ms ease forwards;
        }
      `}</style>
    </form>
  );
}