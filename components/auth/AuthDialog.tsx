"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Card } from "@/components/ui/card";
import { signInAnonymously, signInWithOtp } from "@/lib/auth";
import { useToast } from "@/components/ui/toast";

export function AuthDialog({
  open,
  onOpenChange,
  onSuccess,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onSuccess?: () => void;
}) {
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleGuest = async () => {
    setLoading(true);
    const { error } = await signInAnonymously();
    setLoading(false);
    if (error) toast(`Gagal guest: ${error}`);
    else {
      toast("Masuk sebagai Guest berhasil");
      onOpenChange(false);
      onSuccess?.();
    }
  };

  const handleOtp = async () => {
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      toast("Email tidak valid");
      return;
    }
    setLoading(true);
    const { error } = await signInWithOtp(email);
    setLoading(false);
    if (error) toast(`Gagal OTP: ${error}`);
    else {
      toast("Cek email untuk magic link");
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Masuk JEVARA</DialogTitle>
        </DialogHeader>
        <Card>
          <div className="space-y-3">
            <div>
              <label className="text-[10px] font-bold text-jevara-mu">Email (OTP)</label>
              <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="nama@email.com"
                className="mt-1 w-full rounded-xl border border-jevara-bd bg-jevara-bg3 px-3 py-2.5 text-sm text-jevara-tx outline-none focus:border-jevara-blue"
              />
            </div>
            <button
              onClick={handleOtp}
              disabled={loading}
              className="w-full rounded-xl bg-jevara-blue py-2.5 text-xs font-black text-[#07111d] disabled:opacity-50"
            >
              {loading ? "Memproses..." : "Kirim Magic Link"}
            </button>
            <button
              onClick={handleGuest}
              disabled={loading}
              className="w-full rounded-xl border border-jevara-bd bg-jevara-bg3 py-2.5 text-xs font-bold text-jevara-tx"
            >
              Masuk sebagai Guest
            </button>
            <p className="text-center text-[10px] text-jevara-mu">
              Guest = anon Supabase • Email = OTP magic link • RLS user_id = auth.uid()
            </p>
          </div>
        </Card>
      </DialogContent>
    </Dialog>
  );
}
