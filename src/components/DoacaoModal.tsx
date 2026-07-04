import { useState } from 'react';

interface Props {
  onClose: () => void;
}

const PIX_KEY = '85863335068';

export default function DoacaoModal({ onClose }: Props) {
  const [copied, setCopied] = useState(false);

  function copyKey() {
    navigator.clipboard.writeText(PIX_KEY).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="bg-amber-50 rounded-2xl shadow-2xl w-full max-w-sm p-6 flex flex-col items-center gap-4">
        <div className="flex items-center justify-between w-full">
          <h2 className="text-xl font-bold text-amber-900">☕ Apoiar o Jogo</h2>
          <button onClick={onClose} className="text-amber-700 hover:text-amber-900 text-2xl leading-none">✕</button>
        </div>

        <p className="text-sm text-amber-800 text-center">
          Se você curtiu o jogo, considere fazer uma doação via PIX. Cada contribuição ajuda a manter o servidor e adicionar novos conteúdos!
        </p>

        <img
          src="/pix-qr.png"
          alt="QR Code PIX"
          className="w-48 h-48 object-contain rounded-xl border-2 border-amber-200 bg-white p-2"
        />

        <div className="w-full">
          <p className="text-xs text-amber-700 mb-1 text-center">Ou copie a chave PIX:</p>
          <div className="flex items-center gap-2 bg-white border border-amber-300 rounded-xl px-3 py-2">
            <span className="flex-1 text-sm font-mono text-amber-900 select-all">{PIX_KEY}</span>
            <button
              onClick={copyKey}
              className="text-xs bg-amber-500 hover:bg-amber-600 text-white px-3 py-1 rounded-lg font-semibold transition-colors"
            >
              {copied ? '✓ Copiado' : 'Copiar'}
            </button>
          </div>
        </div>

        <p className="text-xs text-amber-600 text-center">Muito obrigado pelo apoio! 💛</p>
      </div>
    </div>
  );
}
