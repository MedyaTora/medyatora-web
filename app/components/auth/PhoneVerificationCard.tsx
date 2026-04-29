"use client";

import { useState } from "react";

type Channel = "telegram" | "whatsapp";

type Props = {
  initialPhoneNumber?: string | null;
  initialPhoneVerified?: boolean;
  initialBalanceUsd?: number;
  initialWelcomeBonusClaimed?: boolean;
};

function formatBalance(value: number) {
  return `${Number(value || 0).toFixed(2)} USD`;
}

function getChannelLabel(channel: Channel) {
  if (channel === "whatsapp") return "WhatsApp";
  return "Telegram";
}

export default function PhoneVerificationCard({
  initialPhoneNumber = null,
  initialPhoneVerified = false,
  initialBalanceUsd = 0,
  initialWelcomeBonusClaimed = false,
}: Props) {
  const [phoneNumber, setPhoneNumber] = useState(initialPhoneNumber || "");
  const [phoneVerified, setPhoneVerified] = useState(Boolean(initialPhoneVerified));
  const [balanceUsd, setBalanceUsd] = useState(Number(initialBalanceUsd || 0));
  const [welcomeBonusClaimed, setWelcomeBonusClaimed] = useState(
    Boolean(initialWelcomeBonusClaimed)
  );

  const [channel, setChannel] = useState<Channel>("telegram");
  const [code, setCode] = useState("");
  const [maskedPhone, setMaskedPhone] = useState("");
  const [codeRequested, setCodeRequested] = useState(false);

  const [loadingStart, setLoadingStart] = useState(false);
  const [loadingVerify, setLoadingVerify] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function startVerification(nextChannel: Channel) {
    setError("");
    setMessage("");
    setChannel(nextChannel);

    if (!phoneNumber.trim()) {
      setError("Telefon numaranı gir.");
      return;
    }

    setLoadingStart(true);

    try {
      const res = await fetch("/api/auth/phone/start", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          phone_number: phoneNumber,
          channel: nextChannel,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.ok) {
        throw new Error(data.error || "Doğrulama kodu oluşturulamadı.");
      }

      setCodeRequested(true);
      setMaskedPhone(data.maskedPhoneNumber || "");
      setMessage(
        `${getChannelLabel(nextChannel)} doğrulama kodu oluşturuldu. Kod geldikten sonra aşağıya yaz.`
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Bir hata oluştu.");
    } finally {
      setLoadingStart(false);
    }
  }

  async function verifyCode() {
    setError("");
    setMessage("");

    const cleanCode = code.replace(/\D/g, "").slice(0, 6);

    if (cleanCode.length !== 6) {
      setError("6 haneli doğrulama kodunu gir.");
      return;
    }

    setLoadingVerify(true);

    try {
      const res = await fetch("/api/auth/phone/verify", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          phone_number: phoneNumber,
          code: cleanCode,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.ok) {
        throw new Error(data.error || "Telefon doğrulanamadı.");
      }

      setPhoneVerified(true);
      setWelcomeBonusClaimed(Boolean(data.bonusGranted) || welcomeBonusClaimed);
      setBalanceUsd(Number(data.balanceUsd ?? balanceUsd));
      setMaskedPhone(data.maskedPhoneNumber || maskedPhone);
      setCode("");
      setCodeRequested(false);
      setMessage(data.message || "Telefon numaran doğrulandı.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Bir hata oluştu.");
    } finally {
      setLoadingVerify(false);
    }
  }

  if (phoneVerified) {
    return (
      <section className="rounded-[34px] border border-emerald-400/20 bg-emerald-400/10 p-5 shadow-[0_20px_90px_rgba(0,0,0,0.26)] ring-1 ring-white/[0.025] backdrop-blur-xl md:p-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-emerald-200/80">
              Telefon doğrulandı
            </p>
            <h2 className="mt-2 text-2xl font-black text-white">
              Hesabın telefon doğrulaması tamamlandı.
            </h2>
            <p className="mt-2 text-sm leading-6 text-white/65">
              Doğrulanan numara:{" "}
              <span className="font-bold text-white">
                {maskedPhone || phoneNumber || "Doğrulandı"}
              </span>
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3">
            <p className="text-xs text-white/45">Güncel bakiye</p>
            <p className="mt-1 text-xl font-black text-emerald-300">
              {formatBalance(balanceUsd)}
            </p>
          </div>
        </div>

        {welcomeBonusClaimed && (
          <div className="mt-4 rounded-2xl border border-white/10 bg-black/20 p-4 text-sm leading-6 text-white/65">
            Başlangıç bonusu bu hesap için kullanıldı. Aynı telefon veya aynı
            kullanıcı ile tekrar bonus alınamaz.
          </div>
        )}

        {message && (
          <div className="mt-4 rounded-2xl border border-emerald-400/25 bg-emerald-400/10 px-4 py-3 text-sm text-emerald-200">
            {message}
          </div>
        )}
      </section>
    );
  }

  return (
    <section className="rounded-[34px] border border-white/10 bg-[#111827]/90 p-5 shadow-[0_20px_90px_rgba(0,0,0,0.32)] ring-1 ring-white/[0.025] backdrop-blur-xl md:p-6">
      <div className="mb-5 flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.22em] text-white/40">
            Telefon doğrulama
          </p>
          <h2 className="mt-2 text-2xl font-black text-white">
            Telefonunu doğrula, 1 USD başlangıç bonusunu al.
          </h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-white/60">
            Bir telefon numarası yalnızca bir hesapta kullanılabilir ve sadece
            bir kez bonus alabilir. Kod şu an sistem tarafından oluşturulup
            MedyaTora doğrulama kanalına iletilir.
          </p>
        </div>

        <div className="rounded-2xl border border-emerald-400/20 bg-emerald-400/10 px-4 py-3">
          <p className="text-xs text-emerald-200/75">Mevcut bakiye</p>
          <p className="mt-1 text-xl font-black text-white">
            {formatBalance(balanceUsd)}
          </p>
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-[1fr_auto_auto]">
        <input
          value={phoneNumber}
          onChange={(e) => {
            setPhoneNumber(e.target.value);
            setError("");
            setMessage("");
          }}
          placeholder="05530739292"
          className="w-full rounded-2xl border border-white/10 bg-white/[0.055] px-4 py-3 text-white outline-none placeholder:text-white/30 transition focus:border-emerald-400 focus:bg-white/[0.075]"
        />

        <button
          type="button"
          onClick={() => startVerification("telegram")}
          disabled={loadingStart}
          className="rounded-2xl border border-sky-400/20 bg-sky-400/10 px-5 py-3 text-sm font-black text-sky-200 transition hover:-translate-y-0.5 hover:bg-sky-400/15 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0"
        >
          {loadingStart && channel === "telegram"
            ? "Gönderiliyor..."
            : "Telegram ile doğrula"}
        </button>

        <button
          type="button"
          onClick={() => startVerification("whatsapp")}
          disabled={loadingStart}
          className="rounded-2xl border border-emerald-400/20 bg-emerald-400/10 px-5 py-3 text-sm font-black text-emerald-200 transition hover:-translate-y-0.5 hover:bg-emerald-400/15 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0"
        >
          {loadingStart && channel === "whatsapp"
            ? "Hazırlanıyor..."
            : "WhatsApp ile doğrula"}
        </button>
      </div>

      {codeRequested && (
        <div className="mt-4 rounded-3xl border border-white/10 bg-black/20 p-4">
          <p className="mb-3 text-sm font-bold text-white">
            {maskedPhone ? `${maskedPhone} için kod gir` : "Doğrulama kodunu gir"}
          </p>

          <div className="grid gap-3 md:grid-cols-[1fr_auto]">
            <input
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
              placeholder="6 haneli kod"
              inputMode="numeric"
              className="w-full rounded-2xl border border-white/10 bg-white/[0.055] px-4 py-3 text-white outline-none placeholder:text-white/30 transition focus:border-emerald-400 focus:bg-white/[0.075]"
            />

            <button
              type="button"
              onClick={verifyCode}
              disabled={loadingVerify}
              className="rounded-2xl bg-emerald-400 px-5 py-3 text-sm font-black text-black transition hover:-translate-y-0.5 hover:bg-emerald-300 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0"
            >
              {loadingVerify ? "Kontrol ediliyor..." : "Kodu Doğrula"}
            </button>
          </div>

          <p className="mt-3 text-xs leading-5 text-white/45">
            Kod 10 dakika geçerlidir. 5 hatalı denemeden sonra yeni kod istemen
            gerekir.
          </p>
        </div>
      )}

      {message && (
        <div className="mt-4 rounded-2xl border border-sky-400/25 bg-sky-400/10 px-4 py-3 text-sm text-sky-200">
          {message}
        </div>
      )}

      {error && (
        <div className="mt-4 rounded-2xl border border-rose-400/25 bg-rose-400/10 px-4 py-3 text-sm text-rose-200">
          {error}
        </div>
      )}
    </section>
  );
}