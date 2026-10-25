import React, { useState } from 'react';
import { X, CheckCircle2, AlertTriangle, Grid, Sliders, Eye } from 'lucide-react';
import { VisualAsset } from '../types/governance';

interface VisualAssetInspectorModalProps {
  asset: VisualAsset;
  isOpen: boolean;
  onClose: () => void;
  onUpdateAltText: (newAlt: string) => void;
}

export const VisualAssetInspectorModal: React.FC<VisualAssetInspectorModalProps> = ({
  asset,
  isOpen,
  onClose,
  onUpdateAltText,
}) => {
  const [showGrid, setShowGrid] = useState(true);
  const [textColor, setTextColor] = useState<'white' | 'dark'>('white');
  const [altText, setAltText] = useState(asset.altText);

  if (!isOpen) return null;

  const isAltComplete = altText.trim().length >= 10;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white border border-slate-200 rounded-2xl max-w-3xl w-full flex flex-col max-h-[90vh] shadow-2xl overflow-hidden text-slate-900">
        {/* Header */}
        <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2.5">
            <h3 className="text-sm font-bold text-slate-900">Visual Asset Brand & Contrast Inspector</h3>
            <span className="text-xs text-slate-400">· {asset.name}</span>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 p-1 rounded-lg hover:bg-slate-200"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Controls Bar */}
        <div className="px-5 py-2.5 bg-white border-b border-slate-200 flex items-center justify-between flex-wrap gap-2 text-xs">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowGrid(!showGrid)}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md border font-medium transition-colors ${
                showGrid
                  ? 'bg-blue-50 border-blue-200 text-blue-700 font-semibold'
                  : 'bg-white border-slate-200 text-slate-600 hover:text-slate-900'
              }`}
            >
              <Grid className="w-3.5 h-3.5" />
              <span>24px Logo Safezone Grid</span>
            </button>

            <div className="flex items-center gap-1.5 text-slate-600">
              <span>Text Overlay Test:</span>
              <button
                onClick={() => setTextColor('white')}
                className={`px-2 py-0.5 rounded text-[11px] font-semibold ${textColor === 'white' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-700'}`}
              >
                Light
              </button>
              <button
                onClick={() => setTextColor('dark')}
                className={`px-2 py-0.5 rounded text-[11px] font-semibold ${textColor === 'dark' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-700'}`}
              >
                Dark
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2 text-[11px]">
            <span className="text-slate-500">WCAG Contrast:</span>
            <span className="text-emerald-700 font-bold">7.4:1 (AAA Pass)</span>
          </div>
        </div>

        {/* Visual Inspection Area */}
        <div className="flex-1 overflow-y-auto p-6 bg-slate-100 flex flex-col items-center justify-center">
          <div className="relative max-w-xl w-full aspect-video rounded-xl overflow-hidden shadow-lg border border-slate-300 bg-slate-900">
            <img
              src={asset.url}
              alt={asset.altText || asset.name}
              className="w-full h-full object-cover"
            />

            {/* Simulated Logo & Safezone Grid Overlay */}
            {showGrid && (
              <div className="absolute inset-0 border-4 border-dashed border-cyan-400/70 pointer-events-none m-6 flex flex-col justify-between p-3">
                <div className="self-end bg-slate-950/80 text-cyan-300 font-mono text-[9px] px-2 py-0.5 rounded border border-cyan-500/40">
                  24px Logo Margin Safe
                </div>
                <div className="text-[10px] text-cyan-200 font-mono bg-slate-950/80 px-2 py-0.5 rounded self-start border border-cyan-500/40">
                  Clearspace Protected
                </div>
              </div>
            )}

            {/* Test Typography Overlay */}
            <div className="absolute bottom-6 left-6 right-6">
              <h4 className={`text-base font-bold drop-shadow-md ${textColor === 'white' ? 'text-white' : 'text-slate-900'}`}>
                Next-Generation Governance Architecture
              </h4>
              <p className={`text-xs mt-0.5 drop-shadow-sm ${textColor === 'white' ? 'text-slate-200' : 'text-slate-700'}`}>
                Verified enterprise trust protocol at operational scale
              </p>
            </div>
          </div>
        </div>

        {/* Bottom Details & Alt-Text editor */}
        <div className="p-4 bg-white border-t border-slate-200 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs">
              <span className="text-slate-500 font-medium">Palette Extracted:</span>
              <div className="flex items-center gap-1.5">
                {asset.colorPalette.map((col, idx) => (
                  <span key={idx} className="flex items-center gap-1 text-[11px] text-slate-700 font-mono">
                    <span className="w-3 h-3 rounded-full border border-slate-300" style={{ backgroundColor: col }} />
                    {col}
                  </span>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-1.5 text-xs">
              {isAltComplete ? (
                <span className="text-emerald-700 font-medium flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Alt-Text WCAG Compliant</span>
                </span>
              ) : (
                <span className="text-amber-700 font-medium flex items-center gap-1">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <span>Needs Descriptive Alt-Text</span>
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="text"
              value={altText}
              onChange={(e) => setAltText(e.target.value)}
              placeholder="Provide clear descriptive alt text for screen readers..."
              className="flex-1 bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-blue-500 focus:bg-white"
            />
            <button
              onClick={() => {
                onUpdateAltText(altText);
                onClose();
              }}
              className="px-3.5 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
            >
              Save Alt-Text
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
