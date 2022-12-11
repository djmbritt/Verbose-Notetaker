import Dexie, { Table } from 'dexie';

export interface Recording {
  id?: number;
  transcript: string;
  file: Blob;
  summary: any;
  length: number;
  created_at: Date;
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
