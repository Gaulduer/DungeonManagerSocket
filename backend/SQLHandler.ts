import mysql from 'mysql2/promise';

type Table = {
    name: string, 
    columns: string
}

type Entry = {
    column: string,
    value: string,
}

class SQLHandler {
    pool = mysql.createPool({
        host: process.env.HOST ? process.env.HOST:'localhost',
        port: process.env.SQL_PORT ? parseInt(process.env.SQL_PORT):8080,
        user: process.env.USER ? process.env.USER:'root',
        password: process.env.PASSWORD ? process.env.PASSWORD:'',
        database: process.env.DATABASE ? process.env.DATABASE:''
    });

    defaultTables: Table[] = [
        {name: 'campaign', columns: `
            id INT NOT NULL AUTO_INCREMENT,
            name VARCHAR(50) NOT NULL,
            PRIMARY KEY (id)
        `},
        {name: 'map', columns: `
            id INT NOT NULL AUTO_INCREMENT,
            campaign_id INT NOT NULL,
            name VARCHAR(50) NOT NULL,
            PRIMARY KEY (id),
            FOREIGN KEY (campaign_id) REFERENCES campaign(id)
        `},
        {name: 'preset', columns: `
            id INT NOT NULL AUTO_INCREMENT,
            campaign_id INT NOT NULL,
            type VARCHAR(50) NOT NULL,
            content VARCHAR(100) NOT NULL,
            PRIMARY KEY (id),
            FOREIGN KEY (campaign_id) REFERENCES campaign(id)   
        `},
        {name: 'placement', columns: `
            id INT NOT NULL AUTO_INCREMENT,
            map_id INT NOT NULL,
            x INT NOT NULL,
            y INT NOT NULL,
            preset_id INT NOT NULL,
            PRIMARY KEY (id),
            FOREIGN KEY (map_id) REFERENCES map(id),
            FOREIGN KEY (preset_id) REFERENCES preset(id)
        `},
    ]
    
    constructor() {
    }

    async tableExists(tableName: string) {
        try {
            return this.pool.execute(`SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = '${tableName}';`).then((rows) => {
                return Object.keys(rows[0]).length > 0;
            });
        } catch (e) {
            console.log(e);
            return false;
        }
    }

    async createTable(table: Table) {
        const exists = await this.tableExists(table.name);

        if(exists) // If the table already exists, we don't try to create it again.
            return;

        try {
            this.pool.query(`CREATE TABLE ${table.name} (${table.columns});`).then(() => {
                console.log('Created table:', table.name);
            });
        } catch (e) {
            console.log(`Failed to create table "${table.name}"`);
            console.log(e);
        }
    }

    async createTables(tables: Table[]) {
        for (let i = 0 ; i < tables.length ; i++)
            await this.createTable(tables[i]!);
    }

    async dropTable(name: string) {
        const exists = await this.tableExists(name);

        if(!exists) // If the table does not exist, we don't try to drop it.
            return;

        try {
            this.pool.query(`DROP TABLE ${name};`).then(() => {
                console.log('Dropped table:', name);
            });
        } catch (e) {
            console.log(`Failed to drop table "${name}"`);
            console.log(e);
        }
    }

    async dropTables(tables: Table[]) {
        for (let i = tables.length - 1 ; i >= 0 ; i--) // This array is being done in reverse, since tables that are referenced come before those that reference them.
            await this.dropTable(tables[i]!.name);
    }

    async insert(tableName: string, entries: {column: string, value: string}[]): Promise<number> {
        let columnString = '';
        let valueString = '';

        for (let i = 0 ; i < entries.length - 1 ; i++) {
            const entry = entries[i];
            columnString += entry?.column + ',';
            valueString += entry?.value + ',';
        }

        columnString += entries[entries.length - 1]?.column;
        valueString += entries[entries.length - 1]?.value;

        try {
            return this.pool.query(`INSERT INTO ${tableName} (${columnString}) VALUES (${valueString});`).then(results => {
                return Object.values(results[0])[2] // The third position of results holds the 'insertId'
            });
        } catch (e) {
            console.log('Failed to insert.');
            console.log(e);
            return -1;
        }
    }

    async select(tableName: string, columns: string[]) {
        let columnString = '';

        for (let i = 0 ; i < columns.length - 1 ; i++) {
            columnString += columns[i] + ',';
        }

        columnString += columns[columns.length - 1];

        return this.pool.query(`SELECT ${columnString} FROM ${tableName};`).then((rows) => {
            return Object.values(rows[0]);
        }).catch((e) => {
            console.log(e);
            return [];
        });
    }

    async updateByID(tableName: string, id: number, entries: {column: string, value: string}[]): Promise<number> {
        let setString = 'SET ';

        for (let i = 0 ; i < entries.length - 1 ; i++) {
            const entry = entries[i];
            setString += entries[i]?.column + '=' + entries[i]?.value + ',';
        }

        setString += entries[entries.length - 1]?.column + '=' + entries[entries.length - 1]?.value;

        return this.pool.query(`UPDATE ${tableName} ${setString} WHERE id = ${id};`).then(results => {
            return Object.values(results[0])[2] // The third position of results holds the 'insertId'
        }).catch(e => {
            console.log('Failed to insert');
            console.log(e);
            return -1; // If the update failed, return an invalid id.
        });
    }

    async getCampaignID(tableName: string) {
        try {
            return this.pool.query(`SELECT id FROM campaign WHERE name = "${tableName}";`).then(results => {
                if(Object.values(results[0]).length === 0)
                    return -1;
                return Object.values(results[0])[0].id;
            });
        } catch (e) {
            console.log(e);
            throw e;
        }
    }

    async getMapID(campaignID: number, mapName: string) {
        try {
            return this.pool.query(`SELECT id FROM map WHERE campaign_id = ${campaignID} AND name = "${mapName}";`).then(results => {
                if(Object.values(results[0]).length === 0)
                    return -1;
                return Object.values(results[0])[0].id;
            });
        } catch (e) {
            console.log(e);
            throw e;
        }
    }

    async getPresets(campaignID: number) {
        try {
            return this.pool.query(`SELECT * FROM preset WHERE campaign_id = ${campaignID}`).then(results => {
                console.log(results);
                return Object.values(results[0]);
            })
        } catch (e) {
            console.log(e);
            throw e;
        }
    }

    async getPlacements(mapID: number) {
        return this.pool.query(`SELECT * FROM placement WHERE map_id = ${mapID}`).then(results => {
            console.log(results);
            return Object.values(results[0]);
        }).catch((e) => {
            console.log(e);
            return [];
        })
    }
}

export default SQLHandler;