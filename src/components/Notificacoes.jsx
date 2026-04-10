import React, { useEffect, useState, useRef } from 'react';
import { 
  Bell, CheckCircle2, AlertCircle, X, Zap, Info, ShieldAlert,
  Send, DollarSign, RefreshCcw, Smartphone, MapPin, Key,
  Mail, CalendarClock, CreditCard, FileText, Repeat, Lock, AlertTriangle
} from 'lucide-react';

// ==========================================
// CONSTANTES MOVIDAS PARA FORA (PERFORMANCE)
// Evita a recriação destes objetos a cada render/movimento de swipe
// ==========================================
const ICONES_MAP = {
  sucesso: CheckCircle2,
  erro: AlertCircle,
  aviso: AlertTriangle,
  permissao: Bell,
  info: Info,
  pix: Zap,
  pix_enviado: Send,
  pagamento_realizado: DollarSign,
  estorno_realizado: RefreshCcw,
  fatura_proxima: CalendarClock,
  fatura_fechada: CreditCard,
  boleto_amanha: FileText,
  cobranca_recorrente: Repeat,
  login_novo_dispositivo: Smartphone,
  login_nova_localizacao: MapPin,
  alteracao_senha: Key,
  troca_celular: Smartphone,
  acesso_suspeito: ShieldAlert,
  email_alterado: Mail
};

const CORES_MAP = {
  sucesso: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
  erro: 'bg-red-500/10 text-red-500 border-red-500/20',
  aviso: 'bg-orange-500/10 text-orange-500 border-orange-500/20',
  permissao: 'bg-indigo-600 text-white border-indigo-500/50 shadow-indigo-600/30',
  info: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
  pix: 'bg-indigo-500/10 text-indigo-500 border-indigo-500/20',
  pix_enviado: 'bg-indigo-500/10 text-indigo-500 border-indigo-500/20',
  pagamento_realizado: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
  estorno_realizado: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
  fatura_proxima: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
  fatura_fechada: 'bg-indigo-500/10 text-indigo-500 border-indigo-500/20',
  boleto_amanha: 'bg-orange-500/10 text-orange-500 border-orange-500/20',
  cobranca_recorrente: 'bg-indigo-500/10 text-indigo-500 border-indigo-500/20',
  login_novo_dispositivo: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
  login_nova_localizacao: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
  alteracao_senha: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
  troca_celular: 'bg-orange-500/10 text-orange-500 border-orange-500/20',
  acesso_suspeito: 'bg-red-500/10 text-red-500 border-red-500/30 shadow-[0_0_20px_rgba(239,68,68,0.25)]',
  email_alterado: 'bg-blue-500/10 text-blue-500 border-blue-500/20'
};

// ==========================================
// COMPONENTE: ITEM DE NOTIFICAÇÃO (TOAST)
// ==========================================
const ToastItem = ({ notificacao, onClose, isLight }) => {
  const [isLeaving, setIsLeaving] = useState(false);
  const [isPaused, setIsPaused] = useState(false); // NOVO: Pausa ao tocar/passar o rato
  
  // Lógica de Swipe (Arrastar para os lados para fechar)
  const [startX, setStartX] = useState(0);
  const [translateX, setTranslateX] = useState(0);

  // Gestão inteligente do temporizador
  useEffect(() => {
    if (notificacao.tipo === 'permissao' || isPaused) return;

    const timer = setTimeout(() => {
      iniciarFechamento();
    }, notificacao.duracao || 5000); 

    return () => clearTimeout(timer);
  }, [isPaused, notificacao]);

  const iniciarFechamento = () => {
    setIsLeaving(true);
    setTimeout(onClose, 300); // Aguarda a animação CSS terminar antes de remover do DOM
  };

  // Eventos de Toque (Mobile) e Rato (Desktop)
  const handleStart = (clientX) => {
    setStartX(clientX);
    setIsPaused(true); // Pausa a barra de progresso
  };

  const handleMove = (clientX) => {
    if (!startX) return;
    const diff = clientX - startX;
    setTranslateX(diff);
  };

  const handleEnd = () => {
    setIsPaused(false); // Retoma a barra de progresso
    if (Math.abs(translateX) > 80) {
      iniciarFechamento(); 
    } else {
      setTranslateX(0); // Faz "snap" de volta ao normal
    }
    setStartX(0);
  };

  const Icone = ICONES_MAP[notificacao.tipo] || Info;
  const cores = CORES_MAP[notificacao.tipo] || 'bg-slate-500/10 text-slate-500 border-slate-500/20';
  
  const isPermissao = notificacao.tipo === 'permissao';
  const isPerigo = notificacao.tipo === 'acesso_suspeito' || notificacao.tipo === 'erro';

  // Função de segurança para renderizar texto (evita o erro de React child object)
  const renderSeguro = (val) => {
    if (val == null) return '';
    if (typeof val === 'object') return val.message || JSON.stringify(val);
    return String(val);
  };

  // Cálculo visual para a rotação orgânica baseada no swipe
  const rotation = translateX * 0.05;

  return (
    <div 
      // Suporte para Mobile (Toque)
      onTouchStart={(e) => handleStart(e.touches[0].clientX)}
      onTouchMove={(e) => handleMove(e.touches[0].clientX)}
      onTouchEnd={handleEnd}
      // Suporte para Web/Desktop (Rato)
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      
      role="alert"
      aria-live="assertive"
      style={{ 
        transform: `translateX(${translateX}px) scale(${isLeaving ? 0.9 : 1}) rotate(${rotation}deg)`,
        opacity: isLeaving ? 0 : 1 - (Math.abs(translateX) / 200),
        transition: translateX === 0 ? 'all 0.3s cubic-bezier(0.25, 1, 0.5, 1)' : 'none'
      }}
      className={`
        w-full p-4 rounded-[1.5rem] border shadow-2xl flex items-center gap-4 pointer-events-auto
        backdrop-blur-xl relative overflow-hidden cursor-grab active:cursor-grabbing
        animate-in slide-in-from-top-4 fade-in duration-500
        ${isPermissao ? 'bg-indigo-600 shadow-indigo-600/30 border-indigo-500' : 
         (isPerigo ? (isLight ? 'bg-white/95 border-red-200' : 'bg-[#1E0F14]/95 border-red-900/50') : 
         (isLight ? 'bg-white/95 border-slate-200' : 'bg-[#0F172A]/95 border-white/10'))}
      `}
    >
      {/* Barra de Progresso no Fundo (Pausa quando o utilizador toca) */}
      {!isPermissao && (
        <div className="absolute bottom-0 left-0 h-1 bg-black/10 dark:bg-white/10 w-full">
          <div 
            className="h-full bg-current opacity-30" 
            style={{ 
              animation: `shrinkAura ${(notificacao.duracao || 5000)}ms linear forwards`,
              animationPlayState: isPaused ? 'paused' : 'running'
            }} 
          />
        </div>
      )}

      {/* Ícone */}
      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 border ${cores} ${isPermissao ? 'bg-white/20 border-white/10 shadow-inner' : ''}`}>
        <Icone size={24} className={isPermissao ? 'text-white' : ''} />
      </div>
      
      {/* Texto */}
      <div className="flex-1 min-w-0">
        <p className={`text-[10px] font-black uppercase tracking-widest ${isPermissao ? 'text-white/70' : (isPerigo ? 'text-red-500' : (isLight ? 'text-slate-500' : 'text-slate-400'))} truncate`}>
          {renderSeguro(notificacao.titulo)}
        </p>
        <p className={`text-sm font-bold leading-tight ${isPermissao ? 'text-white' : (isLight ? 'text-slate-800' : 'text-slate-200')} mt-0.5`}>
          {renderSeguro(notificacao.mensagem)}
        </p>
      </div>

      {/* Botões de Ação */}
      {isPermissao ? (
        <button 
          onClick={() => {
            if (notificacao.onAction) notificacao.onAction();
            iniciarFechamento();
          }}
          className="px-4 py-2 rounded-xl bg-white text-indigo-600 font-black text-xs uppercase tracking-widest shadow-lg active:scale-95 transition-all shrink-0"
        >
          Permitir
        </button>
      ) : (
        <button onClick={iniciarFechamento} className="p-2 active:scale-90 transition-transform shrink-0">
          <X size={18} className={isLight ? 'text-slate-400' : 'text-slate-500 hover:text-white'} />
        </button>
      )}
    </div>
  );
};

// ==========================================
// COMPONENTE WRAPPER PRINCIPAL
// ==========================================
export default function Notificacoes({ lista = [], setNotificacoes, tema }) {
  const isLight = tema === 'claro';

  const removerNotificacao = (id) => {
    setNotificacoes(prev => prev.filter(n => n.id !== id));
  };

  // Limita o número máximo de notificações visíveis no ecrã para evitar inundação (max 3)
  const notificacoesVisiveis = lista.slice(-3);

  return (
    <>
      {/* Animação CSS global para a barra de progresso (Injetada apenas uma vez) */}
      <style>{`
        @keyframes shrinkAura {
          from { width: 100%; }
          to { width: 0%; }
        }
      `}</style>

      <div className="fixed top-2 left-0 right-0 z-[200] px-4 pt-[env(safe-area-inset-top,1rem)] pointer-events-none flex flex-col gap-3 max-w-md mx-auto">
        {notificacoesVisiveis.map((notificacao) => (
          <ToastItem 
            key={notificacao.id} 
            notificacao={notificacao} 
            onClose={() => removerNotificacao(notificacao.id)} 
            isLight={isLight} 
          />
        ))}
      </div>
    </>
  );
}