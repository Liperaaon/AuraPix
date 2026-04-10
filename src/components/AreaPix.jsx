import React, { useState, useMemo, useEffect } from 'react';
import { 
  ArrowLeft, ArrowUpRight, Copy, QrCode, Search, Users, Loader2,
  Zap, Info, CheckCircle2, ShieldCheck, DollarSign, Wallet, X, User,
  Contact, CalendarDays, ChevronRight, CreditCard, TrendingUp, Share2, Download
} from 'lucide-react';

export default function AreaPix({ 
  user,           
  tema,           
  setView,        
  showValues,     
  saldoUsuario = 0, 
  contatosRecentes = [],
  descontarLimitePix,
  initialStep = 'menu' // Novo parâmetro com valor padrão 'menu'
}) {
  const API_URL = import.meta.env.VITE_API_URL;

  const [pixStep, setPixStep] = useState('menu');
  const [chavePix, setChavePix] = useState('');
  const [codigoCopiaCola, setCodigoCopiaCola] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [dadosCheckout, setDadosCheckout] = useState(null);
  const [parcelaSelecionada, setParcelaSelecionada] = useState(1);
  const [permissaoContatos, setPermissaoContatos] = useState('unknown');
  const [tipoChaveDetectado, setTipoChaveDetectado] = useState(''); 

  const [valorInput, setValorInput] = useState(0); 
  const [valorDisplay, setValorDisplay] = useState(''); 

  const isLight = tema === 'claro';
  const bgMain = isLight ? 'bg-[#F8FAFC]' : 'bg-[#020617]'; 
  const textMain = isLight ? 'text-[#0F172A]' : 'text-white';
  const bgCard = isLight ? 'bg-white' : 'bg-[#0F172A]';
  const borderColor = isLight ? 'border-[#E2E8F0]' : 'border-white/5'; 
  const textMuted = isLight ? 'text-[#64748B]' : 'text-white/50';
  const textLabel = isLight ? 'text-[#94A3B8]' : 'text-white/40';

  const [loadingChave, setLoadingChave] = useState(false);
  const [dadosRecebedor, setDadosRecebedor] = useState(null); 
  const [erroChave, setErroChave] = useState('');

  const handleConsultarChave = async () => {
    if (!chavePix) return;
    
    setLoadingChave(true);
    setErroChave('');
    
    try {
     const API_URL = import.meta.env.VITE_API_URL;
      const response = await fetch(`${API_URL}/api/pix/consultar-chave?chave=${encodeURIComponent(chavePix)}`);
      const data = await response.json();

      if (data.success) {
        setDadosRecebedor(data); // Salva o nome e o banco
        setPixStep('valor'); // SÓ AVANÇA SE ACHAR A CHAVE!
      } else {
        setErroChave(data.error || "Chave não encontrada.");
      }
    } catch (error) {
      setErroChave("Erro ao validar chave. Tente novamente.");
    } finally {
      setLoadingChave(false);
    }
  };

  // PUXA O LIMITE REAL DO UTILIZADOR AQUI
  const limitePix = user?.limites?.pix || 0;

  const taxaMensal = useMemo(() => {
    const taxas = { 'Platinum': 0.069, 'Gold': 0.099, 'Standard': 0.149 };
    return taxas[user?.tier] || 0.159;
  }, [user]);

  // 🚀 CORREÇÃO 2: Operador seguro (|| []) para evitar crash de array undefined
  const todosContatos = useMemo(() => [
    ...(contatosRecentes || []), 
    { nome: "Ana Silva", chave: "ana.silva@email.com", tipo: "E-mail" },
    { nome: "Bruno Oliveira", chave: "123.456.789-00", tipo: "CPF" },
    { nome: "Carlos Souza", chave: "11999887766", tipo: "Telemóvel" },
  ], [contatosRecentes]);

  const contatosFiltrados = todosContatos.filter(c => 
    c.nome.toLowerCase().includes(searchTerm.toLowerCase()) || 
    c.chave.includes(searchTerm)
  );

  const formatCurrency = (val) => val.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });


  
  // DETETIVE DE CHAVES
  const handleChavePixChange = (e) => {
    let val = e.target.value;

    if (/[a-zA-Z]/.test(val)) {
      setChavePix(val);
      if (val.includes('@')) setTipoChaveDetectado('E-mail');
      else setTipoChaveDetectado('Chave Aleatória');
      return;
    }

    const numbers = val.replace(/\D/g, '');

    if (numbers.length === 0) {
      setChavePix('');
      setTipoChaveDetectado('');
      return;
    }

    if (numbers.length <= 11) {
      if (numbers.length >= 3 && numbers[2] === '9') {
        setTipoChaveDetectado('Celular');
        setChavePix(
          numbers
            .replace(/(\d{2})(\d)/, '($1) $2')
            .replace(/(\d{5})(\d)/, '$1-$2')
            .substring(0, 15)
        );
      } else {
        setTipoChaveDetectado('CPF');
        setChavePix(
          numbers
            .replace(/(\d{3})(\d)/, '$1.$2')
            .replace(/(\d{3})(\d)/, '$1.$2')
            .replace(/(\d{3})(\d{1,2})/, '$1-$2')
            .substring(0, 14)
        );
      }
    } else if (numbers.length <= 14) {
      setTipoChaveDetectado('CNPJ');
      setChavePix(
        numbers
          .replace(/^(\d{2})(\d)/, '$1.$2')
          .replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3')
          .replace(/\.(\d{3})(\d)/, '.$1/$2')
          .replace(/(\d{4})(\d)/, '$1-$2')
          .substring(0, 18)
      );
    } else {
      setTipoChaveDetectado('Chave Aleatória');
      setChavePix(val); 
    }
  };

  // MÁSCARA FINANCEIRA
  const handleValorChange = (e) => {
    let rawValue = e.target.value.replace(/\D/g, ''); 
    if (!rawValue) {
      setValorDisplay('');
      setValorInput(0);
      return;
    }
    let floatValue = parseInt(rawValue, 10) / 100;
    setValorInput(floatValue);
    setValorDisplay(floatValue.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }));
  };

  const opcoesParcelamento = useMemo(() => {
    if (valorInput <= 0) return [];

    return Array.from({ length: 11 }, (_, i) => {
      const n = i + 2; 
      const montanteComJuros = valorInput * Math.pow((1 + taxaMensal), n);
      const iofFixo = valorInput * 0.0038;
      const total = montanteComJuros + iofFixo;
      
      return {
        vezes: n,
        valorParcela: total / n,
        total: total,
        juros: montanteComJuros - valorInput 
      };
    });
  }, [valorInput, taxaMensal]);

  const solicitarAcessoContatos = async () => {
    setIsProcessing(true);
    await new Promise(resolve => setTimeout(resolve, 800));
    setPermissaoContatos('granted');
    setPixStep('contatos');
    setIsProcessing(false);
  };

  const selecionarContato = (contato) => {
    setChavePix(contato.chave);
    setPixStep('valor');
  };

  const confirmarParcelamento = (opcao) => {
    setParcelaSelecionada(opcao.vezes);
    setDadosCheckout({
      analise: { 
        perfil: user?.tier || 'Platinum', 
        taxaEfetivaMensal: (taxaMensal * 100).toFixed(2) + "%", 
        status: "Pix Parcelado" 
      },
      valores: { 
        principal: valorInput, 
        iof: valorInput * 0.0038, 
        jurosAplicados: opcao.juros, 
        totalAPagar: opcao.total,
        parcelas: opcao.vezes,
        valorParcela: opcao.valorParcela
      },
      inteligencia: { 
        descontoAntecipacao: 0, 
        mensagem: `O seu Pix de ${opcao.vezes}x será cobrado mensalmente na sua fatura Aura.` 
      }
    });
    setPixStep('checkout');
  };

  const renderMenu = () => (
    <div className="flex-1 overflow-y-auto no-scrollbar pb-32 animate-in fade-in duration-500 flex flex-col">
      <div className="px-6 pt-4 pb-10 relative">
        <div className="absolute top-10 left-6 w-32 h-32 bg-indigo-600/20 rounded-full blur-3xl -z-10"></div>
        <span className="text-[11px] font-black uppercase tracking-widest text-indigo-500/80 mb-2 block">Saldo Disponível</span>
        <h3 className={`text-5xl font-black tracking-tighter ${textMain}`}>
          {showValues ? formatCurrency(saldoUsuario) : '••••'}
        </h3>
      </div>

      <div className="px-6 mb-12">
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: 'Transferir', icon: ArrowUpRight, action: () => setPixStep('transferir') },
            { label: 'Copia e Cola', icon: Copy, action: () => setPixStep('copia-cola') },
            { label: 'Ler QR Code', icon: QrCode, action: () => setPixStep('ler-qr') }
          ].map((item, i) => (
             <div key={i} onClick={item.action} className={`flex flex-col items-center gap-3 p-5 rounded-[2.5rem] bg-gradient-to-b ${isLight ? 'from-white to-slate-50 border-slate-200 shadow-sm' : 'from-white/[0.05] to-transparent border-white/5'} cursor-pointer active:scale-90 transition-all group`}>
                <div className={`w-14 h-14 rounded-full ${bgCard} border ${borderColor} flex items-center justify-center text-indigo-500 group-active:bg-indigo-600 group-active:text-white transition-colors`}>
                  <item.icon size={22} strokeWidth={2.5} />
                </div>
                <span className={`text-[10px] font-black uppercase tracking-wider text-center ${textMuted}`}>{item.label}</span>
             </div>
          ))}
        </div>
      </div>

      <div className="mt-auto px-6 pb-6">
        <h4 className={`text-[10px] font-black uppercase tracking-[0.2em] ${textLabel} mb-6`}>Favoritos</h4>
        <div className="flex gap-5 overflow-x-auto no-scrollbar pb-4">
          <div 
            onClick={() => permissaoContatos === 'granted' ? setPixStep('contatos') : setPixStep('permissao')} 
            className="flex flex-col items-center gap-3 min-w-[64px] active:scale-90 transition-transform cursor-pointer"
          >
            <div className="w-16 h-16 rounded-full bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-500">
              <Search size={22} />
            </div>
            <span className={`text-[10px] font-bold ${textMuted}`}>Buscar</span>
          </div>
          {contatosRecentes && contatosRecentes.map((c, i) => (
            <div key={i} onClick={() => selecionarContato(c)} className="flex flex-col items-center gap-3 min-w-[64px] active:scale-90 transition-transform cursor-pointer">
              <div className={`w-16 h-16 rounded-full ${bgCard} border ${borderColor} flex items-center justify-center overflow-hidden shadow-sm`}>
                {c.foto ? <img src={c.foto} className="w-full h-full object-cover" /> : <Users size={22} className={textLabel}/>}
              </div>
              <span className={`text-[10px] font-bold ${textMuted}`}>{c.nome.split(' ')[0]}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderParcelamento = () => (
    <div className="flex-1 flex flex-col animate-in slide-in-from-right duration-300">
      <div className="px-6 pt-4 pb-6">
        <h3 className={`text-2xl font-black ${textMain} mb-2`}>Parcelar Pix</h3>
        <p className={`text-sm ${textMuted} mb-8`}>Escolha em quantas vezes deseja pagar o envio de {formatCurrency(valorInput)}.</p>
      </div>

      <div className="flex-1 overflow-y-auto no-scrollbar px-6 space-y-3 pb-10">
        {opcoesParcelamento.map((opcao) => (
          <button 
            key={opcao.vezes}
            onClick={() => confirmarParcelamento(opcao)}
            className={`w-full p-6 rounded-[2rem] border ${borderColor} ${bgCard} flex items-center justify-between active:scale-[0.98] transition-all group`}
          >
            <div className="flex items-center gap-4 text-left">
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center bg-indigo-500/10 text-indigo-500">
                <CalendarDays size={24} />
              </div>
              <div>
                <span className={`text-base font-black ${textMain} block`}>
                  {opcao.vezes}x de {formatCurrency(opcao.valorParcela)}
                </span>
                <span className={`text-[10px] ${textMuted} font-bold uppercase tracking-widest`}>
                  Total: {formatCurrency(opcao.total)}
                </span>
              </div>
            </div>
            <ChevronRight size={20} className={textLabel} />
          </button>
        ))}
      </div>
    </div>
  );

const renderCheckout = () => {
    if (!dadosCheckout) return null;
    const { valores, inteligencia, analise } = dadosCheckout;

    // Função auxiliar para formatar moeda dentro do checkout
    const formatCurrency = (val) => val.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

    return (
      <div className="flex-1 flex flex-col animate-in slide-in-from-right duration-300">
        <div className="flex-1 px-6 pt-4 overflow-y-auto no-scrollbar pb-10">
          
          <div className="flex items-center justify-center gap-2 mb-6">
            <ShieldCheck size={16} className="text-indigo-500" />
            <span className={`text-[10px] font-black uppercase tracking-widest text-indigo-500`}>Pagamento Seguro Aura</span>
          </div>

          <div className={`p-8 rounded-[3rem] ${bgCard} border ${borderColor} mb-6 text-center shadow-lg relative overflow-hidden`}>
             <div className="absolute top-0 right-0 p-6 opacity-5"><TrendingUp size={60} className="text-indigo-500" /></div>
             <p className={`text-[10px] font-black uppercase ${textLabel} mb-2`}>
                {valores.parcelas}x de
             </p>
             <h2 className={`text-5xl font-black ${textMain} tracking-tighter`}>
                {formatCurrency(valores.valorParcela)}
             </h2>
             <p className={`text-[10px] font-black uppercase ${textLabel} mt-2`}>
               Total de {formatCurrency(valores.totalAPagar)}
             </p>
          </div>

          <div className="space-y-4 px-2">
            
            <div className={`p-5 rounded-3xl ${isLight ? 'bg-slate-50' : 'bg-white/5'} border ${borderColor}`}>
              <span className={`text-[10px] font-black uppercase tracking-widest ${textLabel} block mb-3`}>Destinatário</span>
              <div className="flex items-center gap-4">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-indigo-500 ${isLight ? 'bg-slate-200' : 'bg-[#020617]'}`}>
                  <User size={18} />
                </div>
                <div>
                  <span className={`text-sm font-black ${textMain} block`}>{chavePix}</span>
                  <span className={`text-[10px] font-bold ${textMuted} uppercase`}>Chave {tipoChaveDetectado}</span>
                </div>
              </div>
            </div>
            
            <div className={`p-5 rounded-3xl ${bgCard} border ${borderColor} space-y-4 shadow-sm`}>
              <span className={`text-[10px] font-black uppercase tracking-widest ${textLabel} block mb-2`}>Resumo Financeiro</span>
              
              <div className="flex justify-between items-center">
                <span className={`text-xs font-bold ${textMuted}`}>Valor Enviado</span>
                <span className={`text-xs font-black ${textMain}`}>{formatCurrency(valores.principal)}</span>
              </div>
              
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-1.5">
                  <span className={`text-xs font-bold ${textMuted}`}>Taxa de Financiamento</span>
                  <Info size={12} className={textLabel} />
                </div>
                <span className={`text-xs font-black ${textMain}`}>{formatCurrency(valores.jurosAplicados)}</span>
              </div>

              <div className="flex justify-between items-center">
                <div className="flex items-center gap-1.5">
                  <span className={`text-xs font-bold ${textMuted}`}>Impostos (IOF)</span>
                  <Info size={12} className={textLabel} />
                </div>
                <span className={`text-xs font-black ${textMain}`}>{formatCurrency(valores.iof)}</span>
              </div>

              <div className={`border-t border-dashed ${isLight ? 'border-slate-200' : 'border-white/10'} pt-4 mt-4 space-y-3`}>
                <div className="flex justify-between items-center">
                  <span className={`text-[10px] font-bold uppercase ${textMuted}`}>Custo Efetivo Total (CET)</span>
                  <span className={`text-[10px] font-black uppercase ${textMain}`}>{analise.taxaEfetivaMensal} a.m.</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className={`text-[10px] font-bold uppercase ${textMuted}`}>1ª Parcela</span>
                  <span className={`text-[10px] font-black uppercase ${textMain}`}>Na próxima fatura</span>
                </div>
              </div>
            </div>

            <div className={`p-5 rounded-[2.5rem] ${isLight ? 'bg-indigo-50' : 'bg-indigo-500/10'} border border-indigo-500/20 flex items-center gap-4 mt-4`}>
              <div className="w-10 h-10 rounded-full bg-indigo-500 text-white flex items-center justify-center min-w-[40px] shadow-lg shadow-indigo-500/30">
                <Zap size={20} fill="white" />
              </div>
              <p className={`text-[10px] font-bold leading-relaxed ${isLight ? 'text-indigo-900' : 'text-indigo-200'}`}>
                {inteligencia.mensagem} Seu limite de crédito é restabelecido conforme o pagamento.
              </p>
            </div>

          </div>
        </div>

        {/* Rodapé com Botões de Ação */}
        <div className={`p-6 pb-12 bg-gradient-to-t ${bgMain} to-transparent flex gap-3`}>
          <button 
            disabled={isProcessing}
            onClick={() => setPixStep('parcelamento')}
            className="flex-1 h-18 rounded-full bg-slate-800 text-slate-300 font-bold uppercase tracking-widest flex items-center justify-center active:scale-95 transition-all py-5 disabled:opacity-50"
          >
            Voltar
          </button>

          <button 
            disabled={isProcessing}
            onClick={async () => {
              setIsProcessing(true);
              
              if (descontarLimitePix && dadosCheckout) {
                // Envia os dados completos para o processamento real no Asaas
                const sucesso = await descontarLimitePix(
                  valorInput, 
                  dadosCheckout.valores.valorParcela, 
                  dadosCheckout.valores.parcelas,
                  chavePix,             
                  tipoChaveDetectado    
                );
                
                if (sucesso) {
                  setView('comprovante'); 
                }
              }
              setIsProcessing(false);
            }}
            className="flex-[2] h-18 rounded-full bg-indigo-600 text-white font-black uppercase tracking-widest flex items-center justify-center shadow-xl shadow-indigo-600/30 active:scale-95 transition-all py-5 disabled:opacity-50"
          >
            {isProcessing ? <Loader2 className="animate-spin" /> : "Confirmar Pix"}
          </button>
        </div>
      </div>
    );
  };

  const renderSucesso = () => (
    <div className="flex-1 flex flex-col items-center justify-center px-10 text-center animate-in zoom-in duration-500">
      <div className="w-32 h-32 rounded-full bg-emerald-500 flex items-center justify-center text-white mb-10 shadow-3xl relative">
        <CheckCircle2 size={64} />
        <div className="absolute inset-0 rounded-full border-8 border-white/20 animate-ping" />
      </div>
      <h3 className={`text-4xl font-black mb-4 ${textMain}`}>Feito!</h3>
      <p className={`text-base ${textMuted} mb-12`}>O Pix foi enviado. Você escolheu pagar em <b>{parcelaSelecionada}x</b>.</p>
      
      <button 
        onClick={() => setView('home')}
        className={`w-full h-16 rounded-full border-2 ${borderColor} ${textMain} font-black uppercase text-xs tracking-widest active:scale-95 transition-all`}
      >
        Voltar ao Início
      </button>
    </div>
  );

  return (
    <div className={`flex-1 flex flex-col h-[100dvh] ${bgMain} absolute inset-0 z-40 transition-colors duration-500`}>
      
      <header className={`pt-14 px-4 pb-4 flex items-center justify-between z-20 sticky top-0 ${bgMain}`}>
        <button 
          onClick={() => {
            if (pixStep === 'menu') setView('home');
            else if (pixStep === 'transferir' || pixStep === 'copia-cola' || pixStep === 'ler-qr' || pixStep === 'permissao' || pixStep === 'contatos') setPixStep('menu');
            else if (pixStep === 'valor') setPixStep('transferir'); 
            else if (pixStep === 'parcelamento') setPixStep('valor');
            else if (pixStep === 'checkout') setPixStep('parcelamento');
            else setPixStep('menu');
          }} 
          className={`w-12 h-12 rounded-full flex items-center justify-center ${isLight ? 'active:bg-slate-200/50 text-slate-800' : 'active:bg-white/5 text-white'}`}
        >
          <ArrowLeft size={28} />
        </button>
        <div className="flex flex-col items-center">
           <h1 className={`font-black text-[10px] uppercase tracking-[0.4em] ${textLabel}`}>
            {pixStep === 'parcelamento' ? 'Opções de Pagamento' : 'Área Pix'}
          </h1>
        </div>
        <div className="w-12 h-12" />
      </header>

      {pixStep === 'menu' && renderMenu()}
      
      {pixStep === 'permissao' && (
        <div className="flex-1 flex flex-col items-center justify-center px-8 text-center animate-in slide-in-from-bottom duration-500">
          <div className={`w-24 h-24 rounded-full ${isLight ? 'bg-indigo-50' : 'bg-indigo-500/10'} flex items-center justify-center text-indigo-500 mb-8 border ${borderColor}`}>
            <Contact size={48} />
          </div>
          <h3 className={`text-2xl font-black mb-4 ${textMain}`}>Contatos Aura</h3>
          <p className={`text-sm ${textMuted} mb-12 leading-relaxed`}>Encontre amigos para enviar Pix mais rápido acedendo à sua lista de contactos.</p>
          <button onClick={solicitarAcessoContatos} className="w-full h-16 rounded-full bg-indigo-600 text-white font-black uppercase text-xs tracking-widest mb-4">Permitir</button>
          <button onClick={() => setPixStep('menu')} className={`w-full h-16 rounded-full border ${borderColor} ${textMain} font-black uppercase text-xs tracking-widest`}>Agora não</button>
        </div>
      )}

      {pixStep === 'contatos' && (
        <div className="flex-1 flex flex-col animate-in slide-in-from-bottom duration-400 overflow-hidden">
          <div className="px-6 pt-2 pb-6">
            <div className={`flex items-center gap-3 p-4 rounded-2xl ${bgCard} border ${borderColor}`}>
              <Search size={20} className={textLabel} />
              <input type="text" autoFocus placeholder="Nome ou CPF..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className={`flex-1 bg-transparent border-none outline-none font-bold text-sm ${textMain}`} />
            </div>
          </div>
          <div className="flex-1 overflow-y-auto no-scrollbar px-6 pb-20 space-y-3">
            {contatosFiltrados.map((contato, i) => (
              <div key={i} onClick={() => selecionarContato(contato)} className={`flex items-center gap-4 p-4 rounded-3xl ${bgCard} border ${borderColor} active:scale-[0.98] transition-all`}>
                <div className={`w-12 h-12 rounded-full ${isLight ? 'bg-slate-100' : 'bg-white/5'} flex items-center justify-center text-indigo-500 border ${borderColor}`}><User size={20} /></div>
                <div><p className={`text-sm font-black ${textMain}`}>{contato.nome}</p><p className={`text-[10px] font-bold ${textLabel}`}>{contato.chave}</p></div>
              </div>
            ))}
          </div>
        </div>
      )}

      {pixStep === 'transferir' && (
        <div className="flex-1 flex flex-col px-8 pt-6 animate-in slide-in-from-right">
          <h3 className={`text-2xl font-black mb-2 ${textMain}`}>Chave Pix</h3>
          <p className={`text-sm mb-10 ${textMuted}`}>Digite CPF, e-mail, telemóvel ou chave aleatória.</p>
          
          <div className="relative">
            <input 
              type="text" 
              autoFocus 
              value={chavePix} 
              onChange={handleChavePixChange} 
              placeholder="Qual a chave?"
              className={`w-full bg-transparent border-b-2 ${borderColor} focus:border-indigo-500 ${textMain} font-bold text-3xl outline-none pb-4 transition-colors`}
            />

            {tipoChaveDetectado && (
              <div className="absolute -bottom-6 left-0 flex items-center gap-1.5 animate-in fade-in slide-in-from-top-1">
                <CheckCircle2 size={12} className="text-emerald-500" />
                <span className={`text-[9px] font-black uppercase tracking-widest ${textLabel}`}>
                  Identificado: <span className="text-indigo-500">{tipoChaveDetectado}</span>
                </span>
              </div>
            )}
          </div>

<button 
  onClick={handleConsultarChave} // <--- Tem de ser a função, não o setPixStep!
  disabled={chavePix.length < 5 || loadingChave}
  className="..."
>
  {loadingChave ? <Loader2 className="animate-spin" /> : "Próximo"}
</button>
        </div>
      )}

      {/* TELA DE VALOR ATUALIZADA COM O BLOQUEIO DE LIMITE */}
      {pixStep === 'valor' && (
        <div className="flex-1 flex flex-col animate-in slide-in-from-right duration-300">
          <div className="flex-1 px-8 pt-6 flex flex-col items-center">
            <h3 className={`text-2xl font-black mb-2 ${textMain} w-full text-left`}>Valor do Pix</h3>
            
            {/* MOSTRA O LIMITE DISPONÍVEL NO ECRÃ */}
            <p className={`text-sm mb-16 ${textMuted} w-full text-left`}>
              Limite disponível: <span className="font-bold text-indigo-500">{formatCurrency(limitePix)}</span>
            </p>
            
            <div className="flex items-center justify-center w-full mt-10">
              <span className={`text-4xl font-black ${valorInput > limitePix ? 'text-red-500' : textLabel} mr-3 transition-colors`}>R$</span>
              <input 
                type="text" 
                inputMode="numeric"
                autoFocus 
                value={valorDisplay} 
                onChange={handleValorChange} 
                placeholder="0,00"
                className={`bg-transparent border-none ${valorInput > limitePix ? 'text-red-500' : textMain} font-black text-6xl outline-none w-full max-w-[200px] placeholder:opacity-20 transition-colors`}
              />
            </div>

            {/* ALERTA VISUAL SE PASSAR DO LIMITE */}
            {valorInput > limitePix && (
              <div className="mt-8 flex items-center gap-2 bg-red-500/10 px-4 py-2 rounded-full border border-red-500/20 animate-in fade-in slide-in-from-bottom-2">
                <Info size={14} className="text-red-500" />
                <span className="text-red-500 text-[10px] font-bold uppercase tracking-widest">Limite excedido</span>
              </div>
            )}

          </div>
          <div className="p-6 pb-12">
            <button 
              onClick={() => setPixStep('parcelamento')} 
              disabled={valorInput <= 0 || valorInput > limitePix || isProcessing} // BLOQUEIA SE ESTOURAR O LIMITE
              className="w-full h-18 rounded-full bg-indigo-600 text-white font-black uppercase tracking-widest shadow-xl active:scale-95 disabled:opacity-30 flex items-center justify-center py-5 transition-all"
            >
              Ver Opções de Parcelamento
            </button>
          </div>
        </div>
      )}

      {pixStep === 'parcelamento' && renderParcelamento()}
      {pixStep === 'checkout' && renderCheckout()}
      {pixStep === 'sucesso' && renderSucesso()}
    </div>
  );
}