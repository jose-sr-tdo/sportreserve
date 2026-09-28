// backend/benchmark-navigation.js
import https from 'https';

const API_HOSTNAME = 'sportreserve-api-s2ni.onrender.com';
const TEST_DATE = '2026-12-01';

function requestGet(path) {
  return new Promise((resolve, reject) => {
    const start = Date.now();
    const req = https.request({
      hostname: API_HOSTNAME,
      port: 443,
      path: path,
      method: 'GET'
    }, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          resolve({ duration: Date.now() - start, data: JSON.parse(body) });
        } catch (e) {
          resolve({ duration: Date.now() - start, data: body });
        }
      });
    });
    req.on('error', reject);
    req.end();
  });
}

async function runBenchmark() {
  console.log(' Iniciando Benchmark de Estrategias de Navegación en la Nube (Render)...\n');

  // Método 1: Búsqueda Tradicional / No Optimizada (N consultas secuenciales)
  console.log('1. Ejecutando Recorrido Tradicional (N consultas HTTP secuenciales)...');
  const startTrad = Date.now();
  const spacesRes = await requestGet('/api/spaces');
  const spaces = Array.isArray(spacesRes.data) ? spacesRes.data : [];
  let queriesCount = 1;

  for (const space of spaces) {
    await requestGet(`/api/reservations/availability?spaceId=${space.id}&date=${TEST_DATE}`);
    queriesCount++;
  }
  const totalTradDuration = Date.now() - startTrad;
  console.log(` Recorrido tradicional: ${queriesCount} peticiones en ${totalTradDuration} ms.\n`);

  // Método 2: Navegación Asistida con Patrón Strategy (1 única consulta agregada)
  console.log('2. Ejecutando Navegación Asistida con Patrón Strategy (/api/navigation/optimal)...');
  const optRes = await requestGet(`/api/navigation/optimal?criteria=EARLIEST&date=${TEST_DATE}`);
  const totalOptDuration = optRes.duration;
  console.log(` Navegación optimizada: 1 petición en ${totalOptDuration} ms.`);
  console.log(' Recorrido sugerido:', optRes.data);

  // Resumen comparativo para el informe técnico
  const improvement = Math.round(((totalTradDuration - totalOptDuration) / totalTradDuration) * 100);
  console.log('\n======================================================');
  console.log('         MÉTRICAS DE OPTIMIZACIÓN ARQUITECTÓNICA      ');
  console.log('======================================================');
  console.log(` Recorrido Secuencial Tradicional:   ${totalTradDuration} ms (${queriesCount} peticiones HTTP)`);
  console.log(` Recorrido Optimizado (Strategy):    ${totalOptDuration} ms (1 petición HTTP)`);
  console.log(` Mejora de Rendimiento / Reducción:  ${improvement}%`);
  console.log('======================================================\n');
}

runBenchmark();