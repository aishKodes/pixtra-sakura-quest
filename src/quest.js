import * as THREE from 'three';
import { frameAt } from './world/planet.js';

// Flat authoring coordinates, on the original walkable paths. No colliders
// are added; tokens use the same spherical projection as the existing town.
export const STOPS = [
  { x: 1.85, z: 7.5, name: 'Railway crossing', hint: 'A first blossom by the crossing' },
  { x: 12, z: 15.1, name: 'Shopping alley', hint: 'Along the alley beside the corner shop' },
  { x: 22.2, z: 36, name: 'Lantern street', hint: 'Follow the shopping street beneath the lanterns' },
  { x: 8, z: 46, name: 'Library corner', hint: 'Turn left at the end of the shopping street' },
  { x: -27.9, z: 19, name: 'Shrine approach', hint: 'West along the lineside path, then up the narrow shrine alley' },
];

export function createQuest({ scene, world, player, hud, restartWorld }) {
  const root = new THREE.Group(); root.name = 'pixtra-sakura-tokens'; scene.add(root);
  const petalGeometry = new THREE.SphereGeometry(1, 10, 8);
  const pink = new THREE.MeshBasicMaterial({ color: '#ff86b9' });
  const core = new THREE.MeshBasicMaterial({ color: '#fff7be' });
  const ringMaterial = new THREE.MeshBasicMaterial({ color: '#fff3d3', transparent: true, opacity: .65, side: THREE.DoubleSide });
  const ringGeometry = new THREE.TorusGeometry(.62, .025, 5, 32);
  const tokens = STOPS.map((stop, index) => {
    const anchor = new THREE.Group();
    anchor.applyMatrix4(frameAt(stop.x, stop.z, world.heightAt(stop.x, stop.z) + 1.1));
    root.add(anchor);
    const flower = new THREE.Group(); anchor.add(flower);
    for (let i = 0; i < 5; i++) {
      const a = i * Math.PI * 2 / 5;
      const petal = new THREE.Mesh(petalGeometry, pink);
      petal.position.set(Math.sin(a) * .26, Math.cos(a) * .26, 0);
      petal.scale.set(.18, .28, .08); petal.rotation.z = -a;
      flower.add(petal);
    }
    const center = new THREE.Mesh(petalGeometry, core); center.scale.setScalar(.13); flower.add(center);
    const ring = new THREE.Mesh(ringGeometry, ringMaterial); flower.add(ring);
    return { ...stop, anchor, flower, index, collected: false, burst: -1 };
  });

  const ui = document.createElement('div'); ui.className = 'quest-hud'; ui.hidden = true;
  ui.innerHTML = '<div class="quest-wordmark">PIXTRA <small>INTERACTIVE</small></div><section class="quest-progress" aria-label="Quest progress"><span class="quest-icon">✿</span><div><span class="quest-caption">BLOSSOMS FOUND</span><strong class="quest-count" aria-live="polite">0 <em>/ 5</em></strong></div><time>0:00</time></section><div class="quest-navigation"><span class="compass-arrow" aria-hidden="true">↑</span><div><strong></strong><p></p></div><span class="quest-distance"></span></div>';
  document.body.appendChild(ui);
  const count = ui.querySelector('.quest-count'); const time = ui.querySelector('time');
  const navigation = ui.querySelector('.quest-navigation'); const arrow = ui.querySelector('.compass-arrow');
  const win = document.createElement('div'); win.className = 'quest-win'; win.hidden = true;
  win.innerHTML = '<section role="dialog" aria-modal="true" aria-labelledby="win-title"><span class="win-flower">✿</span><p class="quest-caption">FIVE BLOSSOMS. ONE LITTLE ADVENTURE.</p><h2 id="win-title">Town discovered.</h2><p>You found every sakura blossom.<br />A little curiosity goes a long way.</p><p class="quest-result"></p><button class="quest-replay">Play again ↗</button><button class="quest-freeplay">Keep exploring</button><small>PIXTRA INTERACTIVE · SAKURA QUEST</small></section>';
  document.body.appendChild(win);
  let started = false, complete = false, elapsed = 0, collected = 0, tick = 0;
  const format = seconds => `${Math.floor(seconds / 60)}:${String(Math.floor(seconds % 60)).padStart(2, '0')}`;

  function start() { started = true; ui.hidden = false; }
  function restart() {
    complete = false; elapsed = 0; collected = 0; started = true;
    win.hidden = true; ui.hidden = false; document.body.classList.remove('quest-complete');
    tokens.forEach(t => { t.collected = false; t.burst = -1; t.anchor.visible = true; t.flower.scale.setScalar(1); });
    count.innerHTML = '0 <em>/ 5</em>'; navigation.hidden = false;
    restartWorld(); player.lock();
  }
  win.querySelector('.quest-replay').addEventListener('click', restart);
  document.querySelector('.restart-quest').addEventListener('click', restart);
  win.querySelector('.quest-freeplay').addEventListener('click', () => { win.hidden = true; document.body.classList.remove('quest-complete'); player.lock(); });

  function update(dt, walkingView = true) {
    tick += dt;
    if (started && !complete && player.locked && walkingView && !document.hidden) elapsed += dt;
    time.textContent = format(elapsed);
    for (const token of tokens) {
      if (token.burst >= 0) {
        token.burst += dt;
        token.flower.scale.setScalar(1 + token.burst * 4);
        if (token.burst > .3) { token.anchor.visible = false; token.burst = -1; }
        continue;
      }
      if (token.collected) continue;
      token.flower.position.y = Math.sin(tick * 2 + token.index) * .14;
      token.flower.rotation.y = tick * .65;
      const distance = Math.hypot(player.pos.x - token.x, player.pos.z - token.z);
      if (started && !complete && player.locked && walkingView && distance < 1.8 && Math.abs(player.pos.y - world.heightAt(token.x, token.z)) < 1.5) {
        token.collected = true; token.burst = 0; collected++;
        count.innerHTML = `${collected} <em>/ 5</em>`;
        hud.flash(`✿ ${token.name} · ${collected} / 5 blossoms`, 1800);
        if (collected === tokens.length) {
          complete = true;
          win.querySelector('.quest-result').textContent = `5 / 5 BLOSSOMS · ${format(elapsed)}`;
          document.body.classList.add('quest-complete'); document.exitPointerLock?.(); win.hidden = false;
          win.querySelector('.quest-replay').focus();
          navigation.hidden = true;
        }
      }
    }
    const target = tokens.find(token => !token.collected);
    if (target) {
      const dx = target.x - player.pos.x, dz = target.z - player.pos.z;
      arrow.style.transform = `rotate(${Math.atan2(dx, -dz) + player.yaw}rad)`;
      navigation.querySelector('strong').textContent = target.name;
      navigation.querySelector('p').textContent = target.hint;
      ui.querySelector('.quest-distance').textContent = `${Math.round(Math.hypot(dx, dz))}m`;
    }
  }
  return { start, restart, update, get complete() { return complete; }, get count() { return collected; }, tokens };
}
