# 🦮 DogVisor Mobile — FrontEnd

Aplicativo mobile para a gestão operacional e clínica do **Centro de Treinamento de Cães-Guia do IF Goiano — Campus Urutaí**.

O **DogVisor** é a interface mobile conectada ao ecossistema de microsserviços **Dog-Vision**, desenvolvida para atender às rotinas diárias de coordenadores, veterinários, treinadores e colaboradores do centro.

---

## 📌 Sobre o Projeto

O treinamento e acompanhamento de cães-guia exige um controle rigoroso de saúde, estoque, eventos clínicos e evolução de cada animal. O **DogVisor** centraliza e simplifica essas operações em um aplicativo móvel moderno, intuitivo e com controle de acesso baseado em papéis (RBAC).

### 🔗 Integração com o Backend (Dog-Vision)
O aplicativo consome a arquitetura de microsserviços Java / Spring Boot do **Dog-Vision**:
- **Cloud Gateway:** Roteamento unificado e segurança das requisições HTTP e WebSockets.
- **Service User:** Autenticação JWT, gerenciamento de perfil e permissões de usuários/colaboradores.
- **Service DogManagement:** Cadastro, listagem e acompanhamento das informações dos cães.
- **Service DogHealth:** Prontuário clínico, consultas, cirurgias, partos, pesagens e gestão farmacêutica.
- **Service Audit & RabbitMQ:** Rastreabilidade e logs de ações no sistema.

---

## 🚀 Funcionalidades Principais

### 🏢 Módulo do Coordenador (`ROLE_COORDINATOR`)
- **Gestão de Colaboradores:** Listagem de membros da equipe, alteração de cargos/permissões e ativação/desativação de contas.
- **Controle de Estoque de Ração:** Cadastro de lotes, incremento/baixa de estoque em kg, alertas de estoque mínimo e estimativa preditiva de consumo diário e dias restantes.
- **Painel de Ações Rápidas (Home):** Indicadores do centro, alertas em tempo real e atalhos operacionais.

### 🩺 Módulo do Veterinário (`ROLE_VETERINARIAN`)
- **Gestão de Medicamentos:** Cadastro de medicamentos veterinários, controle de estoque (comprimidos, ml, doses) e registro de administrações por cão.
- **Agenda e Procedimentos Clínicos:** Agendamento e registro de consultas normais, atendimentos de emergência, cirurgias e partos.
- **Prontuário e Histórico de Saúde:** Acompanhamento de pesagem, histórico médico e tratamentos em andamento.

### 👥 Recursos Compartilhados
- **Gestão dos Cães:** Cadastro de novos cães, visualização de perfil detalhado, status do animal e busca com filtros.
- **Central de Notificações em Tempo Real:** Notificações via WebSocket sobre alertas críticos de estoque, medicamentos e agendamentos.
- **Perfil do Usuário:** Visualização dos dados de cadastro, edição de informações e alteração segura de senha.
- **Navegação Dinâmica (RBAC):** As abas e rotas da aplicação se adaptam dinamicamente de acordo com o nível de acesso do usuário autenticado.

---

## 🛠️ Tecnologias Utilizadas

- **Framework:** [React Native](https://reactnative.dev/) com [Expo](https://expo.dev/) (SDK 56)
- **Linguagem:** [TypeScript](https://www.typescriptlang.org/)
- **Navegação:** [React Navigation 7](https://reactnavigation.org/) (Stack Navigation & Dynamic Bottom Tabs)
- **Comunicação HTTP:** [Axios](https://axios-http.com/) com interceptors para injeção de tokens JWT
- **Tempo Real:** WebSocket nativo para entrega instantânea de notificações
- **Armazenamento Seguro:** `expo-secure-store` para persistência encriptada de tokens de autenticação
- **Ícones e UI:** `react-native-vector-icons`, `expo-image`, `expo-blur` e `expo-video`

---

## 📂 Estrutura de Pastas

```text
dog-visor-front-end/
├── assets/                  # Imagens, logos, ícones e mídias visuais
├── src/
│   ├── consts/              # Constantes de telas, rotas e ícones
│   ├── hooks/               # Custom hooks React
│   ├── navigation/          # Configuração de StackNavigator e TabNavigator
│   ├── screens/             # Telas divididas por domínio de acesso
│   │   ├── auth/            # Login e autenticação
│   │   ├── coordinator/     # Telas e componentes do Coordenador
│   │   ├── veterinarian/    # Telas e componentes do Veterinário
│   │   ├── shared/          # Telas compartilhadas (Cães, Perfil, Notificações)
│   │   └── SplashScreen.tsx # Tela de carregamento e validação de sessão
│   ├── service/             # Configuração da API Axios e WebSocket
│   ├── shared/              # Componentes reutilizáveis (Botões, Modais, Alertas)
│   ├── theme/               # Paleta de cores, tipografia e estilos globais
│   ├── types/               # Tipagens e interfaces TypeScript (DOG, User, Ration, etc.)
│   └── routes.tsx           # Ponto de entrada das rotas da aplicação
├── .env                     # Variáveis de ambiente da aplicação
├── App.tsx                  # Componente raiz
└── package.json             # Dependências e scripts do projeto
```

---

## ⚙️ Pré-requisitos

Antes de iniciar, você precisará ter instalado em sua máquina:
- [Node.js](https://nodejs.org/) (versão 18 ou superior recomendada)
- [npm](https://www.npmjs.com/) ou [yarn](https://yarnpkg.com/)
- [Expo Go](https://expo.dev/go) instalado em seu dispositivo móvel (Android/iOS) ou um emulador configurado (Android Studio / Xcode).
- Instância do backend **Dog-Vision** em execução (ou acessível via rede local).

---

## 🚀 Como Executar o Projeto

### 1. Clonar o repositório
```bash
git clone https://github.com/GarotoCowboy/dog-visor-front-end.git
cd dog-visor-front-end
```

### 2. Instalar as dependências
```bash
npm install
```

### 3. Configurar as Variáveis de Ambiente
Crie um arquivo `.env` na raiz do projeto informando o IP e a porta de acesso ao **Cloud Gateway** do backend:

```env
EXPO_PUBLIC_BACKEND_ADDRESS=192.168.1.X
EXPO_PUBLIC_BACKEND_PORT=3003
```

> 💡 **Dica:** Utilize o IP local da sua máquina na rede (ex: `192.168.X.X`) para que o aplicativo consiga se comunicar com o backend quando executado em um celular físico via Expo Go.

### 4. Iniciar o servidor de desenvolvimento Expo
```bash
npm start
```

Ou diretamente na plataforma desejada:
```bash
npm run android   # Iniciar no emulador Android
npm run ios       # Iniciar no simulador iOS (macOS)
npm run web       # Iniciar versão Web
```

---

## 🔒 Perfis de Acesso (Roles)

| Role | Descrição |
| :--- | :--- |
| `ROLE_COORDINATOR` | Acesso total à gestão de colaboradores, ração, cães e relatórios. |
| `ROLE_VETERINARIAN` | Acesso a medicamentos, prontuários, procedimentos clínicos e agenda. |
| `ROLE_TRAINER` | Acesso a rotinas de acompanhamento e treinamento dos cães. |
| `ROLE_COLLABORATOR` | Acesso operacional básico e consulta de cães e avisos. |

---

## 🎓 Contexto Acadêmico

Projeto desenvolvido como Trabalho de Conclusão de Curso (TCC) no **Instituto Federal Goiano — Campus Urutaí**, voltado ao suporte tecnológico e otimização dos processos do projeto de cães-guia da instituição.
