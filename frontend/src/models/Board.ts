import {type Placement} from '../types/types.js';

export class Board {
    width: number = 0;
    height: number = 0;
    placements: Placement[][][] = [];

    constructor(width: number, height: number) {
        this.makePlacements(width, height);
    }

    inBounds(row: number, col: number) {
        return this.placements[row] && this.placements[row][col];
    }

    validPlacement(placement: Placement) {
        return placement.content && this.inBounds(placement.y, placement.x)
    }

    place(placement: Placement): void {
        if(this.validPlacement(placement)) {
            this.placements[placement.x][placement.y].push(placement);
            console.log('Now placing!');
        }
        else
            console.log('Not placing!')
    }

    update(placement: Placement): void {
        if (!this.validPlacement(placement))
            return;

        this.placements[placement.x][placement.y].filter((existingPlacement, index) => {
            if(existingPlacement.id === placement.id)
                this.placements[placement!.x][placement!.y][index] = placement;
        });
    }

    remove(placement: Placement): void {
        if(this.validPlacement(placement))
            this.placements[placement.x][placement.y] = this.placements[placement.x][placement.y].filter(existingPlacement => existingPlacement.id !== placement.id);
    }

    get(row: number, col: number): Placement[] {
        if(this.inBounds(row, col))
            return this.placements[row][col];
        return [];
    }

    makePlacements(width: number, height: number) {
        this.placements = [];
        this.width = width;
        this.height = height;
        for(let i = 0 ; i < height ; i++) {
            this.placements.push([]);
            for(let j = 0 ; j < width ; j++) {
                this.placements[i].push([]);
            }
        }
    }

    placeAll(placements: Placement[]) {
        for(let i = 0 ; i < placements.length ; i++) {
            this.place(placements[i]);
        }
    }
}