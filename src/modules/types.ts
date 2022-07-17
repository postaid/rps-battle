export interface Position {
  x: number,
  y: number,
}

export interface Size {
  w: number,
  h: number,
}

export interface BBox {
  x0: number,
  y0: number,
  x1: number,
  y1: number,
}

export enum AvatarType {
  CHAR,
  IMAGE
}

export interface RPSCharacterType {
  id: number,
  label: string,
  avatarType: AvatarType,
  avatar: string,
  cacheId?: string | null,
}