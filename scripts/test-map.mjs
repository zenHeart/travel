import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import vm from 'node:vm';
import ts from 'typescript';

// Run the real component effect without browser/network credentials. The SDK
// boundary is controlled so tile completion and a stalled request are repeatable.
const source = readFileSync(new URL('../src/components/Map/SecureMap.tsx', import.meta.url), 'utf8');
const { outputText } = ts.transpileModule(source.replaceAll('import.meta.env', 'testEnv'), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX },
});

async function mountMap() {
  const state = [];
  const timers = new Map();
  const events = new Map();
  const markers = [];
  let effect, options, cleanup, navigated;
  let refs = 0;
  class Satellite {}
  class MapDouble {
    constructor(_container, config) { options = config; }
    on(name, handler) { events.set(name, handler); }
    add(marker) { markers.push(marker); }
    destroy() {}
  }
  class Marker {
    on(name, handler) { this[name] = handler; }
  }
  const point = {
    id: 'sample', label: '示例城市', coordinates: [114, 30], status: 'visited',
    path: '/sample/index', tripId: 'sample', tripTitle: '示例游记',
  };
  const modules = {
    react: {
      useEffect: callback => { effect = callback; },
      useMemo: callback => callback(),
      useRef: () => ({ current: refs++ === 0 ? {} : null }),
      useState: initial => {
        const index = state.push(initial) - 1;
        return [initial, value => { state[index] = value; }];
      },
    },
    'react/jsx-runtime': { jsx: () => null, jsxs: () => null },
    'react-router-dom': { useNavigate: () => path => { navigated = path; } },
    '../../hooks/useTrips': { useTrips: () => ({ trips: [{ points: [point] }] }) },
    '../../utils/placeScanner': { places: [] },
    '../../constants/map': {
      MAP_CONFIG: { apiKey: 'test-only', version: '2.0', center: [114, 30], zoom: 4 },
      MARKER_ICONS: { visited: { url: 'test.svg', size: [20, 30] } },
    },
    './LocalTravelMap': { LocalTravelMap: () => null },
    '@amap/amap-jsapi-loader': { default: { load: async () => ({
      Map: MapDouble, TileLayer: { Satellite }, Marker, Icon: class {}, Size: class {},
    }) } },
  };
  const exports = {};
  vm.runInNewContext(outputText, {
    exports, testEnv: { VITE_AMAP_API_KEY: 'test-only' },
    require: name => {
      assert.ok(name in modules, `Unexpected dependency: ${name}`);
      return modules[name];
    },
    window: {
      setTimeout: callback => { timers.set(1, callback); return 1; },
      clearTimeout: id => timers.delete(id),
    },
  });
  exports.SecureMap();
  cleanup = effect();
  await new Promise(setImmediate);
  return {
    state, timers, options, Satellite, cleanup,
    complete: () => events.get('complete')?.(),
    clickMarker: () => { markers[0].click(); return navigated; },
  };
}

test('initializes the historical satellite base layer and keeps marker navigation', async () => {
  const map = await mountMap();
  assert.ok(map.options.layers?.[0] instanceof map.Satellite, 'Satellite layer must be explicit at initialization');
  assert.equal(map.clickMarker(), '/sample/index');
  map.cleanup();
});

test('keeps the fallback visible until the base map finishes loading', async () => {
  const map = await mountMap();
  assert.equal(map.state[1], true, 'SDK loading alone must not expose an empty map');
  assert.equal(map.timers.size, 1);
  map.complete();
  assert.equal(map.state[1], false);
  assert.equal(map.state[0], null);
  assert.equal(map.timers.size, 0);
  map.cleanup();
});

test('a stalled base map times out even after the SDK has loaded', async () => {
  const map = await mountMap();
  assert.equal(map.timers.size, 1, 'Timeout must cover base map rendering');
  map.timers.get(1)();
  assert.match(map.state[0], /超时/);
  assert.equal(map.state[1], false);
  map.complete();
  assert.match(map.state[0], /超时/);
  map.cleanup();
});
