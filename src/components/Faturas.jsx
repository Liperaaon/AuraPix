import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, CreditCard, ChevronRight, 
  Download, History, CheckCircle2, 
  Loader2, Sparkles, AlertCircle, PieChart,
  Copy, Barcode, QrCode, TrendingUp, Landmark, ShieldCheck,
  User
} from 'lucide-react';

export default function Faturas({ user, setView, tema }) {
  /**
   * ESTADOS DE NAVEGAÇÃO INTERNA
   * 'main' -> Tela principal da fatura
   * 'resumo' -> O que pegou vs o que deve
   * 'historico' -> Faturas pagas anteriormente
   * 'payout' -> Seleção de método (Pix ou Boleto)
   * 'payout-pix' -> Detalhes do Pix Copia e Cola
   * 'payout-boleto' -> Detalhes do Boleto Bancário
   */
  const [faturaStep, setFaturaStep] = useState('main');
  const [loading, setLoading] = useState(true);
  const [dadosMotor, setDadosMotor] = useState(null);

  // 🚀 NOVOS ESTADOS PARA O PIX DO ASAAS
  const [pixData, setPixData] = useState(null);
  const [loadingPix, setLoadingPix] = useState(false);
  const [erroPix, setErroPix] = useState('');

  // Variáveis de Estilização Dinâmica (Tema)
  const isLight = tema === 'claro';
  const bgMain = isLight ? 'bg-[#F8FAFC]' : 'bg-[#020617]'; 
  const textMain = isLight ? 'text-[#0F172A]' : 'text-white';
  const bgCard = isLight ? 'bg-white' : 'bg-[#0F172A]';
  const borderColor = isLight ? 'border-[#E2E8F0]' : 'border-white/5'; 
  const textMuted = isLight ? 'text-[#64748B]' : 'text-white/50';
  const textLabel = isLight ? 'text-[#94A3B8]' : 'text-white/40';

  const formatMoney = (val) => val?.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) || 'R$ 0,00';

  /**
   * INTEGRAÇÃO COM O MOTOR DO SERVER.JS
   */
  const buscarDadosFatura = async () => {
    setLoading(true);
    try {
      const API_URL = import.meta.env.VITE_API_URL;
      const response = await fetch(`${API_URL}/api/credito/simular`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          uid: user?.uid || "ID_TESTE",
          valor: user?.fatura?.valorAtual || 450.90,
          dias: 15 // Simulando pagamento antecipado (metade do ciclo)
        })
      });
      const data = await response.json();
      if (data.success) {
        setDadosMotor(data);
      }
    } catch (error) {
      console.error("Erro ao conectar com o Liberta Server:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    buscarDadosFatura();
  }, []);

  /**
   * 🚀 GERAR PIX DINÂMICO VIA ASAAS
   */
  const handleGerarPix = async () => {
    setFaturaStep('payout-pix'); // Muda a tela
    setLoadingPix(true);
    setErroPix('');
    setPixData(null);

    // Pega o valor total simulado pelo motor ou o valor atual da fatura
    const valorPagar = dadosMotor?.valores?.totalAPagar || user?.fatura?.valorAtual || 0;

    if (valorPagar <= 0) {
        setErroPix('Sua fatura está zerada.');
        setLoadingPix(false);
        return;
    }

    try {
      const API_URL = import.meta.env.VITE_API_URL;
      const response = await fetch(`${API_URL}/api/pagamentos/gerar-pix`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          uid: user?.uid,
          valor: valorPagar,
          descricao: `Pagamento Fatura Liberta - ${user?.nome}`
        })
      });

      const data = await response.json();
      
      if (data.success) {
        setPixData({
          qrCode: data.qrCodeBase64,
          copiaECola: data.copiaECola,
          cobrancaId: data.cobrancaId
        });
      } else {
        setErroPix(data.error || 'Não foi possível gerar a cobrança.');
      }
    } catch (error) {
      console.error("Erro ao gerar Pix:", error);
      setErroPix('Falha na comunicação com o servidor.');
    } finally {
      setLoadingPix(false);
    }
  };

  /**
   * RENDER: TELA DE RESUMO (O QUE PEGOU VS O QUE DEVE)
   */
const renderResumo = () => {
    // 🛡️ PROTEÇÃO: Se transacoes não existir, assume um array vazio
    const ultimaTransacao = user?.transacoes?.[0];

    return (
      <div className="flex-1 flex flex-col px-6 pt-4 animate-in slide-in-from-right duration-300">
        <div className="mb-8">
          <h3 className={`text-2xl font-black ${textMain} mb-2`}>Resumo Aura</h3>
          <p className={`text-xs ${textMuted}`}>Entenda a composição do seu crédito no Liberta.</p>
        </div>
        
        <div className="space-y-4">
          {/* 👤 CARD: DESTINATÁRIO (Com fallback caso esteja vazio) */}
          <div className={`p-6 rounded-[2.5rem] ${bgCard} border ${borderColor} shadow-sm flex items-center gap-4`}>
            <div className="w-12 h-12 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-500 border border-emerald-500/20">
              <User size={22} />
            </div>
            <div>
              <span className={`text-[10px] font-black uppercase tracking-widest ${textLabel} block mb-1`}>Enviado para</span>
              <p className={`text-sm font-black ${textMain}`}>
                {/* 🛡️ O uso do ?. evita que o app quebre se não houver dados */}
                {ultimaTransacao?.recebedor?.nome || "Nenhuma transação recente"}
              </p>
              <p className={`text-[9px] font-bold ${textMuted} uppercase`}>
                {ultimaTransacao?.recebedor?.banco || "Aguardando primeiro Pix"}
              </p>
            </div>
          </div>

          {/* 💸 CARD: VALOR ENVIADO */}
          <div className={`p-6 rounded-[2.5rem] ${bgCard} border ${borderColor} shadow-sm relative overflow-hidden`}>
            <div className="absolute top-0 right-0 p-4 opacity-10"><TrendingUp size={40} className="text-indigo-500" /></div>
            <span className={`text-[10px] font-black uppercase tracking-widest ${textLabel} block mb-2`}>Valor Enviado (Pix)</span>
            <h4 className={`text-3xl font-black ${textMain}`}>
              {/* Mostra o valor da transação ou o valor da simulação do motor */}
              {ultimaTransacao ? formatMoney(Math.abs(ultimaTransacao.valor)) : formatMoney(dadosMotor?.valores?.principal || 0)}
            </h4>
            <p className={`text-[10px] ${textMuted} mt-2 font-bold uppercase`}>Valor original contratado</p>
          </div>

          {/* 🏛️ CARD: TOTAL DA FATURA */}
          <div className={`p-6 rounded-[2.5rem] bg-indigo-600 shadow-xl shadow-indigo-600/20 relative overflow-hidden`}>
            <div className="absolute top-0 right-0 p-4 opacity-20"><Landmark size={40} className="text-white" /></div>
            <span className="text-[10px] font-black uppercase tracking-widest text-white/60 block mb-2">Total a Pagar na Fatura</span>
            <h4 className="text-3xl font-black text-white">
              {formatMoney(dadosMotor?.valores?.totalAPagar || 0)}
            </h4>
            <div className="mt-4 pt-4 border-t border-white/10 flex justify-between items-center text-[9px] font-black text-white/50 uppercase">
              <span>Inclui Juros + IOF</span>
              <div className="flex items-center gap-1 bg-white/10 px-2 py-1 rounded-lg">
                <ShieldCheck size={10} className="text-white" />
                <span>Cálculo Pro-Rata</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  /**
   * RENDER: SELEÇÃO DE MÉTODO DE PAGAMENTO
   */
  const renderPayoutSelection = () => (
    <div className="flex-1 flex flex-col px-6 pt-4 animate-in slide-in-from-bottom duration-300">
      <h3 className={`text-2xl font-black ${textMain} mb-2`}>Como quer pagar?</h3>
      <p className={`text-xs ${textMuted} mb-8`}>Escolha a melhor opção para quitar sua fatura.</p>
      
      <div className="space-y-4">
        <button 
          onClick={handleGerarPix} 
          className={`w-full p-6 rounded-[2.5rem] ${bgCard} border ${borderColor} flex items-center justify-between active:scale-[0.98] transition-all group`}
        >
          <div className="flex items-center gap-4 text-left">
            <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-500">
              <QrCode size={24} />
            </div>
            <div>
              <span className={`text-sm font-black ${textMain} block`}>Pix Copia e Cola</span>
              <span className={`text-[10px] ${textMuted} font-bold uppercase`}>Compensação imediata</span>
            </div>
          </div>
          <ChevronRight size={20} className={textLabel} />
        </button>

        <button 
          onClick={() => setFaturaStep('payout-boleto')}
          className={`w-full p-6 rounded-[2.5rem] ${bgCard} border ${borderColor} flex items-center justify-between active:scale-[0.98] transition-all group`}
        >
          <div className="flex items-center gap-4 text-left">
            <div className="w-12 h-12 rounded-2xl bg-orange-500/10 flex items-center justify-center text-orange-500">
              <Barcode size={24} />
            </div>
            <div>
              <span className={`text-sm font-black ${textMain} block`}>Boleto Bancário</span>
              <span className={`text-[10px] ${textMuted} font-bold uppercase`}>Até 3 dias úteis</span>
            </div>
          </div>
          <ChevronRight size={20} className={textLabel} />
        </button>
      </div>
    </div>
  );

  /**
   * RENDER: TELA PRINCIPAL (MAIN)
   */
  const renderMain = () => (
    <div className="flex-1 flex flex-col animate-in fade-in duration-500">
      
      {/* CARD PREMIUM COM VALOR DA FATURA */}
      <section className="px-6 pt-6 mb-8">
        <div className={`p-8 rounded-[2.5rem] bg-gradient-to-br ${isLight ? 'from-slate-800 to-slate-900' : 'from-[#1E293B] to-[#0F172A]'} shadow-2xl relative overflow-hidden border ${borderColor}`}>
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>
          
          <div className="flex justify-between items-start mb-8 text-white">
            <div>
              <span className="text-[10px] font-black uppercase opacity-40 tracking-[0.2em] block mb-2">
                Fatura Aura {user?.tier || 'Platinum'}
              </span>
              {loading ? (
                <Loader2 className="animate-spin opacity-20" size={24} />
              ) : (
                <h2 className="text-5xl font-black tracking-tighter">
                  {formatMoney(dadosMotor?.valores?.totalAPagar)}
                </h2>
              )}
            </div>
            <div className="bg-orange-500/20 border border-orange-500/30 px-3 py-1.5 rounded-2xl flex items-center gap-2 shadow-inner">
               <AlertCircle size={12} className="text-orange-400" />
               <span className="text-[9px] font-black uppercase text-orange-400">Fecha em 03/03</span>
            </div>
          </div>

          {/* INDICADOR DE ECONOMIA (DO MOTOR SERVER) */}
          {!loading && dadosMotor?.inteligencia?.descontoAntecipacao > 0 && (
            <div className="flex items-center gap-2 mb-4 bg-emerald-500/10 border border-emerald-500/20 p-4 rounded-[1.8rem] shadow-sm">
               <Sparkles size={14} className="text-emerald-500" />
               <p className="text-[10px] font-bold text-emerald-400 uppercase tracking-tight leading-tight">
                 {dadosMotor.inteligencia.mensagem}
               </p>
            </div>
          )}

          <div className="flex justify-between items-center text-[10px] font-bold text-white/40 uppercase tracking-widest border-t border-white/5 pt-4">
            <span>Vencimento: {user?.fatura?.vencimento || '10/03'}</span>
            <span className="text-indigo-400 font-black">Aura Liberta</span>
          </div>
        </div>
      </section>

      {/* BOTÃO HISTÓRICO */}
      <section className="px-6 mb-8">
        <button 
          onClick={() => setFaturaStep('historico')}
          className={`w-full p-6 rounded-[2.5rem] ${bgCard} border ${borderColor} shadow-sm flex items-center justify-between active:scale-[0.98] transition-all group`}
        >
          <div className="flex items-center gap-4 text-left">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${isLight ? 'bg-indigo-50' : 'bg-indigo-500/10'}`}>
              <History size={22} className="text-indigo-500" />
            </div>
            <div className="text-left">
              <span className={`text-sm font-black ${textMain} block`}>Histórico de Pagamentos</span>
              <span className={`text-[10px] ${textMuted} font-bold uppercase tracking-widest`}>Ver faturas pagas</span>
            </div>
          </div>
          <ChevronRight size={20} className={textLabel} />
        </button>
      </section>

      {/* BOTÕES DE AÇÃO: PAGAR E RESUMO */}
      <section className="px-6 grid grid-cols-2 gap-4 mb-10">
        <button 
          onClick={() => setFaturaStep('payout')}
          className="flex flex-col items-center justify-center gap-3 p-6 rounded-[2.5rem] bg-indigo-600 text-white shadow-xl shadow-indigo-600/20 active:scale-95 transition-all"
        >
          <CreditCard size={24} />
          <span className="text-[10px] font-black uppercase tracking-widest">Pagar Fatura</span>
        </button>
        <button 
          onClick={() => setFaturaStep('resumo')}
          className={`flex flex-col items-center justify-center gap-3 p-6 rounded-[2.5rem] ${bgCard} border ${borderColor} ${textMain} active:scale-95 transition-all shadow-sm`}
        >
          <PieChart size={24} className="text-indigo-500" />
          <span className="text-[10px] font-black uppercase tracking-widest">Ver Resumo</span>
        </button>
      </section>
    </div>
  );

  return (
    <div className={`flex-1 flex flex-col h-[100dvh] ${bgMain} absolute inset-0 z-40 transition-colors duration-500 overflow-hidden`}>
      
      {/* HEADER DINÂMICO */}
      <header className={`pt-14 px-4 pb-4 flex items-center justify-between z-20 sticky top-0 ${isLight ? 'bg-[#F8FAFC]/90 border-[#E2E8F0]' : 'bg-[#020617]/90 border-white/5'} backdrop-blur-md border-b`}>
        <button 
          onClick={() => {
            if (faturaStep === 'main') setView('home');
            else if (faturaStep.startsWith('payout-')) setFaturaStep('payout');
            else setFaturaStep('main');
          }} 
          className={`w-12 h-12 rounded-full flex items-center justify-center ${isLight ? 'active:bg-slate-200/50' : 'active:bg-white/5'}`}
        >
          <ArrowLeft size={24} className={textMain} />
        </button>
        <h2 className={`text-[11px] font-black uppercase tracking-[0.3em] ${textMain}`}>
          {faturaStep === 'main' ? 'Fatura Aberta' : 
           faturaStep === 'resumo' ? 'Resumo da Dívida' : 
           faturaStep === 'historico' ? 'Seu Histórico' : 'Pagamento'}
        </h2>
        <div className="w-12" />
      </header>

      {/* ÁREA DE CONTEÚDO SCROLLABLE */}
      <main className="flex-1 overflow-y-auto no-scrollbar pb-10">
        {faturaStep === 'main' && renderMain()}
        {faturaStep === 'resumo' && renderResumo()}
        {faturaStep === 'payout' && renderPayoutSelection()}
        
        {/* TELA DE HISTÓRICO (INLINE) */}
        {faturaStep === 'historico' && (
          <div className="px-6 pt-4 animate-in slide-in-from-right duration-300">
            <h3 className={`text-2xl font-black ${textMain} mb-2`}>Anteriores</h3>
            <p className={`text-xs ${textMuted} mb-8`}>Lista de faturas quitadas.</p>
            <div className={`p-5 rounded-[2rem] ${bgCard} border ${borderColor} flex items-center justify-between`}>
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                  <CheckCircle2 size={18} />
                </div>
                <div>
                  <p className={`text-sm font-black ${textMain}`}>Fatura Fevereiro</p>
                  <p className={`text-[10px] ${textLabel} uppercase font-bold`}>Paga em 10/02/2026</p>
                </div>
              </div>
              <p className={`text-sm font-black ${textMain}`}>{formatMoney(1250.40)}</p>
            </div>
          </div>
        )}

{/* TELA DE PIX COPIA E COLA (DINÂMICA ASAAS) */}
        {faturaStep === 'payout-pix' && (
          <div className="flex-1 flex flex-col px-6 pt-4 items-center text-center animate-in fade-in">
             <div className={`p-8 rounded-[2.5rem] ${bgCard} border ${borderColor} w-full shadow-xl mb-6`}>
                
                {loadingPix ? (
                  <div className="flex flex-col items-center justify-center py-10 space-y-4">
                    <Loader2 size={48} className="animate-spin text-indigo-500" />
                    <p className={`text-sm font-bold ${textMuted} animate-pulse`}>Gerando cobrança segura...</p>
                  </div>
                ) : erroPix ? (
                  <div className="flex flex-col items-center justify-center py-10 space-y-4">
                    <AlertCircle size={48} className="text-red-500" />
                    <p className={`text-sm font-bold text-red-500`}>{erroPix}</p>
                    <button onClick={handleGerarPix} className="mt-4 px-6 py-2 bg-indigo-500/10 text-indigo-500 rounded-full font-bold text-xs uppercase">Tentar Novamente</button>
                  </div>
                ) : pixData ? (
                  <>
                    <div className="w-48 h-48 bg-white p-3 rounded-3xl mx-auto mb-6 border-4 border-indigo-500/20 shadow-inner flex items-center justify-center overflow-hidden">
                      {/* 🚀 O QR CODE REAL DO ASAAS */}
                      <img src={`data:image/jpeg;base64,${pixData.qrCode}`} alt="QR Code Pix" className="w-full h-full object-contain" />
                    </div>
                    
                    <p className={`text-[10px] font-black uppercase tracking-widest ${textLabel} mb-1`}>Código Pix Copia e Cola</p>
                    
                    <div className={`p-4 rounded-xl ${isLight ? 'bg-slate-50' : 'bg-white/5'} border ${borderColor} text-[9px] font-mono mb-6 break-all ${textMuted} max-h-24 overflow-y-auto no-scrollbar relative`}>
                      {pixData.copiaECola}
                    </div>
                    
                    <button 
                      onClick={() => {
                        navigator.clipboard.writeText(pixData.copiaECola);
                        if (dispararAviso) dispararAviso('Sucesso', 'Código copiado para a área de transferência!', 'sucesso');
                        else alert('Código Pix copiado!');
                      }}
                      className="w-full py-4 rounded-full bg-indigo-600 text-white font-black text-xs uppercase tracking-widest shadow-lg shadow-indigo-600/20 active:scale-95 transition-all flex items-center justify-center gap-2"
                    >
                      <Copy size={16} /> Copiar Código
                    </button>
                  </>
                ) : null}

             </div>
             
             {!loadingPix && !erroPix && (
               <p className={`text-[10px] ${textMuted} font-bold px-10`}>O pagamento via Pix libera seu limite em instantes de forma automática.</p>
             )}
          </div>
        )}

        {/* TELA DE BOLETO (INLINE) */}
        {faturaStep === 'payout-boleto' && (
          <div className="flex-1 flex flex-col px-6 pt-4 animate-in fade-in">
             <div className={`p-8 rounded-[2.5rem] ${bgCard} border ${borderColor} w-full shadow-xl`}>
                <div className="flex items-center gap-4 mb-8">
                   <div className="w-14 h-14 rounded-2xl bg-orange-500/10 flex items-center justify-center text-orange-500">
                      <Barcode size={28} />
                   </div>
                   <div className="text-left">
                      <p className={`text-xs font-black ${textMain}`}>Boleto Disponível</p>
                      <p className={`text-[10px] ${textMuted} font-bold uppercase`}>Vence em {user?.fatura?.vencimento}</p>
                   </div>
                </div>
                <p className={`text-[10px] font-black uppercase tracking-widest ${textLabel} mb-1`}>Código de Barras</p>
                <div className={`p-5 rounded-xl ${isLight ? 'bg-slate-50' : 'bg-white/5'} border ${borderColor} text-xs font-bold mb-8 ${textMain} text-center`}>
                  23793.38128 60033.153408 69006.332309 1 93450000045090
                </div>
                <div className="flex gap-4">
                   <button onClick={() => alert("Código copiado!")} className={`flex-1 py-4 rounded-full ${isLight ? 'bg-slate-100' : 'bg-white/5'} ${textMain} font-black text-[10px] uppercase tracking-widest border ${borderColor}`}>
                     Copiar
                   </button>
                   <button className="flex-1 py-4 rounded-full bg-indigo-600 text-white font-black text-[10px] uppercase tracking-widest">
                     PDF
                   </button>
                </div>
             </div>
          </div>
        )}
      </main>
    </div>
  );
}