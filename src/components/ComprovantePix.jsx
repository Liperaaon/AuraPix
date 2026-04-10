import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, 
  Share2, 
  Copy, 
  CheckCircle2,
  ArrowDown,
  Landmark,
  User,
  ShieldCheck,
  Check,
  QrCode,
  FileText
} from 'lucide-react';

/**
 * DetalhesPix Component
 * Estilizado com a paleta AuraPix:
 * Primária: #6366F1 | Fundo: #020617 | Secundária: #0F172A | Destaque: #22C55E | Texto: #F8FAFC
 */
export default function App({ setView, transacao, tema = 'escuro' }) {
  const isLight = tema === 'claro';
  const [copiado, setCopiado] = useState(false);
  const [showContent, setShowContent] = useState(false);

  useEffect(() => {
    setShowContent(true);
  }, []);

  // AuraPix Palette Mapping
  const colors = {
    primary: '#6366F1',
    background: '#020617',
    secondary: '#0F172A',
    highlight: '#22C55E',
    text: '#F8FAFC',
    muted: 'rgba(248, 250, 252, 0.4)',
    border: 'rgba(248, 250, 252, 0.05)'
  };

  // Dinâmica de cores baseada na paleta
  const bgMain = isLight ? 'bg-[#F1F5F9]' : 'bg-[#020617]'; 
  const textMain = isLight ? 'text-[#0F172A]' : 'text-[#F8FAFC]';
  const bgCard = isLight ? 'bg-white' : 'bg-[#0F172A]';
  const borderColor = isLight ? 'border-[#E2E8F0]' : 'border-white/5'; 
  const textMuted = isLight ? 'text-[#64748B]' : 'text-[#F8FAFC]/40';

  // Dados da Transação
  const tx = transacao || {
    valor: 150.00,
    dataHora: "11/03/2026 - 14:35",
    pagador: {
      nome: "João da Silva",
      cpf: "***.123.***-45",
      banco: "Banco XPTO"
    },
    recebedor: {
      nome: "Maria Oliveira",
      cpf: "***.987.***-10",
      banco: "Nubank",
      chavePix: "maria@email.com"
    },
    idTransacao: "E123456789ABCDEF"
  };

  const formatMoney = (val) => val.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

  // Fallback para cópia em ambientes restritos
  const handleCopyId = () => {
    try {
      const textArea = document.createElement("textarea");
      textArea.value = tx.idTransacao;
      textArea.style.position = "fixed";
      textArea.style.left = "-9999px";
      textArea.style.top = "0";
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      const successful = document.execCommand('copy');
      document.body.removeChild(textArea);
      if (successful) {
        setCopiado(true);
        setTimeout(() => setCopiado(false), 2000);
      }
    } catch (err) {
      console.error('Erro ao copiar: ', err);
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Comprovante Pix Aura',
          text: `Comprovante de Transferência PIX\nValor: ${formatMoney(tx.valor)}\nPara: ${tx.recebedor.nome}`,
          url: window.location.href
        });
      } catch (err) { console.log('Compartilhamento cancelado'); }
    }
  };

  return (
    <div className={`flex flex-col h-[100dvh] ${bgMain} absolute inset-0 z-50 font-sans overflow-hidden transition-all duration-500`}>
      
      {/* HEADER DINÂMICO */}
      <header className={`pt-12 px-6 pb-4 flex items-center justify-between z-20 sticky top-0 backdrop-blur-xl ${isLight ? 'bg-white/80' : 'bg-[#020617]/80'}`}>
        <button 
          onClick={() => setView ? setView('extrato') : null} 
          className={`w-11 h-11 rounded-2xl flex items-center justify-center transition-all active:scale-90 ${isLight ? 'bg-white shadow-sm' : 'bg-[#0F172A] border border-white/5 hover:bg-white/10'}`}
        >
          <ArrowLeft size={22} className={textMain} />
        </button>
        <div className="flex flex-col items-center">
          <h2 className={`text-[10px] font-black uppercase tracking-[0.25em] ${textMuted}`}>Comprovante</h2>
          <div className="flex items-center gap-1">
             <div className="w-1.5 h-1.5 rounded-full bg-[#6366F1]"></div>
             <span className={`text-xs font-bold tracking-tight ${textMain}`}>AuraPix</span>
          </div>
        </div>
        <button 
          onClick={handleShare}
          className={`w-11 h-11 rounded-2xl flex items-center justify-center transition-all active:scale-90 ${isLight ? 'bg-white shadow-sm text-[#6366F1]' : 'bg-[#6366F1]/10 text-[#6366F1] border border-[#6366F1]/20'}`}
        >
          <Share2 size={20} />
        </button>
      </header>

      <main className={`flex-1 overflow-y-auto no-scrollbar px-6 pb-32 transition-all duration-1000 transform ${showContent ? 'translate-y-0 opacity-100' : 'translate-y-12 opacity-0'}`}>
        
        {/* HERO: STATUS & VALOR */}
        <div className="flex flex-col items-center py-10">
          <div className="relative mb-6">
            <div className="absolute inset-0 bg-[#22C55E] blur-3xl opacity-20 animate-pulse"></div>
            <div className="relative w-20 h-20 rounded-[2rem] bg-[#22C55E] flex items-center justify-center shadow-[0_15px_40px_rgba(34,197,94,0.3)] transform rotate-6 hover:rotate-0 transition-transform duration-500">
              <CheckCircle2 size={42} className="text-white -rotate-6 group-hover:rotate-0 transition-transform duration-500" />
            </div>
          </div>
          <p className={`text-[10px] font-black uppercase tracking-[0.3em] text-[#22C55E] mb-2`}>Transferência Realizada</p>
          <h1 className={`text-4xl font-black tracking-tighter ${textMain}`}>{formatMoney(tx.valor)}</h1>
          <p className={`text-xs font-medium ${textMuted} mt-2`}>{tx.dataHora}</p>
        </div>

        {/* COMPROVANTE TICKET */}
        <div className={`relative ${bgCard} border ${borderColor} rounded-[2.5rem] p-7 shadow-2xl mb-8 overflow-hidden`}>
          
          {/* DETALHES VISUAIS DE TICKET */}
          <div className={`absolute top-[170px] -left-5 w-10 h-10 rounded-full ${bgMain} border-r ${borderColor}`}></div>
          <div className={`absolute top-[170px] -right-5 w-10 h-10 rounded-full ${bgMain} border-l ${borderColor}`}></div>

          {/* SESSÃO: PAGADOR */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-5">
               <div className="w-10 h-10 rounded-xl bg-[#6366F1]/10 flex items-center justify-center border border-[#6366F1]/20">
                  <FileText size={18} className="text-[#6366F1]" />
               </div>
               <h3 className={`text-[11px] font-black uppercase tracking-widest text-[#6366F1]`}>Pagador</h3>
            </div>
            <div className="space-y-2 pl-2">
              <p className={`text-base font-bold tracking-tight ${textMain}`}>{tx.pagador.nome}</p>
              <div className="flex flex-col gap-0.5">
                <p className={`text-xs ${textMuted}`}>CPF: <span className={textMain}>{tx.pagador.cpf}</span></p>
                <p className={`text-xs ${textMuted}`}>Instituição: <span className={textMain}>{tx.pagador.banco}</span></p>
              </div>
            </div>
          </div>

          {/* DIVISOR DE FLUXO */}
          <div className="relative h-10 flex items-center justify-center my-4">
            <div className={`w-full border-t border-dashed ${borderColor}`}></div>
            <div className={`absolute w-9 h-9 rounded-full ${isLight ? 'bg-slate-50' : 'bg-[#020617]'} flex items-center justify-center border ${borderColor} shadow-inner`}>
              <ArrowDown size={16} className="text-[#6366F1]" />
            </div>
          </div>

          {/* SESSÃO: RECEBEDOR */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-5">
               <div className="w-10 h-10 rounded-xl bg-[#22C55E]/10 flex items-center justify-center border border-[#22C55E]/20">
                  <User size={18} className="text-[#22C55E]" />
               </div>
               <h3 className={`text-[11px] font-black uppercase tracking-widest text-[#22C55E]`}>Recebedor</h3>
            </div>
            <div className="space-y-2 pl-2">
              <p className={`text-base font-bold tracking-tight ${textMain}`}>{tx.recebedor.nome}</p>
              <div className="flex flex-col gap-0.5">
                <p className={`text-xs ${textMuted}`}>CPF/CNPJ: <span className={textMain}>{tx.recebedor.cpf}</span></p>
                <p className={`text-xs ${textMuted}`}>Instituição: <span className={textMain}>{tx.recebedor.banco}</span></p>
              </div>
              <div className={`mt-3 inline-flex items-center gap-2 px-3 py-1.5 rounded-xl ${isLight ? 'bg-emerald-50' : 'bg-[#22C55E]/5 border border-[#22C55E]/10'}`}>
                <ShieldCheck size={14} className="text-[#22C55E]" />
                <p className={`text-[11px] font-bold ${textMain}`}>Chave: {tx.recebedor.chavePix}</p>
              </div>
            </div>
          </div>

          <div className={`border-t border-dashed ${borderColor} pt-8 mt-4`}>
             <div className="flex items-center justify-between mb-4">
               <div className="flex items-center gap-2">
                 <QrCode size={16} className="text-[#6366F1]" />
                 <span className={`text-[10px] font-black uppercase tracking-[0.2em] ${textMuted}`}>Autenticação Digital</span>
               </div>
               <div className={`px-2 py-0.5 rounded bg-[#22C55E]/10 text-[#22C55E] text-[9px] font-black uppercase`}>Original</div>
             </div>
             
             {/* ID COPIÁVEL */}
             <div 
               onClick={handleCopyId}
               className={`p-4 rounded-2xl transition-all cursor-pointer group active:scale-[0.97] ${isLight ? 'bg-slate-50' : 'bg-[#020617] border border-white/5'}`}
             >
                <div className="flex items-center justify-between mb-2">
                  <span className={`text-[9px] font-black uppercase tracking-widest ${textMuted}`}>ID da Transação</span>
                  {copiado ? (
                    <div className="flex items-center gap-1 text-[#22C55E]">
                      <span className="text-[9px] font-black uppercase">Copiado</span>
                      <Check size={12} />
                    </div>
                  ) : (
                    <Copy size={12} className={`${textMuted} group-hover:text-[#6366F1] transition-colors`} />
                  )}
                </div>
                <p className={`text-[11px] font-mono font-bold break-all leading-relaxed ${copiado ? 'text-[#22C55E]' : textMain}`}>
                  {tx.idTransacao}
                </p>
             </div>
          </div>
        </div>

        {/* BADGE DE SEGURANÇA */}
        <div className="flex flex-col items-center justify-center gap-2 py-6 opacity-60">
           <Landmark size={20} className="text-[#6366F1]" />
           <p className={`text-[9px] font-black uppercase tracking-[0.3em] ${textMain}`}>Operação Segura AuraBank</p>
        </div>

      </main>

      {/* ACTION FOOTER */}
      <footer className={`fixed bottom-0 left-0 w-full p-8 pt-4 bg-gradient-to-t ${isLight ? 'from-[#F1F5F9]' : 'from-[#020617]'} to-transparent z-30`}>
        <button 
          onClick={handleShare}
          className="w-full h-16 rounded-[1.5rem] bg-[#6366F1] text-[#F8FAFC] font-black text-sm uppercase tracking-[0.2em] shadow-[0_20px_50px_rgba(99,102,241,0.4)] active:scale-[0.98] transition-all flex items-center justify-center gap-3 hover:brightness-110"
        >
          <Share2 size={20} />
          Compartilhar
        </button>
      </footer>
    </div>
  );
}