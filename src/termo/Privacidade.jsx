import React from 'react';
import { ArrowLeft, ShieldCheck, Database, Eye, Lock, CheckCircle2 } from 'lucide-react';

export default function Privacidade({ setView, tema, voltarPara }) {
  const isLight = tema === 'claro';
  const bgMain = isLight ? 'bg-[#F8FAFC]' : 'bg-[#020617]'; 
  const textMain = isLight ? 'text-[#0F172A]' : 'text-white';
  const bgCard = isLight ? 'bg-white' : 'bg-[#0F172A]';
  const borderColor = isLight ? 'border-[#E2E8F0]' : 'border-white/5'; 
  const textMuted = isLight ? 'text-[#64748B]' : 'text-white/50';

  const Section = ({ title, icon: Icon, children }) => (
    <section className="mb-8">
      <h4 className={`text-base font-black ${textMain} mb-3 flex items-center gap-2`}>
        {Icon && <Icon size={18} className="text-indigo-500" />} 
        {title}
      </h4>
      <div className={`space-y-2 text-[13px] leading-relaxed ${textMuted}`}>
        {children}
      </div>
    </section>
  );

  return (
    <div className={`flex-1 flex flex-col h-[100dvh] ${bgMain} absolute inset-0 z-[100] animate-in slide-in-from-bottom duration-300`}>
      
      {/* CABEÇALHO FIXO */}
      <header className={`pt-14 px-4 pb-4 flex items-center justify-between z-20 sticky top-0 ${isLight ? 'bg-[#F8FAFC]/90' : 'bg-[#020617]/90'} backdrop-blur-md border-b ${borderColor}`}>
        <button onClick={() => setView(voltarPara)} className={`w-12 h-12 rounded-full flex items-center justify-center ${isLight ? 'active:bg-slate-200/50' : 'active:bg-white/5'}`}>
          <ArrowLeft size={24} className={textMain} />
        </button>
        <h2 className={`text-[11px] font-black uppercase tracking-[0.3em] ${textMain}`}>Documentos Legais</h2>
        <div className="w-12" />
      </header>

      <main className="flex-1 overflow-y-auto no-scrollbar p-6 pb-24">
        
        {/* HERO SECTION */}
        <div className="mb-12 text-center">
          <div className={`w-20 h-20 rounded-[2rem] ${bgCard} border ${borderColor} flex items-center justify-center mx-auto mb-5 shadow-2xl`}>
            <ShieldCheck size={40} className="text-indigo-500" />
          </div>
          <h3 className={`text-2xl font-black ${textMain} tracking-tight`}>Política de Privacidade</h3>
          <p className={`text-[11px] font-bold uppercase tracking-widest ${textMuted} mt-3 opacity-60`}>Atualizado • Março 2026</p>
        </div>

        {/* CONTEÚDO */}
        <div className="max-w-md mx-auto">
          
          <div className={`p-5 rounded-3xl ${isLight ? 'bg-indigo-50' : 'bg-indigo-500/10'} border border-indigo-500/10 mb-8`}>
            <p className={`text-[13px] leading-relaxed ${isLight ? 'text-indigo-900' : 'text-indigo-200'}`}>
              A sua privacidade é a nossa prioridade. No <b>Aura Pix</b>, garantimos que os seus dados estão protegidos com criptografia de ponta a ponta e nunca são vendidos a terceiros.
            </p>
          </div>

          <Section title="1. Dados que Recolhemos" icon={Database}>
            <p>Recolhemos informações essenciais para fornecer um serviço seguro a todos os nossos utilizadores:</p>
            <ul className="list-disc pl-5 space-y-1 mt-2">
              <li><b>Dados de Registo:</b> Nome, CPF, endereço de e-mail, data de nascimento e celular.</li>
              <li><b>Dados Biométricos:</b> Reconhecimento facial e impressões digitais para autenticação no dispositivo.</li>
              <li><b>Dados Financeiros:</b> Histórico de transações, chaves Pix e dados necessários para a análise de crédito.</li>
            </ul>
          </Section>

          <Section title="2. Como Usamos os Seus Dados" icon={Eye}>
            <p>Utilizamos os dados recolhidos para finalidades estritamente ligadas aos serviços bancários:</p>
            <div className={`p-4 rounded-2xl ${bgCard} border ${borderColor} space-y-3 mt-3`}>
              <div className="flex items-start gap-3">
                <CheckCircle2 size={16} className="text-emerald-500 shrink-0 mt-0.5" />
                <p className={`text-[11px] ${textMain} leading-relaxed`}>Processar transferências e pagamentos Pix de forma instantânea.</p>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle2 size={16} className="text-emerald-500 shrink-0 mt-0.5" />
                <p className={`text-[11px] ${textMain} leading-relaxed`}>Calcular e oferecer limites de crédito personalizados.</p>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle2 size={16} className="text-emerald-500 shrink-0 mt-0.5" />
                <p className={`text-[11px] ${textMain} leading-relaxed`}>Prevenir fraudes e garantir a segurança da sua conta.</p>
              </div>
            </div>
          </Section>

          <Section title="3. Partilha de Informações" icon={ShieldCheck}>
            <p>
              Não partilhamos as suas informações pessoais com empresas, organizações e indivíduos externos à Aura, exceto com instituições financeiras parceiras estritamente necessárias para liquidar transações (como o Banco Central e reguladores).
            </p>
          </Section>

          <Section title="4. Segurança dos Dados" icon={Lock}>
            <p>
              Trabalhamos arduamente para proteger os nossos utilizadores contra o acesso, alteração, divulgação ou destruição não autorizados das informações que detemos, utilizando protocolos de segurança avançados (TLS/SSL) em todas as comunicações.
            </p>
          </Section>

          <div className={`p-5 rounded-3xl ${isLight ? 'bg-slate-100' : 'bg-white/5'} border ${borderColor} mt-10`}>
            <p className={`text-[11px] font-bold ${textMuted} uppercase text-center`}>
              Dúvidas sobre os seus dados? <br/>
              <span className="text-indigo-500">privacidade@aurapix.com.br</span>
            </p>
          </div>

          <button 
            onClick={() => setView(voltarPara)}
            className="w-full h-16 rounded-full bg-indigo-600 text-white font-black uppercase text-xs tracking-widest mt-10 shadow-xl shadow-indigo-600/30 active:scale-95 transition-all flex items-center justify-center gap-3"
          >
            Entendi
          </button>
        </div>

      </main>
    </div>
  );
}