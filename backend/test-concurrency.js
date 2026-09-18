// backend/test-concurrency.js
import http from 'https';

const API_HOSTNAME = 'sportreserve-api-s2ni.onrender.com';
const TOTAL_REQUESTS = 20;

const TEST_USER = {
  name: 'Tester Concurrencia',
  email: 'tester_stress_2026@example.com',
  password: 'TestPassword2026!'
};

// Generamos una franja horaria y fecha futura única para la prueba
const RESERVATION_PAYLOAD = JSON.stringify({
  spaceId: 1,
  date: '2026-12-01',
  startTime: '14:00:00',
  endTime: '15:00:00'
});

console.log(' Preparando credenciales y autenticación en Render...');

// Función auxiliar para peticiones HTTP en formato JSON
function postJson(path, payload, token = null) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify(payload);
    const headers = {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(data)
    };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const req = http.request({
      hostname: API_HOSTNAME,
      port: 443,
      path: path,
      method: 'POST',
      headers: headers
    }, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => resolve({ status: res.statusCode, data: body }));
    });

    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

async function start() {
  try {
    // 1. Intentar registrar al usuario de pruebas
    await postJson('/api/auth/register', TEST_USER);

    // 2. Iniciar sesión para obtener el token válido
    const loginRes = await postJson('/api/auth/login', {
      email: TEST_USER.email,
      password: TEST_USER.password
    });

    const parsed = JSON.parse(loginRes.data);
    if (!parsed.token) {
      console.error('❌ Error al obtener token:', loginRes.data);
      process.exit(1);
    }

    console.log(' Autenticación exitosa. Token JWT generado.');
    runConcurrencyTest(parsed.token);
  } catch (err) {
    console.error('❌ Error en el proceso inicial:', err.message);
  }
}

function runConcurrencyTest(jwtToken) {
  console.log(`\n Iniciando prueba de concurrencia y estrés distribuido...`);
  console.log(` Enviando ${TOTAL_REQUESTS} peticiones simultáneas a: https://${API_HOSTNAME}/api/reservations\n`);

  let completed = 0;
  let successCount = 0;
  let conflictCount = 0;
  let errorCount = 0;
  const latencies = [];
  const startTime = Date.now();

  for (let i = 1; i <= TOTAL_REQUESTS; i++) {
    const reqStart = Date.now();
    const req = http.request({
      hostname: API_HOSTNAME,
      port: 443,
      path: '/api/reservations',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(RESERVATION_PAYLOAD),
        'Authorization': `Bearer ${jwtToken}`
      }
    }, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        const latency = Date.now() - reqStart;
        latencies.push(latency);
        completed++;

        if (res.statusCode === 201) {
          successCount++;
          console.log(`[Req #${i}]  201 CREATED (${latency}ms) -> Reserva confirmada en DB`);
        } else if (res.statusCode === 409) {
          conflictCount++;
          console.log(`[Req #${i}]  409 CONFLICT (${latency}ms) -> Solapamiento bloqueado por ACID`);
        } else {
          errorCount++;
          console.log(`[Req #${i}] ⚠️ ${res.statusCode} (${latency}ms) -> ${body}`);
        }

        if (completed === TOTAL_REQUESTS) {
          generateReport(startTime, latencies, successCount, conflictCount, errorCount);
        }
      });
    });

    req.on('error', (e) => {
      completed++;
      errorCount++;
      console.error(`[Req #${i}] ❌ Error de red: ${e.message}`);
      if (completed === TOTAL_REQUESTS) {
        generateReport(startTime, latencies, successCount, conflictCount, errorCount);
      }
    });

    req.write(RESERVATION_PAYLOAD);
    req.end();
  }
}

function generateReport(startTime, latencies, successCount, conflictCount, errorCount) {
  const totalDuration = Date.now() - startTime;
  const avgLatency = Math.round(latencies.reduce((a, b) => a + b, 0) / latencies.length);
  const minLatency = Math.min(...latencies);
  const maxLatency = Math.max(...latencies);

  console.log('\n======================================================');
  console.log('       INFORME DE RENDIMIENTO Y ESCALABILIDAD         ');
  console.log('======================================================');
  console.log(` Peticiones totales enviadas:       ${TOTAL_REQUESTS}`);
  console.log(` Reservas confirmadas (201):        ${successCount} (Debe ser exactamente 1)`);
  console.log(` Colisiones bloqueadas (409):       ${conflictCount}`);
  console.log(` Fallos imprevistos / Red:           ${errorCount}`);
  console.log(` Tiempo total de prueba:            ${totalDuration} ms`);
  console.log(` Latencia promedio por petición:    ${avgLatency} ms`);
  console.log(` Latencia mínima:                   ${minLatency} ms`);
  console.log(` Latencia máxima:                   ${maxLatency} ms`);
  console.log('======================================================');

  if (successCount === 1 && conflictCount === TOTAL_REQUESTS - 1) {
    console.log(' Resultado: Integridad transaccional ACID 100% exitosa en entorno distribuido.');
  } else {
    console.log('⚠️ Resultado: Verifica si la fecha ya estaba ocupada antes de la prueba.');
  }
  console.log('======================================================\n');
}

start();