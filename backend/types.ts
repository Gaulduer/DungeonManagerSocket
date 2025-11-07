export type Placement = {
  x: number;
  y: number;
  id: number;
}

export type Token = {
  id: number;
  placement?: Placement;
  outline?: string;
  backgroundImage?: string;
}