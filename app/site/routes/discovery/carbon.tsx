export const loader = () => {
  const carbonText = `version="0.4"
last_updated="2026-01-26"

[org]
disclosures = [
	{ doc_type='web-page', url='https://webaudits.org/audits/ecos-v1/b31420c19fa37e26d83b7add65a05dc9#co2-emissions' }
]

[upstream]
services = [
	{ domain='aws.amazon.com', service_type='aws' }
]`


  return new Response(carbonText, {
    status: 200,
    headers: {
      "Content-Type": "text/plain",
      "Cache-Control": "public, max-age=86400",
      "X-Content-Type-Options": "nosniff"
    }
  });
};