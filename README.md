# HackGov · Agendamento em Unidades de Saúde

Protótipo da Fase 1 do Projeto HackGov, desenvolvido para a disciplina de
Sistema de Informação (Agile Transformation) — FIAP, Engenharia de Software.

**Autora:** Rebeca Gouvea Franco — RM576187

## Sobre o projeto

O HackGov é uma iniciativa de transformação digital da gestão pública. Esta
frente do projeto resolve o problema de agendamento de consultas e exames em
unidades de saúde, hoje marcado por filas presenciais, ligações telefônicas
sem retorno e falta de visibilidade sobre o status da solicitação.

Este protótipo é a primeira versão conceitual do sistema: uma aplicação web
front-end, sem backend, que roda inteiramente no navegador e usa
`localStorage` para simular a persistência de dados. O objetivo é validar o
fluxo de uso e os requisitos levantados na documentação da Fase 1, servindo
de base para a evolução do sistema ao longo do ano.

## Como executar

Não há dependências ou instalação necessárias.

1. Baixe/clone este repositório.
2. Abra o arquivo `index.html` diretamente no navegador.

   Ou, para evitar restrições de navegador com `localStorage` em arquivos
   locais, sirva a pasta com um servidor simples:

   ```bash
   cd app
   python3 -m http.server 8000
   ```

   Depois acesse `http://localhost:8000` no navegador.

## Funcionalidades e User Stories atendidas

| Tela | User Story | O que faz |
|---|---|---|
| Meu cadastro | US01 | Cadastra nome, CPF, Cartão SUS e data de nascimento do cidadão, com validação básica dos campos. |
| Agendar consulta | US02 | Permite escolher unidade de saúde, especialidade, data e horário disponível, gerando um número de protocolo. |
| Meus agendamentos | US03 | Permite cancelar ou reagendar uma consulta já marcada. |
| Meus agendamentos → Lembretes | US04 | Simula o envio de lembretes automáticos (app, SMS ou e-mail) a cada agendamento criado, confirmado ou reagendado. |
| Meus agendamentos | US05 | Exibe o status de cada solicitação (pendente, confirmado, cancelado) e permite consultar pelo protocolo. |

O botão **"Simular confirmação da unidade"** existe apenas para fins de
demonstração da Fase 1: em uma versão futura com backend, essa mudança de
status seria feita pela equipe da unidade de saúde, não pelo cidadão.

## Estrutura do código

```
app/
├── index.html   → estrutura das 3 telas (cadastro, agendar, agendamentos)
├── style.css    → sistema visual (identidade preto, branco e rosa da FIAP)
├── script.js    → lógica da aplicação e persistência em localStorage
└── README.md
```

## Próximos passos (fora do escopo desta fase)

- Substituir o `localStorage` por um backend real (API + banco de dados).
- Autenticação do cidadão (login via gov.br, por exemplo).
- Envio real de notificações (integração com SMS/e-mail).
- Painel para a unidade de saúde confirmar/gerenciar agendamentos.
- Dashboard com os indicadores levantados na Parte 4 da documentação.
