import { Lock, ShieldCheck, X } from 'lucide-react';
import React, { useState } from 'react';

interface PinModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  correctPin: string;
  title?: string;
  description?: string;
}

export const PinModal: React.FC<PinModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  correctPin,
  title = 'Masukkan PIN Operator',
  description = 'Fitur administrasi dilindungi PIN untuk mencegah perubahan tidak disengaja.',
}) => {
  const [pin, setPin] = useState<string>('');
  const [error, setError] = useState<string>('');

  if (!isOpen) return null;

  const handleDigit = (digit: string) => {
    if (pin.length < 6) {
      const newPin = pin + digit;
      setPin(newPin);
      setError('');

      if (newPin === correctPin) {
        setTimeout(() => {
          setPin('');
          onSuccess();
        }, 150);
      } else if (newPin.length === correctPin.length) {
        setError('PIN salah. Silakan coba lagi.');
        setTimeout(() => setPin(''), 600);
      }
    }
  };

  const handleDelete = () => {
    setPin((prev) => prev.slice(0, -1));
    setError('');
  };

  const handleClear = () => {
    setPin('');
    setError('');
  };

  return (
    <div
      id="pin-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4"
    >
      <div
        id="pin-modal-card"
        className="w-full max-w-sm bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl relative animate-in fade-in zoom-in-95 duration-200"
      >
        <button
          id="pin-modal-close-btn"
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          aria-label="Tutup"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex flex-col items-center text-center mb-6">
          <div className="w-14 h-14 rounded-2xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400 mb-3 shadow-lg shadow-blue-500/10">
            <Lock className="w-7 h-7" />
          </div>
          <h3 className="text-xl font-bold text-white tracking-tight">{title}</h3>
          <p className="text-xs text-slate-400 mt-1 max-w-xs">{description}</p>
        </div>

        {/* PIN Indicators */}
        <div className="flex justify-center items-center gap-3 mb-6">
          {Array.from({ length: correctPin.length || 4 }).map((_, idx) => {
            const isFilled = idx < pin.length;
            return (
              <div
                key={idx}
                className={`w-4 h-4 rounded-full transition-all duration-200 ${
                  error
                    ? 'bg-rose-500 scale-110 animate-shake'
                    : isFilled
                    ? 'bg-blue-500 scale-110 shadow-lg shadow-blue-500/50'
                    : 'bg-slate-800 border border-slate-700'
                }`}
              />
            );
          })}
        </div>

        {error && (
          <p className="text-center text-xs font-semibold text-rose-400 mb-4 animate-bounce">
            {error}
          </p>
        )}

        {/* Numpad */}
        <div className="grid grid-cols-3 gap-2.5 max-w-xs mx-auto mb-4">
          {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((digit) => (
            <button
              key={digit}
              id={`pin-btn-${digit}`}
              onClick={() => handleDigit(digit)}
              className="h-14 rounded-2xl bg-slate-800/80 hover:bg-slate-700/80 active:bg-blue-600 text-white font-mono text-xl font-semibold transition-all border border-slate-700/60 shadow-sm active:scale-95 flex items-center justify-center"
            >
              {digit}
            </button>
          ))}
          <button
            id="pin-btn-clear"
            onClick={handleClear}
            className="h-14 rounded-2xl bg-slate-800/40 hover:bg-slate-800 text-slate-400 hover:text-white text-xs font-medium transition-all border border-slate-800 active:scale-95 flex items-center justify-center"
          >
            Hapus
          </button>
          <button
            id="pin-btn-0"
            onClick={() => handleDigit('0')}
            className="h-14 rounded-2xl bg-slate-800/80 hover:bg-slate-700/80 active:bg-blue-600 text-white font-mono text-xl font-semibold transition-all border border-slate-700/60 shadow-sm active:scale-95 flex items-center justify-center"
          >
            0
          </button>
          <button
            id="pin-btn-backspace"
            onClick={handleDelete}
            className="h-14 rounded-2xl bg-slate-800/40 hover:bg-slate-800 text-slate-400 hover:text-white text-xs font-medium transition-all border border-slate-800 active:scale-95 flex items-center justify-center"
          >
            ⌫
          </button>
        </div>

        <div className="text-center">
          <span className="text-[11px] text-slate-400 flex items-center justify-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
            {correctPin === '1234' ? (
              <span className="text-amber-400/90 font-medium">PIN bawaan awal: 1234 (Dapat diubah di Pengaturan)</span>
            ) : (
              <span className="text-emerald-400 font-medium">PIN Dirahasiakan oleh Pemilik Akun</span>
            )}
          </span>
        </div>
      </div>
    </div>
  );
};
