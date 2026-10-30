# Mídia paga por produto · Rank 2026

Site estático + 2 funções (api/plano.js, api/vendas.js). Sem build.

Variáveis de ambiente (Vercel > Settings > Environment Variables):
- GOOGLE_SERVICE_ACCOUNT_JSON: JSON da conta de serviço do Google. Compartilhe a planilha "Plano de Mídia Paga" com o e-mail dela (leitor).
- HUBSPOT_TOKEN: token de Private App do HubSpot com escopo crm.objects.deals.read.

Sem essas variáveis o site mostra o retrato de 30/10/2026 (snapshot-*.json) com um aviso.
Deploy: `vercel --prod` dentro desta pasta.
