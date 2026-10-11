/**
 * Generates printable QR codes for static sources (bins, e-waste hubs).
 *
 *   TABLE_NAME=SaafSafariMain AWS_REGION=ap-south-1 pnpm tsx scripts/print-static-qrs.ts
 *
 * Writes PNGs + an index.html to docs/demo-qr/. Each QR encodes
 * {"v":1,"sourceId":"…","token":"<HMAC signature>"}, which the citizen app sends to POST /v1/scans.
 * Re-run after `pnpm seed` (seeding rotates the signing secrets).
 */
import { mkdirSync, writeFileSync } from 'fs';
import { join } from 'path';
import { createHmac } from 'crypto';
import QRCode from 'qrcode';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, ScanCommand } from '@aws-sdk/lib-dynamodb';

const REGION = process.env.AWS_REGION || 'ap-south-1';
const TABLE_NAME = process.env.TABLE_NAME || 'SaafSafariMain';
const OUT_DIR = join(__dirname, '..', 'docs', 'demo-qr');

const ddb = DynamoDBDocumentClient.from(new DynamoDBClient({ region: REGION }));

/** Must match generateStaticQrSignature in services/api/src/utils/hmac.ts */
const sign = (secret: string, sourceId: string) =>
  createHmac('sha256', secret).update(`static:${sourceId}`).digest('hex');

async function main() {
  const items: Record<string, any>[] = [];
  let lastKey: Record<string, any> | undefined;
  do {
    const res = await ddb.send(
      new ScanCommand({
        TableName: TABLE_NAME,
        FilterExpression: 'begins_with(PK, :p) AND SK = :sk',
        ExpressionAttributeValues: { ':p': 'QR#', ':sk': 'METADATA' },
        ExclusiveStartKey: lastKey,
      }),
    );
    items.push(...(res.Items || []));
    lastKey = res.LastEvaluatedKey;
  } while (lastKey);

  const statics = items.filter((i) => i.type === 'dustbin_static' || i.type === 'ewaste_static');
  mkdirSync(OUT_DIR, { recursive: true });

  const cards: string[] = [];
  for (const src of statics) {
    const payload = JSON.stringify({ v: 1, sourceId: src.sourceId, token: sign(src.secretKey, src.sourceId) });
    const file = `${src.sourceId}.png`;
    await QRCode.toFile(join(OUT_DIR, file), payload, { width: 512, margin: 2 });
    cards.push(
      `<figure><img src="${file}" alt="${src.sourceId}"/><figcaption><b>${src.name}</b><br/>${src.sourceId}<br/>` +
        `${src.latitude}, ${src.longitude} · ${src.geofenceRadiusMeters || 75} m</figcaption></figure>`,
    );
  }

  writeFileSync(
    join(OUT_DIR, 'index.html'),
    `<!doctype html><meta charset="utf-8"><title>Oru demo QR codes</title>
<style>body{font-family:system-ui;margin:24px}main{display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:20px}
figure{margin:0;border:1px solid #ddd;border-radius:12px;padding:12px;text-align:center}img{width:100%}figcaption{font-size:12px}</style>
<h1>Oru demo QR codes</h1><p>Scanning only counts within the geofence radius of each source.</p><main>${cards.join('')}</main>`,
  );
  console.log(`✓ Wrote ${statics.length} QR codes to ${OUT_DIR}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
