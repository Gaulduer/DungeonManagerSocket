export type Placement = {
  x: number;
  y: number;
  id: number;
  type: string;
  contentID: number;
  content: string;
}

export type Token = {
  id: number;
  placement?: Placement;
  outline?: string;
  backgroundImage?: string;
}

export type Tile = {
  id: number;
  placement?: Placement;
  backgroundImage?: string;
  blocking: boolean;
}