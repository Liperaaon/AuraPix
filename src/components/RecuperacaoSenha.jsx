import React, { useState, useEffect } from 'react';
import { ArrowLeft, FileText, Mail, Info, CheckCircle2, Loader2, Key, Lock, Eye, EyeOff } from 'lucide-react';

// 🚀 COMPONENTES LOCAIS INTEGRADOS
const MainButton = ({ onClick, children, disabled }) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className={`w-full h-16 rounded-2xl font-black text-xs tracking-[0.2em] uppercase transition-all flex items-center justify-center gap-3 active:scale-[0.97] disabled:opacity-20
      ${disabled ? 'bg-slate-800 text-slate-500' : 'bg-indigo-600 text-white shadow-[0_10px_30px_rgba(79,70,229,0.3)]'}`}
  >
    {children}
  </button>
);

const CustomInput = ({ label, placeholder, type = "text", value, onChange, icon: Icon, tema, disabled = false, inputMode, autoCapitalize }) => {
  const [showPassword, setShowPassword] = useState(false);
  const isLight = tema === 'claro';
  const textMain = isLight ? 'text-[#0F172A]' : 'text-white';
  const bgCard = isLight ? 'bg-white' : 'bg-[#0F172A]';
  const borderColor = isLight ? 'border-[#E2E8F0]' : 'border-white/5';
  const textLabel = isLight ? 'text-[#94A3B8]' : 'text-white/40';
  const iconColor = isLight ? 'text-indigo-600' : 'text-indigo-400';

  const isPasswordType = type === 'password';
  const inputType = isPasswordType && !showPassword ? 'password' : isPasswordType && showPassword ? 'text' : type;

  return (
    <div className={`mb-5 text-left w-full ${disabled ? 'opacity-60' : ''}`}>
      <div className="flex items-center gap-2 mb-2 ml-2">
        {Icon && <Icon size={14} className={`${iconColor} opacity-80`} />}
        <p className={`text-[10px] font-black uppercase tracking-[0.2em] ${textLabel}`}>{label}</p>
      </div>
      <div className={`p-4 rounded-[1.5rem] ${bgCard} border ${borderColor} flex items-center transition-all ${!disabled ? 'focus-within:ring-2 focus-within:ring-indigo-500/30 focus-within:border-indigo-500/50' : ''}`}>
        <input
          type={inputType}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          disabled={disabled}
          inputMode={inputMode}
          autoCapitalize={autoCapitalize}
          className={`bg-transparent border-none outline-none font-bold flex-1 w-full text-base ${textMain} ${isLight ? 'placeholder:text-slate-400' : 'placeholder:text-white/20'}`}
        />
        {isPasswordType && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className={`ml-3 outline-none transition-colors active:scale-90 ${textLabel} hover:${textMain}`}
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        )}
      </div>
    </div>
  );
};

// 🚀 RECEBEMOS NOVAS PROPS: modo, userEmail e onBack
export default function RecuperacaoSenha({ setView, tema, modo = 'recuperacao', userEmail = '', onBack }) {
  const isPerfil = modo === 'perfil'; // Identifica se está dentro do Profile.jsx

  // Identifica se o usuário veio pelo link do e-mail (apenas no modo recuperação)
  const params = new URLSearchParams(window.location.search);
  const emailReset = params.get('email');

  // Estados Locais
  const [loading, setLoading] = useState(false);
  const [recuperaData, setRecuperaData] = useState({ cpf: '', email: '' });
  const [resetData, setResetData] = useState({ senhaAtual: '', novaSenha: '', confirmarSenha: '' });
  const [msg, setMsg] = useState({ erro: '', sucesso: '' });

  // Variáveis de Tema
  const isLight = tema === 'claro';
  const textMain = isLight ? 'text-[#0F172A]' : 'text-white';
  const textMuted = isLight ? 'text-[#64748B]' : 'text-white/50';
  const bgCard = isLight ? 'bg-white' : 'bg-[#0F172A]';
  const borderColor = isLight ? 'border-[#E2E8F0]' : 'border-white/5'; 

  const maskCPF = (v) => v.replace(/\D/g, '').replace(/(\d{3})(\d)/, '$1.$2').replace(/(\d{3})(\d)/, '$1.$2').replace(/(\d{3})(\d{1,2})/, '$1-$2').replace(/(-\d{2})\d+?$/, '$1');

  const validarSenha = (senha) => {
    const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{6,16}$/;
    return regex.test(senha);
  };

  // 1. Enviar E-mail de Recuperação (Apenas Modo Externo)
  const handleSendEmail = async () => {
    setLoading(true); setMsg({ erro: '', sucesso: '' });
    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://192.168.15.7:3001';
      const response = await fetch(`${API_URL}/api/auth/forgot-password`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cpf: recuperaData.cpf, email: recuperaData.email })
      });
      const data = await response.json();
      if (data.success) {
        setMsg({ erro: '', sucesso: "E-mail enviado! Verifique sua caixa de entrada." });
        setTimeout(() => setView('login'), 4000);
      } else {
        setMsg({ erro: data.error || "Erro ao solicitar recuperação.", sucesso: '' });
      }
    } catch (error) {
      setMsg({ erro: "Servidor offline.", sucesso: '' });
    } finally { setLoading(false); }
  };

  // 2. Atualizar Senha via Link de Recuperação (Modo Externo)
  const handleUpdatePassword = async () => {
    setLoading(true); setMsg({ erro: '', sucesso: '' });
    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://192.168.15.7:3001';
      const response = await fetch(`${API_URL}/api/auth/update-password`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: emailReset, novaSenha: resetData.novaSenha })
      });
      const data = await response.json();
      if (data.success) {
        setMsg({ erro: '', sucesso: "Senha alterada com sucesso! Você já pode entrar." });
        setTimeout(() => {
             window.history.replaceState({}, document.title, "/");
             setView('login');
        }, 3000);
      } else {
        setMsg({ erro: data.error || "Erro ao atualizar senha.", sucesso: '' });
      }
    } catch (error) {
      setMsg({ erro: "Erro ao conectar com o servidor.", sucesso: '' });
    } finally { setLoading(false); }
  };

  // 3. Trocar Senha (Modo Interno / Perfil - Requer Senha Atual)
  const handleChangePasswordInterno = async () => {
    setLoading(true); setMsg({ erro: '', sucesso: '' });
    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://192.168.15.7:3001';
      // Rota nova no back-end para trocar senha validando a atual
      const response = await fetch(`${API_URL}/api/auth/change-password`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: userEmail, senhaAtual: resetData.senhaAtual, novaSenha: resetData.novaSenha })
      });
      const data = await response.json();
      if (data.success) {
        setMsg({ erro: '', sucesso: "Senha atualizada com segurança!" });
        setTimeout(() => {
             if (onBack) onBack();
             else setView('profile');
        }, 3000);
      } else {
        setMsg({ erro: data.error || "A senha atual está incorreta.", sucesso: '' });
      }
    } catch (error) {
      setMsg({ erro: "Erro ao conectar com o servidor.", sucesso: '' });
    } finally { setLoading(false); }
  };

  // Helpers Visuais
  const renderPasswordRules = () => (
    resetData.novaSenha && (
      <div className="mt-[-10px] ml-2 space-y-1 mb-4">
        <p className={`text-[10px] font-bold uppercase transition-colors ${/(?=.*[A-Z])/.test(resetData.novaSenha) ? 'text-emerald-500' : textMuted}`}>
          {/(?=.*[A-Z])/.test(resetData.novaSenha) ? '✓' : '○'} 1 Letra Maiúscula
        </p>
        <p className={`text-[10px] font-bold uppercase transition-colors ${/(?=.*[a-z])/.test(resetData.novaSenha) ? 'text-emerald-500' : textMuted}`}>
          {/(?=.*[a-z])/.test(resetData.novaSenha) ? '✓' : '○'} 1 Letra Minúscula
        </p>
        <p className={`text-[10px] font-bold uppercase transition-colors ${/(?=.*\d)/.test(resetData.novaSenha) ? 'text-emerald-500' : textMuted}`}>
          {/(?=.*\d)/.test(resetData.novaSenha) ? '✓' : '○'} 1 Número
        </p>
        <p className={`text-[10px] font-bold uppercase transition-colors ${resetData.novaSenha.length >= 6 ? 'text-emerald-500' : textMuted}`}>
          {resetData.novaSenha.length >= 6 ? '✓' : '○'} Mín. de 6 caracteres
        </p>
      </div>
    )
  );

  const renderMismatchWarning = () => (
    resetData.novaSenha && resetData.confirmarSenha && resetData.novaSenha !== resetData.confirmarSenha && (
      <p className="text-red-500 text-[10px] font-bold uppercase ml-2 mt-[-10px]">As senhas não coincidem!</p>
    )
  );

  return (
    <div className={`flex-1 flex flex-col h-[100dvh] relative z-10 animate-in slide-in-from-right duration-300 overflow-hidden ${isPerfil ? (isLight ? 'bg-[#F8FAFC]' : 'bg-[#020617]') : ''}`}>
      {/* Efeitos de Fundo Premium (Oculto no modo perfil para não chocar com o fundo nativo) */}
      {!isPerfil && (
        <>
          <div className={`absolute top-[-10%] left-[-10%] w-96 h-96 ${isLight ? 'bg-indigo-400/20' : 'bg-indigo-600/20'} blur-[120px] rounded-full pointer-events-none -z-10`} />
          <div className={`absolute bottom-[-10%] right-[-10%] w-96 h-96 ${isLight ? 'bg-purple-400/20' : 'bg-purple-600/20'} blur-[120px] rounded-full pointer-events-none -z-10`} />
        </>
      )}

      <header className={`pt-14 px-6 pb-2 flex items-center justify-between z-20 ${isPerfil ? 'border-b ' + borderColor : ''}`}>
        <button 
          onClick={onBack ? onBack : () => setView('login')} 
          disabled={loading || msg.sucesso} 
          className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${isLight ? 'active:bg-slate-200/50' : 'active:bg-white/10'} disabled:opacity-0`}
        >
          <ArrowLeft size={24} className={textMain} />
        </button>
        {isPerfil && <h2 className={`text-sm font-black uppercase tracking-widest ${textMain}`}>Segurança</h2>}
        <div className="w-12" />
      </header>

      {msg.sucesso ? (
        <div className="flex-1 flex flex-col items-center justify-center p-8 text-center animate-in zoom-in-95 duration-500">
           <div className="relative mb-8">
             <div className="absolute inset-0 bg-emerald-500 blur-3xl opacity-20 animate-pulse"></div>
             <div className="relative w-24 h-24 rounded-[2rem] bg-emerald-500 flex items-center justify-center shadow-[0_15px_40px_rgba(16,185,129,0.3)]">
                <CheckCircle2 size={48} className="text-white" />
             </div>
           </div>
           <h2 className={`text-4xl font-black mb-4 tracking-tighter ${textMain}`}>Sucesso!</h2>
           <p className={`text-sm leading-relaxed ${textMuted}`}>{msg.sucesso}</p>
        </div>
      ) : (
        <div className="flex-1 flex flex-col px-6 mt-6">
          <main className="flex-1 overflow-y-auto no-scrollbar flex flex-col justify-start pb-10">
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 w-full max-w-sm mx-auto">
              
              <div className="flex flex-col items-center text-center mb-10">
                <div className={`w-20 h-20 rounded-[2rem] flex items-center justify-center mb-6 ${bgCard} border ${borderColor} shadow-2xl shadow-indigo-500/10 relative`}>
                  <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500/10 to-purple-500/10 rounded-[2rem]" />
                  {isPerfil ? <Key size={32} className="text-indigo-500 relative z-10" /> : (emailReset ? <Lock size={32} className="text-indigo-500 relative z-10" /> : <Key size={32} className="text-indigo-500 relative z-10" />)}
                </div>

                <h2 className={`text-3xl font-black mb-3 tracking-tight ${textMain}`}>
                  {isPerfil ? 'Alterar Senha' : (!emailReset ? 'Esqueceu a senha?' : 'Nova Senha')}
                </h2>
                <p className={`text-sm leading-relaxed ${textMuted} max-w-[260px]`}>
                  {isPerfil 
                    ? 'Digite sua senha atual e escolha uma nova senha segura.'
                    : (!emailReset 
                      ? 'Informe seu e-mail e CPF cadastrados para recuperar o seu acesso.' 
                      : <span>Olá, <b className="text-indigo-500 break-all">{emailReset}</b>. Crie uma nova senha.</span>)}
                </p>
              </div>

              {/* RENDERIZAÇÃO INTELIGENTE BASEADA NO MODO */}
              <div className={`p-6 rounded-[2.5rem] ${bgCard} border ${borderColor} shadow-xl shadow-black/5 space-y-2 relative overflow-hidden`}>
                
                {/* CASO 1: MODO PERFIL (LOGADO) */}
                {isPerfil && (
                  <>
                    <CustomInput label="Senha Atual" type="password" placeholder="••••••••" value={resetData.senhaAtual} onChange={e => setResetData({...resetData, senhaAtual: e.target.value})} icon={Lock} tema={tema}/>
                    <CustomInput label="Nova Senha" type="password" placeholder="••••••••" value={resetData.novaSenha} onChange={e => setResetData({...resetData, novaSenha: e.target.value})} icon={Key} tema={tema}/>
                    {renderPasswordRules()}
                    <CustomInput label="Confirmar Nova Senha" type="password" placeholder="••••••••" value={resetData.confirmarSenha} onChange={e => setResetData({...resetData, confirmarSenha: e.target.value})} icon={CheckCircle2} tema={tema}/>
                    {renderMismatchWarning()}
                  </>
                )}

                {/* CASO 2: RECUPERAÇÃO - PEDINDO EMAIL */}
                {!isPerfil && !emailReset && (
                  <>
                    <CustomInput label="Seu E-mail" placeholder="seu@email.com" inputMode="email" autoCapitalize="none" value={recuperaData.email} onChange={e => setRecuperaData({...recuperaData, email: e.target.value})} icon={Mail} tema={tema}/>
                    <CustomInput label="Seu CPF" placeholder="000.000.000-00" inputMode="numeric" value={recuperaData.cpf} onChange={e => setRecuperaData({...recuperaData, cpf: maskCPF(e.target.value)})} icon={FileText} tema={tema}/>
                  </>
                )}

                {/* CASO 3: RECUPERAÇÃO - REDEFININDO SENHA */}
                {!isPerfil && emailReset && (
                  <>
                    <CustomInput label="Nova Senha" type="password" placeholder="••••••••" value={resetData.novaSenha} onChange={e => setResetData({...resetData, novaSenha: e.target.value})} icon={Lock} tema={tema}/>
                    {renderPasswordRules()}
                    <CustomInput label="Confirmar Senha" type="password" placeholder="••••••••" value={resetData.confirmarSenha} onChange={e => setResetData({...resetData, confirmarSenha: e.target.value})} icon={CheckCircle2} tema={tema}/>
                    {renderMismatchWarning()}
                  </>
                )}
                
                {msg.erro && (
                  <div className="flex items-center gap-3 mt-4 bg-red-500/10 border border-red-500/20 p-4 rounded-2xl animate-in fade-in zoom-in-95">
                    <Info size={18} className="text-red-500 min-w-[18px]" />
                    <span className="text-red-500 text-[10px] font-bold uppercase tracking-widest leading-tight">{msg.erro}</span>
                  </div>
                )}
              </div>
            </div>
          </main>

          <footer className="pt-4 pb-[env(safe-area-inset-bottom,1.5rem)]">
            <MainButton 
              onClick={isPerfil ? handleChangePasswordInterno : (!emailReset ? handleSendEmail : handleUpdatePassword)} 
              disabled={
                loading || 
                (isPerfil && (!resetData.senhaAtual || !resetData.novaSenha || resetData.novaSenha !== resetData.confirmarSenha || !validarSenha(resetData.novaSenha))) ||
                (!isPerfil && !emailReset && (!recuperaData.cpf || !recuperaData.email)) ||
                (!isPerfil && emailReset && (!resetData.novaSenha || resetData.novaSenha !== resetData.confirmarSenha || !validarSenha(resetData.novaSenha)))
              }
            >
              {loading ? <Loader2 className="animate-spin" /> : (
                isPerfil ? "Atualizar Senha" : (!emailReset ? "Enviar Link de Acesso" : "Confirmar Nova Senha")
              )}
            </MainButton>
          </footer>
        </div>
      )}
    </div>
  );
}