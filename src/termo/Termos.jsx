import React from 'react';
import { ArrowLeft, FileText, ShieldCheck, Landmark, AlertCircle, Ban, Lock } from 'lucide-react';

export default function Termos({ setView, tema, voltarPara }) {
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
            <FileText size={40} className="text-indigo-500" />
          </div>
          <h3 className={`text-2xl font-black ${textMain} tracking-tight`}>Termos de Uso</h3>
          <p className={`text-[11px] font-bold uppercase tracking-widest ${textMuted} mt-3 opacity-60`}>Versão 2.0 • Março 2026</p>
        </div>

        {/* CONTEÚDO */}
        <div className="max-w-md mx-auto">
          
          <Section title="1. Aceitação dos Termos" icon={ShieldCheck}>
            <p>
              Ao aceder à Aura, o utilizador declara ter lido, compreendido e aceite estes termos. Esta plataforma é um serviço de tecnologia financeira que facilita pagamentos e gestão de crédito através de parceiros bancários.
            </p>
          </Section>

          <Section title="2. Análise de Crédito (Liberta Brain)" icon={Landmark}>
            <p>
              A concessão de limites é realizada de forma automatizada pelo nosso motor de IA, o <strong>Liberta Brain</strong>. 
            </p>
            <ul className="list-disc pl-5 space-y-1">
              <li>A análise utiliza dados de mercado, histórico de pagamentos e comportamento de consumo.</li>
              <li>O limite pode ser reduzido ou suspenso sem aviso prévio caso sejam detetados riscos de inadimplência.</li>
            </ul>
          </Section>

          <Section title="3. Pix Parcelado e Encargos" icon={AlertCircle}>
            <p>
              O serviço de "Pix Parcelado" constitui uma operação de crédito. Ao utilizar esta função, o utilizador está ciente de que:
            </p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Serão aplicadas taxas de juros e IOF, detalhadas no momento da transação.</li>
              <li>O atraso no pagamento das faturas gera multa de 2% e juros de mora de 1% ao mês.</li>
            </ul>
          </Section>

          <Section title="4. Privacidade (LGPD)" icon={Lock}>
            <p>
              Tratamos os seus dados com rigorosa segurança conforme a Lei Geral de Proteção de Dados. Recolhemos biometria e dados de geolocalização para:
            </p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Prevenção de fraudes e lavagem de dinheiro.</li>
              <li>Autenticação de transações de alto valor.</li>
              <li>Melhoria da pontuação de crédito interna.</li>
            </ul>
          </Section>

          <Section title="5. Suspensão e Bloqueio" icon={Ban}>
            <p>
              A Aura reserva-se o direito de bloquear temporariamente ou encerrar contas em caso de:
            </p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Suspeita de atividade ilícita ou fraude.</li>
              <li>Inconsistência grave nos dados fornecidos.</li>
              <li>Uso indevido da marca ou engenharia reversa da aplicação.</li>
            </ul>
          </Section>

          <div className={`p-5 rounded-3xl ${isLight ? 'bg-slate-100' : 'bg-white/5'} border ${borderColor} mt-10`}>
            <p className={`text-[11px] font-bold ${textMuted} uppercase text-center`}>
              Dúvidas sobre estes termos? <br/>
              <span className="text-indigo-500">suporte@aurapix.com.br</span>
            </p>
          </div>

          <button 
            onClick={() => setView(voltarPara)}
            className="w-full h-16 rounded-full bg-indigo-600 text-white font-black uppercase text-xs tracking-widest mt-10 shadow-xl shadow-indigo-600/30 active:scale-95 transition-all flex items-center justify-center gap-3"
          >
            Concordo com os Termos
          </button>
        </div>

      </main>
    </div>
  );
}