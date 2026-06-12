import React, { useRef, useEffect } from 'react';

interface PriceChartProps {
  history: number[];
  basePrice: number;
}

const PriceChart: React.FC<PriceChartProps> = ({ history, basePrice }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const width = 110;
    const height = 40;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    ctx.scale(dpr, dpr);

    ctx.clearRect(0, 0, width, height);

    ctx.strokeStyle = '#f1f5f9';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, height / 2);
    ctx.lineTo(width, height / 2);
    ctx.stroke();

    const data = history && history.length > 0 ? history : [basePrice, basePrice, basePrice, basePrice, basePrice, basePrice, basePrice];
    const maxVal = Math.max(...data, basePrice * 1.5);
    const minVal = Math.min(...data, basePrice * 0.5);
    const range = maxVal - minVal === 0 ? 1 : maxVal - minVal;

    ctx.strokeStyle = '#2563eb';
    ctx.lineWidth = 2.0;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    ctx.beginPath();
    data.forEach((val, index) => {
      const x = (index / (data.length - 1)) * (width - 8) + 4;
      const y = height - ((val - minVal) / range) * (height - 10) - 5;
      if (index === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.stroke();

    const gradient = ctx.createLinearGradient(0, 0, 0, height);
    gradient.addColorStop(0, 'rgba(37, 99, 235, 0.20)');
    gradient.addColorStop(1, 'rgba(37, 99, 235, 0.0)');
    ctx.fillStyle = gradient;
    ctx.beginPath();
    data.forEach((val, index) => {
      const x = (index / (data.length - 1)) * (width - 8) + 4;
      const y = height - ((val - minVal) / range) * (height - 10) - 5;
      if (index === 0) { ctx.moveTo(x, height); ctx.lineTo(x, y); }
      else ctx.lineTo(x, y);
    });
    ctx.lineTo((data.length - 1) / (data.length - 1) * (width - 8) + 4, height);
    ctx.closePath();
    ctx.fill();

    const lastValue = data[data.length - 1];
    const lastX = (data.length - 1) / (data.length - 1) * (width - 8) + 4;
    const lastY = height - ((lastValue - minVal) / range) * (height - 10) - 5;

    ctx.beginPath();
    ctx.arc(lastX, lastY, 3.5, 0, 2 * Math.PI);
    ctx.fillStyle = '#ef4444';
    ctx.fill();
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 1.0;
    ctx.stroke();
  }, [history, basePrice]);

  return (
    <div className="flex flex-col items-center bg-[#fafaf9] border border-stone-200 rounded-lg p-1 shrink-0">
      <span className="text-[7.5px] text-stone-400 font-mono font-bold uppercase tracking-widest leading-none mb-0.5">7 Dias</span>
      <canvas ref={canvasRef} />
    </div>
  );
};

export default PriceChart;
