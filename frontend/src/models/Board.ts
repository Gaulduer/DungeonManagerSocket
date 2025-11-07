import {type Token, type Placement} from '../types/types.js';

export class Board {
    width: number = 0;
    height: number = 0;
    model: Token[][][] = [];

    constructor(width: number, height: number) {
        this.makeModel(width, height);
    }

    place(placement: Placement, token: Token): void {
        if(token.placement)
            this.remove(token.placement);
        if(this.model[placement.x] && this.model[placement.x][placement.y]) {
            token.placement = placement;
            this.model[placement.x][placement.y].push(token);
            console.log('Now placing!');
        }
        else
            console.log('Not placing!')
    }

    update(token: Token): void {
        if(!token.placement || !(this.model[token.placement.x] && this.model[token.placement.x][token.placement.y]))
            return

        this.model[token.placement.x][token.placement.y].filter((existingToken, index) => {
            if(existingToken.placement!.id === token.placement!.id)
                this.model[token.placement!.x][token.placement!.y][index] = token;
        });
    }

    remove(placement: Placement): void {
        if(this.model[placement.x] && this.model[placement.x][placement.y])
            this.model[placement.x][placement.y] = this.model[placement.x][placement.y].filter(token => token.placement!.id !== placement.id);
    }

    getTokens(row: number, col: number): Token[] {
        if(this.model[row] && this.model[row][col])
            return this.model[row][col];
        return [];
    }

    makeModel(width: number, height: number) {
        this.model = [];
        this.width = width;
        this.height = height;
        for(let i = 0 ; i < height ; i++) {
            this.model.push([]);
            for(let j = 0 ; j < width ; j++)
                this.model[i]!.push([]);
        }
        console.log(width, height);
    }

    placeTokens(tokens: Token[]) {
        for(let i = 0 ; i < tokens.length ; i++) {
            this.place(tokens[i]!.placement!, tokens[i]);
        }
    }
}