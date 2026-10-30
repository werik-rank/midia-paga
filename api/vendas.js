// Negócios ganhos com origem Ads desde 01/05/2026, via HubSpot REST (Private App).
// Env: HUBSPOT_TOKEN (escopo crm.objects.deals.read), HUBSPOT_PORTAL_ID (opcional)
const PORTAL = process.env.HUBSPOT_PORTAL_ID || '44530090';
module.exports = async (req, res) => {
  try {
    if (!process.env.HUBSPOT_TOKEN) throw new Error('HUBSPOT_TOKEN não configurado');
    const results = [];
    let after;
    for (let i = 0; i < 10; i++) {
      const r = await fetch('https://api.hubapi.com/crm/v3/objects/deals/search', {
        method: 'POST',
        headers: {authorization: 'Bearer ' + process.env.HUBSPOT_TOKEN, 'content-type': 'application/json'},
        body: JSON.stringify({
          filterGroups: [{filters: [
            {propertyName: 'hs_is_closed_won', operator: 'EQ', value: 'true'},
            {propertyName: 'closedate', operator: 'GTE', value: '2026-05-01'},
            {propertyName: 'origem', operator: 'EQ', value: 'Ads'}]}],
          properties: ['dealname', 'pipeline', 'closedate', 'amount', 'origem', 'origem_detalhada_ads'],
          sorts: [{propertyName: 'closedate', direction: 'ASCENDING'}], limit: 100, after
        })
      });
      const j = await r.json();
      if (!r.ok) throw new Error('HubSpot: ' + (j.message || r.status));
      results.push(...j.results);
      after = j.paging && j.paging.next && j.paging.next.after;
      if (!after) break;
    }
    res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate=600');
    res.status(200).json({results, urlTemplate: 'https://app.hubspot.com/contacts/' + PORTAL + '/record/0-3/{id}'});
  } catch (e) {
    res.status(500).json({error: String(e.message || e)});
  }
};
