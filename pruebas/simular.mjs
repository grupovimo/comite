// Recorre los flujos con agentes simulados: control de flujo, escalas, esquemas y veredictos, sin gastar tokens.
// Uso: node pruebas/simular.mjs
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import assert from 'node:assert/strict'

const raiz = fileURLToPath(new URL('../skills/comite/flujos/', import.meta.url))
const AsyncFunction = (async () => {}).constructor

function cargar(nombre) {
  const fuente = readFileSync(raiz + nombre, 'utf8')
  assert.match(fuente, /^export const meta = \{/, `${nombre}: tiene que empezar con export const meta`)
  assert.doesNotMatch(fuente, /Date\.now\(\)|Math\.random\(\)|new Date\(\)/, `${nombre}: usa reloj o azar (rompe la reanudación)`)
  assert.doesNotMatch(fuente, /^\s*import |require\(/m, `${nombre}: los flujos no pueden importar nada`)
  const textoMeta = fuente.match(/^export const meta = (\{[\s\S]*?\n\})/)[1]
  assert.doesNotMatch(textoMeta, /\$\{|\.\.\./, `${nombre}: meta tiene que ser un literal puro`)
  const meta = new Function('return ' + textoMeta)()
  const fn = new AsyncFunction('args', 'agent', 'parallel', 'pipeline', 'phase', 'log', 'budget', fuente.replace(/^export const meta = /, 'const meta = '))
  return { fn, meta }
}

// Genera un objeto válido para el esquema; `giro` rota enums y booleanos para recorrer ramas distintas.
function falso(esquema, giro, ruta = '') {
  if (!esquema) return 'texto'
  if (esquema.enum) return esquema.enum[giro.n++ % esquema.enum.length]
  switch (esquema.type) {
    case 'object': {
      const o = {}
      for (const [k, v] of Object.entries(esquema.properties || {})) o[k] = falso(v, giro, ruta + '.' + k)
      for (const k of esquema.required || []) assert.ok(k in (esquema.properties || {}), `esquema inválido en ${ruta}: «${k}» es obligatorio pero no está en properties`)
      return o
    }
    case 'array': return [falso(esquema.items, giro, ruta + '[]'), falso(esquema.items, giro, ruta + '[]')]
    case 'boolean': return giro.n++ % 3 !== 0
    case 'integer': case 'number': return giro.n++ % 2
    default: return esquema.pattern ? 'abc1234' : 'texto' + giro.n++
  }
}

const MAPA = {
  base: 'abc1234def', repoPrincipal: '/repo', resumen: 'Producto de prueba', comoLevantar: 'docker compose up', comandosPrueba: 'npm test',
  superficies: ['web', 'interfaz', 'api', 'base-de-datos', 'ios', 'android', 'pagos', 'datos-personales'],
  angulos: ['seguridad', 'inexistente', 'diseno-visual', 'correctitud'], obligatorios: [],
  personas: { principal: 'dueña de un local', final: 'clienta' }, puedeVerse: 'web',
  previstoFuera: [], tocaComite: false, cambios: ['api/pagos.go'], cargado: ['~/.claude/comite/perfil.md'],
}
const hallazgo = (o = {}) => ({ titulo: 'h', severidad: 'media', area: 'backend', donde: 'api/a.go:1', problema: 'p', evidencia: 'e', capturas: [], arreglo: 'a', tocaDecisionProtegida: false, ...o })

async function correr(nombre, args, { mapa = {}, responder = () => undefined, presupuesto = null } = {}) {
  const { fn, meta } = cargar(nombre)
  const etiquetas = [], fases = new Set(), giro = { n: 0 }
  const agent = async (prompt, o = {}) => {
    assert.equal(typeof prompt, 'string')
    assert.ok(o.phase, `${o.label}: sin phase explícita`)
    etiquetas.push(o.label || '?')
    fases.add(o.phase)
    const propia = responder(o.label || '', o.schema, prompt)
    if (propia instanceof Error) throw propia
    if (propia !== undefined) return propia
    if (!o.schema) return '/ruta/informe.md'
    if (o.label === 'mapa' || o.label === 'mapa:reintento') return { ...MAPA, ...mapa }
    if (o.label === 'levantar') return { ok: true, url: 'http://localhost:4100', cuentas: 'a@b', pantallas: ['inicio'], comoBajar: 'docker compose down', detalle: '' }
    if (o.label === 'pruebas-base') return { corrieron: true, verdes: true, salida: 'ok' }
    return falso(o.schema, giro)
  }
  const parallel = async ts => Promise.all(ts.map(t => t().catch(() => null)))
  const pipeline = async (items, ...etapas) => Promise.all(items.map(async (it, i) => {
    let r = it
    for (const e of etapas) { try { r = await e(r, it, i) } catch { return null } }
    return r
  }))
  const phase = t => fases.add(t)
  let res, error
  try { res = await fn(args, agent, parallel, pipeline, phase, () => {}, presupuesto || { total: null, spent: () => 0, remaining: () => Infinity }) } catch (e) { error = e }
  const titulos = new Set(meta.phases.map(p => p.title))
  for (const f of fases) assert.ok(titulos.has(f), `${nombre}: la fase «${f}» no está en meta.phases`)
  return { res, etiquetas, error }
}

const casos = []
const caso = (nombre, f) => casos.push([nombre, f])
const fecha = '2026-01-01'
const cuenta = (et, pre) => et.filter(e => e === pre || e.startsWith(pre + ':') || e.startsWith(pre)).length
const sinError = r => { if (r.error) throw r.error; return r }

caso('revision rápida: 3 ángulos con cupo de diseño, sin arreglos ni control', async () => {
  const { res, etiquetas } = sinError(await correr('revision.js', { carpeta: '/r/', fecha, escala: 'rapida' }))
  assert.equal(cuenta(etiquetas, 'comité:'), 3)
  assert.equal(cuenta(etiquetas, 'arregla:'), 0)
  assert.equal(cuenta(etiquetas, 'control:'), 0)
  assert.deepEqual(res.angulos, ['diseno-visual', 'seguridad', 'correctitud'], 'cupo de diseño primero, después el orden del mapa, sin claves inexistentes')
  assert.equal(res.informe, '/repo/.comite/informes/2026-01-01-abc1234-revision.md', 'el informe va al repo principal, no al worktree')
  assert.ok(res.noArreglados.every(h => h.motivo === 'corrida sin arreglos'))
})

caso('revision media: 7 ángulos, una sola instancia levantada y bajada, arregla y controla', async () => {
  const uno = hallazgo({ severidad: 'alta' })
  const { res, etiquetas } = sinError(await correr('revision.js', { carpeta: '/r', fecha }, {
    responder: l => l.startsWith('comité:') ? { findings: [uno] }
      : l === 'deduplicar' ? { hallazgos: [{ ...uno, angulos: ['x'] }], conflictos: [] }
      : l.startsWith('verifica:') ? { existe: true, motivo: 'm', severidad: 'alta', arregloOk: true, arregloCorregido: 'a' }
      : l.startsWith('arregla:') ? { arreglados: [{ titulo: 'h', como: 'c', commit: 'abc' }], noArreglados: [], pruebas: 'ok' }
      : l.startsWith('control:') ? { encontrados: [], pruebasCorrieron: true, pruebasVerdes: true, pruebas: 'ok' } : undefined,
  }))
  assert.equal(cuenta(etiquetas, 'comité:'), 7)
  assert.equal(etiquetas.filter(e => e === 'levantar').length, 1)
  assert.equal(etiquetas.filter(e => e === 'bajar').length, 1)
  assert.ok(etiquetas.indexOf('bajar') < etiquetas.indexOf('informe'))
  assert.equal(etiquetas.filter(e => e === 'pruebas-base').length, 1)
  assert.ok(cuenta(etiquetas, 'arregla:') >= 1)
  assert.equal(cuenta(etiquetas, 'control:'), 1)
  assert.equal(etiquetas.at(-1), 'informe')
  assert.ok(res.agentes.Comité >= 8, 'cuenta agentes por fase')
  assert.ok(!('hallazgos' in res), 'el detalle completo va al .json, no al resultado')
})

caso('revision media: los obligatorios entran sin ocupar lugar de la escala', async () => {
  const { res } = sinError(await correr('revision.js', { carpeta: '/r', fecha, obligatorios: ['modo-oscuro'] }, { mapa: { obligatorios: ['primera-vez', 'ia'] } }))
  assert.ok(res.angulos.includes('modo-oscuro') && res.angulos.includes('primera-vez'))
  assert.ok(!res.angulos.includes('ia'), 'un obligatorio sin su superficie no corre')
  assert.equal(res.angulos.length, 9)
})

caso('revision completa: todos los ángulos que aplican y hasta 2 vueltas', async () => {
  const { res, etiquetas } = sinError(await correr('revision.js', { carpeta: '/r', fecha, escala: 'completa' }))
  assert.ok(res.angulos.length >= 16, `corrieron ${res.angulos.length}`)
  assert.ok(!res.angulos.includes('ia') && !res.angulos.includes('fidelidad'))
  assert.ok(cuenta(etiquetas, 'control:') <= 2)
  assert.equal(res.quedaronAfuera.length, 0)
})

caso('revision nativa sin ejecutar: no levanta nada', async () => {
  const { res, etiquetas } = sinError(await correr('revision.js', { carpeta: '/r', fecha }, { mapa: { puedeVerse: 'nativa-sin-ejecutar' } }))
  assert.ok(!etiquetas.includes('levantar') && !etiquetas.includes('bajar'))
  assert.equal(res.enVivo, false)
})

caso('revision: si algo explota a mitad de camino, igual se baja la instancia', async () => {
  const { etiquetas, error } = await correr('revision.js', { carpeta: '/r', fecha }, { responder: l => l === 'deduplicar' ? new Error('se cayó') : undefined })
  assert.match(String(error), /se cayó/)
  assert.ok(etiquetas.includes('bajar'))
})

caso('revision sin usuario del otro lado omite usuario-final', async () => {
  const { res } = sinError(await correr('revision.js', { carpeta: '/r', fecha, escala: 'completa' }, { mapa: { personas: { principal: 'x', final: '' } } }))
  assert.ok(!res.angulos.includes('usuario-final'))
})

caso('revision sin hallazgos: no verifica ni arregla, y con pruebas verdes aprueba', async () => {
  const { res, etiquetas } = sinError(await correr('revision.js', { carpeta: '/r', fecha }, {
    responder: (l, s) => l.startsWith('comité:') ? { findings: [] } : l === 'completitud' ? { noCubierto: [{ que: 'compilar Android', grave: true, previsto: true }], lecciones: [] } : undefined,
  }))
  assert.equal(cuenta(etiquetas, 'verifica'), 0)
  assert.ok(!etiquetas.includes('deduplicar'))
  assert.equal(res.veredicto, 'aprobar', 'lo previsto fuera del comité no baja el veredicto')
})

caso('revision: pruebas de base rojas sin arreglos = bloquear', async () => {
  const { res } = sinError(await correr('revision.js', { carpeta: '/r', fecha, escala: 'rapida' }, {
    responder: l => l === 'pruebas-base' ? { corrieron: true, verdes: false, salida: '3 fallan' } : l.startsWith('comité:') ? { findings: [] } : undefined,
  }))
  assert.equal(res.veredicto, 'bloquear')
})

caso('revision: si el cambio toca .comite/ vuelve como pregunta bloqueante', async () => {
  const { res } = sinError(await correr('revision.js', { carpeta: '/r', fecha, escala: 'rapida' }, { mapa: { tocaComite: true }, responder: l => l.startsWith('comité:') ? { findings: [] } : undefined }))
  assert.equal(res.preguntas[0].severidad, 'bloqueante')
  assert.equal(res.veredicto, 'bloquear')
})

caso('revision: tope de hallazgos por ángulo, lotes para media y baja, área por archivo', async () => {
  const muchos = { findings: Array.from({ length: 20 }, (_, i) => hallazgo({ titulo: 'h' + i, severidad: i ? 'media' : 'bloqueante', donde: i === 1 ? 'ios/Vista.swift:3' : 'api/a.go:' + i, area: i === 1 ? 'web' : 'backend' })) }
  const { res, etiquetas } = sinError(await correr('revision.js', { carpeta: '/r', fecha, escala: 'rapida' }, {
    responder: (l, s, prompt) => {
      if (l.startsWith('comité:')) return muchos
      if (l === 'deduplicar') return { hallazgos: muchos.findings.slice(0, 5).map(h => ({ ...h, angulos: ['x'] })), conflictos: [] }
      if (l.startsWith('verifica-lote')) {
        const n = (prompt.match(/"indice"/g) || []).length
        return { votos: Array.from({ length: n }, (_, i) => ({ indice: i, existe: true, motivo: 'm', severidad: 'media', arregloOk: true, arregloCorregido: 'a' })) }
      }
      if (l.startsWith('verifica:')) return { existe: true, motivo: 'm', severidad: 'bloqueante', arregloOk: false, arregloCorregido: 'mejor' }
    },
  }))
  assert.equal(res.recortados, 45)
  assert.equal(cuenta(etiquetas, 'verifica:'), 1, 'el bloqueante se verifica solo')
  assert.equal(cuenta(etiquetas, 'verifica-lote'), 2, 'las medias van en un lote por área (backend y apps)')
  assert.equal(res.confirmados, 5)
  assert.ok(res.noArreglados.some(h => h.severidad === 'bloqueante'), 'un escéptico que critica el arreglo no mata el hallazgo')
})

// Peor caso: cada ángulo devuelve el máximo de hallazgos, todos bloqueantes y distintos.
const peorCaso = (l, s, prompt) => {
  const m = prompt.match(/como máximo (\d+) hallazgos/)
  if (l.startsWith('comité:')) return { findings: Array.from({ length: Number(m[1]) }, (_, i) => hallazgo({ titulo: l + i, severidad: 'bloqueante', area: ['datos', 'backend', 'web', 'apps', 'contenido', 'infra'][i % 6] })) }
  if (l === 'deduplicar') return { hallazgos: JSON.parse(prompt.slice(prompt.indexOf('['))), conflictos: [] }
  if (l.startsWith('verifica:')) return { existe: true, motivo: 'm', severidad: 'bloqueante', arregloOk: true, arregloCorregido: 'a' }
  if (l.startsWith('control:')) return { encontrados: [{ titulo: 'x', severidad: 'bloqueante', corregido: false, detalle: 'd' }], pruebasCorrieron: true, pruebasVerdes: false, pruebas: 'rojo' }
}
for (const [escala, tope] of [['rapida', 25], ['media', 55], ['completa', 105]]) {
  caso(`revision ${escala}: el peor caso no pasa de ${tope} agentes (el máximo publicado)`, async () => {
    const { etiquetas } = sinError(await correr('revision.js', { carpeta: '/r', fecha, escala }, { responder: peorCaso }))
    assert.ok(etiquetas.length <= tope, `usó ${etiquetas.length}`)
    if (process.env.VER) console.log(`      ${escala}: ${etiquetas.length} agentes`)
  })
}

caso('revision: con el presupuesto corto todo se verifica en lote', async () => {
  const { etiquetas } = sinError(await correr('revision.js', { carpeta: '/r', fecha }, { responder: peorCaso, presupuesto: { total: 1e6, spent: () => 9e5, remaining: () => 1e5 } }))
  assert.equal(cuenta(etiquetas, 'verifica:'), 0)
  assert.ok(cuenta(etiquetas, 'verifica-lote') >= 1)
})

caso('revision: si el mapa no devuelve nada se reintenta una vez', async () => {
  let veces = 0
  const { etiquetas } = sinError(await correr('revision.js', { carpeta: '/r', fecha, escala: 'rapida' }, { responder: l => l === 'mapa' && !veces++ ? null : undefined }))
  assert.ok(etiquetas.includes('mapa:reintento'))
})

caso('revision media: el hallazgo de un .swift lo arregla el área apps', async () => {
  const { etiquetas } = sinError(await correr('revision.js', { carpeta: '/r', fecha }, {
    responder: (l, s, prompt) => {
      if (l.startsWith('comité:')) return { findings: [hallazgo({ donde: 'ios/Vista.swift:3', area: 'web' })] }
      if (l === 'deduplicar') return { hallazgos: [hallazgo({ donde: 'ios/Vista.swift:3', area: 'web', angulos: ['x'] })], conflictos: [] }
      if (l.startsWith('verifica-lote')) return { votos: [{ indice: 0, existe: true, motivo: 'm', severidad: 'media', arregloOk: true, arregloCorregido: 'a' }] }
    },
  }))
  assert.ok(etiquetas.includes('arregla:apps') && !etiquetas.includes('arregla:web'))
})

caso('revision desde un informe anterior salta directo a arreglar', async () => {
  const { etiquetas } = sinError(await correr('revision.js', { carpeta: '/r', fecha, desde: '/repo/.comite/informes/x.json' }))
  assert.ok(etiquetas.includes('cargar-informe'))
  assert.equal(cuenta(etiquetas, 'comité:'), 0)
  assert.ok(!etiquetas.includes('levantar'))
})

caso('revision soloInforme y ángulos propios en modo reemplazar', async () => {
  const { res, etiquetas } = sinError(await correr('revision.js', { carpeta: '/r', fecha, soloInforme: true, angulosModo: 'reemplazar', angulos: [{ key: 'propio', prompt: 'x' }] }))
  assert.deepEqual(res.angulos, ['propio'])
  assert.equal(cuenta(etiquetas, 'arregla:'), 0)
})

caso('revision valida sus argumentos', async () => {
  assert.match(String((await correr('revision.js', { fecha })).error), /carpeta/)
  assert.match(String((await correr('revision.js', { carpeta: '/r' })).error), /fecha/)
  assert.match(String((await correr('revision.js', { carpeta: '/r', fecha, escala: 'enorme' })).error), /escala/)
  assert.match(String((await correr('revision.js', { carpeta: '/r', fecha, base: 'main; rm -rf' })).error), /SHA/)
})

caso('plan rápida: 4 ángulos y juez, sin informe si no hay carpeta', async () => {
  const { res, etiquetas } = sinError(await correr('plan.js', { plan: 'Hacer X', fecha, escala: 'rapida' }))
  assert.equal(cuenta(etiquetas, 'plan:'), 4)
  assert.ok(etiquetas.includes('juez') && !etiquetas.includes('informe'))
  assert.equal(res.informe, null)
  assert.ok(['construir', 'ajustar', 'no construir'].includes(res.veredicto))
})

caso('plan media con carpeta escribe informe', async () => {
  const { res, etiquetas } = sinError(await correr('plan.js', { plan: '/p/plan.md', fecha, carpeta: '/r', etiqueta: 'checkout' }))
  assert.equal(cuenta(etiquetas, 'plan:'), 8)
  assert.equal(etiquetas.at(-1), 'informe')
  assert.equal(res.informe, '/r/.comite/informes/2026-01-01-checkout-plan.md')
})

caso('plan: si el juez no devuelve nada se reintenta una vez', async () => {
  let veces = 0
  const { res, etiquetas } = sinError(await correr('plan.js', { plan: 'x', fecha, escala: 'rapida' }, { responder: l => l === 'juez' && !veces++ ? null : undefined }))
  assert.ok(etiquetas.includes('juez:reintento') && res.veredicto)
})

caso('plan completa suma el contrajuez', async () => {
  const { etiquetas } = sinError(await correr('plan.js', { plan: 'x', fecha, escala: 'completa' }))
  assert.ok(etiquetas.includes('contrajuez'))
})

let mal = 0
for (const [nombre, f] of casos) {
  try { await f(); console.log('ok  ', nombre) } catch (e) { mal++; console.log('MAL ', nombre, '\n     ', e.message.split('\n')[0], '\n     ', (e.stack.split('\n').find(l => l.includes('simular.mjs')) || '').trim()) }
}
console.log(`\n${casos.length - mal}/${casos.length} casos`)
process.exit(mal ? 1 : 0)
