'use strict';
const MANIFEST = 'flutter-app-manifest';
const TEMP = 'flutter-temp-cache';
const CACHE_NAME = 'flutter-app-cache';
const RESOURCES = {
  "assets/AssetManifest.json": "6fd2b8516c40e16a8ff59f7034edfe47",
"assets/FontManifest.json": "dc3d03800ccca4601324923c0b1d6d57",
"assets/fonts/MaterialIcons-Regular.otf": "4e6447691c9509f7acdbf8a931a85ca1",
"assets/lib/app/assets/dashboard/conta.png": "9a20aa8630feb330c227b696b5e45709",
"assets/lib/app/assets/dashboard/dashboard.png": "8bf014126c3deaeb03570e5b85127962",
"assets/lib/app/assets/dashboard/definicoes.png": "585ed346b68ba4a0cd5e1b130f9371cb",
"assets/lib/app/assets/dashboard/definicoesgrande.png": "9507b80cc43734ccd14d88e89f47f5ba",
"assets/lib/app/assets/dashboard/enfermagem.png": "f7e6099e45fcb672f12c525f239bfac0",
"assets/lib/app/assets/dashboard/enfermagemgrande.png": "8361380db02d1366663fb98c4f3c2e1e",
"assets/lib/app/assets/dashboard/farmacia.png": "5f04536f84e966c04e84b60ca8ba9b23",
"assets/lib/app/assets/dashboard/farmaciagrande.png": "4973283fac15b6e78ac7426302a3efea",
"assets/lib/app/assets/dashboard/laboratorio.png": "7e54783f5d2d3b4620c784ae471ee879",
"assets/lib/app/assets/dashboard/laboratoriogrande.png": "3d423008843faf5f85d77b56b2db1e39",
"assets/lib/app/assets/dashboard/medico.png": "1739af28a881185c539aa357a19d9e99",
"assets/lib/app/assets/dashboard/medicogrande.png": "0fd56e82e1bc506dd10f4998ae2a7105",
"assets/lib/app/assets/dashboard/paciente.png": "5df7e5222e4bbabf8f6fc0c97da4b8f8",
"assets/lib/app/assets/dashboard/pacientegrande.png": "ba07bdc13cd697a32cc065293eb064d1",
"assets/lib/app/assets/dashboard/pessoapadrao.png": "4871a10c2154767c1ef83dfca81244d7",
"assets/lib/app/assets/dashboard/recepcao.png": "7ada72a1d6d47c7a33eb424049920c25",
"assets/lib/app/assets/dashboard/recepcaogrande.png": "3c892ef681cab246745acc37db803512",
"assets/lib/app/assets/dashboard/relatoriogrande.png": "8fb1fb85f9f8aafdc2c80e30c8cffa78",
"assets/lib/app/assets/dashboard/setinha.png": "d8dc9fa89eca802b1eb96ea207384a93",
"assets/lib/app/assets/logoLogin.png": "0926732162d255ad3d63754b1c781d3d",
"assets/NOTICES": "b034560ee45abf131cb19c4095a871ca",
"assets/packages/cupertino_icons/assets/CupertinoIcons.ttf": "6d342eb68f170c97609e9da345464e5e",
"favicon.png": "5dcef449791fa27946b3d35ad8803796",
"icons/Icon-192.png": "ac9a721a12bbc803b44f645561ecb1e1",
"icons/Icon-512.png": "96e752610906ba2a93c65f8abe1645f1",
"icons/Icon-maskable-192.png": "c457ef57daa1d16f64b27b786ec2ea3c",
"icons/Icon-maskable-512.png": "301a7604d45b3e739efc881eb04896ea",
"index.html": "9e0da8343ec639338452a2e26ab71332",
"/": "9e0da8343ec639338452a2e26ab71332",
"main.dart.js": "7a164b23c0b026eb545c2b920cab9a04",
"manifest.json": "e4f2f936f74c3558742aeb0034a18886",
"version.json": "438b34617a36802bd95fd6f9405422f1"
};

// The application shell files that are downloaded before a service worker can
// start.
const CORE = [
  "/",
"main.dart.js",
"index.html",
"assets/NOTICES",
"assets/AssetManifest.json",
"assets/FontManifest.json"];
// During install, the TEMP cache is populated with the application shell files.
self.addEventListener("install", (event) => {
  self.skipWaiting();
  return event.waitUntil(
    caches.open(TEMP).then((cache) => {
      return cache.addAll(
        CORE.map((value) => new Request(value, {'cache': 'reload'})));
    })
  );
});

// During activate, the cache is populated with the temp files downloaded in
// install. If this service worker is upgrading from one with a saved
// MANIFEST, then use this to retain unchanged resource files.
self.addEventListener("activate", function(event) {
  return event.waitUntil(async function() {
    try {
      var contentCache = await caches.open(CACHE_NAME);
      var tempCache = await caches.open(TEMP);
      var manifestCache = await caches.open(MANIFEST);
      var manifest = await manifestCache.match('manifest');
      // When there is no prior manifest, clear the entire cache.
      if (!manifest) {
        await caches.delete(CACHE_NAME);
        contentCache = await caches.open(CACHE_NAME);
        for (var request of await tempCache.keys()) {
          var response = await tempCache.match(request);
          await contentCache.put(request, response);
        }
        await caches.delete(TEMP);
        // Save the manifest to make future upgrades efficient.
        await manifestCache.put('manifest', new Response(JSON.stringify(RESOURCES)));
        return;
      }
      var oldManifest = await manifest.json();
      var origin = self.location.origin;
      for (var request of await contentCache.keys()) {
        var key = request.url.substring(origin.length + 1);
        if (key == "") {
          key = "/";
        }
        // If a resource from the old manifest is not in the new cache, or if
        // the MD5 sum has changed, delete it. Otherwise the resource is left
        // in the cache and can be reused by the new service worker.
        if (!RESOURCES[key] || RESOURCES[key] != oldManifest[key]) {
          await contentCache.delete(request);
        }
      }
      // Populate the cache with the app shell TEMP files, potentially overwriting
      // cache files preserved above.
      for (var request of await tempCache.keys()) {
        var response = await tempCache.match(request);
        await contentCache.put(request, response);
      }
      await caches.delete(TEMP);
      // Save the manifest to make future upgrades efficient.
      await manifestCache.put('manifest', new Response(JSON.stringify(RESOURCES)));
      return;
    } catch (err) {
      // On an unhandled exception the state of the cache cannot be guaranteed.
      console.error('Failed to upgrade service worker: ' + err);
      await caches.delete(CACHE_NAME);
      await caches.delete(TEMP);
      await caches.delete(MANIFEST);
    }
  }());
});

// The fetch handler redirects requests for RESOURCE files to the service
// worker cache.
self.addEventListener("fetch", (event) => {
  if (event.request.method !== 'GET') {
    return;
  }
  var origin = self.location.origin;
  var key = event.request.url.substring(origin.length + 1);
  // Redirect URLs to the index.html
  if (key.indexOf('?v=') != -1) {
    key = key.split('?v=')[0];
  }
  if (event.request.url == origin || event.request.url.startsWith(origin + '/#') || key == '') {
    key = '/';
  }
  // If the URL is not the RESOURCE list then return to signal that the
  // browser should take over.
  if (!RESOURCES[key]) {
    return;
  }
  // If the URL is the index.html, perform an online-first request.
  if (key == '/') {
    return onlineFirst(event);
  }
  event.respondWith(caches.open(CACHE_NAME)
    .then((cache) =>  {
      return cache.match(event.request).then((response) => {
        // Either respond with the cached resource, or perform a fetch and
        // lazily populate the cache.
        return response || fetch(event.request).then((response) => {
          cache.put(event.request, response.clone());
          return response;
        });
      })
    })
  );
});

self.addEventListener('message', (event) => {
  // SkipWaiting can be used to immediately activate a waiting service worker.
  // This will also require a page refresh triggered by the main worker.
  if (event.data === 'skipWaiting') {
    self.skipWaiting();
    return;
  }
  if (event.data === 'downloadOffline') {
    downloadOffline();
    return;
  }
});

// Download offline will check the RESOURCES for all files not in the cache
// and populate them.
async function downloadOffline() {
  var resources = [];
  var contentCache = await caches.open(CACHE_NAME);
  var currentContent = {};
  for (var request of await contentCache.keys()) {
    var key = request.url.substring(origin.length + 1);
    if (key == "") {
      key = "/";
    }
    currentContent[key] = true;
  }
  for (var resourceKey of Object.keys(RESOURCES)) {
    if (!currentContent[resourceKey]) {
      resources.push(resourceKey);
    }
  }
  return contentCache.addAll(resources);
}

// Attempt to download the resource online before falling back to
// the offline cache.
function onlineFirst(event) {
  return event.respondWith(
    fetch(event.request).then((response) => {
      return caches.open(CACHE_NAME).then((cache) => {
        cache.put(event.request, response.clone());
        return response;
      });
    }).catch((error) => {
      return caches.open(CACHE_NAME).then((cache) => {
        return cache.match(event.request).then((response) => {
          if (response != null) {
            return response;
          }
          throw error;
        });
      });
    })
  );
}
