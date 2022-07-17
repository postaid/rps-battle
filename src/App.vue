<script setup lang="ts">
  import Layout from '@/components/Layout.vue';
  import RPSField from '@/components/RPSField.vue';
  import { useMainStore } from '@/stores/main';
  import { AvatarType, type BBox, type Position } from '@/modules/types';
  import { RPSCharacter } from '@/modules/RPSCharacter';
  import SpeedControl from '@/components/SpeedControl.vue';
  import { computed, onBeforeMount, ref, watch } from 'vue';
  import { pointer } from 'd3-selection';
  import { drawArrow } from '@/utils';
  import RPSMaker from '@/components/RPSMaker.vue';
  import { registerAnimation, startAnimation, stopAnimation, averageFps } from '@/modules/Animation';
  import { cacheImage, drawCacheImage } from '@/modules/canvasCache';

  const store = useMainStore();

  let ctx: CanvasRenderingContext2D | null = null;
  let ctxFog: CanvasRenderingContext2D | null = null;
  let fieldWidth = 0;
  let fieldHeight = 0;
  let charWidth = 20;
  let charHeight = 20;

  const itemsCount = ref<[string, number][]>([]);
  const wantItems = ref<number>(1000);
  const collidedCount = ref<number>(0);
  const checkInt = ref<number>(0);
  const showFog = ref<boolean>(false);
  let stepCheckInt = 0;
  let selectedChar: RPSCharacter | null = null;

  const updateItemsCount = () => {
    const types = store.types;
    const items = store.items;
    const result = types.reduce((r, t) => (r[t.id] = [t.label, 0]) && r, {} as { [index: string]: any });
    for (let i = 0; i < items.length; i++) {
      ++result[items[i].type][1];
    }

    itemsCount.value = Object.values(result);
  };

  async function handlerCanvasReady ({ field, fog }: { field: HTMLCanvasElement, fog: HTMLCanvasElement }) {
    ctx = field.getContext('2d');
    ctxFog = fog.getContext('2d');
    updateCanvasSize();
    await loadGame();
    prerenderTypes();
    draw();
    setTimeout(() => {
      updateCanvasSize();
    }, 200);
  }

  async function loadGame () {
    store.setTypes([
      {
        id: 1,
        label: 'Rock',
        avatarType: AvatarType.CHAR,
        // avatar: '🧱',
        avatar: '\ud83e\uddf1',
      },
      {
        id: 2,
        label: 'Paper',
        avatarType: AvatarType.CHAR,
        // avatar: '📃️',
        avatar: '\ud83d\udcc3',
      },
      {
        id: 3,
        label: 'Scissors',
        avatarType: AvatarType.CHAR,
        // avatar: '✂️',
        avatar: '\u2702\ufe0f',
      },
    ]);
    const items = generateItems(wantItems.value);
    store.addCharacters(items);
  }

  const relations = computed(() => store.relations);

  function generateItems (count: number): RPSCharacter[] {
    const typesList = store.types;

    const generateCount = Math.max(count - store.items.length, typesList.length);
    if (generateCount <= 0) return [];

    const itemsOfType = Math.trunc(generateCount / typesList.length);

    let chars = [];
    for (let i = 0; i < typesList.length; i++) {
      const type = typesList[i];
      for (let j = 0; j < itemsOfType; j++) {
        const char = new RPSCharacter();
        char.type = type.id;
        const pos = getRandomPosition();
        char.setPosition(pos.x, pos.y);
        const speed = getRandomSpeed();
        char.setSpeed(speed.x, speed.y);
        char.setSize(charWidth, charHeight);
        chars.push(char);
      }
    }
    return chars.sort(sortCharactersByX);
  }

  function prerenderTypes () {
    const baseFontSize = 12;
    store.types.forEach((type, i) => {
      if (type.avatarType === AvatarType.CHAR) {
        const cacheId = cacheImage((offscreenCtx: CanvasRenderingContext2D) => {
          offscreenCtx.textBaseline = 'top';
          offscreenCtx.font = baseFontSize + 'px Calibri';

          let metrix = offscreenCtx.measureText(type.avatar);
          let w = metrix.actualBoundingBoxRight - metrix.actualBoundingBoxLeft;

          offscreenCtx.font = baseFontSize * charWidth / w + 'px Calibri';
          metrix = offscreenCtx.measureText(type.avatar);
          w = metrix.actualBoundingBoxRight - metrix.actualBoundingBoxLeft;

          let h = metrix.actualBoundingBoxDescent + metrix.actualBoundingBoxAscent;

          const startX = i * charWidth;
          const startY = 0;

          offscreenCtx.beginPath();
          offscreenCtx.fillText(type.avatar, startX + (charWidth - w) / 2, startY + (charHeight - h) / 2 + metrix.actualBoundingBoxAscent);

          const x0 = i * charWidth;
          return {
            x0,
            y0: 0,
            x1: x0 + charWidth,
            y1: charHeight,
            w: charWidth,
            h: charHeight,
          };
        });
        store.updateType(type.id, { cacheId });
      }
    });
  }

  function updateCanvasSize () {
    if (ctx) {
      const canvas = ctx.canvas;
      canvas.width = fieldWidth = canvas.offsetWidth;
      canvas.height = fieldHeight = canvas.offsetHeight;
    }
    if (ctxFog) {
      const canvas = ctxFog.canvas;
      canvas.width = fieldWidth = canvas.offsetWidth;
      canvas.height = fieldHeight = canvas.offsetHeight;
    }

  }

  function step () {
    stepCheckInt = 0;
    const characters = store.items;
    moveCharacters(characters);
    characters.sort(sortCharactersByX);
    processCollisions(characters);
    updateItemsCount();
    checkInt.value = stepCheckInt;
  }

  function processCollisions (characters: RPSCharacter[]) {
    const maxDeltaX = charWidth;
    const intersected: { [index: string]: boolean } = {};
    const rels = relations.value;
    stepCollided = 0;

    const ln = characters.length;
    for (let i = 0; i < ln; i++) {
      const c1 = characters[i];
      if (c1.id in intersected) continue;

      const p1 = c1.position;
      const b1 = c1.bbox;
      for (let j = i + 1; j < ln; j++) {
        const c2 = characters[j];
        if (c2.id in intersected) continue;

        const p2 = c2.position;

        if (p2.x - p1.x > maxDeltaX) continue;

        ++stepCheckInt;
        if (hasIntersection(b1, c2.bbox)) {
          intersected[c1.id] = true;
          intersected[c2.id] = true;

          // collideItems(c1, c2);
          (rels[c1.type] === c2.type && collideItems(c1, c2))
          || (rels[c2.type] === c1.type && collideItems(c2, c1));
        }
      }
    }
    collidedCount.value = stepCollided;
  }

  let stepCollided = 0;

  function collideItems (source: RPSCharacter, target: RPSCharacter) {
    target.type = source.type;

    const p1 = source.position;
    const p2 = target.position;

    const m1 = 1;
    const m2 = 1;
    const n = normalize(p2, p1);
    const a1 = dot(n, source.speed);
    const a2 = dot(n, target.speed);

    const optimizedP = (2.0 * (a1 - a2)) / (m1 + m2);

    const s1x = source.speed.x - optimizedP * m2 * n.x;
    const s1y = source.speed.y - optimizedP * m2 * n.y;

    const s2x = target.speed.x + optimizedP * m1 * n.x;
    const s2y = target.speed.y + optimizedP * m1 * n.y;

    source.speed = { x: s1x, y: s1y };
    target.speed = { x: s2x, y: s2y };

    ++stepCollided;
  }

  function reflect (v: Position, n: Position): Position {
    // r=v−2(v⋅n)n
    let d = dot(v, n);
    return {
      x: v.x - 2 * d * n.x,
      y: v.y - 2 * d * n.y,
    };
  }

  function normalize (p1: Position, p2: Position): Position {
    let nx = p2.x - p1.x;
    let ny = p2.y - p1.y;
    let nln = Math.sqrt(nx * nx + ny * ny);
    if (nln === 0) return {
      x: 0, y: 0
    };

    return {
      x: nx / nln,
      y: ny / nln,
    };
  }

  function dot (p1: Position, p2: Position): number {
    return p1.x * p2.x + p1.y * p2.y;
  }

  function hasIntersection (b1: BBox, b2: BBox): boolean {
    return b1.x1 >= b2.x0 && b1.x0 <= b2.x1 && b1.y1 >= b2.y0 && b1.y0 <= b2.y1;
  }

  function sortCharactersByX (a: RPSCharacter, b: RPSCharacter) {
    return a.position.x - b.position.x;
  }

  function sortCharactersBySpeedX (a: RPSCharacter, b: RPSCharacter) {
    return a.speed.x - b.speed.x;
  }

  function moveCharacters (characters: RPSCharacter[]) {
    const speed = store.speed;
    for (let i = 0; i < characters.length; i++) {
      const character = characters[i];
      const speedX = character.speed.x * speed;
      const speedY = character.speed.y * speed;
      character.moveBy(speedX, speedY);

      character.setSpeed(
        character.speed.x * (-2 * +(
          (character.position.x + character.size.w > fieldWidth && speedX > 0)
          || (character.position.x < 0 && speedX < 0)
        ) + 1),
        character.speed.y * (-2 * +(
          (character.position.y + character.size.h > fieldHeight && speedY > 0)
          || (character.position.y < 0 && speedY < 0)
        ) + 1)
      );
    }
  }


  function draw () {
    if (!ctx) return;

    ctx.clearRect(0, 0, fieldWidth, fieldHeight);

    ctx.textBaseline = 'middle';
    const types = store.typesIndex;
    const characters = store.items;
    characters.sort(sortCharactersByX);

    ctx.beginPath();
    ctx.lineWidth = 1;
    ctx.strokeStyle = 'black';
    for (let i = 0; i < characters.length; i++) {
      const char = characters[i];
      const charType = types[char.type];

      if (charType.cacheId) {
        const x = char.position.x;
        const y = char.position.y;
        // const x = ~~(char.position.x + 0.5);
        // const y = ~~(char.position.y + 0.5);

        drawCacheImage(ctx, charType.cacheId, x, y);
      }
    }
    ctx.stroke();

    if (selectedChar) {
      drawSelection(ctx, selectedChar);

      if (ctxFog && showFog.value) {
        ctxFog.globalCompositeOperation = 'destination-out';
        drawLineOfSight(ctxFog, selectedChar);
      }
    }

  }

  const animationStep = () => {
    step();
    draw();
  };
  registerAnimation(animationStep);
  startAnimation();

  function getRandomPosition (): Position {
    return {
      x: Math.round(Math.random() * (fieldWidth - charWidth)),
      y: Math.round(Math.random() * (fieldHeight - charHeight)),
    };
  }

  function getRandomSpeed (): Position {
    return {
      x: -0.05 + Math.random() * 0.1,
      y: -0.05 + Math.random() * 0.1,
    };
  }

  function onWantItemsInput (ev: Event) {
    const el = ev.target as HTMLInputElement;
    if (!el) return;

    const v = +el.value;
    if (!isNaN(v)) {
      wantItems.value = v;
    }
  }

  function onCanvasClick (ev: MouseEvent) {
    const [x, y] = pointer(ev, ev.currentTarget);
    selectedChar = store.getCharByCoord(x, y);
  }

  function drawSelection (ctx: CanvasRenderingContext2D, char: RPSCharacter) {
    const minLength = 30;
    const speedMult = 1000;

    const pos = char.position;
    const size = char.size;

    const cx = pos.x + size.w / 2;
    const cy = pos.y + size.h / 2;
    const r = size.w / 2 + 4;

    ctx.beginPath();
    ctx.lineWidth = 1;
    ctx.strokeStyle = 'green';
    ctx.moveTo(pos.x + size.w + 4, pos.y + size.h / 2);
    ctx.arc(cx, cy, r, 0, 2 * Math.PI);
    ctx.stroke();

    ctx.beginPath();
    ctx.strokeStyle = '1px solid black';
    ctx.moveTo(cx, cy);
    let sx = char.speed.x * speedMult;
    let sy = char.speed.y * speedMult;
    let ln = Math.sqrt(sx * sx + sy * sy);
    if (ln < minLength) {
      sx *= minLength / ln;
      sy *= minLength / ln;
      ln = minLength;
    }
    drawArrow(ctx, cx + sx * r / ln, cy + sy * r / ln, cx + sx, cy + sy);
    ctx.stroke();
  }

  function drawLineOfSight (ctx: CanvasRenderingContext2D, char: RPSCharacter) {
    const pos = char.position;
    const size = char.size;
    const cx = pos.x + size.w / 2;
    const cy = pos.y + size.h / 2;
    const r = size.w / 2 + 4;

    ctx.beginPath();
    ctx.fillStyle = 'black';
    ctx.moveTo(pos.x + size.w + 4, pos.y + size.h / 2);
    ctx.arc(cx, cy, r * 1.5, 0, 2 * Math.PI);
    ctx.fill();

  }

  function drawFog () {
    if (!ctxFog) return;
    ctxFog.globalCompositeOperation = 'source-over';
    ctxFog.globalAlpha = 0.8;
    ctxFog.filter = '';
    ctxFog.fillStyle = 'black';
    ctxFog.fillRect(-20, -20, fieldWidth + 40, fieldHeight + 40);
    ctxFog.globalCompositeOperation = 'destination-out';
    ctxFog.filter = 'blur(5px)';
  }

  function clearFog () {
    if (!ctxFog) return;
    ctxFog.clearRect(0, 0, fieldWidth, fieldHeight);
  }

  watch(wantItems, (value) => {
    if (value > store.items.length) {
      store.addCharacters(generateItems(value));
    } else {
      store.items = store.items.slice(0, value);
      if (selectedChar) {
        const id = selectedChar.id;
        if (!store.items.find(c => c.id === id)) {
          selectedChar = null;
        }
      }
    }
  });

  watch(showFog, (value) => {
    if (value) {
      drawFog();
    } else {
      clearFog();
    }
  });

  onBeforeMount(() => {
    window.addEventListener('resize', updateCanvasSize);
  });

</script>

<template>
  <Layout>
    <template #info>
      <div>
        Items: {{ store.items.length }} (FPS: {{ averageFps }})
      </div>
      <div>
        <span
          v-for="stat in itemsCount"
          :key="stat[0]"
        >
          {{ stat[0] }}: {{ stat[1] }}
        </span>
      </div>
      <div>
        Collided: {{ collidedCount }}
      </div>
    </template>
    <template #field>
      <div class="full-size" style="border: 1px solid black; box-sizing: border-box">
        <RPSField
          @canvasready="handlerCanvasReady"
          @mousedown="onCanvasClick"
        />
      </div>
    </template>
    <template #controls>
      <div>
        Speed
        <SpeedControl
          @input="store.setSpeed($event)"
        />
        {{ store.speed }}
        <button @click="startAnimation">Start</button>
        <button @click="stopAnimation">Stop</button>
      </div>
      <div>
        Count <input
        type="text"
        :value="wantItems"
        @input="onWantItemsInput"
      />
      </div>
      <div><label>Show fog: <input
        type="checkbox"
        v-model="showFog"
      /></label>
      </div>
      <div>Intersection check: {{ checkInt }}</div>
    </template>
    <template #float>
      <RPSMaker
        :types="store.types"
        :relations="store.relations"
      />
    </template>
  </Layout>
</template>

<style>
  body {
    margin: 0;
    padding: 0;
  }

  .full-size {
    width: 100%;
    height: 100%;
  }

  * {
    box-sizing: border-box;
  }
</style>
