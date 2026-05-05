const fs = require("fs");
const path = require("path");

const filePath = path.join(process.cwd(), "app", "smmtora", "page.tsx");

if (!fs.existsSync(filePath)) {
  console.error("Dosya bulunamadı:", filePath);
  process.exit(1);
}

let content = fs.readFileSync(filePath, "utf8");

const replacements = [
  [
    `rounded-[32px] border border-amber-400/20 bg-gradient-to-br from-amber-400/10 to-white/[0.035] p-5 shadow-[0_18px_70px_rgba(0,0,0,0.28)] ring-1 ring-white/[0.025] backdrop-blur-xl sm:p-6`,
    `rounded-[32px] border border-white/10 bg-white/[0.04] p-5 shadow-[0_18px_70px_rgba(0,0,0,0.30)] ring-1 ring-white/[0.025] backdrop-blur-xl sm:p-6`,
  ],
  [
    `text-xs font-bold uppercase tracking-[0.22em] text-amber-300`,
    `text-xs font-black uppercase tracking-[0.22em] text-white/45`,
  ],
  [
    `hover:border-amber-300/25 hover:bg-black/25`,
    `hover:border-white/20 hover:bg-white/[0.055]`,
  ],
  [
    `mb-3 flex h-10 w-10 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04] text-amber-300`,
    `mb-3 flex h-10 w-10 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04] text-white/82`,
  ],

  [
    `border-emerald-400/80 bg-emerald-400/12 shadow-[0_18px_50px_rgba(52,211,153,0.12),0_0_0_1px_rgba(52,211,153,0.16)]`,
    `border-white/28 bg-white/[0.095] shadow-[0_18px_50px_rgba(0,0,0,0.30),0_0_0_1px_rgba(255,255,255,0.08)]`,
  ],
  [
    `border-emerald-400/25 bg-emerald-400/10 text-emerald-300`,
    `border-white/18 bg-white/[0.08] text-white`,
  ],
  [
    `rounded-full bg-emerald-400 px-2.5 py-1 text-[10px] font-bold text-black`,
    `rounded-full bg-white px-2.5 py-1 text-[10px] font-black text-black`,
  ],
  [
    `rounded-full bg-emerald-400 px-2.5 py-1 text-[10px] font-bold text-black sm:text-[11px]`,
    `rounded-full bg-white px-2.5 py-1 text-[10px] font-black text-black sm:text-[11px]`,
  ],

  [
    `rounded-2xl border border-sky-400/20 bg-sky-400/10 px-4 py-2 text-sm font-bold text-sky-300 transition hover:-translate-y-0.5 hover:bg-sky-400/15`,
    `rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-2 text-sm font-black text-white/72 transition hover:-translate-y-0.5 hover:border-white/20 hover:bg-white/[0.08] hover:text-white`,
  ],
  [
    `rounded-2xl border border-sky-400/20 bg-sky-400/10 px-4 py-3 text-sm font-bold text-sky-300 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] transition hover:-translate-y-0.5 hover:bg-sky-400/15`,
    `rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm font-black text-white/72 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] transition hover:-translate-y-0.5 hover:border-white/20 hover:bg-white/[0.08] hover:text-white`,
  ],

  [
    `border-emerald-300 bg-emerald-400 text-black shadow-[0_10px_28px_rgba(52,211,153,0.18)]`,
    `border-white bg-white text-black shadow-[0_10px_28px_rgba(255,255,255,0.10)]`,
  ],
  [
    `focus:border-emerald-400`,
    `focus:border-white/28`,
  ],

  [
    `border-emerald-400/80 bg-gradient-to-br from-emerald-500/18 to-white/[0.055] shadow-[0_18px_55px_rgba(52,211,153,0.12),0_0_0_1px_rgba(52,211,153,0.14)]`,
    `border-white/28 bg-gradient-to-br from-white/[0.13] to-white/[0.055] shadow-[0_18px_55px_rgba(0,0,0,0.30),0_0_0_1px_rgba(255,255,255,0.08)]`,
  ],

  [
    `service.guarantee
                                  ? "bg-emerald-500/15 text-emerald-300"
                                  : "bg-rose-500/15 text-rose-300"`,
    `service.guarantee
                                  ? "border border-white/10 bg-white/[0.07] text-white/78"
                                  : "border border-white/10 bg-black/25 text-white/48"`,
  ],
  [
    `selectedService.guarantee
                          ? "bg-emerald-500/15 text-emerald-300"
                          : "bg-rose-500/15 text-rose-300"`,
    `selectedService.guarantee
                          ? "border border-white/10 bg-white/[0.07] text-white/78"
                          : "border border-white/10 bg-black/25 text-white/48"`,
  ],

  [
    `shrink-0 rounded-2xl border border-emerald-400/20 bg-emerald-400/10 px-3 py-2 text-right shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]`,
    `shrink-0 rounded-2xl border border-white/10 bg-black/25 px-3 py-2 text-right shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]`,
  ],
  [
    `mt-1 text-base font-bold text-emerald-300 sm:text-lg`,
    `mt-1 text-base font-black text-white sm:text-lg`,
  ],

  [
    `rounded-2xl bg-gradient-to-r from-emerald-400 to-emerald-500 px-4 py-3 text-sm font-black text-black shadow-[0_16px_38px_rgba(52,211,153,0.18)] transition hover:-translate-y-0.5 hover:from-emerald-300 hover:to-emerald-400 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0`,
    `rounded-2xl bg-white px-4 py-3 text-sm font-black text-black shadow-[0_16px_38px_rgba(255,255,255,0.10)] transition hover:-translate-y-0.5 hover:bg-white/90 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0`,
  ],
  [
    `rounded-2xl border border-emerald-400/30 bg-emerald-400/10 px-4 py-3 text-sm font-bold text-emerald-300 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] transition hover:-translate-y-0.5 hover:bg-emerald-400/15 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0`,
    `rounded-2xl border border-white/12 bg-white/[0.055] px-4 py-3 text-sm font-black text-white/82 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] transition hover:-translate-y-0.5 hover:bg-white/[0.085] disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0`,
  ],

  [
    `rounded-2xl border border-emerald-400/20 bg-gradient-to-br from-emerald-400/12 to-emerald-400/[0.035] p-4 shadow-[0_14px_42px_rgba(52,211,153,0.08),inset_0_1px_0_rgba(255,255,255,0.04)]`,
    `rounded-2xl border border-white/12 bg-white/[0.055] p-4 shadow-[0_14px_42px_rgba(0,0,0,0.18),inset_0_1px_0_rgba(255,255,255,0.04)]`,
  ],
  [
    `text-lg font-bold text-emerald-300`,
    `text-lg font-black text-white`,
  ],

  [
    `rounded-xl border border-amber-400/20 bg-amber-400/10 px-3 py-2 text-xs font-bold text-amber-300 transition hover:-translate-y-0.5 hover:bg-amber-400/15`,
    `rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2 text-xs font-black text-white/70 transition hover:-translate-y-0.5 hover:bg-white/[0.08] hover:text-white`,
  ],
  [
    `rounded-xl border border-rose-400/20 bg-rose-400/10 px-3 py-2 text-xs font-bold text-rose-300 transition hover:-translate-y-0.5 hover:bg-rose-400/15`,
    `rounded-xl border border-white/10 bg-black/25 px-3 py-2 text-xs font-black text-white/50 transition hover:-translate-y-0.5 hover:bg-white/[0.08] hover:text-white`,
  ],

  [
    `rounded-2xl border border-sky-500/30 bg-sky-500/10 px-4 py-3 text-sm text-sky-300`,
    `rounded-2xl border border-white/10 bg-white/[0.055] px-4 py-3 text-sm text-white/72`,
  ],
  [
    `rounded-2xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-300`,
    `rounded-2xl border border-[#6b2232] bg-[#31101b]/70 px-4 py-3 text-sm text-[#f2c7d1]`,
  ],

  [
    `border border-emerald-400 bg-emerald-400/10 shadow-[0_12px_34px_rgba(52,211,153,0.12)]`,
    `border border-white/28 bg-white/[0.095] shadow-[0_12px_34px_rgba(0,0,0,0.24)]`,
  ],
  [
    `border-sky-400 bg-sky-400/10 shadow-[0_12px_34px_rgba(56,189,248,0.12)]`,
    `border-white/28 bg-white/[0.095] shadow-[0_12px_34px_rgba(0,0,0,0.24)]`,
  ],

  [
    `rounded-2xl border border-emerald-400/20 bg-emerald-400/10 p-4 text-sm leading-6 text-emerald-50`,
    `rounded-2xl border border-white/12 bg-white/[0.055] p-4 text-sm leading-6 text-white/72`,
  ],
  [
    `rounded-2xl border border-sky-400/20 bg-sky-400/10 p-4 text-sm leading-6 text-sky-50`,
    `rounded-2xl border border-white/12 bg-white/[0.055] p-4 text-sm leading-6 text-white/72`,
  ],
  [
    `rounded-2xl border border-amber-400/20 bg-amber-400/10 p-4 text-sm leading-6 text-amber-50`,
    `rounded-2xl border border-[#6b5b2a]/60 bg-[#211d11]/70 p-4 text-sm leading-6 text-[#e7d9a4]`,
  ],

  [
    `accent-emerald-400`,
    `accent-white`,
  ],
  [
    `text-emerald-300`,
    `text-white/82`,
  ],
  [
    `text-emerald-200`,
    `text-white/82`,
  ],
  [
    `text-emerald-100/70`,
    `text-white/55`,
  ],
];

let changedCount = 0;

for (const [from, to] of replacements) {
  const before = content;
  content = content.split(from).join(to);

  if (content !== before) {
    changedCount += 1;
  }
}

fs.writeFileSync(filePath, content, "utf8");

console.log(`SMMTora premium düzenleme tamamlandı. Uygulanan değişiklik grubu: ${changedCount}`);