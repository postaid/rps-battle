import {defineStore} from 'pinia';
import { shallowRef } from 'vue';
import type { RPSCharacter } from '@/modules/RPSCharacter';
import type { RPSCharacterType } from '@/modules/types';

export const useMainStore = defineStore('main', {
  state: () => {
    return {
      items: shallowRef<RPSCharacter[]>([]),
      types: shallowRef<RPSCharacterType[]>([]),
      relations: shallowRef<{[index: string]: number}>({
        1: 3,
        2: 1,
        3: 2,
      }),
      typesIndex: shallowRef<{[index: string]: RPSCharacterType}>({}),
      count: 100,
      speed: 25,
    };
  },
  actions: {
    addCharacters (characters: RPSCharacter[]) {
      this.items = this.items.concat(characters);
    },
    setTypes (types: RPSCharacterType[]) {
      this.types = types;
      this.typesIndex = types.reduce((r: {[index: string]: RPSCharacterType}, t) => (r[t.id] = t) && r, {});
    },
    setSpeed (speed: number) {
      this.speed = speed;
    },
    getCharByCoord (x: number, y: number): RPSCharacter | null {
      const items = this.items;
      for (let i = 0; i < items.length; i++) {
        const bbox = items[i].bbox;
        if (!(x < bbox.x0 || x > bbox.x1 || y < bbox.y0 || y > bbox.y1)) {
          return items[i];
        }
      }
      return null;
    },
    updateType (typeId: number, data: any) {
      const typeIndex = this.types.findIndex(t => t.id === typeId);
      if (typeIndex === -1) return;
      const t = {
        ...this.types[typeIndex],
        ...data,
      };
      this.types.splice(typeIndex, 1, t);
      this.types = [...this.types];
      this.typesIndex[typeId] = t;
    },
  },
});