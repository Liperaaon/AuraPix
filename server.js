// server.js - LIBERTA: Motor de Crédito com Antecipação Pro-Rata (Direto no Firebase)
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import admin from 'firebase-admin';
import { createRequire } from "module";
import bcrypt from 'bcrypt';
import nodemailer from 'nodemailer';
import { cpf } from 'cpf-cnpj-validator';
import { z } from 'zod';

// Configuração para importar o JSON de forma segura em módulos ES
const require = createRequire(import.meta.url);
const serviceAccount = require("./serviceAccountKey.json");

dotenv.config();

// Inicialização do Firebase Admin com a chave mestra 
// sever.js
if (!admin.apps.length) {
    admin.initializeApp({ 
        credential: admin.credential.cert(serviceAccount),
    });
}

const db = admin.firestore();
const app = express();

app.use(cors());
app.use(express.json());

// 1. O Filtro (Middleware)
const validate = (schema) => (req, res, next) => {
  try {
    schema.parse(req.body);
    next();
  } catch (error) {
    return res.status(400).json({ 
      success: false, 
      error: "Dados inválidos", 
      details: error.errors.map(e => e.message) 
    });
  }
};

// 2. Os Schemas (Contratos)
const pixSchema = z.object({
  uid: z.string().min(1, "UID é obrigatório"),
  valorPix: z.number().positive("O valor deve ser maior que zero"),
  valorParcela: z.number().positive(),
  parcelas: z.number().int().min(1).max(12),
  chavePix: z.string().min(1, "Chave Pix é obrigatória"),
  tipoChave: z.enum(['CPF', 'CNPJ', 'E-mail', 'Celular', 'Chave Aleatória'])
});

const registerSchema = z.object({
  nome: z.string().min(3, "Nome muito curto"),
  email: z.string().email("E-mail inválido"),
  cpf: z.string().min(11, "CPF incompleto"),
  senha: z.string().min(6, "Mínimo 6 caracteres")
});

/** * 🧠 MOTOR DE CRÉDITO "LIBERTA BRAIN 2.0" (Alta Rentabilidade) */
const processarInteligenciaFinanceira = (valor, tier, diasParaPagar = 30, scoreInterno = 50, taxasDinamicas = null) => {
  // 1. Usa as taxas do banco de dados OU o padrão antigo caso o banco falhe
  const taxasMensais = taxasDinamicas || { 'Platinum': 0.069, 'Gold': 0.099, 'Standard': 0.149 }; 
  let taxaMensal = Number(taxasMensais[tier]) || 0.159; 

  // 2. Análise de Risco Granular (Score Interno)
  if (scoreInterno >= 85) taxaMensal -= 0.02;      // Excelente pagador: Bônus de -2%
  else if (scoreInterno >= 65) taxaMensal -= 0.01; // Bom pagador: Bônus de -1%
  else if (scoreInterno <= 30) taxaMensal += 0.05; // Risco altíssimo: Punição de +5%
  else if (scoreInterno <= 45) taxaMensal += 0.03; // Risco moderado: Punição de +3%

  // Trava de segurança para garantir margem de lucro mínima do banco (nunca menor que 4.9%)
  if (taxaMensal < 0.049) taxaMensal = 0.049; 

  // 3. Cálculo de Juros Compostos Diários
  const taxaDiaria = Math.pow((1 + taxaMensal), (1 / 30)) - 1;
  const montanteBase30 = valor * Math.pow((1 + taxaDiaria), 30);
  const jurosBase30 = montanteBase30 - valor;
  
  const montanteReal = valor * Math.pow((1 + taxaDiaria), diasParaPagar);
  const jurosReal = montanteReal - valor;

  // 4. IOF Padrão Banco Central (0,38% fixo + 0,0082% ao dia de crédito)
  const iofFixo = valor * 0.0038; 
  const iofDiario = valor * 0.000082 * diasParaPagar;
  const iofTotal = iofFixo + iofDiario;

  const economiaGanhada = jurosBase30 - jurosReal;

  return {
    analise: { 
      perfil: tier, 
      score: scoreInterno, 
      taxaEfetivaMensal: (taxaMensal * 100).toFixed(2) + "%", 
      status: diasParaPagar < 30 ? "Antecipação Premiada" : "Ciclo Regular" 
    },
    valores: { 
      principal: Number(valor.toFixed(2)), 
      iof: Number(iofTotal.toFixed(2)), 
      jurosAplicados: Number(jurosReal.toFixed(2)), 
      totalAPagar: Number((montanteReal + iofTotal).toFixed(2)) 
    },
    inteligencia: { 
      cicloOriginal: 30, 
      diasUtilizados: diasParaPagar, 
      descontoAntecipacao: Number(Math.max(0, economiaGanhada).toFixed(2)), 
      mensagem: diasParaPagar < 30 
        ? `Você economizou ${Number(economiaGanhada.toFixed(2)).toLocaleString('pt-BR', {style: 'currency', currency: 'BRL'})} pagando ${30 - diasParaPagar} dias antes!`
        : "Pague antes do vencimento no próximo mês para ganhar descontos no Pix!"
    }
  };
};

/** * 🚀 ROTAS REAIS LIGADAS DIRETAMENTE AO FIREBASE  */

// ROTA DE LOGIN SEGURA (CORRIGIDA: CASE-INSENSITIVE)
app.post('/api/auth/login', async (req, res) => {
    // 🚀 Normaliza o login: remove espaços e força letras minúsculas
    // Isso garante que "Felipe" ou "felipe" funcionem igualmente se o banco tiver "felipe"
    const loginRaw = req.body.login || '';
    const login = loginRaw.toLowerCase().trim(); 
    const { senha } = req.body; 
    
    try {
        const usersRef = db.collection('users');
        
        // 1. Tenta buscar primeiro pelo E-mail (já em minúsculo)
        let snapshot = await usersRef.where('email', '==', login).get();

        // 2. Se não achou por e-mail, tenta buscar pelo CPF
        if (snapshot.empty) {
            snapshot = await usersRef.where('cpf', '==', login).get();
        }

        // Se após as duas buscas continuar vazio, o usuário não existe
        if (snapshot.empty) {
            return res.status(404).json({ success: false, error: "E-mail ou CPF não encontrados." });
        }
        
        let userEntry = null;
        snapshot.forEach(doc => { 
            userEntry = { uid: doc.id, ...doc.data() }; 
        });

        // 3. VERIFICAÇÃO DA SENHA CRIPTOGRAFADA
        const senhaValida = await bcrypt.compare(senha, userEntry.senha);

        if (!senhaValida) {
            return res.status(401).json({ success: false, error: "Senha incorreta. Tente novamente." });
        }

        // Por segurança, removemos o hash da senha antes de devolver para o aplicativo
        delete userEntry.senha;

        res.json({ success: true, user: userEntry });

    } catch (e) {
        console.error("🔥 Erro detalhado no Login:", e);
        res.status(500).json({ success: false, error: `Erro no servidor: ${e.message}` });
    }
});

// ROTA DE RECUPERAÇÃO DE PALAVRA-PASSE //
app.post('/api/auth/forgot-password', async (req, res) => {
    const { cpf, email } = req.body;

    try {
        const usersRef = db.collection('users');
        const snapshot = await usersRef.where('cpf', '==', cpf).where('email', '==', email).get();

        if (snapshot.empty) {
            return res.status(404).json({ success: false, error: "CPF ou E-mail incorretos." });
        }

        let userName = '';
        snapshot.forEach(doc => {
            userName = doc.data().nome.split(' ')[0]; // Pega o primeiro nome do usuário
        });

        // 1. Configura o "Carteiro" (Ajustado para SMTP Oficial da Hostinger)
        const transporter = nodemailer.createTransport({
            host: 'smtp.hostinger.com', // Servidor de saída da Hostinger
            port: 465,                  // Porta segura (SSL)
            secure: true,               // Requisito para porta 465
            auth: {
                user: process.env.EMAIL_USER, // suporte@aurapix.com.br
                pass: process.env.EMAIL_PASS  // Sua senha definida no .env
            }
        });

        // Link de redefinição (Ajuste o IP se estiver testando no APK)
        const baseUrl = process.env.FRONTEND_URL || 'http://192.168.15.7:5173';
        const resetLink = `${baseUrl}/?email=${email}`;
        // 2. Novo Design Premium do E-mail (HTML Atualizado)
        const emailHTML = `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Recuperação de Senha - Aura Pix</title>
    <style>
        body, table, td, a { -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
        table, td { mso-table-lspace: 0pt; mso-table-rspace: 0pt; }
        img { -ms-interpolation-mode: bicubic; border: 0; height: auto; line-height: 100%; outline: none; text-decoration: none; }
        table { border-collapse: collapse !important; }
        body { height: 100% !important; margin: 0 !important; padding: 0 !important; width: 100% !important; }
        @media screen and (max-width: 600px) {
            .container { width: 100% !important; max-width: 100% !important; }
            .content-padding { padding: 30px 20px !important; }
            .title { font-size: 24px !important; }
        }
    </style>
</head>
<body style="background-color: #F8FAFC; margin: 0; padding: 0; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;">
    <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #F8FAFC; padding: 40px 20px;">
        <tr>
            <td align="center">
                <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px; background-color: #FFFFFF; border-radius: 24px; box-shadow: 0 10px 25px rgba(0,0,0,0.05); overflow: hidden;">
                    <tr>
                        <td align="center" style="padding: 40px 40px 20px 40px; background-color: #FFFFFF;">
                            <h1 style="color: #0F172A; font-size: 28px; font-weight: 900; font-style: italic; text-transform: uppercase; letter-spacing: -1px; margin: 0;">Aura Pix</h1>
                            <p style="color: #4F46E5; font-size: 10px; font-weight: 900; text-transform: uppercase; letter-spacing: 4px; margin: 8px 0 0 0;">Crédito Inteligente</p>
                        </td>
                    </tr>
                    <tr>
                        <td align="center" style="padding: 0 40px;">
                            <div style="height: 2px; width: 40px; background-color: #E2E8F0; margin: 0 auto; border-radius: 2px;"></div>
                        </td>
                    </tr>
                    <tr>
                        <td align="center" style="padding: 30px 40px 40px 40px;">
                            <div style="background-color: #EEF2FF; width: 64px; height: 64px; border-radius: 20px; display: inline-block; margin-bottom: 24px;">
                                <p style="font-size: 32px; margin: 0; line-height: 64px;">🔑</p>
                            </div>
                            <h2 style="color: #0F172A; font-size: 26px; font-weight: 900; margin: 0 0 16px 0; letter-spacing: -0.5px;">Esqueceu a senha?</h2>
                            <p style="color: #64748B; font-size: 15px; line-height: 24px; margin: 0 0 32px 0; text-align: center;">
                                Olá, <strong>${userName}</strong>.<br>
                                Recebemos uma solicitação para redefinir a senha da sua conta no Aura Pix. Clique no botão abaixo para criar uma nova senha segura.
                            </p>
                            <table border="0" cellpadding="0" cellspacing="0" width="100%">
                                <tr>
                                    <td align="center">
                                        <a href="${resetLink}" target="_blank" style="display: inline-block; background-color: #4F46E5; color: #FFFFFF; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; font-size: 12px; font-weight: 900; text-transform: uppercase; letter-spacing: 2px; text-decoration: none; padding: 18px 36px; border-radius: 50px; box-shadow: 0 8px 20px rgba(79, 70, 229, 0.25);">
                                            Redefinir Minha Senha
                                        </a>
                                    </td>
                                </tr>
                            </table>
                            <p style="color: #94A3B8; font-size: 13px; line-height: 20px; margin: 32px 0 0 0; text-align: center;">
                                Se não solicitou esta alteração, ignore este e-mail. A sua conta permanece segura.
                            </p>
                        </td>
                    </tr>
                    <tr>
                        <td align="center" style="padding: 30px 40px; background-color: #0F172A;">
                            <p style="color: #FFFFFF; font-size: 14px; font-weight: 700; margin: 0 0 8px 0;">Precisa de ajuda?</p>
                            <p style="color: #64748B; font-size: 12px; line-height: 18px; margin: 0 0 24px 0;">
                                A nossa equipa de suporte está disponível 24/7.<br>
                                Aceda ao chat no aplicativo ou visite a nossa central de ajuda.
                            </p>
                            <p style="color: #475569; font-size: 10px; text-transform: uppercase; letter-spacing: 1px; margin: 0 0 6px 0;">
                                &copy; 2026 Aura Pix. Todos os direitos reservados.
                            </p>
                            <p style="color: #475569; font-size: 9px; text-transform: uppercase; letter-spacing: 1.5px; margin: 0; opacity: 0.7;">
                                Desenvolvido por <strong style="color: #6366F1;">Prime Studio</strong>
                            </p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>`;

        // 3. Opções do E-mail
        const mailOptions = {
            from: '"Aura Pix Suporte" <' + process.env.EMAIL_USER + '>',
            to: email,
            subject: '🔒 Redefinição de Senha - Aura Pix',
            html: emailHTML
        };

        // 4. Dispara o E-mail
        await transporter.sendMail(mailOptions);

        res.json({ success: true, message: "E-mail enviado com sucesso!" });

    } catch (e) {
        console.error("🔥 Erro na recuperação de senha:", e);
        res.status(500).json({ success: false, error: "Erro ao enviar o e-mail. Verifica as configurações." });
    }
});

// ROTA: VERIFICAR SE O CPF É VÁLIDO E SE JÁ EXISTE NO BANCO (VERSÃO BLINDADA)
app.post('/api/auth/verificar-cpf', async (req, res) => {
    const { cpf: cpfOriginal } = req.body;

    if (!cpfOriginal) {
        return res.status(400).json({ success: false, error: "CPF não informado." });
    }

    // 1. Padronização: Geramos as duas versões possíveis para a busca no banco
    const cpfLimpo = cpfOriginal.replace(/\D/g, '');
    const cpfMascarado = cpfLimpo.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");

    try {
        // 2. VALIDAÇÃO MATEMÁTICA (Usando a biblioteca cpf-cnpj-validator já instalada)
        if (!cpf.isValid(cpfLimpo)) {
            return res.status(400).json({ 
                success: false, 
                error: "O CPF informado é inválido. Verifique os números digitados." 
            });
        }

        // 3. BUSCA NO FIRESTORE COM OPERADOR 'IN'
        // Esta busca verifica se o campo 'cpf' é IGUAL a 'cpfLimpo' OU 'cpfMascarado'
        const usersRef = db.collection('users');
        const snapshot = await usersRef.where('cpf', 'in', [cpfLimpo, cpfMascarado]).get();

        if (!snapshot.empty) {
            return res.status(400).json({ 
                success: false, 
                error: "Este CPF já possui uma conta cadastrada. Faça login para acessar." 
            });
        }

        // Se passar por todas as travas, o CPF está liberado
        res.json({ 
            success: true,
            message: "CPF validado com sucesso." 
        });

    } catch (e) {
        console.error("🔥 Erro na verificação do CPF:", e);
        res.status(500).json({ 
            success: false, 
            error: "Erro interno ao validar CPF. Tente novamente em instantes." 
        });
    }
});

// ROTA DE CADASTRO COM VALIDAÇÃO DE DUPLICIDADE BLINDADA (E AGORA ZOD)
app.post('/api/auth/register', validate(registerSchema), async (req, res) => {
    const { senha, cpf: cpfEntrada, email: emailEntrada, ...userData } = req.body; 

    if (!cpfEntrada || !emailEntrada) {
        return res.status(400).json({ success: false, error: "Dados incompletos." });
    }

    const cpfLimpo = cpfEntrada.replace(/\D/g, '');
    const cpfMascarado = cpfLimpo.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
    const emailLimpo = emailEntrada.toLowerCase().trim();
    
    try {
        const usersRef = db.collection('users');

        // 1. Verificação de E-mail
        const emailCheck = await usersRef.where('email', '==', emailLimpo).get();
        if (!emailCheck.empty) {
            return res.status(400).json({ success: false, error: "Este e-mail já está em uso." });
        }

        // 2. Busca por CPF (Lógica corrigida e limpa)
        const cpfCheck = await usersRef.where('cpf', 'in', [cpfLimpo, cpfMascarado]).get();

        if (!cpfCheck.empty) {
            return res.status(400).json({ 
                success: false, 
                error: "Este CPF já está cadastrado no Aura Pix. Tente fazer login." 
            });
        }

        // 3. Criptografia
        const saltRounds = 10;
        const senhaCriptografada = await bcrypt.hash(senha, saltRounds);

        // 4. Salvando no Banco (Sem duplicidade e sem citações)
        const docRef = await usersRef.add({
            ...userData,
            email: emailLimpo,
            cpf: cpfLimpo, 
            senha: senhaCriptografada,
            tier: 'Standard',
            saldo: 0,
            score: 50,
            limites: { pix: 0, compras: 0, fatura: 0 },
            fatura: { valorAtual: 0, vencimento: '10/03', status: 'Fechada' },
            transacoes: [],
            createdAt: admin.firestore.FieldValue.serverTimestamp()
        });

        res.json({ success: true, uid: docRef.id });
        
    } catch (e) {
        console.error("🔥 Erro no Cadastro:", e);
        res.status(500).json({ success: false, error: "Erro interno no servidor." });
    }
});

// SIMULAÇÃO DE CRÉDITO 
app.post('/api/credito/simular', async (req, res) => {
  const { uid, valor, dias } = req.body;
  
  try {
    const userDoc = await db.collection('users').doc(uid).get();
    
    if (!userDoc.exists) {
        return res.status(404).json({ success: false, error: "Usuário para simulação não encontrado." });
    }

    const userData = userDoc.data();
    
    // 🚀 NOVO: Busca as taxas dinâmicas salvas no Firebase
    const configDoc = await db.collection('sistema').doc('taxas').get();
    let taxasDinamicas = null;
    if (configDoc.exists) {
        taxasDinamicas = configDoc.data();
    }
    
    // Passa as taxas dinâmicas para o motor
    const oferta = processarInteligenciaFinanceira(
        parseFloat(valor), 
        userData.tier || 'Standard', 
        parseInt(dias), 
        userData.score || 50,
        taxasDinamicas
    );
    
    res.json({ success: true, ...oferta });
    
  } catch (e) {
    console.error("🔥 Erro detalhado no Motor de Crédito:", e);
    res.status(500).json({ success: false, error: "Erro interno no processamento da simulação." });
  }
});

// ==========================================
// INTEGRAÇÃO ASAAS - PAGAMENTOS PIX
// ==========================================

// Função auxiliar para comunicar com o Asaas
const fetchAsaas = async (endpoint, method = 'GET', body = null) => {
    const options = {
        method,
        headers: {
            'Content-Type': 'application/json',
            'access_token': process.env.ASAAS_API_KEY
        }
    };
    if (body) options.body = JSON.stringify(body);
    
    const response = await fetch(`${process.env.ASAAS_API_URL}${endpoint}`, options);
    const data = await response.json();
    
    if (!response.ok) {
        throw new Error(data.errors ? data.errors[0].description : 'Erro na API do Asaas');
    }
    return data;
};

// Rota para Gerar Cobrança Pix (Ex: Pagamento da Fatura)
app.post('/api/pagamentos/gerar-pix', async (req, res) => {
    const { uid, valor, descricao } = req.body;

    try {
        const userRef = db.collection('users').doc(uid);
        const userDoc = await userRef.get();
        
        if (!userDoc.exists) {
            return res.status(404).json({ success: false, error: "Usuário não encontrado" });
        }
        
        const userData = userDoc.data();
        let asaasCustomerId = userData.asaasId;

        // 1. Cria o cliente no Asaas se ele ainda não tiver um ID
        if (!asaasCustomerId) {
            const novoCliente = await fetchAsaas('/customers', 'POST', {
                name: userData.nome,
                cpfCnpj: userData.cpf, // O Asaas exige CPF válido
                email: userData.email,
                mobilePhone: userData.celular
            });
            
            asaasCustomerId = novoCliente.id;
            
            // Salva o ID do Asaas no Firebase do usuário
            await userRef.update({ asaasId: asaasCustomerId });
        }

        // 2. Define o vencimento para amanhã
        const dataVencimento = new Date();
        dataVencimento.setDate(dataVencimento.getDate() + 1);
        const dueDateString = dataVencimento.toISOString().split('T')[0];

        // 3. Gera a cobrança Pix
        const cobranca = await fetchAsaas('/payments', 'POST', {
            customer: asaasCustomerId,
            billingType: 'PIX',
            value: valor,
            dueDate: dueDateString,
            description: descricao || 'Pagamento Fatura Liberta',
            externalReference: uid // Essencial para identificar quem pagou no Webhook
        });

        // 4. Pega os dados do Pix (QR Code e Payload)
        const pixData = await fetchAsaas(`/payments/${cobranca.id}/pixQrCode`);

        res.json({
            success: true,
            cobrancaId: cobranca.id,
            copiaECola: pixData.payload,
            qrCodeBase64: pixData.encodedImage,
            expirationDate: pixData.expirationDate
        });

    } catch (error) {
        console.error("🔥 Erro na integração Asaas:", error.message);
        res.status(500).json({ success: false, error: error.message });
    }
});

// ==========================================
// 🎧 WEBHOOK ASAAS (Ouvinte de Pagamentos)
// ==========================================
app.post('/api/webhooks/asaas', async (req, res) => {
    // Validação de Segurança do Asaas
    const webhookToken = req.headers['asaas-access-token'];
    if (webhookToken !== process.env.ASAAS_API_KEY) {
        return res.status(403).json({ success: false, error: "Acesso negado ao Webhook." });
    }

    const { event, payment } = req.body;

    // 1. O Asaas exige que você responda rápido com status 200, senão ele acha que seu servidor caiu e tenta de novo.
    res.status(200).send('OK'); 

    // 2. Se o evento for de pagamento recebido/confirmado
    if (event === 'PAYMENT_RECEIVED' || event === 'PAYMENT_CONFIRMED') {
        // Lembra que mandamos o UID no 'externalReference'? Vamos usá-lo para achar o usuário!
        const uid = payment.externalReference; 
        const valorPago = payment.value;

        if (!uid) {
            console.warn("⚠️ Webhook recebido sem externalReference (UID). Ignorando.");
            return;
        }

        try {
            const userRef = db.collection('users').doc(uid);
            const userDoc = await userRef.get();
            
            if (!userDoc.exists) return;

            let userData = userDoc.data();

            // 3. Lógica de Negócios: Abate o valor pago da fatura atual
            if (userData.fatura) {
                // Reduz o valor da fatura. O Math.max garante que não fique negativo.
                userData.fatura.valorAtual = Math.max(0, userData.fatura.valorAtual - valorPago);
                
                // Se zerou a fatura, muda o status
                if (userData.fatura.valorAtual === 0) {
                    userData.fatura.status = 'Fechada';
                }
            }

            // 4. Lógica de Negócios: Restaura o limite do usuário
            // Aqui você pode definir a regra (ex: se pagou 100, libera 100 no Pix)
            if (userData.limites) {
                userData.limites.pix += valorPago; 
            }

            // 5. Salva a atualização no Firebase
            await userRef.update({
                fatura: userData.fatura,
                limites: userData.limites
            });

            console.log(`✅ Webhook Processado: Fatura de ${userData.nome} atualizada!`);

            // 6. 🚀 A MÁGICA: Dispara o Push Nativo avisando que o limite voltou!
            if (userData.fcmToken) {
                await dispararPushAndroid(
                    userData.fcmToken,
                    "Fatura Paga! 🎉",
                    `Seu pagamento de R$ ${valorPago.toFixed(2)} foi processado e seu limite foi liberado.`,
                    { tipo: "sucesso" }
                );
            }

        } catch (error) {
            console.error("🔥 Erro ao processar Webhook do Asaas:", error);
        }
    }
});

// ROTA PARA SALVAR A NOVA SENHA (APÓS CLICAR NO LINK DO E-MAIL)
app.post('/api/auth/update-password', async (req, res) => {
    const { email, novaSenha } = req.body;

    try {
        const usersRef = db.collection('users');
        const snapshot = await usersRef.where('email', '==', email).get();

        if (snapshot.empty) {
            return res.status(404).json({ success: false, error: "Usuário não encontrado." });
        }

        let userId = '';
        snapshot.forEach(doc => { 
            userId = doc.id; 
        });

        // Criptografia da nova senha antes de salvar no banco
        const saltRounds = 10;
        const senhaCriptografada = await bcrypt.hash(novaSenha, saltRounds);

        // Atualiza o documento do usuário com a nova senha protegida
        await db.collection('users').doc(userId).update({
            senha: senhaCriptografada
        });

        res.json({ success: true, message: "Senha atualizada com sucesso!" });

    } catch (e) {
        console.error("🔥 Erro ao atualizar senha no Firestore:", e);
        res.status(500).json({ success: false, error: "Erro interno ao salvar nova senha." });
    }
});

// 🚀 ADICIONE AQUI A NOVA ROTA DE SEGURANÇA INTERNA
app.post('/api/auth/change-password', async (req, res) => {
    const { email, senhaAtual, novaSenha } = req.body; 

    try {
        const usersRef = db.collection('users');
        const snapshot = await usersRef.where('email', '==', email.toLowerCase().trim()).get();

        if (snapshot.empty) {
            return res.status(404).json({ success: false, error: "Usuário não encontrado." });
        }

        let userDoc = null;
        snapshot.forEach(doc => { userDoc = { id: doc.id, ...doc.data() }; });

        // Verifica se a senha atual está correta antes de mudar
        const senhaValida = await bcrypt.compare(senhaAtual, userDoc.senha);
        if (!senhaValida) {
            return res.status(401).json({ success: false, error: "A senha atual está incorreta." });
        }

        const saltRounds = 10;
        const novaSenhaCriptografada = await bcrypt.hash(novaSenha, saltRounds);

        await db.collection('users').doc(userDoc.id).update({
            senha: novaSenhaCriptografada
        });

        res.json({ success: true, message: "Senha atualizada com segurança!" });

    } catch (e) {
        console.error("🔥 Erro ao trocar senha:", e);
        res.status(500).json({ success: false, error: "Erro interno no servidor." });
    }
});

// ==========================================
// ROTA: PROCESSAR PIX PARCELADO (INTEGRADO AO ASAAS E BLINDADO COM ZOD)
// ==========================================
app.post('/api/pix/transferir', validate(pixSchema), async (req, res) => {
    // 🚀 NOVO: Agora recebemos a chave e o tipo de chave do App!
    const { uid, valorPix, valorParcela, parcelas, chavePix, tipoChave } = req.body;

    try {
        const userRef = db.collection('users').doc(uid);
        const doc = await userRef.get();

        if (!doc.exists) {
            return res.status(404).json({ success: false, error: "Utilizador não encontrado." });
        }

        let userData = doc.data();

     // 1. VALIDAÇÃO DE SEGURANÇA NO FIREBASE (BLINDADA)
        const limiteAtual = Number(userData.limites?.pix) || 0;
        const valorDaTransferencia = Number(valorPix) || 0;

        if (limiteAtual < valorDaTransferencia) {
            return res.status(400).json({ 
                success: false, 
                error: `Limite Pix insuficiente. Limite real no banco: R$ ${limiteAtual}` 
            });
        }

        // ====================================================
        // 🚀 O CORAÇÃO DA OPERAÇÃO: TRANSFERÊNCIA REAL NO ASAAS
        // ====================================================
        // Precisamos traduzir o nome do tipo de chave do seu App para o padrão do Asaas
        const asaasKeyTypeMap = {
            'CPF': 'CPF',
            'CNPJ': 'CNPJ',
            'E-mail': 'EMAIL',
            'Celular': 'PHONE',
            'Chave Aleatória': 'EVP'
        };
        const pixAddressKeyType = asaasKeyTypeMap[tipoChave] || 'EVP';

        // Dispara a ordem de transferência para o Asaas
        const asaasTransfer = await fetchAsaas('/transfers', 'POST', {
            value: valorPix,
            pixAddressKey: chavePix,
            pixAddressKeyType: pixAddressKeyType,
            description: `Pix via Liberta App`
        });

        // Se o Asaas recusar (ex: sua conta Sandbox está sem saldo)
        if (asaasTransfer.errors) {
            throw new Error(asaasTransfer.errors[0].description);
        }
        // ====================================================

        // 2. DESCONTA O LIMITE DO USUÁRIO
        userData.limites.pix -= valorPix;

        // 3. ATUALIZA A FATURA DA PESSOA
        if (!userData.fatura) {
            userData.fatura = { valorAtual: 0, vencimento: '10/03', status: 'Aberta' };
        }
        userData.fatura.valorAtual += valorParcela;

        // 4. CRIA O HISTÓRICO COM O ID REAL DA TRANSAÇÃO NO ASAAS
        const novaTransacao = {
            id: Date.now(),
            idTransacao: asaasTransfer.id, // 🚀 ID autêntico do Asaas!
            titulo: `Pix Parcelado (${parcelas}x)`,
            data: new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
            dataHora: new Date().toLocaleString('pt-BR'),
            valor: -valorPix,
            pagador: {
                nome: userData.nome,
                cpf: userData.cpf,
                banco: "Aura Bank"
            },
            recebedor: {
                nome: "Destinatário", // Opcional: buscaríamos o nome real via validação de chave antes
                cpf: "***.***.***-**", 
                banco: "Instituição Destino",
                chavePix: chavePix
            }
        };
        
        userData.transacoes = [novaTransacao, ...(userData.transacoes || [])];

        // 5. GRAVA TUDO DE VOLTA NO FIREBASE
        await userRef.update({
            limites: userData.limites,
            fatura: userData.fatura,
            transacoes: userData.transacoes
        });

        // 6. DISPARA A NOTIFICAÇÃO PUSH
        if (userData.fcmToken) {
            await dispararPushAndroid(
                userData.fcmToken,
                "Pix Enviado! 💸",
                `Transferência de R$ ${valorPix.toFixed(2)} processada com sucesso.`,
                { tipo: "pix", transacaoId: novaTransacao.idTransacao }
            );
        }

        res.json({ success: true, user: { uid, ...userData } });

    } catch (error) {
        console.error("🔥 Erro ao processar Pix:", error.message || error);
        // Retorna o erro exato do Asaas (ex: Saldo insuficiente) para a tela do celular
        res.status(500).json({ success: false, error: error.message || "Erro na transferência." });
    }
});

// ROTA PARA LISTAR TODOS OS USUÁRIOS (Faltava no server.js)
app.get('/api/admin/users', async (req, res) => {
    const adminKey = req.headers['x-admin-key'];
    if (adminKey !== process.env.ADMIN_KEY) return res.status(403).json({ success: false, error: "Acesso negado." });

    try {
        const snapshot = await db.collection('users').get();
        const users = [];
        snapshot.forEach(doc => users.push({ uid: doc.id, ...doc.data() }));
        res.json({ success: true, users });
    } catch (e) {
        res.status(500).json({ success: false, error: e.message });
    }
});

// ROTA PARA ATUALIZAÇÃO COMPLETA DO CLIENTE (Faltava no server.js)
app.put('/api/admin/update-full/:uid', async (req, res) => {
    const adminKey = req.headers['x-admin-key'];
    if (adminKey !== process.env.ADMIN_KEY) return res.status(403).json({ success: false, error: "Acesso negado." });

    const { uid } = req.params;
    const dadosNovos = req.body;

    try {
        await db.collection('users').doc(uid).update(dadosNovos);
        res.json({ success: true });
    } catch (e) {
        res.status(500).json({ success: false, error: e.message });
    }
});

// ROTA PARA BUSCAR SALDO REAL DO ASAAS (Faltava no server.js)
app.get('/api/admin/asaas-balance', async (req, res) => {
    const adminKey = req.headers['x-admin-key'];
    if (adminKey !== process.env.ADMIN_KEY) return res.status(403).json({ success: false, error: "Acesso negado." });

    try {
        const response = await fetch(`${process.env.ASAAS_API_URL}/finance/balance`, {
            headers: { 'access_token': process.env.ASAAS_API_KEY }
        });
        const data = await response.json();
        res.json({ success: true, saldoAsaas: data.balance });
    } catch (e) {
        res.status(500).json({ success: false, error: "Erro ao consultar Asaas" });
    }
});

// ==========================================
// ROTA ADMIN: GERIR TAXAS DE JUROS DO SISTEMA
// ==========================================
app.get('/api/admin/taxas', async (req, res) => {
    const adminKey = req.headers['x-admin-key'];
    if (adminKey !== process.env.ADMIN_KEY) return res.status(403).json({ success: false, error: "Acesso negado." });

    try {
        const doc = await db.collection('sistema').doc('taxas').get();
        if (doc.exists) {
            res.json({ success: true, taxas: doc.data() });
        } else {
            // Retorna o padrão caso ainda não exista no banco
            res.json({ success: true, taxas: { 'Platinum': 0.069, 'Gold': 0.099, 'Standard': 0.149 } });
        }
    } catch (e) {
        res.status(500).json({ success: false, error: "Erro ao ler taxas." });
    }
});

app.post('/api/admin/taxas', async (req, res) => {
    const adminKey = req.headers['x-admin-key'];
    if (adminKey !== process.env.ADMIN_KEY) return res.status(403).json({ success: false, error: "Acesso negado." });

    const { Platinum, Gold, Standard } = req.body;

    try {
        await db.collection('sistema').doc('taxas').set({
            Platinum: Number(Platinum),
            Gold: Number(Gold),
            Standard: Number(Standard)
        });
        
        // Regista nos logs a alteração
        await db.collection('admin_logs').add({
            acao: 'Alteração de Taxas',
            detalhes: `As taxas base foram alteradas. STD: ${Standard}, GLD: ${Gold}, PLT: ${Platinum}`,
            usuarioAfetado: 'Sistema Global',
            data: admin.firestore.FieldValue.serverTimestamp(),
            admin: "Felipe (Mestre)"
        });

        res.json({ success: true });
    } catch (e) {
        res.status(500).json({ success: false, error: "Erro ao guardar taxas." });
    }
});

// ==========================================
// ROTA ADMIN: DISPARAR PUSH INDIVIDUAL (Usada no Loop de Massa e no Perfil)
// ==========================================
app.post('/api/admin/notificar', async (req, res) => {
    // 1. Validação de Segurança (Apenas o Admin pode disparar)
    const adminKey = req.headers['x-admin-key'];
    if (adminKey !== process.env.ADMIN_KEY) {
        return res.status(403).json({ success: false, error: "Acesso negado." });
    }

    const { uid, titulo, mensagem, tipo } = req.body;

    try {
        // 2. Busca o usuário no banco para pegar o Token do celular dele
        const userDoc = await db.collection('users').doc(uid).get();
        
        if (!userDoc.exists) {
            return res.status(404).json({ success: false, error: "Usuário não encontrado." });
        }

        const userData = userDoc.data();

        // 3. Verifica se ele tem o app instalado e registrou o token
        if (!userData.fcmToken) {
            return res.status(400).json({ success: false, error: "O cliente não tem o token FCM registrado." });
        }

        // 4. Usa a função que você já tem no server.js para disparar pro Android
        const enviado = await dispararPushAndroid(
            userData.fcmToken, 
            titulo, 
            mensagem, 
            { tipo: tipo }
        );

        if (enviado) {
            res.json({ success: true, message: "Push enviado com sucesso!" });
        } else {
            res.status(500).json({ success: false, error: "Falha ao enviar pelo Firebase." });
        }

    } catch (error) {
        console.error("🔥 Erro na rota de notificação:", error);
        res.status(500).json({ success: false, error: "Erro interno no servidor." });
    }
});

// ==========================================
// ROTA: LOGIN DO ADMIN
// ==========================================
app.post('/api/admin/login', (req, res) => {
    const { senha } = req.body;
    if (senha === process.env.ADMIN_KEY) {
        res.json({ success: true, token: process.env.ADMIN_KEY });
    } else {
        res.status(401).json({ success: false, error: "Chave inválida." });
    }
});

// ==========================================
// ROTAS DE AUDITORIA (LOGS)
// ==========================================

// 1. Gravar um novo log
app.post('/api/admin/logs', async (req, res) => {
    const adminKey = req.headers['x-admin-key'];
    if (adminKey !== process.env.ADMIN_KEY) return res.status(403).send("Negado");

    try {
        const { acao, detalhes, usuarioAfetado } = req.body;
        await db.collection('admin_logs').add({
            acao,
            detalhes,
            usuarioAfetado,
            data: admin.firestore.FieldValue.serverTimestamp(),
            admin: "Felipe (Mestre)" // Futuramente pode ser dinâmico
        });
        res.json({ success: true });
    } catch (e) { res.status(500).json({ error: e.message }); }
});


// 2. Listar logs
app.get('/api/admin/logs', async (req, res) => {
    const adminKey = req.headers['x-admin-key'];
    if (adminKey !== process.env.ADMIN_KEY) return res.status(403).send("Negado");

    try {
        const snapshot = await db.collection('admin_logs').orderBy('data', 'desc').limit(50).get();
        const logs = [];
        snapshot.forEach(doc => logs.push({ id: doc.id, ...doc.data() }));
        res.json({ success: true, logs });
    } catch (e) { res.status(500).json({ error: e.message }); }
});

// ==========================================
// ROTAS DE GESTÃO DE BANNERS (APP E ADMIN)
// ==========================================

// 1. Rota Pública: O aplicativo usa essa rota para ler os banners ao iniciar
app.get('/api/banners', async (req, res) => {
    try {
        const doc = await db.collection('sistema').doc('banners').get();
        if (doc.exists && doc.data().lista) {
            res.json({ success: true, banners: doc.data().lista });
        } else {
            // Se não houver banners no banco, envia array vazio
            res.json({ success: true, banners: [] });
        }
    } catch (error) {
        res.status(500).json({ success: false, error: "Erro ao buscar banners." });
    }
});

// 2. Rota Admin: O painel usa essa rota para guardar novos banners
app.post('/api/admin/banners', async (req, res) => {
    const adminKey = req.headers['x-admin-key'];
    if (adminKey !== process.env.ADMIN_KEY) return res.status(403).json({ success: false, error: "Acesso negado." });

    const { banners } = req.body;
    try {
        await db.collection('sistema').doc('banners').set({ lista: banners });
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ success: false, error: "Erro ao guardar banners." });
    }
});

// NOVA ROTA: O Painel Admin usa esta rota para VER o que já está salvo
app.get('/api/admin/banners', async (req, res) => {
    const adminKey = req.headers['x-admin-key'];
    if (adminKey !== process.env.ADMIN_KEY) return res.status(403).json({ success: false });

    try {
        const doc = await db.collection('sistema').doc('banners').get();
        if (!doc.exists) return res.json({ success: true, banners: [] });
        res.json({ success: true, banners: doc.data().lista || [] });
    } catch (e) {
        res.status(500).json({ success: false, error: e.message });
    }
});

// ==========================================
// ROTA: ALTERAR DATA DE VENCIMENTO DA FATURA
// ==========================================
app.post('/api/fatura/alterar-vencimento', async (req, res) => {
    const { uid, novoDia } = req.body;

    // Validação de segurança para garantir que é um dia permitido
    const diasPermitidos = [5, 10, 15, 20, 25];
    if (!diasPermitidos.includes(novoDia)) {
        return res.status(400).json({ success: false, error: "Dia de vencimento inválido." });
    }

    try {
        const userRef = db.collection('users').doc(uid);
        const doc = await userRef.get();

        if (!doc.exists) {
            return res.status(404).json({ success: false, error: "Usuário não encontrado." });
        }

        let userData = doc.data();

        // Atualiza apenas o dia do vencimento dentro do objeto fatura
        userData.fatura = {
            ...userData.fatura,
            diaVencimento: novoDia,
            // Recalcula o status ou mantém o atual
        };

        await userRef.update({ fatura: userData.fatura });

        res.json({ success: true, message: "Data de vencimento alterada com sucesso!", user: userData });

    } catch (error) {
        console.error("🔥 Erro ao alterar vencimento:", error);
        res.status(500).json({ success: false, error: "Erro interno ao atualizar a fatura." });
    }
});

// ==========================================
// 🔔 MOTOR DE NOTIFICAÇÕES (FIREBASE CLOUD MESSAGING)
// ==========================================

// Função interna do Cérebro para disparar o Push para o Android
const dispararPushAndroid = async (fcmToken, titulo, mensagem, dadosExtras = {}) => {
    if (!fcmToken) {
        console.log("⚠️ Usuário sem token FCM. Notificação ignorada.");
        return false;
    }

const payload = {
        token: fcmToken,
        notification: {
            title: titulo,
            body: mensagem,
        },
        data: {
            ...dadosExtras
        },
        android: {
            priority: "high",
            notification: {
                sound: "default",
                channelId: "transacoes_aura" 
            }
        }
    };

    try {
        const response = await admin.messaging().send(payload);
        console.log("✅ Notificação Push enviada com sucesso:", response);
        return true;
    } catch (error) {
        console.error("🔥 Erro ao enviar Push:", error);
        return false;
    }
};

// Rota para o APK informar qual é o "Endereço do Celular" (Token FCM)
app.post('/api/notificacoes/registrar-token', async (req, res) => {
    const { uid, fcmToken } = req.body;

    if (!uid || !fcmToken) {
        return res.status(400).json({ success: false, error: "Faltam dados." });
    }

    try {
        // Salva o token no perfil do usuário no Firestore
        await db.collection('users').doc(uid).set({
            fcmToken: fcmToken
        }, { merge: true }); // merge: true não apaga os outros dados!

        res.json({ success: true, message: "Aparelho Android registrado para notificações!" });
    } catch (error) {
        console.error("🔥 Erro ao salvar Token FCM:", error);
        res.status(500).json({ success: false, error: "Erro interno." });
    }
});

const PORT = process.env.PORT || 3001;

// ============================================================
// 🚀 GESTÃO DINÂMICA DE BANNERS (SINCRONIZAÇÃO APP/SITE)
// ============================================================

// 1. ROTA PÚBLICA: O App lê os banners aqui
app.get('/api/banners', async (req, res) => {
    try {
        const doc = await db.collection('sistema').doc('banners').get();
        if (!doc.exists) {
            return res.json({ success: true, banners: [] });
        }
        // Retorna a lista que o Admin salvou
        res.json({ success: true, banners: doc.data().lista || [] });
    } catch (e) {
        console.error("🔥 Erro ao buscar banners:", e);
        res.status(500).json({ success: false, error: e.message });
    }
});

// 2. ROTA PRIVADA: O Painel Admin salva os banners aqui
app.post('/api/admin/banners', async (req, res) => {
    const adminKey = req.headers['x-admin-key'];
    
    // Validação de segurança usando a chave do seu .env
    if (adminKey !== process.env.ADMIN_KEY) {
        return res.status(403).json({ success: false, error: "Acesso negado" });
    }

    const { banners } = req.body; 
    try {
        // Salva na coleção 'sistema', documento 'banners'
        await db.collection('sistema').doc('banners').set({ 
            lista: banners,
            ultimaAtualizacao: new Date().toISOString()
        });
        res.json({ success: true, message: "Banners atualizados na nuvem!" });
    } catch (e) {
        console.error("🔥 Erro ao salvar banners:", e);
        res.status(500).json({ success: false, error: e.message });
    }
});

// ROTA DE EMERGÊNCIA PARA LIMPAR BANNERS (Acesse no navegador: IP:3001/api/admin/reset-banners)
app.get('/api/admin/reset-banners', async (req, res) => {
    try {
        await db.collection('sistema').doc('banners').set({ lista: [] });
        res.send("<h1>Sucesso! A lista de banners foi resetada para vazio.</h1>");
    } catch (e) {
        res.status(500).send("Erro: " + e.message);
    }
});

// =========================================================
// ROTA: ALTERAR DATA DE VENCIMENTO DA FATURA
// =========================================================
app.post('/api/fatura/alterar-vencimento', async (req, res) => {
    const { uid, novoDia } = req.body;

    if (!uid || !novoDia) {
        return res.status(400).json({ success: false, error: "Faltam dados: uid ou novoDia." });
    }

    try {
        // ATENÇÃO: Se a sua coleção no Firebase se chama 'usuarios', mude 'users' para 'usuarios' abaixo
        const userRef = db.collection('users').doc(uid);
        
        // Atualiza apenas o campo 'diaVencimento' dentro do objeto 'fatura', 
        // mantendo os restantes dados (como limite usado, valor atual, etc.) intactos.
        await userRef.set({
            fatura: {
                diaVencimento: novoDia
            }
        }, { merge: true }); 

        res.json({ success: true, message: "Vencimento atualizado com sucesso!" });
    } catch (error) {
        console.error("🔥 Erro ao alterar data de vencimento:", error);
        res.status(500).json({ success: false, error: "Erro interno no servidor." });
    }
});

// ROTA: PROXY DE CEP (USADA NO PASSO 5 DO CADASTRO)
// O App chama seu servidor, e seu servidor chama o ViaCEP
app.get('/api/utils/cep/:cep', async (req, res) => {
    const { cep } = req.params;
    const cepLimpo = cep.replace(/\D/g, ''); // Garante que só existam números

    if (cepLimpo.length !== 8) {
        return res.status(400).json({ success: false, error: "CEP inválido." });
    }

    try {
        // O servidor faz a requisição pesada
        const response = await fetch(`https://viacep.com.br/ws/${cepLimpo}/json/`);
        const data = await response.json();

        if (data.erro) {
            return res.status(404).json({ success: false, error: "CEP não encontrado." });
        }

        // Retorna o endereço formatado para o App
        res.json({ success: true, address: data });
    } catch (e) {
        console.error("🔥 Erro na consulta de CEP:", e);
        res.status(500).json({ success: false, error: "Erro ao consultar serviço de CEP." });
    }
});

// ROTA: CONSULTAR QUEM É O DONO DA CHAVE PIX (DICT) NO ASAAS
app.get('/api/pix/consultar-chave', async (req, res) => {
    const { chave } = req.query; // Pega a chave enviada pelo fetch do AreaPix

    if (!chave) {
        return res.status(400).json({ success: false, error: "Chave Pix não informada." });
    }

    try {
        // Chamada para a API de Sandbox do Asaas
        const response = await fetch(`${process.env.ASAAS_API_URL}/pix/addressKey/validate?addressKey=${encodeURIComponent(chave)}`, {
            method: 'GET',
            headers: {
                'accept': 'application/json',
                'access_token': process.env.ASAAS_API_KEY // Usa o teu token do .env
            }
        });

        const data = await response.json();

        if (response.ok && data.owner) {
            // Devolvemos apenas o que o teu frontend precisa
            res.json({
                success: true,
                nome: data.owner.name,
                documento: data.owner.cpfCnpj,
                instituicao: data.bank.name
            });
        } else {
            res.status(404).json({ success: false, error: "Chave Pix não encontrada no sistema." });
        }

    } catch (e) {
        console.error("🔥 Erro DICT Pix:", e);
        res.status(500).json({ success: false, error: "Erro ao conectar com o sistema Pix." });
    }
});

// ==========================================
// ROTA: EXCLUIR CONTA PERMANENTEMENTE (COM VALIDAÇÃO DE DÍVIDA E SENHA)
// ==========================================
app.delete('/api/auth/delete-account', async (req, res) => {
    const { uid, senha } = req.body;

    if (!uid || !senha) {
        return res.status(400).json({ success: false, error: "Dados incompletos para exclusão." });
    }

    try {
        const userRef = db.collection('users').doc(uid);
        const userDoc = await userRef.get();

        if (!userDoc.exists) {
            return res.status(404).json({ success: false, error: "Utilizador não encontrado." });
        }

        const userData = userDoc.data();

        // 1. VERIFICAÇÃO DE DÍVIDA (A REGRA DE OURO)
        const saldoDevedor = Number(userData.fatura?.valorAtual || 0) + 
                             Number(userData.limites?.usado || 0) + 
                             Number(userData.fatura?.saldoDevedor || 0);

        if (saldoDevedor > 0) {
            return res.status(403).json({ 
                success: false, 
                error: `Exclusão negada. Você possui um débito de R$ ${saldoDevedor.toFixed(2)}. Quite suas pendências antes de encerrar a conta.` 
            });
        }

        // 2. COMPARA A SENHA DIGITADA COM O HASH DO BANCO
        const senhaValida = await bcrypt.compare(senha, userData.senha);

        if (!senhaValida) {
            return res.status(401).json({ success: false, error: "Senha incorreta. Exclusão cancelada." });
        }

        // 3. SE NÃO DEVE NADA E A SENHA ESTÁ CORRETA, EXCLUI O USUÁRIO
        await userRef.delete();
        
        // 4. GRAVA NOS LOGS DO ADMIN
        await db.collection('admin_logs').add({
            acao: 'Exclusão de Conta',
            detalhes: `A conta associada ao UID ${uid} foi encerrada. Nenhuma dívida pendente.`,
            usuarioAfetado: uid,
            data: admin.firestore.FieldValue.serverTimestamp(),
            admin: "Sistema Automático"
        });

        res.json({ success: true, message: "Conta excluída com sucesso." });
    } catch (e) {
        console.error("🔥 Erro ao excluir conta:", e);
        res.status(500).json({ success: false, error: "Erro interno ao excluir a conta." });
    }
});



app.listen(PORT, '0.0.0.0', () => {
  console.log(`
🚀 Server iniciado com sucesso!
💻 Liberta Brain rodando e pronto para mudar o jogo.
📡 Acesse: http://192.168.15.7:${PORT}
🔥 Bora construir o futuro!

✅ Conectado ao Firebase: ${serviceAccount.project_id}
  `);
});