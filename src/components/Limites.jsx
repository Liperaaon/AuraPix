import React from 'react';
import { 
  ArrowLeft, ShieldCheck, Zap, ShoppingBag, 
  Info, TrendingUp, AlertCircle, ChevronRight 
} from 'lucide-react';

export default function Limites({ user, setView, tema }) {
  const isLight = tema === 'claro';
  const bgMain = isLight ? 'bg-[#F8FAFC]' : 'bg-[#020617]'; 
  const textMain = isLight ? 'text-[#0F172A]' : 'text-white';
  const bgCard = isLight ? 'bg-white' : 'bg-[#0F172A]';
  const borderColor = isLight ? 'border-[#E2E8F0]' : 'border-white/5'; 
  const textMuted = isLight ? 'text-[#64748B]' : 'text-white/50';
  const textLabel = isLight ? 'text-[#94A3B8]' : 'text-white/40';

  const formatMoney = (val) => val.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

// 🚀 SINCRONIZAÇÃO REAL COM O DASHBOARD (FIREBASE)
  const limites = [
    { 
      id: 'pix', 
      label: 'Limite Pix', 
      total: user?.limites?.pix || 0, // Inicia zerado até a aprovação
      usado: 0, // No futuro, isso pode ser calculado das transações
      icon: Zap, 
      color: 'bg-indigo-500' 
    },
    { 
      id: 'compras', 
      label: 'Limite de Compras', 
      total: user?.limites?.compras || 0, // Inicia zerado até a aprovação
      usado: 0, 
      icon: ShoppingBag, 
      color: 'bg-emerald-500' 
    }
  ];

  return (
    <div className={`flex-1 flex flex-col h-[100dvh] ${bgMain} absolute inset-0 z-50 animate-in slide-in-from-right duration-300`}>
      
      {/* CABEÇALHO */}
      <header className={`pt-14 px-4 pb-4 flex items-center justify-between z-20 sticky top-0 ${isLight ? 'bg-[#F8FAFC]/90' : 'bg-[#020617]/90'} backdrop-blur-md border-b ${borderColor}`}>
        <button onClick={() => setView('home')} className={`w-12 h-12 rounded-full flex items-center justify-center ${isLight ? 'active:bg-slate-200/50' : 'active:bg-white/5'}`}>
          <ArrowLeft size={24} className={textMain} />
        </button>
        <h2 className={`text-[11px] font-black uppercase tracking-[0.3em] ${textMain}`}>Meus Limites</h2>
        <div className="w-12" />
      </header>

      <main className="flex-1 overflow-y-auto no-scrollbar p-6">
        
        <div className="mb-10 text-center">
          <div className={`w-16 h-16 rounded-[1.5rem] ${bgCard} border ${borderColor} flex items-center justify-center mx-auto mb-4 shadow-xl`}>
            <ShieldCheck size={32} className="text-indigo-500" />
          </div>
          <h3 className={`text-2xl font-black ${textMain}`}>Gestão Aura {user?.tier}</h3>
          <p className={`text-xs ${textMuted} mt-2`}>Consulte e gerencie seus limites de crédito disponíveis.</p>
        </div>

        <div className="space-y-6">
          {limites.map((limite) => {
            // Cálculo dinâmico da porcentagem da barra
            const porcentagemUsada = (limite.usado / limite.total) * 100;
            const disponivel = limite.total - limite.usado;

            return (
              <div key={limite.id} className={`p-6 rounded-[2.5rem] ${bgCard} border ${borderColor} shadow-sm`}>
                <div className="flex justify-between items-start mb-6">
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-2xl ${limite.color}/10 flex items-center justify-center`}>
                      <limite.icon size={22} className={limite.color.replace('bg-', 'text-')} />
                    </div>
                    <div>
                      <span className={`text-[10px] font-black uppercase tracking-widest ${textLabel} block mb-1`}>{limite.label}</span>
                      <span className={`text-xl font-black ${textMain}`}>{formatMoney(disponivel)}</span>
                    </div>
                  </div>
                </div>

                {/* BARRA DE PROGRESSO SINCRONIZADA */}
                <div className="space-y-3">
                  <div className={`h-2.5 w-full ${isLight ? 'bg-slate-100' : 'bg-white/5'} rounded-full overflow-hidden`}>
                    <div 
                      className={`h-full ${limite.color} transition-all duration-1000`} 
                      style={{ width: `${porcentagemUsada === 0 ? '5%' : `${porcentagemUsada}%`}` }} 
                    />
                  </div>
                  <div className="flex justify-between items-center">
                    <span className={`text-[9px] font-bold ${textMuted} uppercase tracking-tighter`}>Utilizado: {formatMoney(limite.usado)}</span>
                    <span className={`text-[9px] font-bold ${textMuted} uppercase tracking-tighter`}>Total: {formatMoney(limite.total)}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* AVISO INTELIGENTE */}
        <div className={`mt-8 p-6 rounded-[2.5rem] ${isLight ? 'bg-indigo-50' : 'bg-indigo-500/5'} border border-indigo-500/10 flex items-start gap-4`}>
          <div className="w-10 h-10 rounded-full bg-indigo-500/20 flex items-center justify-center shrink-0">
            <TrendingUp size={18} className="text-indigo-500" />
          </div>
          <p className={`text-[10px] font-bold leading-relaxed ${textMuted}`}>
            A Aura analisa seu comportamento financeiro. Pagar faturas em dia e utilizar o Pix frequentemente ajuda nosso motor de crédito a aumentar seus limites automaticamente.
          </p>
        </div>

      </main>
    </div>
  );
}