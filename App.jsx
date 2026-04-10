import React, { useState, useEffect, useRef } from 'react';
import { 
  LogOut, LayoutDashboard, ArrowRightLeft, ShieldCheck,
  User, Zap, FileText, QrCode, Wallet, Eye, EyeOff, CreditCard, 
  ChevronRight, Loader2, ShoppingBag, CalendarDays, ArrowRight, 
  CheckCircle2, Bell, Mail, Lock, Fingerprint, Info, ChevronDown,
  Briefcase, Calendar, Heart, Flag, MapPin, Phone, Landmark, TrendingUp, Home,
  ArrowLeft, Clock, ArrowUpRight, ArrowDownLeft, Search, UploadCloud,
  Copy, Users
} from 'lucide-react';

import Profile from './components/Profile';
import Faturas from './components/Faturas';
import RecuperacaoSenha from './components/RecuperacaoSenha';
import AreaPix from './components/AreaPix';
import Limites from './components/Limites'; 
import Termos from './termo/Termos';
import ComprovantePix from './components/ComprovantePix';
import Privacidade from './termo/Privacidade'; 
import CentralAjuda from './termo/ajuda';
import Notificacoes from './components/Notificacoes';
import { initializeApp } from 'firebase/app';
import { PushNotifications } from '@capacitor/push-notifications';
import { NativeBiometric } from "@capgo/capacitor-native-biometric"; 
import { App as CapacitorApp } from '@capacitor/app'; 
import { cpf } from 'cpf-cnpj-validator';

/** ==========================================
 * COMPONENTES DE UI
 * ========================================== */

const MainButton = ({ onClick, children, icon: Icon, disabled, ...props }) => (
  <button 
    onClick={onClick} 
    disabled={disabled}
    {...props}
    className={`w-full h-16 rounded-2xl font-black text-xs tracking-[0.2em] uppercase transition-all flex items-center justify-center gap-3 active:scale-[0.97] disabled:opacity-20 
      ${disabled ? 'bg-slate-800 text-slate-500' : 'bg-indigo-600 text-white shadow-[0_10px_30px_rgba(79,70,229,0.3)]'}`}
  >
    {children}
    {Icon && <Icon size={18} />}
  </button>
);

const CustomInput = ({ label, placeholder, type = "text", value, onChange, icon: Icon, tema, disabled = false, ...props }) => {
  
  // Novo estado local para controlar se a senha está visível
  const [showPassword, setShowPassword] = useState(false);
  
  const isLight = tema === 'claro';
  const textMain = isLight ? 'text-[#0F172A]' : 'text-white';
  const bgCard = isLight ? 'bg-white' : 'bg-[#0F172A]';
  const borderColor = isLight ? 'border-[#E2E8F0]' : 'border-white/5'; 
  const textLabel = isLight ? 'text-[#94A3B8]' : 'text-white/40';
  const iconColor = isLight ? 'text-indigo-600' : 'text-indigo-400';

  // Lógica para alternar o tipo do input de 'password' para 'text'
  const isPasswordType = type === 'password';
  const inputType = isPasswordType && !showPassword ? 'password' : isPasswordType && showPassword ? 'text' : type;

  return (
    <div className={`mb-5 text-left w-full ${disabled ? 'opacity-60' : ''}`}>
      <div className="flex items-center gap-2 mb-2 ml-2">
        {Icon && <Icon size={14} className={`${iconColor} opacity-80`} />}
        <p className={`text-[10px] font-black uppercase tracking-[0.2em] ${textLabel}`}>{label}</p>
      </div>
      {/* Adicionado 'flex' e 'items-center' para alinhar o input e o ícone do olho lado a lado */}
      <div className={`p-4 rounded-[1.5rem] ${bgCard} border ${borderColor} flex items-center transition-all ${!disabled ? 'focus-within:ring-2 focus-within:ring-indigo-500/30 focus-within:border-indigo-500/50' : ''}`}>
        <input 
          type={inputType} 
          value={value} 
          onChange={onChange} 
          placeholder={placeholder} 
          disabled={disabled}
          {...props} /* 🚀 CRÍTICO: Repassa propriedades como inputMode e autoCapitalize para o teclado do celular */
          className={`bg-transparent border-none outline-none font-bold flex-1 w-full text-base ${textMain} ${isLight ? 'placeholder:text-slate-400' : 'placeholder:text-white/20'}`}
        />
        
        {/* Renderiza o botão do olho APENAS se o input for do tipo senha original */}
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

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

const app = initializeApp(firebaseConfig);

const CustomSelect = ({ label, value, onChange, options, icon: Icon, tema }) => {
  const [isOpen, setIsOpen] = useState(false);
  const isLight = tema === 'claro';
  const textMain = isLight ? 'text-[#0F172A]' : 'text-white';
  const bgCard = isLight ? 'bg-white' : 'bg-[#0F172A]';
  const borderColor = isLight ? 'border-[#E2E8F0]' : 'border-white/5'; 
  const textLabel = isLight ? 'text-[#94A3B8]' : 'text-white/40';
  const iconColor = isLight ? 'text-indigo-600' : 'text-indigo-400';

  return (
    <div className="mb-5 relative">
      <div className="flex items-center gap-2 mb-2 ml-2">
        {Icon && <Icon size={14} className={`${iconColor} opacity-80`} />}
        <p className={`text-[10px] font-black uppercase tracking-[0.2em] ${textLabel}`}>{label}</p>
      </div>
      <div 
        onClick={() => setIsOpen(true)}
        className={`p-4 rounded-[1.5rem] ${bgCard} border ${borderColor} cursor-pointer active:scale-[0.98] transition-transform flex items-center justify-between`}
      >
        <span className={`font-bold text-base ${value ? textMain : textLabel}`}>
          {value || 'Selecione...'}
        </span>
        <ChevronDown size={18} className={textLabel} />
      </div>

      {isOpen && (
        <div className="fixed inset-0 z-[60] flex flex-col justify-end">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsOpen(false)} />
          {/* 🚀 CRÍTICO: Ajuste de padding-bottom usando safe-area para evitar sobreposição da barra de gestos do Android/iOS */}
          <div className={`relative w-full ${bgCard} border-t ${borderColor} rounded-t-[2.5rem] p-6 pb-[max(env(safe-area-inset-bottom,2rem),3rem)] animate-in slide-in-from-bottom-full duration-300 shadow-[0_-10px_40px_rgba(0,0,0,0.2)]`}>
            <div className={`w-12 h-1.5 rounded-full mx-auto mb-6 ${isLight ? 'bg-slate-200' : 'bg-white/10'}`} />
            <h3 className={`text-xl font-black mb-6 px-2 ${textMain}`}>{label}</h3>
            <div className="space-y-2 max-h-[50vh] overflow-y-auto no-scrollbar pr-2">
              {options.map((opt, i) => (
                <button key={i} onClick={() => { onChange({ target: { value: opt } }); setIsOpen(false); }}
                  className={`w-full p-4 rounded-[1.5rem] text-left flex items-center justify-between active:scale-[0.98] transition-all border ${value === opt ? 'bg-indigo-600 border-indigo-500 text-white' : `bg-transparent ${borderColor} ${textMain} hover:bg-slate-500/5`}`}>
                  <span className="font-bold">{opt}</span>
                  {value === opt && <CheckCircle2 size={18} />}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/// ==========================================
// COMPONENTE PRINCIPAL (APP)
// ==========================================
export default function App() {
  const API_URL = import.meta.env.VITE_API_URL || 'http://72.61.222.214:3001';
  const [view, setView] = useState('welcome');
  const [user, setUser] = useState(null); 
  const [showValues, setShowValues] = useState(true);
  const [loading, setLoading] = useState(false);
  const [loadingCep, setLoadingCep] = useState(false); // Novo estado para o mobile não parecer travado
  const [step, setStep] = useState(1);
  const [erroLogin, setErroLogin] = useState(''); 
  const [notificacoes, setNotificacoes] = useState([]);
  const [bannersApp, setBannersApp] = useState([]);
  const [apiLoaded, setApiLoaded] = useState(false);

// Função para disparar alertas de qualquer lugar
const dispararAviso = (titulo, mensagem, tipo = 'info') => {
  const nova = { id: Date.now(), titulo, mensagem, tipo };
  setNotificacoes(prev => [...prev, nova]);
};
  const [loginStep, setLoginStep] = useState(1);

  // --- INÍCIO DA LÓGICA DO BOTÃO VOLTAR NATIVO ---
  const viewRef = useRef(view);
  const stepRef = useRef(step);
  const loginStepRef = useRef(loginStep);

  useEffect(() => { viewRef.current = view; }, [view]);
  useEffect(() => { stepRef.current = step; }, [step]);
  useEffect(() => { loginStepRef.current = loginStep; }, [loginStep]);

  useEffect(() => {
    let backListener = null;

    const registrarOuvinte = async () => {
      // O Capacitor intercepta o gesto/botão nativo do Android
      backListener = await CapacitorApp.addListener('backButton', () => {
        const currentView = viewRef.current;

        // Se estiver na tela de Boas-vindas ou na Home, fecha o app
        if (currentView === 'welcome' || currentView === 'home') {
          CapacitorApp.exitApp();
        } 
        // Lógica dentro do Login
        else if (currentView === 'login') {
          if (loginStepRef.current === 2) {
            setLoginStep(1); 
            setErroLogin('');
          } else {
            setView('welcome');
          }
        } 
        // Lógica dentro do Cadastro
        else if (currentView === 'onboarding') {
          if (stepRef.current > 1) {
            setStep(stepRef.current - 1);
            setErroLogin('');
          } else {
            setView('welcome');
          }
        } 
        // Se estiver solto em qualquer outra aba (Perfil, Faturas, Pix), volta pra Home!
        else {
          setView('home');
        }
      });
    };

    registrarOuvinte();

    // Limpeza correta da memória
    return () => {
      if (backListener) {
        backListener.remove();
      }
    };
  }, []);

  // ==========================================
  // ESTADO GLOBAL DO TEMA
  // ==========================================
  const [tema, setTema] = useState(() => {
    if (typeof window !== 'undefined' && window.matchMedia) {
      return window.matchMedia('(prefers-color-scheme: light)').matches ? 'claro' : 'escuro';
    }
    return 'escuro'; 
  });

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: light)');
    const handleChange = (e) => {
      setTema(e.matches ? 'claro' : 'escuro');
    };
    
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);
  
// Recuperar sessão e pedir Biometria ao abrir o app
useEffect(() => {
  const verificarSessao = async () => {
    const usuarioSalvo = localStorage.getItem('@Liberta:user');
    // NOVO: Verifica se o usuário ativou a biometria nas configurações
    const biometriaAtiva = localStorage.getItem('@Liberta:biometriaAtiva') === 'true'; 

    if (usuarioSalvo) {
      const parsedUser = JSON.parse(usuarioSalvo);

      // Só dispara o sensor se a biometria estiver ligada no perfil
      if (biometriaAtiva) {
        try {
          const result = await NativeBiometric.isAvailable();

          if (result.isAvailable) {
            await NativeBiometric.verifyIdentity({
              reason: "Para sua segurança, confirme a sua identidade",
              title: "Autenticação AuraPix",
              subtitle: "Aceda com a sua impressão digital ou rosto",
            });

            setUser(parsedUser);
            setView('home');
          } else {
            // Celular não tem sensor, entra direto
            setUser(parsedUser);
            setView('home');
          }
        } catch (error) {
          console.error("Biometria cancelada ou falhou:", error);
          setAuthData({ login: parsedUser.email || parsedUser.cpf, senha: '' });
          setLoginStep(2);
          setView('login');
          setErroLogin("Autenticação biométrica cancelada. Digite sua senha.");
        }
      } else {
        // Biometria desativada pelo usuário, entra direto (ou pede senha, como preferir)
        setUser(parsedUser);
        setView('home');
      }
    }
  };

  verificarSessao();
}, []);
  // ==========================================
  // CAPTURA DE PARÂMETROS DE URL (DEEP LINKING BÁSICO)
  // Consolidado em um único useEffect
  // ==========================================
  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const emailParam = params.get('email');
      
      if (emailParam) {
        setView('recuperacao');
      }
    } catch (error) {
      console.warn("Erro ao ler parâmetros de URL no ambiente mobile:", error);
    }
  }, []);

useEffect(() => {
    if (user && user.uid) {
      const registrarPushNativo = async () => {
        try {
          // 1. Pede permissão nativa ao Android/iOS
          let permStatus = await PushNotifications.checkPermissions();
          
          if (permStatus.receive === 'prompt') {
            permStatus = await PushNotifications.requestPermissions();
          }

          if (permStatus.receive !== 'granted') {
            console.warn('Permissão de notificação negada pelo usuário.');
            return;
          }

          // 2. Registra o aparelho no serviço de Push da Apple/Google
          await PushNotifications.register();

          // 3. Captura o Token FCM Nativo
          PushNotifications.addListener('registration', async (token) => {
            console.log('🚀 Token FCM Nativo capturado:', token.value);

            // 4. Envia o token para o seu servidor Node.js (Liberta Brain)
            const API_URL = import.meta.env.VITE_API_URL;
            await fetch(`${API_URL}/api/notificacoes/registrar-token`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ uid: user.uid, fcmToken: token.value })
            });
          });

          // Trata erros de registro nativo
          PushNotifications.addListener('registrationError', (error) => {
            console.error('Erro ao registrar push nativo:', error);
          });

          // 5. Escuta as notificações chegando com o app ABERTO na tela
          PushNotifications.addListener('pushNotificationReceived', (notification) => {
            console.log('Push recebido em Foreground:', notification);
            
            // Dispara aquele seu Toast visual bonitão na tela!
            dispararAviso(
              notification.title || "Aura Pix",
              notification.body || "Você tem um novo aviso.",
              notification.data?.tipo || 'info'
            );
          });

        } catch (error) {
          console.error("Erro ao configurar Push Nativo do Capacitor:", error);
        }
      };

      registrarPushNativo();

      // Limpa os ouvintes de notificação quando o usuário sair da conta
      return () => {
        PushNotifications.removeAllListeners();
      };
    }
  }, [user]);

useEffect(() => {
    const buscarBanners = async () => {
      try {
        // Trocamos temporariamente a variável pelo IP real da sua VPS
        const response = await fetch(`${API_URL}/api/banners`);
        const data = await response.json();
        
        if (data.success) {
          setBannersApp(data.banners || []);
        }
      } catch (error) {
        console.error("Erro ao sincronizar:", error);
      } finally {
        setApiLoaded(true);
      }
    };
    buscarBanners();
}, []);
  
  // Variáveis Dinâmicas
  const isLight = tema === 'claro';
  const bgMain = isLight ? 'bg-[#F8FAFC]' : 'bg-[#020617]'; 
  const textMain = isLight ? 'text-[#0F172A]' : 'text-white';
  const bgCard = isLight ? 'bg-white' : 'bg-[#0F172A]';
  const borderColor = isLight ? 'border-[#E2E8F0]' : 'border-white/5'; 
  const textMuted = isLight ? 'text-[#64748B]' : 'text-white/50'; 
  const textLabel = isLight ? 'text-[#94A3B8]' : 'text-white/40';
  const iconColor = isLight ? 'text-indigo-600' : 'text-indigo-400';

  const [authData, setAuthData] = useState({ login: '', senha: '' });
  const [formData, setFormData] = useState({
    nome: '', cpf: '', dataNascimento: '', nomeMae: '', estadoCivil: '', nacionalidade: 'Brasileira',
    email: '', celular: '', cep: '', endereco: '', numero: '', bairro: '', cidade: '', uf: '',
    profissao: '', renda: '', patrimonio: ''
  });

  const maskCEP = (v) => v.replace(/\D/g, '').replace(/^(\d{5})(\d)/, '$1-$2').substring(0, 9);

  const validarSenha = (senha) => {
    const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{6,16}$/;
    return regex.test(senha);
  };

  // Melhorado para lidar com oscilações de rede no celular
const buscarCep = async (cepDigitado) => {
    const cepLimpo = cepDigitado.replace(/\D/g, ''); 
    if (cepLimpo.length !== 8) return; 

    setLoadingCep(true);
    try {
      // 1. Define a URL da sua API (Liberta Brain)
      const API_URL = import.meta.env.VITE_API_URL || 'http://72.61.222.214:3001';

      // 2. Configura o AbortController para evitar requisições presas
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 8000); // 8 segundos de limite

      // 3. Faz a chamada para o SEU servidor, não mais para o ViaCEP direto
      const response = await fetch(`${API_URL}/api/utils/cep/${cepLimpo}`, {
        signal: controller.signal
      });
      clearTimeout(timeoutId);

      const data = await response.json();
      
      // 4. Trata a resposta baseada no formato do seu backend (data.success e data.address)
      if (data.success && data.address) {
        const info = data.address;
        setFormData(prev => ({
          ...prev,
          endereco: info.logradouro || '',
          bairro: info.bairro || '',
          cidade: info.localidade || '',
          uf: info.uf || ''
        }));
      } else {
        console.warn(data.error || "CEP não encontrado.");
      }
    } catch (error) {
      if (error.name === 'AbortError') {
        console.error("Timeout na busca do CEP. Conexão lenta ou servidor offline.");
      } else {
        console.error("Erro de rede ao buscar CEP:", error);
      }
    } finally {
      setLoadingCep(false);
    }
  };

  const handleVerificarCPF = async () => {
    setLoading(true);
    setErroLogin(''); 
    
    // 1. Limpa o CPF para garantir que apenas números sejam validados/enviados
    const cpfLimpo = formData.cpf.replace(/\D/g, '');

    // 2. Validação Matemática Local (Instantânea)
    // Evita chamar o servidor se o usuário digitou algo claramente errado
    if (!cpf.isValid(cpfLimpo)) {
      setErroLogin("CPF inválido. Verifique os números digitados.");
      setLoading(false);
      return;
    }
    
    try {
      // 3. Usa a URL do .env ou o IP de fallback para desenvolvimento
      const API_URL = import.meta.env.VITE_API_URL || 'http://72.61.222.214:3001';
      
      const response = await fetch(`${API_URL}/api/auth/verificar-cpf`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cpf: cpfLimpo }) // Enviamos a versão limpa para o backend
      });
      
      const data = await response.json();
      
      // 4. Se o backend retornar erro (CPF já cadastrado ou inválido lá também)
      if (!data.success) {
        throw new Error(data.error || "Este CPF já possui uma conta cadastrada.");
      }

      // Sucesso! Avança para o passo de criação de senha/e-mail
      setStep(3); 
      
    } catch (error) {
      console.error("Erro na verificação do CPF:", error);
      
      // Tratamento para falta de rede ou servidor offline
      const isNetworkError = error.message.includes('Failed to fetch') || error.message.includes('NetworkError');
      setErroLogin(isNetworkError ? "Não foi possível conectar ao Liberta Brain. Verifique sua conexão." : error.message);
    } finally {
      setLoading(false);
    }
  };

 // ==========================================
  // LÓGICA DE INTEGRAÇÃO (Otimizada para Mobile/APK)
  // ==========================================
  const consultarMotorSrv = async (valorSolicitado) => {
    if (!navigator.onLine) {
      console.warn("Dispositivo offline. Não foi possível simular o crédito.");
      return null;
    }

    try {
      import.meta.env.VITE_API_URL
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s de limite

      const response = await fetch(`${API_URL}/api/credito/simular`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          uid: user.uid || "ID_TESTE", 
          valor: valorSolicitado,
          dias: 30
        }),
        signal: controller.signal
      });

      clearTimeout(timeoutId);
      const data = await response.json();
      return data.success ? data.oferta : null;

    } catch (error) {
      console.error("Erro ao falar com o servidor:", error);
      return null;
    }
  };
  
  const handleLogin = async () => {
    setLoading(true);
    setErroLogin('');

    if (!navigator.onLine) {
      setErroLogin("Sem conexão com a internet. Verifique seu Wi-Fi ou dados móveis.");
      setLoading(false);
      return;
    }

    try {
      import.meta.env.VITE_API_URL
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);

      const response = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          login: authData.login.toLowerCase().trim(), 
          senha: authData.senha 
        }),
        signal: controller.signal
      });

      clearTimeout(timeoutId);
      const data = await response.json();

      if (data.success) {
        // ✅ PERSISTÊNCIA: Salva os dados no celular
        localStorage.setItem('@Liberta:user', JSON.stringify(data.user)); 
        
        setUser(data.user);
        setView('home');
      } else {
        setErroLogin(data.error || "Usuário não encontrado. Verifique os dados.");
      }
    } catch (error) {
      if (error.name === 'AbortError') {
        setErroLogin("A conexão está muito lenta. Tente novamente.");
      } else {
        console.error("Erro no login:", error);
        setErroLogin("Erro de conexão com o servidor do Liberta.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async () => {
    setLoading(true);
    setErroLogin('');
    
    if (!navigator.onLine) {
      setErroLogin("Você está offline. Conecte-se à internet para criar sua conta.");
      setLoading(false);
      return;
    }

    try {
      import.meta.env.VITE_API_URL
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000);

      const response = await fetch(`${API_URL}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
        signal: controller.signal
      });

      clearTimeout(timeoutId);
      const data = await response.json();

      if (data.success) {
        const usuarioLogado = {
          ...formData,
          uid: data.uid,
          tier: 'Standard',
          saldo: 0,
          limites: { pix: 0, compras: 0, fatura: 0 },
          fatura: { valorAtual: 0, vencimento: '10/03', status: 'Fechada' },
          transacoes: []
        };

        // ✅ PERSISTÊNCIA: Salva os dados após o cadastro
        localStorage.setItem('@Liberta:user', JSON.stringify(usuarioLogado));

        setUser(usuarioLogado);
        setView('home');
      } else {
        setErroLogin(data.error || "Erro ao realizar cadastro.");
      }
    } catch (error) {
      if (error.name === 'AbortError') {
        setErroLogin("O servidor demorou a responder. Tente novamente.");
      } else {
        console.error("Erro na requisição de cadastro:", error);
        setErroLogin("Servidor offline ou indisponível.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async () => {
    setLoading(true);
    setMsgRecupera({ erro: '', sucesso: '' });
    
    if (!navigator.onLine) {
      setMsgRecupera({ erro: "Sem conexão com a internet.", sucesso: '' });
      setLoading(false);
      return;
    }

    try {
      import.meta.env.VITE_API_URL
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);

      const response = await fetch(`${API_URL}/api/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cpf: recuperaData.cpf,
          nomeMae: recuperaData.nomeMae,
          novaSenha: recuperaData.novaSenha
        }),
        signal: controller.signal
      });

      clearTimeout(timeoutId);
      const data = await response.json();

      if (data.success) {
        setMsgRecupera({ erro: '', sucesso: "Senha alterada com sucesso!" });
        setTimeout(() => {
          setView('login');
          setRecuperaData({ cpf: '', nomeMae: '', novaSenha: '', confirmarNovaSenha: '' });
          setRecuperaStep(1);
          setMsgRecupera({ erro: '', sucesso: '' });
        }, 2000);
      } else {
        setMsgRecupera({ erro: data.error || "Erro ao recuperar senha.", sucesso: '' });
      }
    } catch (error) {
      if (error.name === 'AbortError') {
        setMsgRecupera({ erro: "Tempo limite de conexão excedido.", sucesso: '' });
      } else {
        setMsgRecupera({ erro: "Erro de comunicação com o servidor.", sucesso: '' });
      }
    } finally {
      setLoading(false);
    }
  };

  const maskCPF = (v) => v.replace(/\D/g, '').replace(/(\d{3})(\d)/, '$1.$2').replace(/(\d{3})(\d)/, '$1.$2').replace(/(\d{3})(\d{1,2})/, '$1-$2').replace(/(-\d{2})\d+?$/, '$1');
  const formatMoney = (val) => showValues ? val.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) : '••••';

  // Função para solicitar ao Servidor o processamento do Pix
const descontarLimitePix = async (valorPix, valorDaParcela, numeroDeParcelas, chavePix, tipoChave) => {
    // ...
    try {
      // ...
      const response = await fetch(`${API_URL}/api/pix/transferir`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          uid: user.uid,
          valorPix,
          valorParcela: valorDaParcela,
          parcelas: numeroDeParcelas,
          chavePix: chavePix,     
          tipoChave: tipoChave    
        }),
        signal: controller.signal
      });

      clearTimeout(timeoutId);
      const data = await response.json();

      if (data.success) {
        setUser(data.user); 
        // Verifica se setDadosUltimaTransacao está definido no escopo geral, 
        // caso contrário, passe via props ou Context
        if (typeof setDadosUltimaTransacao === 'function') {
           setDadosUltimaTransacao(data.user.transacoes[0]); 
        }
        return true;
      }
      return false;
    } catch (error) {
      console.error("Erro na integração do Pix:", error);
      // Aqui seria ideal disparar um toast ou notificação na UI de que a transferência falhou por rede
      return false;
    }
  };

// ==========================================
  // RENDERIZAÇÃO
  // ==========================================
  return (
<div className={`fixed inset-0 w-full h-[100dvh] flex flex-col select-none overflow-hidden ${bgMain} ${textMain} transition-colors duration-500`}>
      
      {/* 🚀 COMPONENTE DE NOTIFICAÇÕES (Fica por cima de tudo) */}
      <Notificacoes 
        lista={notificacoes} 
        setNotificacoes={setNotificacoes} 
        tema={tema} 
      />

      <div className={`w-full h-full flex flex-col relative overflow-x-hidden overflow-y-auto ${bgMain} max-w-md mx-auto`}>

        {/* --- TELA: BEM-VINDO --- */}
        {view === 'welcome' && (
          <div className="flex-1 flex flex-col relative w-full h-full animate-in fade-in duration-500 overflow-hidden bg-indigo-600">
            
{/* BACKGROUND / IMAGEM DE DESTAQUE COM EFEITO DE PROFUNDIDADE */}
<div className="absolute inset-0 z-0 flex justify-center items-center overflow-hidden">
   <div className="w-full h-full absolute top-0 bg-gradient-to-b from-[#1e1b4b] via-indigo-600 to-[#020617] flex flex-col items-center justify-center">
      
      {/* Efeito de Aura/Brilho atrás da logo */}
      <div className="absolute w-80 h-80 bg-indigo-400/20 rounded-full blur-[100px] animate-pulse" />
      
      <div className="relative group">
        {/* Sombra interna para a logo não parecer chapada */}
        <div className="absolute inset-0 bg-indigo-500/10 blur-2xl rounded-full scale-150 group-hover:scale-110 transition-transform duration-700" />
        
        <img 
          src="https://i.postimg.cc/nhd0jdQq/Chat-GPT-Image-12-de-mar-de-2026-18-47-20.png" 
          alt="Aura Pix" 
          className="w-60 h-60 object-contain relative z-10 drop-shadow-[0_20px_50px_rgba(79,70,229,0.5)]" 
        />
      </div>

      {/* Nome da marca abaixo da logo (opcional, mas ajuda a preencher) */}
      <h1 className="text-white text-4xl font-black italic tracking-tighter mt-4 opacity-90">
        AURA<span className="text-indigo-400">PIX</span>
      </h1>
   </div>
</div>

            {/* ÁREA DOS BOTÕES (RODAPÉ) */}
            <div className="absolute bottom-0 w-full p-6 z-10 flex flex-col gap-3 bg-gradient-to-t from-black/90 via-black/60 to-transparent pt-32 pb-[env(safe-area-inset-bottom,2rem)]">
              <h2 className="text-white text-2xl font-black tracking-tight mb-4 drop-shadow-md">
                  Mais liberdade para pagar<br/>do seu jeito.
              </h2>
              
              <button 
                onClick={() => { 
                  setView('login'); 
                  setLoginStep(1); 
                  setAuthData({login: '', senha: ''}); 
                  setErroLogin('');
                }}
                className="w-full h-14 rounded-full font-black text-sm tracking-widest uppercase transition-all bg-indigo-500 text-white shadow-lg shadow-indigo-500/30 active:scale-[0.98]"
              >
                Entrar
              </button>
              
              <button 
                onClick={() => { setStep(1); setView('onboarding'); }}
                className="w-full h-14 rounded-full font-black text-sm tracking-widest uppercase transition-all bg-transparent border-2 border-white/20 text-white hover:bg-white/10 active:scale-[0.98]"
              >
                Abrir conta grátis
              </button>
            </div>
          </div>
        )}

       {/* --- TELA: LOGIN (2 ETAPAS) --- */}
        {view === 'login' && (
          <div className="flex-1 flex flex-col p-6 pt-[max(env(safe-area-inset-top,1.5rem),3.5rem)] animate-in slide-in-from-right duration-300 relative z-10 w-full max-w-full overflow-hidden">
            
            {/* HEADER COM BOTÃO VOLTAR */}
            <header className="flex items-center gap-4 mb-10 w-full">
              <button 
                onClick={() => {
                  setErroLogin('');
                  if (loginStep === 2) {
                    setLoginStep(1); // Volta pro E-mail
                  } else {
                    setView('welcome'); // Volta pra Boas-Vindas
                  }
                }} 
                className={`p-2 hover:bg-white/5 active:bg-white/10 rounded-full transition-colors z-20`}
              >
                <ArrowLeft size={24} className={textMain} />
              </button>
            </header>

            <div className="flex-1 flex flex-col w-full overflow-y-auto no-scrollbar pb-6">
{/* ETAPA 1: E-MAIL OU CPF */}
{loginStep === 1 && (
  <div className="w-full animate-in fade-in slide-in-from-right-4 space-y-8 flex-1">
    <div className="mt-4">
      <h2 className={`text-3xl font-black mb-3 tracking-tight ${textMain}`}>
        Acesse sua conta
      </h2>
      <p className={`text-sm ${textMuted} font-medium`}>
        Digite seu e-mail cadastrado para continuar.
      </p>
    </div>
    
    <div className="relative group">
      <input
        type="text"
        inputMode="email"
        autoCapitalize="none"
        autoCorrect="off"
        autoFocus
        placeholder="E-mail"
        value={authData.login}
        onChange={e => setAuthData({...authData, login: e.target.value})}
        className={`w-full bg-transparent border-b-2 ${borderColor} focus:border-indigo-500 py-4 text-xl font-bold ${textMain} outline-none transition-all placeholder:opacity-20`}
      />
      <div className="absolute bottom-0 left-0 w-0 h-0.5 bg-indigo-500 transition-all duration-500 group-focus-within:w-full" />
    </div>
  </div>
)}

{/* ETAPA 2: SENHA */}
{loginStep === 2 && (
  <div className="w-full animate-in fade-in slide-in-from-right-4 space-y-6 flex-1">
    <h2 className={`text-2xl font-black mb-2 tracking-tight ${textMain}`}>
      Digite sua senha
    </h2>
    <p className={`text-sm ${textMuted} mb-8 break-words`}>
       Para o acesso de <span className="font-bold text-indigo-500 break-all">{authData.login}</span>
    </p>
    
    <div className={`w-full rounded-[1.5rem] ${bgCard} border border-indigo-500/50 shadow-[0_0_15px_rgba(99,102,241,0.1)] focus-within:border-indigo-400 focus-within:ring-2 focus-within:ring-indigo-500/20 transition-all flex items-center overflow-hidden pr-2`}>
      <input
        type="password"
        autoFocus
        placeholder="••••••••"
        value={authData.senha}
        onChange={e => setAuthData({...authData, senha: e.target.value})}
        className={`flex-1 w-full min-w-0 bg-transparent border-none outline-none font-bold text-2xl px-6 py-5 ${textMain} placeholder:opacity-30 tracking-widest`}
      />
    </div>

    <div className="mt-8 text-left w-full">
      <button 
        onClick={() => { setView('recuperacao'); }} 
        className={`font-bold text-sm text-indigo-500 hover:text-indigo-400 transition-colors cursor-pointer`}
        >
          Não sei a minha senha
      </button>
    </div>
  </div>
)}

              {/* MENSAGEM DE ERRO (Aparece em qualquer uma das etapas se houver) */}
              {erroLogin && (
                <div className="w-full flex items-center gap-3 mt-4 bg-red-500/10 border border-red-500/20 p-4 rounded-2xl animate-in fade-in zoom-in-95">
                  <Info size={18} className="text-red-500 min-w-[18px]" />
                  <span className="text-red-500 text-[11px] font-bold uppercase tracking-wide leading-tight">{erroLogin}</span>
                </div>
              )}
            </div>

            {/* BOTÃO DO RODAPÉ */}
            <footer className="w-full pt-4 pb-[env(safe-area-inset-bottom,1.5rem)]">
              <MainButton 
                onClick={() => {
                  setErroLogin('');
                  if (loginStep === 1) {
                    setLoginStep(2); // Vai para a tela de senha
                  } else {
                    handleLogin(); // Tenta fazer o login no backend
                  }
                }} 
                disabled={
                  loading || 
                  (loginStep === 1 && !authData.login) || 
                  (loginStep === 2 && !authData.senha)
                }
              >
                {loading ? <Loader2 className="animate-spin" /> : (loginStep === 1 ? "Continuar" : "Entrar")}
              </MainButton>
            </footer>
          </div>
        )}

        {/* --- TELA: ONBOARDING (CADASTRO) --- */}
        {view === 'onboarding' && (
          <div className="flex-1 flex flex-col p-6 pt-[max(env(safe-area-inset-top,1.5rem),3.5rem)] animate-in slide-in-from-right duration-300">
            
            {/* PROGRESS BAR ATUALIZADA PARA 7 ETAPAS */}
            <header className="flex items-center gap-4 mb-10">
              <button 
                onClick={() => {
                  setErroLogin('');
                  step > 1 ? setStep(step - 1) : setView('welcome');
                }} 
                className={`p-2 hover:bg-white/5 active:bg-white/10 rounded-full transition-colors`}
              >
                <ArrowLeft size={24} />
              </button>
              <div className={`flex-1 h-1.5 rounded-full ${isLight ? 'bg-slate-200' : 'bg-[#0F172A]'} overflow-hidden`}>
                <div className="h-full bg-indigo-500 transition-all duration-500" style={{ width: `${(step/7)*100}%` }} />
              </div>
              <span className={`text-[10px] font-black ${textLabel}`}>{step}/7</span>
            </header>

            <div className="flex-1 overflow-y-auto no-scrollbar pb-10">
              
              {/* NOVA ETAPA 1: TERMOS E POLÍTICAS */}
              {step === 1 && (
                <div className="animate-in fade-in slide-in-from-right-4 space-y-6 px-1">
                  <h2 className={`text-2xl font-black mb-8 ${textMain}`}>Para começar, confira nossas políticas de uso</h2>

                  <div className="space-y-3">
                    <h3 className={`text-base font-bold ${textMain}`}>Declaração de privacidade e uso de dados</h3>
                    {/* 🚀 TEXTO 1 ALTERADO AQUI */}
                    <p className={`text-[11px] ${textMuted} leading-relaxed`}>
                      Vamos coletar dados pessoais, como seu e-mail, documento de identidade, imagem e dados biométricos para validar sua identidade e oferecer nossos serviços. Também podemos acessar sua lista de contatos e processar dados por meio de terceiros. Tudo de acordo com nossa <span onClick={() => setView('termos')} className="text-indigo-500 underline cursor-pointer active:text-indigo-400">Declaração de privacidade</span>.
                    </p>
                    <label className="flex items-center gap-3 cursor-pointer mt-4 py-2">
                      <input 
                        type="checkbox" 
                        className="w-5 h-5 accent-indigo-600 rounded cursor-pointer" 
                        checked={formData.aceitePrivacidade} 
                        onChange={(e) => setFormData({...formData, aceitePrivacidade: e.target.checked})} 
                      />
                      <span className={`text-xs ${textMain}`}>Aceito o uso dos meus dados.</span>
                    </label>
                  </div>

                  <div className={`space-y-3 pt-6 border-t ${borderColor}`}>
                    <h3 className={`text-base font-bold ${textMain}`}>Termos e condições</h3>
                    {/* 🚀 TEXTO 2 ALTERADO AQUI */}
                    <p className={`text-[11px] ${textMuted} leading-relaxed`}>
                      Ao usar o aplicativo, você tem direitos e responsabilidades que são informados em nossos <span onClick={() => setView('termos')} className="text-indigo-500 underline cursor-pointer active:text-indigo-400">Termos e condições</span>.
                    </p>
                    <label className="flex items-center gap-3 cursor-pointer mt-4 py-2">
                      <input 
                        type="checkbox" 
                        className="w-5 h-5 accent-indigo-600 rounded cursor-pointer" 
                        checked={formData.aceiteTermos} 
                        onChange={(e) => setFormData({...formData, aceiteTermos: e.target.checked})} 
                      />
                      <span className={`text-xs ${textMain}`}>Aceito os Termos e condições.</span>
                    </label>
                  </div>
                </div>
              )}

              {/* NOVA ETAPA 2: CPF */}
              {step === 2 && (
                <div className="animate-in fade-in slide-in-from-right-4 space-y-6 px-1">
                  <h2 className={`text-3xl font-black mb-2 tracking-tight ${textMain}`}>Adicione seu CPF ou CNPJ</h2>
                  <p className={`text-sm ${textMuted} mb-8`}>O documento indica de quem será a conta. Ela pode ser sua ou de um negócio.</p>

                  <div className={`p-2 rounded-[1rem] ${bgCard} border border-indigo-500/50 shadow-[0_0_15px_rgba(99,102,241,0.1)] transition-all`}>
                    <input
                      type="tel" // Aciona o teclado numérico no celular (ideal para CPF)
                      inputMode="numeric"
                      autoFocus
                      placeholder="000.000.000-00"
                      value={formData.cpf}
                      onChange={e => setFormData({...formData, cpf: maskCPF(e.target.value)})}
                      className={`w-full bg-transparent border-none outline-none font-bold text-xl px-4 py-3 ${textMain} placeholder:opacity-30`}
                    />
                  </div>
                  <p className={`text-[10px] ${textLabel} mt-2 ml-2`}>Insira somente números, sem pontos, espaços ou hífen.</p>
                </div>
              )}

              {/* ETAPA 3: ACESSO */}
              {step === 3 && (
                <div className="animate-in fade-in slide-in-from-right-4 space-y-2">
                  <h2 className="text-3xl font-black mb-6">Criar Acesso</h2>
                  <p className={`text-sm mb-6 ${textMuted}`}>Crie os dados de acesso da sua conta.</p>
                  
                  {/* Nota: Assumindo que o CustomInput repassa os props extras para o input nativo, adicionei inputMode e autoCapitalize */}
                  <CustomInput label="E-mail" placeholder="seu@email.com" inputMode="email" autoCapitalize="none" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} icon={Mail} tema={tema}/>
                  <CustomInput label="Crie sua Senha" type="password" placeholder="Sua senha segura" value={formData.senha} onChange={e => setFormData({...formData, senha: e.target.value})} icon={Lock} tema={tema}/>
                  
                  {formData.senha && (
                    <div className="mt-2 ml-2 space-y-1 mb-4">
                      <p className={`text-[10px] font-bold uppercase transition-colors ${/(?=.*[A-Z])/.test(formData.senha) ? 'text-emerald-500' : textMuted}`}>
                        {/(?=.*[A-Z])/.test(formData.senha) ? '✓' : '○'} 1 Letra Maiúscula
                      </p>
                      <p className={`text-[10px] font-bold uppercase transition-colors ${/(?=.*[a-z])/.test(formData.senha) ? 'text-emerald-500' : textMuted}`}>
                        {/(?=.*[a-z])/.test(formData.senha) ? '✓' : '○'} 1 Letra Minúscula
                      </p>
                      <p className={`text-[10px] font-bold uppercase transition-colors ${/(?=.*\d)/.test(formData.senha) ? 'text-emerald-500' : textMuted}`}>
                        {/(?=.*\d)/.test(formData.senha) ? '✓' : '○'} 1 Número
                      </p>
                      <p className={`text-[10px] font-bold uppercase transition-colors ${formData.senha.length >= 6 ? 'text-emerald-500' : textMuted}`}>
                        {formData.senha.length >= 6 ? '✓' : '○'} Mín. de 6 caracteres
                      </p>
                    </div>
                  )}

                  <CustomInput label="Confirme a Senha" type="password" placeholder="Repita sua senha" value={formData.confirmarSenha} onChange={e => setFormData({...formData, confirmarSenha: e.target.value})} icon={Lock} tema={tema}/>
                  
                  {formData.senha && formData.confirmarSenha && formData.senha !== formData.confirmarSenha && (
                    <p className="text-red-500 text-[10px] font-bold uppercase ml-2 mt-[-10px]">As senhas não coincidem!</p>
                  )}
                </div>
              )}

              {/* ETAPA 4: IDENTIDADE */}
              {step === 4 && (
                <div className="animate-in fade-in slide-in-from-right-4 space-y-2">
                  <h2 className="text-3xl font-black mb-6">Identidade</h2>
                  <CustomInput label="Nome Completo" placeholder="Como quer ser chamado?" autoCapitalize="words" value={formData.nome} onChange={e => setFormData({...formData, nome: e.target.value})} icon={User} tema={tema}/>
                  <CustomInput label="Data de Nascimento" type="date" value={formData.dataNascimento} onChange={e => setFormData({...formData, dataNascimento: e.target.value})} icon={Calendar} tema={tema}/>
                  <CustomInput label="Nome da Mãe" placeholder="Nome completo" autoCapitalize="words" value={formData.nomeMae} onChange={e => setFormData({...formData, nomeMae: e.target.value})} icon={Heart} tema={tema}/>
                </div>
              )}

              {/* ETAPA 5: RESIDÊNCIA */}
              {step === 5 && (
                <div className="animate-in fade-in slide-in-from-right-4 space-y-2">
                  <h2 className="text-3xl font-black mb-6">Residência</h2>
                  <CustomInput 
                    label="CEP" 
                    placeholder="00000-000" 
                    inputMode="numeric"
                    value={formData.cep} 
                    onChange={e => {
                      const cepMascarado = maskCEP(e.target.value);
                      setFormData({...formData, cep: cepMascarado});
                      if (cepMascarado.replace(/\D/g, '').length === 8) buscarCep(cepMascarado);
                    }} 
                    icon={MapPin} 
                    tema={tema}
                  />
                  <CustomInput label="Endereço Completo" value={formData.endereco} onChange={e => setFormData({...formData, endereco: e.target.value})} icon={Home} tema={tema} disabled={true} />
                  <div className="flex gap-4">
                    <div className="w-1/3">
                      <CustomInput label="Nº" placeholder="123" inputMode="numeric" value={formData.numero} onChange={e => setFormData({...formData, numero: e.target.value})} tema={tema} />
                    </div>
                    <div className="flex-1">
                      <CustomInput label="Bairro" placeholder="Ex: Centro" value={formData.bairro} onChange={e => setFormData({...formData, bairro: e.target.value})} tema={tema} disabled={true} />
                    </div>
                  </div>
                  <div className={`p-5 rounded-[1.5rem] ${bgCard} border ${borderColor} border-dashed flex flex-col items-center gap-2 cursor-pointer ${isLight ? 'active:bg-slate-100' : 'active:bg-white/5'}`}>
                    <UploadCloud size={24} className="text-indigo-500 mb-1" />
                    <p className={`text-[10px] font-black uppercase ${textLabel}`}>Anexar Comprovante</p>
                  </div>
                </div>
              )}

              {/* ETAPA 6: CONTATO */}
              {step === 6 && (
                <div className="animate-in fade-in slide-in-from-right-4 space-y-2">
                  <h2 className="text-3xl font-black mb-6">Contato</h2>
                  <CustomInput label="Celular" placeholder="(11) 99999-9999" inputMode="tel" value={formData.celular} onChange={e => setFormData({...formData, celular: e.target.value})} icon={Phone} tema={tema}/>
                  <CustomSelect label="Estado Civil" value={formData.estadoCivil} options={['Solteiro(a)', 'Casado(a)', 'Divorciado(a)', 'Viúvo(a)']} onChange={e => setFormData({...formData, estadoCivil: e.target.value})} icon={User} tema={tema}/>
                </div>
              )}

              {/* ETAPA 7: FINANCEIRO */}
              {step === 7 && (
                <div className="animate-in fade-in slide-in-from-right-4 space-y-2">
                  <h2 className="text-3xl font-black mb-6">Financeiro</h2>
                  <CustomSelect label="Profissão" value={formData.profissao} options={['Assalariado', 'Autônomo', 'Empresário', 'Estudante']} onChange={e => setFormData({...formData, profissao: e.target.value})} icon={Briefcase} tema={tema}/>
                  <CustomInput label="Renda Mensal" placeholder="R$ 0,00" inputMode="numeric" value={formData.renda} onChange={e => setFormData({...formData, renda: e.target.value})} icon={TrendingUp} tema={tema}/>
                  <CustomSelect label="Patrimônio" value={formData.patrimonio} options={['Até R$ 10mil', 'Até R$ 50mil', 'Mais de R$ 100mil']} onChange={e => setFormData({...formData, patrimonio: e.target.value})} icon={Landmark} tema={tema}/>
                </div>
              )}

              {/* MENSAGEM DE ERRO DINÂMICA */}
              {erroLogin && (
                <div className="flex items-center gap-3 mt-6 bg-red-500/10 border border-red-500/20 p-4 rounded-2xl animate-in fade-in zoom-in-95">
                  <Info size={18} className="text-red-500 min-w-[18px]" />
                  <span className="text-red-500 text-[11px] font-bold uppercase tracking-wide leading-tight">
                    {erroLogin}
                  </span>
                </div>
              )}
            </div>

            {/* BOTÃO COM LÓGICA DE VALIDAÇÃO */}
            <footer className="pt-4 pb-[env(safe-area-inset-bottom,1.5rem)]">
              <MainButton 
                onClick={() => {
                  setErroLogin('');
                  if (step === 2) {
                    handleVerificarCPF(); // Valida CPF
                  } else if (step < 7) {
                    setStep(step + 1);    // Avança normal
                  } else {
                    handleRegister();     // Finaliza Cadastro
                  }
                }} 
                disabled={
                  loading || 
                  (step === 1 && (!formData.aceitePrivacidade || !formData.aceiteTermos)) ||
                  (step === 2 && formData.cpf.length < 14) || 
                  (step === 3 && (!formData.email || !validarSenha(formData.senha) || formData.senha !== formData.confirmarSenha))
                }
              >
                {loading ? <Loader2 className="animate-spin" /> : (step === 7 ? "Criar Minha Conta" : "Continuar")}
              </MainButton>
            </footer>
          </div>
        )}

{/* --- TELA: HOME (DASHBOARD) --- */}
        {view === 'home' && user && (
          <div className="flex-1 flex flex-col animate-in fade-in duration-500 h-full relative">
            
            {/* HEADER: Perfil, Olho e LogOut */}
            <header className="pt-14 px-5 pb-4 flex justify-between items-center z-20 sticky top-0 backdrop-blur-xl">
              <div className="flex items-center gap-3">
                <div 
                  onClick={() => setView('profile')}
                  className="w-12 h-12 rounded-full p-[2px] cursor-pointer active:scale-95 transition-transform bg-[var(--color-border)]"
                >
                  <div className="w-full h-full rounded-full bg-[var(--color-background)] flex items-center justify-center">
                    <User size={24} className="text-[var(--color-text)]" />
                  </div>
                </div>
                
                <div>
                  <p className="text-xs font-medium text-[var(--color-text-secondary)]">Olá,</p>
                  <p className="text-sm font-bold capitalize tracking-tight text-[var(--color-text)]">{user.nome}</p>
                </div>
              </div>
              
              <div className="flex gap-2">
                <button onClick={() => setShowValues(!showValues)} className="w-10 h-10 rounded-full flex items-center justify-center text-[var(--color-text-secondary)] hover:text-[var(--color-text)] transition-colors active:scale-95">
                  {showValues ? <Eye size={24} strokeWidth={2}/> : <EyeOff size={24} strokeWidth={2}/>}
                </button>
                <button onClick={() => { setUser(null); setView('login'); }} className="w-10 h-10 rounded-full flex items-center justify-center text-[var(--color-text-secondary)] hover:text-[var(--color-primary)] transition-colors active:scale-95">
                  <LogOut size={24} strokeWidth={2}/>
                </button>
              </div>
            </header>

            {/* CONTEÚDO PRINCIPAL: Sem barra inferior, foco total nas informações */}
            <main className="flex-1 overflow-y-auto no-scrollbar px-5 pt-2 pb-[env(safe-area-inset-bottom,2rem)]">
              
              {/* CARD: CONTA EM ANÁLISE (Opcional) */}
              {(user.status === 'pendente' || (!user.status && !user.limites?.pix && !user.limites?.compras)) && (
                <div className="bg-[var(--color-card)] border border-[var(--color-border)] rounded-2xl p-5 mb-6 flex items-start gap-4 animate-in fade-in slide-in-from-top-4">
                  <Clock size={24} className="text-[var(--color-primary)] shrink-0" />
                  <div>
                    <p className="text-xs text-[var(--color-text-secondary)] font-bold uppercase tracking-wider">
                      Conta em análise
                    </p>
                    <p className="text-sm text-[var(--color-text-secondary)] mt-2 leading-relaxed">
                      Estamos avaliando seu perfil financeiro para liberar Pix e cartão.
                    </p>
                  </div>
                </div>
              )}

              {/* GRID DE AÇÕES */}
              <div className="grid grid-cols-3 gap-3 mb-8">
                {[
                  { label: 'Área Pix', icon: Zap, action: () => setView('area-pix') },
                  { label: 'Transferir', icon: ArrowRightLeft, action: () => setView('area-pix-transferir') },
                  { label: 'Faturas', icon: FileText, action: () => setView('faturas') }, 
                  { label: 'Limites', icon: ShieldCheck, action: () => setView('limites') },
                  { label: 'Histórico', icon: Clock, action: () => {} },
                  { label: 'Loja', icon: ShoppingBag, action: () => dispararAviso('Loja Aura', 'A Loja estará disponível em breve!', 'info') }
                ].map((item, i) => (
                  <button 
                    key={i} 
                    onClick={item.action} 
                    className="flex flex-col items-center gap-2 p-4 rounded-2xl bg-[var(--color-card)] border border-[var(--color-border)] active:scale-95 transition-all shadow-sm group"
                  >
                    <div className="text-[var(--color-text)] group-active:text-indigo-500 transition-colors">
                      <item.icon size={24} strokeWidth={2} />
                    </div>
                    <span className="text-[10px] font-bold text-[var(--color-text-secondary)] text-center leading-tight">
                      {item.label}
                    </span>
                  </button>
                ))}
              </div>

              {/* CARD: FATURA ATUAL */}
              <section className="mb-6">
                <div className="bg-[var(--color-card)] border border-[var(--color-border)] rounded-2xl p-5 flex justify-between items-center shadow-lg">
                  <div>
                    <p className="text-xs font-bold text-[var(--color-text-secondary)] uppercase tracking-wider mb-1">
                      Fatura atual
                    </p>
                    <h2 className="text-2xl font-bold text-[var(--color-text)] tracking-tight">
                      {showValues ? formatMoney(user.fatura?.valorAtual || 0) : '••••'}
                    </h2>
                    <p className="text-xs font-medium text-[var(--color-text-secondary)] mt-1">
                      Vence dia {user.fatura?.vencimento || '--'}
                    </p>
                  </div>
                  <button 
                    onClick={() => setView('faturas')}
                    className="bg-[var(--color-primary)] text-[var(--color-text)] px-5 py-3 rounded-xl font-bold text-xs uppercase tracking-wider active:scale-95 transition-all hover:opacity-90"
                  >
                    Pagar
                  </button>
                </div>
              </section>

              {/* CARDS: LIMITES E COMPRAS */}
              <section className="grid grid-cols-2 gap-4 mb-8">
                <div onClick={() => setView('limites')} className="bg-[var(--color-card)] border border-[var(--color-border)] rounded-2xl p-5 flex flex-col justify-between cursor-pointer active:scale-[0.98] transition-transform shadow-sm">
                  <div className="flex items-center gap-2 mb-3">
                    <Zap size={20} className="text-[var(--color-text-secondary)]" strokeWidth={2}/>
                    <p className="text-xs font-bold text-[var(--color-text-secondary)] uppercase tracking-wider">Limite Pix</p>
                  </div>
                  <p className="text-xl font-bold text-[var(--color-text)] tracking-tight">
                    {showValues ? formatMoney(user.limites?.pix || 0) : '••••'}
                  </p>
                </div>
                
                <div onClick={() => setView('limites')} className="bg-[var(--color-card)] border border-[var(--color-border)] rounded-2xl p-5 flex flex-col justify-between cursor-pointer active:scale-[0.98] transition-transform shadow-sm">
                  <div className="flex items-center gap-2 mb-3">
                    <ShoppingBag size={20} className="text-[var(--color-text-secondary)]" strokeWidth={2}/>
                    <p className="text-xs font-bold text-[var(--color-text-secondary)] uppercase tracking-wider">Compras</p>
                  </div>
                  <p className="text-xl font-bold text-[var(--color-text)] tracking-tight">
                    {showValues ? formatMoney(user.limites?.compras || 0) : '••••'}
                  </p>
                </div>
              </section>

{/* -------------------------------------------------- */}
{/* 🚀 BANNERS DINÂMICOS (NOTÍCIAS) - VERSÃO SEM ERROS */}
{/* -------------------------------------------------- */}
<section className="mt-2 mb-10">
  <div className="flex items-center justify-between mb-4 px-1">
    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--color-text-secondary)]">
      Notícias
    </p>
  </div>

  {apiLoaded ? (
    <>
      {/* CASO 1: Vários Banners (Carrossel Infinito) */}
      {bannersApp.length > 1 && (
        <div className="flex gap-4 overflow-x-auto no-scrollbar pb-4 -mx-1 px-1 snap-x snap-mandatory">
          {[...bannersApp, ...bannersApp].map((banner, index) => (
            <a
              key={banner.id ? `${banner.id}_${index}` : `banner_${index}`}
              href={banner.link || '#'}
              target={banner.link ? "_blank" : "_self"}
              rel="noopener noreferrer"
              className="min-w-[85%] h-36 rounded-[2rem] bg-[var(--color-card)] border border-[var(--color-border)] overflow-hidden relative active:scale-[0.98] transition-all shrink-0 snap-center shadow-sm block"
            >
              <img 
                src={banner.img} 
                alt="Banner" 
                className="absolute inset-0 w-full h-full object-cover" 
                onError={(e) => { e.target.src='https://via.placeholder.com/1280x560/4F46E5/FFFFFF?text=AuraPix+Ofertas'; }}
              />
            </a>
          ))}
        </div>
      )}

      {/* CASO 2: Um único Banner (Fix para fotos verticais - 1280x560px) */}
      {bannersApp.length === 1 && (
        <div className="px-1">
          <a
            href={bannersApp[0].link || '#'}
            target={bannersApp[0].link ? "_blank" : "_self"}
            rel="noopener noreferrer"
            className="w-full h-44 rounded-[2.5rem] bg-[var(--color-card)] border border-[var(--color-border)] overflow-hidden relative active:scale-[0.98] transition-all shadow-sm block"
          >
            <img 
              src={bannersApp[0].img} 
              alt="Destaque Único" 
              className="absolute inset-0 w-full h-full object-cover" 
              onError={(e) => { e.target.src='https://via.placeholder.com/1280x560/4F46E5/FFFFFF?text=AuraPix+Ofertas'; }}
            />
          </a>
        </div>
      )}

      {/* CASO 3: Sem Banners (Banner Roxo Original) */}
      {bannersApp.length === 0 && (
        <div className="px-1">
          <div className="w-full h-40 rounded-[2.5rem] bg-gradient-to-br from-indigo-600 to-purple-900 border border-[var(--color-border)] overflow-hidden relative flex flex-col justify-center p-8 shadow-sm">
             <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-3xl -mr-16 -mt-16"></div>
             <h3 className="text-white font-black text-xl leading-tight relative z-10">Novidades em breve:<br/>Pix Parcelado.</h3>
             <p className="text-white/60 text-[10px] font-bold uppercase tracking-widest mt-3 relative z-10">Consulte os seus limites</p>
          </div>
        </div>
      )}
    </>
  ) : (
    /* ESTADO DE CARREGAMENTO (SKELETON) */
    <div className="px-1">
      <div className="w-full h-36 rounded-[2.5rem] bg-[var(--color-card)] border border-[var(--color-border)] overflow-hidden relative flex items-center justify-center animate-pulse shadow-sm">
         <p className="text-[10px] font-black uppercase tracking-widest text-[var(--color-text-secondary)] opacity-40">
           A carregar novidades...
         </p>
      </div>
    </div>
  )}
              </section>
          </main>
      </div>
   )}

        {/* --- COMPONENTES FILHOS --- */}

        {(view === 'area-pix' || view === 'area-pix-transferir') && (
          <AreaPix 
            user={user}       
            tema={tema}
            setView={setView} 
            showValues={showValues} 
            saldoUsuario={user?.saldo} 
            contatosRecentes={user?.contatos} 
            descontarLimitePix={descontarLimitePix}
            initialStep={view === 'area-pix-transferir' ? 'transferir' : 'menu'} 
            dispararAviso={dispararAviso} // Propagando a função de notificação!
          />
        )}

        {view === 'profile' && (
          <Profile 
            user={user} 
            tema={tema}     
            setTema={setTema} 
            setView={setView} 
            onLogout={() => { setUser(null); setView('login'); setAuthData({login:'', senha:''}) }}
            dispararAviso={dispararAviso}
          />
        )}

        {view === 'faturas' && (
          <Faturas 
            user={user} 
            tema={tema} 
            setView={setView} 
            dispararAviso={dispararAviso}
          />
        )}

        {view === 'recuperacao' && (
          <RecuperacaoSenha 
            setView={setView} 
            tema={tema} 
            CustomInput={CustomInput} 
            MainButton={MainButton} 
            dispararAviso={dispararAviso}
          />
        )}

        {view === 'limites' && (
          <Limites 
            user={user} 
            tema={tema} 
            setView={setView} 
          />
        )}

        {view === 'termos' && (
          <Termos 
            setView={setView} 
            tema={tema} 
            voltarPara={user ? 'home' : 'onboarding'} 
          />
        )}

        {view === 'comprovante' && (
          <ComprovantePix 
            tema={tema}
            setView={setView}
            transacao={dadosUltimaTransacao} 
          />
        )}

        {view === 'privacidade' && (
         <Privacidade 
          setView={setView} 
          tema={tema} 
          voltarPara={user ? 'home' : 'onboarding'} 
        />
        )}

         {view === 'ajuda' && (
          <CentralAjuda 
           setView={setView} 
           tema={tema} 
         />
         )}

      </div>

      {/* ESTILOS GLOBAIS NATIVOS (Configurados para o WebView do APK) */}
{/* ESTILOS GLOBAIS NATIVOS (Configurados para o WebView do APK) */}
<style>{`
  /* 1. Reset de Tela e Comportamento Mobile */
  html, body, #root { 
    margin: 0 !important; 
    padding: 0 !important; 
    width: 100vw !important; 
    height: 100dvh !important; 
    max-width: 100vw !important;
    max-height: 100dvh !important;
    /* Fundo com gradiente para profundidade premium */
    background: ${isLight 
      ? 'radial-gradient(circle at top right, #F8FAFC, #E2E8F0)' 
      : 'radial-gradient(circle at top right, #0F172A, #020617)'} !important;
    color: ${isLight ? '#0F172A' : '#F8FAFC'} !important;
    transition: background 0.5s ease;
    overflow: hidden !important; 
    position: fixed; 
    top: 0; left: 0; right: 0; bottom: 0;
    -webkit-text-size-adjust: 100%;
    font-family: 'Inter', system-ui, -apple-system, sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }
  
  #root {
    display: flex !important;
    flex-direction: column !important;
  }

  /* 2. Utilitários de Rolagem (Scrollbar Invisível) */
  .no-scrollbar::-webkit-scrollbar { display: none; }
  .no-scrollbar { 
    -ms-overflow-style: none; 
    scrollbar-width: none; 
    -webkit-overflow-scrolling: touch; 
  }
  
  /* 3. Toque e Seleção (Experiência de App Nativo) */
  * { 
    -webkit-tap-highlight-color: transparent; 
    outline: none; 
    box-sizing: border-box; 
    user-select: none; 
  }

  /* 4. Inputs e Textareas (Permitir Interação) */
  input, textarea {
    user-select: text !important;
    font-family: inherit;
  }

  input::placeholder {
    opacity: 0.3;
    font-weight: 500;
  }
  
  /* 5. Correção Crítica de Autofill (Preenchimento Automático) */
  input:-webkit-autofill,
  input:-webkit-autofill:hover, 
  input:-webkit-autofill:focus, 
  input:-webkit-autofill:active {
      -webkit-transition: color 9999s ease-out, background-color 9999s ease-out;
      -webkit-transition-delay: 9999s;
      /* Força a cor correta do texto no tema dark/light */
      -webkit-text-fill-color: ${isLight ? '#0F172A' : '#F8FAFC'} !important;
      caret-color: #6366F1;
  }

  /* 6. Animações de Entrada Suaves */
  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(10px); }
    to { opacity: 1; transform: translateY(0); }
  }

  .animate-premium {
    animation: fadeIn 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
  }
`}</style>
    </div>
  );
}