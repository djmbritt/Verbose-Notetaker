import Dexie, { Table } from 'dexie';

export interface Recording {
  id?: number;
  transcript: string;
  file: string;
  length: number;
  created_at: number;
}

export class DexieDB extends Dexie {
  recordings!: Table<Recording>;

  constructor() {
    super('recordings');
    this.version(1).stores({
      recordings: '++id, name, age',
    });
  }
}

export const db = new DexieDB();
