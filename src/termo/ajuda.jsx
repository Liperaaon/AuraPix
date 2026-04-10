import React, { useState } from 'react';
import { 
  ArrowLeft, Search, MessageSquare, 
  Mail, ChevronRight, HelpCircle, ShieldCheck, 
  Zap, CreditCard, ChevronDown, Clock, Info, X
} from 'lucide-react';

export default function CentralAjuda({ setView = () => {}, tema = 'escuro' }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFaq, setSearchFaq] = useState(null);
  
  const isLight = tema === 'claro';
  const bgMain = isLight ? 'bg-white' : 'bg-[#020617]'; 
  const textMain = isLight ? 'text-[#0F172A]' : 'text-white';
  const textMuted = isLight ? 'text-slate-500' : 'text-slate-400';
  const borderColor = isLight ? 'border-slate-100' : 'border-white/5';
  const itemBg = isLight ? 'bg-slate-50/50' : 'bg-white/[0.02]';

  const faqData = [
    { cat: 'Pix', q: 'Como funciona o Pix Parcelado?', a: 'Tu envias o valor agora e pagas na tua próxima fatura em até 12x.' },
    { cat: 'Pix', q: 'O Pix é instantâneo?', a: 'Sim, as transferências via Pix caem na conta do destino em poucos segundos.' },
    { cat: 'Limite', q: 'Como aumentar o meu limite?', a: 'O aumento é automático conforme utilizas a app e pagas as faturas em dia.' },
    { cat: 'Segurança', q: 'Perdi o meu telemóvel, o que fazer?', a: 'Bloqueia a tua conta enviando um e-mail urgente para suporte@aurapix.com.br.' },
    { cat: 'Conta', q: 'A conta tem custo de manutenção?', a: 'Não, a conta Aura é 100% gratuita para sempre.' },
    { cat: 'Fatura', q: 'Onde vejo a minha fatura?', a: 'Podes consultar todos os detalhes na aba "Faturas" no ecrã principal.' },
  ].filter(p => 
    p.q.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.cat.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const toggleFaq = (index) => {
    setSearchFaq(activeFaq === index ? null : index);
  };

  return (
    <div className={`flex flex-col h-[100dvh] w-full ${bgMain} absolute inset-0 z-50 font-sans select-none overflow-hidden transition-colors duration-300`}>
      
      {/* HEADER SIMPLIFICADO */}
      <header className="pt-14 px-6 pb-4 flex items-center justify-between sticky top-0 z-30">
        <button 
          onClick={() => setView('profile')} 
          className={`w-10 h-10 rounded-full flex items-center justify-center active:scale-90 transition-all ${isLight ? 'bg-slate-100' : 'bg-white/5'}`}
        >
          <ArrowLeft size={22} className={textMain} />
        </button>
        <h2 className={`text-xs font-black uppercase tracking-[0.2em] opacity-40 ${textMain}`}>Ajuda</h2>
        <div className="w-10" />
      </header>

      <main className="flex-1 overflow-y-auto no-scrollbar px-6">
        
        {/* TITULO E BUSCA MINIMALISTA */}
        <div className="py-6">
          <h1 className={`text-3xl font-bold ${textMain} tracking-tight mb-8`}>
            Como podemos<br/>ajudar-te?
          </h1>
          
          <div className={`flex items-center gap-3 px-4 py-3 rounded-2xl ${itemBg} border ${borderColor} transition-all focus-within:border-indigo-500/50`}>
            <Search size={18} className="text-slate-500" />
            <input 
              type="text" 
              placeholder="Pesquisar..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`flex-1 bg-transparent border-none outline-none text-sm font-medium ${textMain} placeholder:opacity-30`}
            />
            {searchTerm && (
              <button onClick={() => setSearchTerm('')} className="p-1">
                <X size={16} className={textMuted} />
              </button>
            )}
          </div>
        </div>

        {/* LISTA DE TÓPICOS RÁPIDOS */}
        {!searchTerm && (
          <div className="py-4 space-y-1">
            <p className={`text-[10px] font-black uppercase tracking-widest ${textMuted} mb-4 opacity-60 px-1`}>Principais Tópicos</p>
            {[
              { label: 'Tudo sobre Pix', icon: Zap, color: 'text-indigo-500', search: 'Pix' },
              { label: 'Cartão e Fatura', icon: CreditCard, color: 'text-purple-500', search: 'Fatura' },
              { label: 'Minha Segurança', icon: ShieldCheck, color: 'text-emerald-500', search: 'Segurança' },
              { label: 'Configurações', icon: Info, color: 'text-slate-400', search: 'Conta' },
            ].map((item, i) => (
              <button 
                key={i} 
                onClick={() => setSearchTerm(item.search)}
                className={`w-full flex items-center justify-between py-4 px-2 active:opacity-50 transition-all border-b ${borderColor}`}
              >
                <div className="flex items-center gap-4">
                  <item.icon size={18} className={item.color} />
                  <span className={`text-sm font-bold ${textMain}`}>{item.label}</span>
                </div>
                <ChevronRight size={16} className="text-slate-600" />
              </button>
            ))}
          </div>
        )}

        {/* FAQ - ESTILO LISTA LIMPA */}
        <div className="py-8">
          <p className={`text-[10px] font-black uppercase tracking-widest ${textMuted} mb-4 opacity-60 px-1`}>
            {searchTerm ? `Resultados para "${searchTerm}"` : 'Dúvidas Frequentes'}
          </p>
          <div className="space-y-2">
            {faqData.map((item, i) => (
              <div key={i} className={`border-b ${borderColor} last:border-0`}>
                <button 
                  onClick={() => toggleFaq(i)}
                  className="w-full py-5 flex items-center justify-between text-left active:opacity-60"
                >
                  <span className={`text-sm font-bold pr-6 leading-tight ${textMain}`}>{item.q}</span>
                  <ChevronDown size={16} className={`shrink-0 text-slate-600 transition-transform ${activeFaq === i ? 'rotate-180' : ''}`} />
                </button>
                {activeFaq === i && (
                  <div className="pb-5 animate-in fade-in slide-in-from-top-1">
                    <p className={`text-xs leading-relaxed ${textMuted}`}>{item.a}</p>
                  </div>
                )}
              </div>
            ))}
            {faqData.length === 0 && (
              <p className={`text-xs ${textMuted} py-10 text-center`}>Nenhum resultado encontrado.</p>
            )}
          </div>
        </div>

        {/* CANAIS DE CONTATO */}
        <div className="py-10 space-y-4">
          <button 
            onClick={() => window.location.href = 'mailto:suporte@aurapix.com.br'}
            className="w-full py-5 rounded-2xl bg-indigo-600 flex items-center justify-center gap-3 active:scale-[0.98] transition-all shadow-lg shadow-indigo-500/10"
          >
            <Mail size={18} className="text-white" />
            <span className="text-xs font-black text-white uppercase tracking-widest">Enviar E-mail</span>
          </button>
          
          <div className="flex flex-col items-center gap-1 opacity-40 py-2">
             <div className="flex items-center gap-2">
               <Clock size={12} className={textMuted} />
               <span className={`text-[9px] font-black uppercase tracking-widest ${textMuted}`}>Chat Aura: Em breve</span>
             </div>
          </div>
        </div>

        {/* RODAPÉ COM ASSINATURA */}
        <div className="pb-12 text-center flex flex-col gap-1 items-center">
          <p className={`text-[9px] font-bold ${textMuted} opacity-20 uppercase tracking-[0.4em]`}>Liberta Aura • 2026</p>
          <p className={`text-[8px] font-medium ${textMuted} opacity-20 uppercase tracking-[0.2em]`}>desenvolvido por primestudios 2026</p>
        </div>

      </main>
    </div>
  );
}