import React, { useState } from 'react';
import { 
  ArrowLeft, User, Mail, Phone, ShieldCheck, 
  CheckCircle2, Loader2, LogOut,
  Moon, Sun, Lock, ChevronRight,
  HelpCircle, Fingerprint, Calendar, CreditCard,
  Briefcase, Home, MessageSquare, Settings, UserX, 
  Trash2, Heart
} from 'lucide-react';

// IMPORTAÇÕES DO FIREBASE (Para salvar os dados reais na nuvem)
import { getFirestore, doc, updateDoc } from 'firebase/firestore';
import { NativeBiometric } from "@capgo/capacitor-native-biometric"; 

// Movido para fora para ser usado no estado inicial
const getIconForType = (tipo) => {
  if (tipo.includes('Trabalho')) return Briefcase;
  if (tipo.includes('Casa') || tipo.includes('Fixo')) return Home;
  if (tipo.includes('Recado')) return MessageSquare;
  return Phone;
};

// 🚀 FUNÇÃO PARA CONVERTER DATA AMERICANA (YYYY-MM-DD) PARA BRASILEIRA (DD/MM/YYYY)
const formatarDataBR = (dataString) => {
  if (!dataString) return 'Não informada';
  if (dataString.includes('-')) {
    const [ano, mes, dia] = dataString.split('-');
    if (ano && mes && dia) return `${dia}/${mes}/${ano}`;
  }
  return dataString;
};

export default function Profile({ user, setView, onLogout, tema, setTema, dispararAviso }) {  
  const [activeScreen, setActiveScreen] = useState('main');

  // Lê do armazenamento do celular se a biometria está ligada
  const [biometriaAtiva, setBiometriaAtiva] = useState(() => {
    return localStorage.getItem('@Liberta:biometriaAtiva') === 'true';
  });

  // 🚀 AGORA PEGA DADOS REAIS DO FIREBASE
  const [localUserData, setLocalUserData] = useState({
    nome: user?.nome || '',
    email: user?.email || '',
  });

  // 🚀 TENTA LER OS CONTATOS DO FIREBASE, SE NÃO EXISTIR, MONTA O PADRÃO
  const [listaContatos, setListaContatos] = useState(() => {
    if (user?.contatos && Array.isArray(user.contatos) && user.contatos.length > 0) {
      // Se já tem salvo no Firebase, carrega e recoloca o ícone
      return user.contatos.map(c => ({ ...c, icon: getIconForType(c.tipo) }));
    }
    // Caso contrário, estado inicial puxando o celular do cadastro principal
    return [
      { id: 1, tipo: 'Telemóvel Pessoal', numero: user?.celular || '', icon: Phone },
      { id: 2, tipo: 'Trabalho', numero: '', icon: Briefcase },
      { id: 3, tipo: 'Recado', numero: '', icon: MessageSquare },
    ];
  });

  const [editingField, setEditingField] = useState(null); 
  const [editValue, setEditValue] = useState('');
  const [editingContactId, setEditingContactId] = useState(null);
  const [editContactType, setEditContactType] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  // 🚀 ESTADOS PARA ALTERAÇÃO DE SENHA
  const [senhaData, setSenhaData] = useState({ novaSenha: '', confirmarSenha: '' });
  const [isSavingSenha, setIsSavingSenha] = useState(false);

  // ESTADOS DA FATURA
  const [showModalVencimento, setShowModalVencimento] = useState(false);
  const [novoVencimento, setNovoVencimento] = useState(user?.fatura?.diaVencimento || 10);
  const [isSavingDate, setIsSavingDate] = useState(false);
  const diasDisponiveis = [5, 10, 15, 20, 25];

  // ESTADOS PARA EXCLUIR CONTA
  const [showModalExcluir, setShowModalExcluir] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [senhaExclusao, setSenhaExclusao] = useState('');
  const [etapaExclusao, setEtapaExclusao] = useState(1);

  // FUNÇÃO PARA EXCLUIR CONTA (AGORA COM SENHA)
  const handleExcluirConta = async () => {
    if (!senhaExclusao) {
      if (dispararAviso) dispararAviso("Erro", "Digite a sua senha para confirmar.", "erro");
      return;
    }

    setIsDeleting(true);
    try {
      const API_URL = import.meta.env.VITE_API_URL;
      
      const response = await fetch(`${API_URL}/api/auth/delete-account`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ uid: user?.uid, senha: senhaExclusao })
      });
      
      const data = await response.json();
      
      if (data.success) {
        localStorage.removeItem('@Liberta:user');
        localStorage.removeItem('@Liberta:biometriaAtiva');
        
        if (dispararAviso) dispararAviso("Sucesso", "Conta excluída permanentemente.", "sucesso");
        setShowModalExcluir(false);
        setSenhaExclusao(''); // Limpa a senha
        onLogout(); 
      } else {
        if (dispararAviso) dispararAviso("Erro", data.error || "Erro ao excluir conta.", "erro");
      }
    } catch (error) {
      console.error("Erro ao excluir conta:", error);
      if (dispararAviso) dispararAviso("Erro", "Falha de conexão com o servidor.", "erro");
    } finally {
      setIsDeleting(false);
    }
  };

  // 🚀 FUNÇÃO PARA ALTERAR SENHA COM USUÁRIO LOGADO
  const handleAlterarSenha = async () => {
    if (senhaData.novaSenha !== senhaData.confirmarSenha) {
      if (dispararAviso) dispararAviso("Erro", "As senhas não coincidem.", "erro");
      return;
    }
    if (senhaData.novaSenha.length < 6) {
      if (dispararAviso) dispararAviso("Erro", "A senha deve ter pelo menos 6 caracteres.", "erro");
      return;
    }

    setIsSavingSenha(true);
    try {
      const API_URL = import.meta.env.VITE_API_URL;
      const response = await fetch(`${API_URL}/api/auth/update-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        // Envia o e-mail do utilizador atualmente logado
        body: JSON.stringify({ email: user?.email, novaSenha: senhaData.novaSenha })
      });

      const data = await response.json();
      if (data.success) {
        if (dispararAviso) dispararAviso("Sucesso", "Sua senha foi alterada com sucesso!", "sucesso");
        setSenhaData({ novaSenha: '', confirmarSenha: '' });
        setActiveScreen('configurar'); // Volta para o menu de segurança
      } else {
        if (dispararAviso) dispararAviso("Erro", data.error || "Erro ao alterar senha.", "erro");
      }
    } catch (error) {
      console.error("Erro ao alterar senha:", error);
      if (dispararAviso) dispararAviso("Erro", "Erro de comunicação com o servidor.", "erro");
    } finally {
      setIsSavingSenha(false);
    }
  };

  // 🚀 VALIDAÇÃO DE SEGURANÇA PARA ALTERAÇÃO DE VENCIMENTO
  const handleAbrirModalVencimento = () => {
    // Verifica se há saldo devedor. Somamos as possibilidades de onde o backend guarda a dívida.
    const saldoDevedor = Number(user?.fatura?.valorAtual || 0) + Number(user?.limites?.usado || 0) + Number(user?.fatura?.saldoDevedor || 0);
    
    if (saldoDevedor > 0) {
      if (dispararAviso) {
        dispararAviso(
          "Ação Bloqueada", 
          "Não é possível alterar a data de vencimento enquanto houver saldo devedor na sua fatura em aberto.", 
          "erro"
        );
      }
      return; // Interrompe a função e não abre o modal
    }
    
    // Se estiver zerado, permite a abertura do modal
    setShowModalVencimento(true);
  };

  // FUNÇÃO PARA GUARDAR O VENCIMENTO NO BACKEND
  const handleAlterarVencimento = async () => {
    setIsSavingDate(true);
    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://192.168.15.7:3001';
      const response = await fetch(`${API_URL}/api/fatura/alterar-vencimento`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ uid: user?.uid, novoDia: novoVencimento })
      });
      
      const data = await response.json();
      if (data.success) {
        if (dispararAviso) dispararAviso("Sucesso", "Data de vencimento alterada com sucesso!", "sucesso");
        setShowModalVencimento(false);
      } else {
        if (dispararAviso) dispararAviso("Erro", data.error || "Erro ao alterar o vencimento.", "erro");
      }
    } catch (error) {
      console.error("Erro ao alterar data:", error);
    } finally {
      setIsSavingDate(false);
    }
  };

  // Variáveis usando o tema que veio do App.jsx via props
  const isLight = tema === 'claro';
  const bgMain = isLight ? 'bg-[#F8FAFC]' : 'bg-[#020617]'; 
  const textMain = isLight ? 'text-[#0F172A]' : 'text-white';
  const bgCard = isLight ? 'bg-white' : 'bg-[#0F172A]';
  const borderColor = isLight ? 'border-[#E2E8F0]' : 'border-white/5'; 
  const textMuted = isLight ? 'text-[#64748B]' : 'text-white/50'; 
  const textLabel = isLight ? 'text-[#94A3B8]' : 'text-white/40'; 
  const iconBg = isLight ? 'bg-[#F1F5F9]' : 'bg-[#020617]'; 
  const hoverActive = isLight ? 'active:bg-slate-200/50' : 'active:bg-white/5';

  /**
   * LÓGICA DE BIOMETRIA NATIVA
   */
  const toggleBiometria = async () => {
    if (biometriaAtiva) {
      localStorage.setItem('@Liberta:biometriaAtiva', 'false');
      setBiometriaAtiva(false);
      if (dispararAviso) dispararAviso('Segurança', 'Acesso por biometria desativado.', 'info');
      return;
    }

    try {
      const result = await NativeBiometric.isAvailable();
      
      if (result.isAvailable) {
        await NativeBiometric.verifyIdentity({
          reason: "Para ativar o acesso rápido, confirme sua identidade",
          title: "Autenticação AuraPix",
          subtitle: "Ativar Biometria/Face ID",
          description: "Toque no sensor biométrico",
        });
        
        localStorage.setItem('@Liberta:biometriaAtiva', 'true');
        setBiometriaAtiva(true);
        if (dispararAviso) dispararAviso('Segurança', 'Biometria ativada com sucesso!', 'sucesso');
        
      } else {
        if (dispararAviso) dispararAviso('Aviso', 'Biometria não disponível neste dispositivo.', 'info');
      }
    } catch (error) {
      console.error("Erro Biometria:", error);
      if (dispararAviso) dispararAviso('Erro', 'Falha ao configurar a biometria.', 'erro');
    }
  };

  const handleMenuClick = (action) => {
    if (action === 'Meus Dados') setActiveScreen('meus-dados');
    else if (action === 'Configurar') setActiveScreen('configurar');
    else if (action === 'Senhas') setActiveScreen('senhas'); // 🚀 REDIRECIONA PARA A TELA DE SENHA
    else if (action === 'Tema') openEditModal('tema', tema);
    else if (action === 'Termos') setView('privacidade'); 
    else if (action === 'Ajuda') setView('ajuda'); 
    else if (action === 'Biometria') toggleBiometria(); 
    else if (dispararAviso) dispararAviso('Aviso', `Navegar para: ${action} (Em breve!)`, 'info');
  };

  const openEditModal = (fieldKey, currentValue) => {
    setEditingField(fieldKey);
    setEditValue(currentValue);
  };

  const openContactModal = (contato) => {
    setEditingContactId(contato.id);
    setEditContactType(contato.tipo);
    setEditValue(contato.numero);
  };

  const closeModal = () => {
    if (isSaving) return;
    setEditingField(null);
    setEditingContactId(null);
  };

  // 🚀 FUNÇÃO ATUALIZADA PARA SALVAR DIRETO NO FIREBASE (FIRESTORE)
  const handleSaveEdit = async () => {
    if (editingField === 'tema') {
      closeModal(); 
      return;
    }

    if (!user?.uid) {
      if (dispararAviso) dispararAviso("Erro", "Sessão inválida. Faça login novamente.", "erro");
      return;
    }

    setIsSaving(true);
    
    try {
      const db = getFirestore();
      
      // ATENÇÃO: Verifique se a sua coleção se chama 'users' ou 'usuarios'
      // Se for 'usuarios', troque 'users' por 'usuarios' na linha abaixo:
      const userRef = doc(db, 'users', user.uid); 
      
      if (editingContactId) {
        // 1. Atualiza o estado local
        const updatedContacts = listaContatos.map(c => 
          c.id === editingContactId ? { ...c, numero: editValue, tipo: editContactType, icon: getIconForType(editContactType) } : c
        );
        setListaContatos(updatedContacts);

        // 2. Prepara os dados para o Firebase (remove o React Component 'icon' para não dar erro)
        const contatosParaSalvar = updatedContacts.map(c => ({
          id: c.id,
          tipo: c.tipo,
          numero: c.numero
        }));

        // 3. Salva no banco de dados
        await updateDoc(userRef, { contatos: contatosParaSalvar });
        
      } else if (editingField) {
        // 1. Atualiza o estado local
        setLocalUserData(prev => ({ ...prev, [editingField]: editValue }));
        
        // 2. Salva o campo específico (ex: nome, email) no banco de dados
        await updateDoc(userRef, { [editingField]: editValue });
      }

      if (dispararAviso) dispararAviso("Sucesso", "Informação atualizada com sucesso!", "sucesso");
    } catch (error) {
      console.error("Erro ao salvar no Firebase:", error);
      if (dispararAviso) dispararAviso("Erro", "Não foi possível atualizar seus dados.", "erro");
    } finally {
      setIsSaving(false);
      closeModal();
    }
  };

  const MenuSection = ({ title, children }) => (
    <div className="mb-6">
      <h4 className={`text-[10px] font-black uppercase tracking-[0.2em] mb-3 ml-2 ${textLabel}`}>{title}</h4>
      <div className={`${bgCard} border ${borderColor} rounded-[1.5rem] overflow-hidden shadow-sm`}>
        {children}
      </div>
    </div>
  );

  const MenuItem = ({ icon: Icon, label, value, onClick, showBorder = true }) => (
    <button onClick={onClick} className={`w-full flex items-center justify-between p-4 ${hoverActive} transition-colors ${showBorder ? `border-b ${borderColor}` : ''}`}>
      <div className="flex items-center gap-4">
        <div className={`w-10 h-10 rounded-full flex items-center justify-center border ${iconBg} ${borderColor} text-indigo-500`}>
          <Icon size={18} />
        </div>
        <div className="text-left">
          <span className={`font-bold text-sm block ${textMain}`}>{label}</span>
          {value && <span className={`text-[11px] ${textMuted}`}>{value}</span>}
        </div>
      </div>
      <ChevronRight size={18} className={isLight ? 'text-slate-300' : 'text-white/20'} />
    </button>
  );

  const DataRow = ({ label, value, icon: Icon, editable = true, onEdit, badge, isPlaceholder }) => (
    <div className={`flex items-center justify-between p-4 border-b ${borderColor} ${bgCard} first:rounded-t-[1.5rem] last:rounded-b-[1.5rem] last:border-0 ${hoverActive} transition-colors`}>
      <div className="flex items-center gap-4">
        {Icon && <div className={`w-8 h-8 rounded-full ${iconBg} border ${borderColor} flex items-center justify-center`}><Icon size={14} className="text-indigo-500" /></div>}
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className={`text-[10px] font-black uppercase tracking-wider ${textLabel}`}>{label}</span>
            {badge && <span className={`text-[8px] font-black uppercase tracking-widest ${isLight ? 'bg-slate-100 text-slate-500' : 'bg-white/10 text-white/70'} px-2 py-0.5 rounded-md`}>{badge}</span>}
          </div>
          <span className={`font-bold text-sm ${isPlaceholder ? textMuted : textMain}`}>{value}</span>
        </div>
      </div>
      {editable && (
        <button onClick={onEdit} className="text-[10px] font-black text-indigo-500 uppercase tracking-widest bg-indigo-500/10 px-3 py-1.5 rounded-full active:scale-95 transition-transform">
          {isPlaceholder ? 'Adicionar' : 'Editar'}
        </button>
      )}
    </div>
  );

  return (
    <div className={`flex-1 flex flex-col h-[100dvh] ${bgMain} absolute inset-0 z-50 overflow-hidden transition-colors duration-500`}>
      {activeScreen === 'main' && (
        <div className="flex-1 flex flex-col h-full animate-in slide-in-from-right duration-300">
          <header className={`pt-14 px-4 pb-4 flex items-center justify-between z-20 sticky top-0 ${isLight ? 'bg-[#F8FAFC]/90 border-[#E2E8F0]' : 'bg-[#020617]/90 border-white/5'} backdrop-blur-md border-b transition-colors duration-500`}>
            <button onClick={() => setView('home')} className={`w-12 h-12 rounded-full flex items-center justify-center ${hoverActive} transition-colors`}>
              <ArrowLeft size={24} className={textMain} />
            </button>
            <h2 className={`text-sm font-black uppercase tracking-widest ${textMain}`}>O Meu Perfil</h2>
            <div className="w-12" /> 
          </header>

          <main className="flex-1 overflow-y-auto no-scrollbar pb-10 px-6">
            <div className="flex flex-col items-center mt-6 mb-10">
              <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-indigo-600 to-purple-600 p-[3px] shadow-lg shadow-indigo-500/20">
                <div className={`w-full h-full rounded-full ${bgMain} border-2 border-transparent flex items-center justify-center overflow-hidden transition-colors duration-500`}>
                  <User size={40} className={textMuted} />
                </div>
              </div>
              <h3 className={`text-2xl font-black mt-4 ${textMain}`}>{localUserData.nome}</h3>
              <div className="flex items-center gap-1 mt-1 bg-indigo-500/10 px-3 py-1 rounded-full border border-indigo-500/20">
                <ShieldCheck size={12} className="text-indigo-500" />
                <span className="text-[9px] font-black uppercase tracking-widest text-indigo-500">
                  Aura {user?.tier || 'Platinum'}
                </span>
              </div>
            </div>

            <MenuSection title="A Minha Conta">
              <MenuItem icon={User} label="Os Meus Dados" value="Nome, CPF, E-mail..." onClick={() => handleMenuClick('Meus Dados')} showBorder={false} />
            </MenuSection>
            
            <MenuSection title="Geral">
              <MenuItem icon={Settings} label="Configurar" value="Tema, Segurança e Senha" onClick={() => handleMenuClick('Configurar')} showBorder={false} />
            </MenuSection>

            <MenuSection title="Sobre">
              <MenuItem icon={HelpCircle} label="Centro de Ajuda" onClick={() => handleMenuClick('Ajuda')} />
              <MenuItem icon={ShieldCheck} label="Termos e Privacidade" onClick={() => handleMenuClick('Termos')} showBorder={false}/>
            </MenuSection>

            <div className="mt-8 mb-4">
              <button onClick={onLogout} className="w-full flex items-center justify-center gap-2 p-4 rounded-[1.5rem] bg-red-500/10 border border-red-500/20 text-red-500 font-bold text-sm active:scale-[0.98] transition-all">
                <LogOut size={18} /> Sair da Aplicação
              </button>
            </div>
          </main>
        </div>
      )}

      {/* RENDERIZAÇÃO DOS SUB-ECRÃS (Dados Pessoais, Fatura, Configurar e Senhas) */}
      {(activeScreen === 'meus-dados' || activeScreen === 'fatura' || activeScreen === 'configurar' || activeScreen === 'senhas') && (
        <div className="flex-1 flex flex-col h-full animate-in slide-in-from-right duration-300">
          <header className={`pt-14 px-4 pb-4 flex items-center justify-between z-20 sticky top-0 ${isLight ? 'bg-[#F8FAFC]/90 border-[#E2E8F0]' : 'bg-[#020617]/90 border-white/5'} backdrop-blur-md border-b`}>
            <button onClick={() => {
                // 🚀 Lógica inteligente: Volta para o menu 'Configurar' caso venha das sub-telas
                if (activeScreen === 'fatura' || activeScreen === 'senhas') setActiveScreen('configurar');
                else setActiveScreen('main');
              }} 
              className={`w-12 h-12 rounded-full flex items-center justify-center ${hoverActive} transition-colors`}>
              <ArrowLeft size={24} className={textMain} />
            </button>
            <h2 className={`text-sm font-black uppercase tracking-widest ${textMain}`}>
              {activeScreen === 'meus-dados' ? 'Os Meus Dados' : 
               activeScreen === 'configurar' ? 'Configurar' : 
               activeScreen === 'senhas' ? 'Alterar Senha' : 
               'Vencimento'}
            </h2>
            <div className="w-12" />
          </header>

          <main className="flex-1 overflow-y-auto no-scrollbar pb-10 px-6 pt-6">
            
            {/* ECRÃ OS MEUS DADOS (COM CONTATOS INTEGRADOS E DADOS REAIS) */}
            {activeScreen === 'meus-dados' && (
              <>
                <h4 className={`text-[10px] font-black uppercase tracking-[0.2em] mb-3 ml-2 ${textLabel}`}>Informações Pessoais</h4>
                <div className="shadow-sm mb-6">
                  <DataRow icon={User} label="Nome Completo" value={localUserData.nome} editable={true} onEdit={() => openEditModal('nome', localUserData.nome)} />
                  {/* 🚀 LÊ O CPF DIRETO DO FIREBASE E ESCONDE SE NÃO TIVER */}
                  <DataRow icon={CreditCard} label="CPF" value={user?.cpf || 'Não cadastrado'} editable={false} />
                  {/* 🚀 LÊ A DATA DE NASCIMENTO DIRETO DO FIREBASE E APLICA A FORMATAÇÃO */}
                  <DataRow icon={Calendar} label="Data de Nascimento" value={formatarDataBR(user?.dataNascimento)} editable={false} />
                </div>
                
                <h4 className={`text-[10px] font-black uppercase tracking-[0.2em] mb-3 ml-2 mt-8 ${textLabel}`}>Acesso e Segurança</h4>
                <div className="shadow-sm mb-6">
                  <DataRow icon={Mail} label="E-mail principal" value={localUserData.email} editable={true} onEdit={() => openEditModal('email', localUserData.email)} />
                </div>

                <h4 className={`text-[10px] font-black uppercase tracking-[0.2em] mb-3 ml-2 mt-8 ${textLabel}`}>Telefones de Contato</h4>
                <p className={`text-[11px] mb-4 ml-2 leading-relaxed ${textMuted}`}>
                  Mantenha os seus números atualizados para garantir a recuperação da sua conta e a receção de códigos.
                </p>
                <div className="shadow-sm mb-6">
                  {listaContatos.map((contato, index) => (
                    <DataRow 
                      key={contato.id} 
                      icon={contato.icon} 
                      label={index === 0 ? 'Principal' : 'Opcional'} 
                      badge={contato.tipo} 
                      value={contato.numero || 'Adicionar número'} 
                      isPlaceholder={!contato.numero}
                      editable={true} 
                      onEdit={() => openContactModal(contato)} 
                    />
                  ))}
                </div>
              </>
            )}

            {/* ECRÃ CONFIGURAR FATURA */}
            {activeScreen === 'fatura' && (
              <>
                <p className={`text-xs mb-8 leading-relaxed ${textMuted}`}>
                  Gira as configurações do seu cartão de crédito Aura, como a data de vencimento ideal para si.
                </p>
                
                <h4 className={`text-[10px] font-black uppercase tracking-[0.2em] mb-3 ml-2 ${textLabel}`}>
                  Vencimento e Fecho
                </h4>
                
                <div className="shadow-sm mb-6">
                  <button 
                    onClick={handleAbrirModalVencimento}
                    className={`w-full flex items-center justify-between p-4 border border-b-0 ${borderColor} ${bgCard} rounded-[1.5rem] active:bg-white/5 transition-colors`}
                  >
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center border ${iconBg} ${borderColor} text-indigo-500`}>
                        <Calendar size={18} />
                      </div>
                      <div className="text-left">
                        <span className={`font-bold text-sm block ${textMain}`}>Alterar Vencimento</span>
                        <span className={`text-[11px] ${textMuted}`}>Atual: Dia {user?.fatura?.diaVencimento || 10}</span>
                      </div>
                    </div>
                    <ChevronRight size={18} className={isLight ? 'text-slate-300' : 'text-white/20'} />
                  </button>
                </div>
              </>
            )}

            {/* ECRÃ CONFIGURAR (TEMA, BIOMETRIA E SENHA) */}
            {activeScreen === 'configurar' && (
              <>
                <p className={`text-xs mb-8 leading-relaxed ${textMuted}`}>
                  Gira as suas preferências de acesso, segurança, fatura e visualização da aplicação.
                </p>

                <MenuSection title="Financeiro">
                  <MenuItem 
                    icon={Calendar} 
                    label="Vencimento" 
                    value={`Dia ${user?.fatura?.diaVencimento || 10}`} 
                    onClick={() => setActiveScreen('fatura')} 
                    showBorder={false}
                  />
                </MenuSection>
                
                <MenuSection title="Segurança">
                  <MenuItem 
                    icon={Fingerprint} 
                    label="Biometria e Face ID" 
                    value={biometriaAtiva ? "Ativado" : "Desativado"} 
                    onClick={() => handleMenuClick('Biometria')} 
                  />
                  <MenuItem 
                    icon={Lock} 
                    label="Alteração de Senha" 
                    onClick={() => handleMenuClick('Senhas')} 
                    showBorder={false}
                  />
                </MenuSection>

                <MenuSection title="Visualização">
                  <MenuItem 
                    icon={isLight ? Sun : Moon} 
                    label="Aparência" 
                    value={isLight ? 'Claro' : 'Escuro'} 
                    onClick={() => handleMenuClick('Tema')} 
                    showBorder={false} 
                  />
                </MenuSection>

                {/* 👇 NOVA SEÇÃO DE ZONA DE PERIGO 👇 */}
                <MenuSection title="Zona de Perigo">
                  <button 
                    onClick={() => {
                      // 1. Calcula se existe algum saldo devedor na fatura ou limites usados
                      const saldoDevedor = Number(user?.fatura?.valorAtual || 0) + 
                                           Number(user?.limites?.usado || 0) + 
                                           Number(user?.fatura?.saldoDevedor || 0);
                      
                      // 2. Se houver dívida, bloqueia e avisa o utilizador
                      if (saldoDevedor > 0) {
                        if (dispararAviso) {
                          dispararAviso(
                            "Ação Bloqueada", 
                            "Você possui débitos em aberto. Quite sua fatura antes de excluir a conta.", 
                            "erro"
                          );
                        }
                        return; // Impede que o modal abra
                      }
                      
                      // Se estiver tudo limpo, abre o modal de exclusão
                      setShowModalExcluir(true);
                    }}
                    className={`w-full flex items-center justify-between p-4 bg-red-500/5 active:bg-red-500/10 transition-colors`}
                  >
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center border border-red-500/20 text-red-500 bg-red-500/10`}>
                        <UserX size={18} />
                      </div>
                      <div className="text-left">
                        <span className={`font-bold text-sm block text-red-500`}>Excluir Minha Conta</span>
                        <span className={`text-[11px] text-red-500/70`}>Ação permanente e irreversível</span>
                      </div>
                    </div>
                    <ChevronRight size={18} className="text-red-500/50" />
                  </button>
                </MenuSection>
              </>
            )}

            {/* 🚀 ECRÃ DE ALTERAÇÃO DE SENHA */}
            {activeScreen === 'senhas' && (
              <div className="animate-in fade-in duration-300">
                <p className={`text-xs mb-8 leading-relaxed ${textMuted}`}>
                  Crie uma nova senha para acessar sua conta. Recomendamos o uso de letras, números e símbolos.
                </p>

                <div className={`p-4 rounded-[1.5rem] ${iconBg} border ${borderColor} focus-within:border-indigo-500/50 focus-within:ring-2 focus-within:ring-indigo-500/20 transition-all mb-4`}>
                   <span className={`text-[10px] font-black uppercase tracking-widest ${textLabel} block mb-2`}>Nova Senha</span>
                   <input 
                     type="password" 
                     value={senhaData.novaSenha} 
                     onChange={(e) => setSenhaData({...senhaData, novaSenha: e.target.value})} 
                     disabled={isSavingSenha} 
                     placeholder="••••••••" 
                     className={`bg-transparent border-none outline-none font-bold w-full text-base tracking-widest ${textMain} ${isLight ? 'placeholder:text-slate-400' : 'placeholder:text-white/20'}`} 
                   />
                </div>

                <div className={`p-4 rounded-[1.5rem] ${iconBg} border ${borderColor} focus-within:border-indigo-500/50 focus-within:ring-2 focus-within:ring-indigo-500/20 transition-all mb-8`}>
                   <span className={`text-[10px] font-black uppercase tracking-widest ${textLabel} block mb-2`}>Confirmar Nova Senha</span>
                   <input 
                     type="password" 
                     value={senhaData.confirmarSenha} 
                     onChange={(e) => setSenhaData({...senhaData, confirmarSenha: e.target.value})} 
                     disabled={isSavingSenha} 
                     placeholder="••••••••" 
                     className={`bg-transparent border-none outline-none font-bold w-full text-base tracking-widest ${textMain} ${isLight ? 'placeholder:text-slate-400' : 'placeholder:text-white/20'}`} 
                   />
                </div>

                <button 
                  onClick={handleAlterarSenha} 
                  disabled={isSavingSenha || !senhaData.novaSenha || senhaData.novaSenha !== senhaData.confirmarSenha}
                  className="w-full py-4 flex justify-center items-center gap-2 rounded-full font-black text-sm uppercase tracking-widest bg-indigo-600 text-white shadow-lg shadow-indigo-600/20 active:scale-[0.98] transition-transform disabled:opacity-50"
                >
                  {isSavingSenha ? <Loader2 size={18} className="animate-spin" /> : 'Salvar Nova Senha'}
                </button>
              </div>
            )}
          </main>
        </div>
      )}

      {/* ==================== MODAL BOTTOM SHEET GERAL ==================== */}
      {(editingField || editingContactId) && (
        <div className="fixed inset-0 z-[100] flex flex-col justify-end">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300" onClick={closeModal} />
          
          <div className={`relative w-full ${bgCard} border-t ${borderColor} rounded-t-[2.5rem] p-6 pb-10 animate-in slide-in-from-bottom-full duration-300 shadow-[0_-10px_40px_rgba(0,0,0,0.2)]`}>
            <div className={`w-12 h-1.5 rounded-full mx-auto mb-6 ${isLight ? 'bg-slate-200' : 'bg-white/10'}`} />

            <h3 className={`text-xl font-black mb-2 capitalize px-2 ${textMain}`}>
              {editingContactId ? 'Editar Contato' : editingField === 'tema' ? 'Aparência' : `Editar ${editingField}`}
            </h3>
            <p className={`text-xs mb-6 px-2 ${textMuted}`}>
              {editingField === 'tema' ? 'Escolha como prefere visualizar o Aura Pix.' : 'Atualize a sua informação abaixo.'}
            </p>

            {/* SELEÇÃO DE TEMA */}
            {editingField === 'tema' && (
              <div className="mb-6 space-y-3">
                <button onClick={() => setTema('escuro')} className={`w-full p-4 rounded-2xl border flex items-center justify-between transition-all ${!isLight ? 'bg-indigo-600 border-indigo-500 text-white shadow-md' : `bg-transparent ${borderColor} ${textMain}`}`}>
                  <div className="flex items-center gap-3">
                    <Moon size={20} className={!isLight ? 'text-white' : textMuted} />
                    <span className="font-bold text-sm">Escuro (Padrão)</span>
                  </div>
                  {!isLight && <CheckCircle2 size={20} className="text-white" />}
                </button>
                <button onClick={() => setTema('claro')} className={`w-full p-4 rounded-2xl border flex items-center justify-between transition-all ${isLight ? 'bg-indigo-600 border-indigo-500 text-white shadow-md' : `bg-transparent ${borderColor} ${textMain}`}`}>
                  <div className="flex items-center gap-3">
                    <Sun size={20} className={isLight ? 'text-white' : textMuted} />
                    <span className="font-bold text-sm">Claro</span>
                  </div>
                  {isLight && <CheckCircle2 size={20} className="text-white" />}
                </button>
              </div>
            )}

            {/* SELEÇÃO DE TIPO (Exclusivo para Contatos) */}
            {editingContactId && (
              <div className="mb-6 px-2">
                <span className={`text-[10px] font-black uppercase tracking-widest block mb-3 ${textLabel}`}>Tipo do Número</span>
                <div className="flex flex-wrap gap-2">
                  {['Telemóvel Pessoal', 'Trabalho', 'Casa', 'Recado'].map((tipo) => (
                    <button key={tipo} onClick={() => setEditContactType(tipo)} className={`px-4 py-2 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all border ${editContactType === tipo ? 'bg-indigo-600 border-indigo-500 text-white' : `${iconBg} ${borderColor} ${textMuted} hover:bg-slate-200/50`}`}>
                      {tipo}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* INPUT PADRÃO (Oculto no Tema) */}
            {editingField !== 'tema' && (
              <div className={`p-4 rounded-[1.5rem] ${iconBg} border ${borderColor} focus-within:border-indigo-500/50 focus-within:ring-2 focus-within:ring-indigo-500/20 transition-all mb-8`}>
                 <input type={editingField === 'email' ? 'email' : 'text'} autoFocus value={editValue} onChange={(e) => setEditValue(e.target.value)} disabled={isSaving} placeholder={editingContactId ? '(00) 00000-0000' : ''} className={`bg-transparent border-none outline-none font-bold w-full text-base ${textMain} ${isLight ? 'placeholder:text-slate-400' : 'placeholder:text-white/20'}`} />
              </div>
            )}

            {/* BOTÕES DE AÇÃO */}
            <div className="flex gap-4">
               <button onClick={closeModal} disabled={isSaving} className={`flex-1 py-4 rounded-full font-bold text-sm ${textMuted} ${hoverActive} transition-colors disabled:opacity-50`}>
                 {editingField === 'tema' ? 'Voltar' : 'Cancelar'}
               </button>
               {editingField !== 'tema' && (
                 <button onClick={handleSaveEdit} disabled={isSaving || !editValue.trim()} className="flex-1 py-4 flex justify-center items-center gap-2 rounded-full font-black text-sm uppercase tracking-widest bg-indigo-600 text-white shadow-lg shadow-indigo-600/20 active:scale-[0.98] transition-transform disabled:opacity-50 disabled:active:scale-100">
                   {isSaving ? <Loader2 size={18} className="animate-spin" /> : 'Guardar'}
                 </button>
               )}
            </div>

          </div>
        </div>
      )}

      {/* ==================== MODAL DE VENCIMENTO DA FATURA ==================== */}
      {showModalVencimento && (
        <div className="fixed inset-0 z-[100] flex flex-col justify-end">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300" onClick={() => setShowModalVencimento(false)} />
          
          <div className={`relative w-full ${bgCard} border-t ${borderColor} rounded-t-[2.5rem] p-6 pb-10 animate-in slide-in-from-bottom-full duration-300 shadow-[0_-10px_40px_rgba(0,0,0,0.2)]`}>
            <div className={`w-12 h-1.5 rounded-full mx-auto mb-6 ${isLight ? 'bg-slate-200' : 'bg-white/10'}`} />

            <h3 className={`text-xl font-black mb-2 px-2 ${textMain}`}>Dia de Vencimento</h3>
            <p className={`text-xs mb-6 px-2 ${textMuted}`}>
              Escolha o melhor dia para pagar a sua fatura. O fecho ocorre sempre 7 dias antes.
            </p>

            <div className="grid grid-cols-5 gap-2 mb-8 px-2">
              {diasDisponiveis.map((dia) => (
                <button 
                  key={dia}
                  onClick={() => setNovoVencimento(dia)}
                  className={`flex flex-col items-center justify-center py-4 rounded-2xl border transition-all ${novoVencimento === dia ? 'bg-indigo-600 border-indigo-500 text-white shadow-lg shadow-indigo-500/20 scale-105' : `bg-transparent ${borderColor} ${textMain} ${hoverActive}`}`}
                >
                  <span className="text-lg font-black">{dia}</span>
                </button>
              ))}
            </div>

            <div className={`p-4 rounded-2xl ${isLight ? 'bg-indigo-50' : 'bg-indigo-500/10'} mb-8 mx-2 border border-indigo-500/20`}>
              <p className={`text-[10px] font-bold text-indigo-500 uppercase tracking-widest mb-2 flex items-center gap-2`}>
                <Calendar size={12}/> Resumo das Datas
              </p>
              <p className={`text-xs ${isLight ? 'text-indigo-900' : 'text-indigo-200'} leading-relaxed`}>
                A sua fatura vencerá todos os dias <b>{novoVencimento}</b>.<br/>
                O seu melhor dia para compras será o dia <b>{novoVencimento > 7 ? novoVencimento - 7 : novoVencimento + 23}</b>.
              </p>
            </div>

            <div className="flex gap-4 px-2">
              <button onClick={() => setShowModalVencimento(false)} className={`flex-1 py-4 rounded-full font-bold text-sm ${textMuted} ${hoverActive} transition-colors`}>
                Cancelar
              </button>
              <button 
                onClick={handleAlterarVencimento} 
                disabled={isSavingDate || novoVencimento === (user?.fatura?.diaVencimento || 10)}
                className="flex-1 py-4 flex justify-center items-center gap-2 rounded-full font-black text-sm uppercase tracking-widest bg-indigo-600 text-white shadow-lg shadow-indigo-600/20 active:scale-[0.98] transition-all disabled:opacity-50"
              >
                {isSavingDate ? <Loader2 size={18} className="animate-spin" /> : 'Confirmar'}
              </button>
            </div>
          </div>
        </div>
      )}

{/* ==================== MODAL DE EXCLUIR CONTA (COM RETENÇÃO) ==================== */}
      {showModalExcluir && (
        <div className="fixed inset-0 z-[100] flex flex-col justify-end">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300" 
               onClick={() => { 
                 if(!isDeleting) { 
                   setShowModalExcluir(false); 
                   setSenhaExclusao(''); 
                   setEtapaExclusao(1); // Reseta a etapa ao fechar
                 } 
               }} 
          />
          
          <div className={`relative w-full ${bgCard} border-t ${borderColor} rounded-t-[2.5rem] p-6 pb-10 animate-in slide-in-from-bottom-full duration-300 shadow-[0_-10px_40px_rgba(0,0,0,0.2)]`}>
            <div className={`w-12 h-1.5 rounded-full mx-auto mb-6 ${isLight ? 'bg-slate-200' : 'bg-white/10'}`} />

            {/* --- ETAPA 1: TELA DE RETENÇÃO --- */}
            {etapaExclusao === 1 ? (
              <div className="animate-in fade-in duration-300">
                <div className="flex justify-center mb-4">
                  <div className="w-16 h-16 rounded-full bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center shadow-lg shadow-indigo-500/10">
                    <Heart size={32} className="text-indigo-500 fill-indigo-500/20" />
                  </div>
                </div>

                <h3 className={`text-xl font-black mb-3 px-2 text-center ${textMain}`}>Poxa, vai mesmo nos deixar?</h3>
                <p className={`text-xs mb-6 px-2 text-center ${textMuted} leading-relaxed`}>
                  Nós construímos o Aura Pix para simplificar a sua vida financeira. Se você teve algum problema ou se o seu limite não está como gostaria, nossa equipe adoraria ajudar!
                  <br/><br/>
                  Ao encerrar, você perde permanentemente seus benefícios <strong className="text-indigo-500 font-bold">Aura {user?.tier || 'Platinum'}</strong> e todo o seu histórico.
                </p>

                <div className="flex flex-col gap-3 px-2">
                  <button 
                    onClick={() => { setShowModalExcluir(false); setEtapaExclusao(1); }}
                    className="w-full py-4 rounded-full font-black text-sm uppercase tracking-widest bg-indigo-600 text-white shadow-lg shadow-indigo-600/20 active:scale-[0.98] transition-all"
                  >
                    Quero continuar no Aura
                  </button>
                  <button 
                    onClick={() => { setShowModalExcluir(false); setView('ajuda'); }}
                    className={`w-full py-4 rounded-full font-bold text-sm ${textMuted} ${hoverActive} transition-colors border ${borderColor}`}
                  >
                    Falar com o Suporte
                  </button>
                  <button 
                    onClick={() => setEtapaExclusao(2)}
                    className="w-full py-4 rounded-full font-bold text-xs text-red-500 active:scale-[0.98] transition-all mt-2"
                  >
                    Continuar com a exclusão
                  </button>
                </div>
              </div>
            ) : (
              
            /* --- ETAPA 2: TELA DA SENHA --- */
              <div className="animate-in slide-in-from-right-4 duration-300">
                <div className="flex justify-center mb-4">
                  <div className="w-16 h-16 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-500 shadow-lg shadow-red-500/10">
                    <UserX size={32} />
                  </div>
                </div>

                <h3 className={`text-xl font-black mb-2 px-2 text-center ${textMain}`}>Exclusão Definitiva</h3>
                <p className={`text-xs mb-8 px-2 text-center ${textMuted} leading-relaxed`}>
                  Esta ação apagará todo o seu histórico. <strong className="text-red-500 font-bold">Confirme com a sua senha.</strong>
                </p>

                <div className={`p-4 rounded-[1.5rem] ${iconBg} border ${borderColor} focus-within:border-red-500/50 focus-within:ring-2 focus-within:ring-red-500/20 transition-all mb-8 mx-2`}>
                   <span className={`text-[10px] font-black uppercase tracking-widest ${textLabel} block mb-2`}>Senha de Acesso</span>
                   <input 
                     type="password" 
                     value={senhaExclusao} 
                     onChange={(e) => setSenhaExclusao(e.target.value)} 
                     disabled={isDeleting} 
                     placeholder="••••••••" 
                     className={`bg-transparent border-none outline-none font-bold w-full text-base tracking-widest ${textMain} ${isLight ? 'placeholder:text-slate-400' : 'placeholder:text-white/20'}`} 
                   />
                </div>

                <div className="flex gap-4 px-2">
                  <button 
                    onClick={() => setEtapaExclusao(1)} 
                    disabled={isDeleting}
                    className={`flex-1 py-4 rounded-full font-bold text-sm ${textMuted} ${hoverActive} transition-colors border ${borderColor}`}
                  >
                    Voltar
                  </button>
                  <button 
                    onClick={handleExcluirConta} 
                    disabled={isDeleting || !senhaExclusao}
                    className="flex-1 py-4 flex justify-center items-center gap-2 rounded-full font-black text-sm uppercase tracking-widest bg-red-600 text-white shadow-lg shadow-red-600/20 active:scale-[0.98] transition-all disabled:opacity-50"
                  >
                    {isDeleting ? <Loader2 size={18} className="animate-spin" /> : 'Excluir'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
}