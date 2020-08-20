import { Injectable } from '@angular/core';

const DB_NAME: string = 'db1'
const DB_VERSION: number = 2;

const DB_EXAM_STORE_NAME: string = 'exams'

@Injectable({
  providedIn: 'root'
})
export class StorageService {

  private idbFactory: IDBFactory;
  private db: IDBDatabase = undefined;

  constructor() {
    this.setupDatabase();
  }

  setupDatabase() {
    console.log('setting up indexedDB');
    //check for support
    if (!('indexedDB' in window)) {
      console.error('This browser doesn\'t support IndexedDB');
      //TODO redirect to dedicated error page
      return;
    }
    this.idbFactory = window.indexedDB;
    const req = this.idbFactory.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = this.initStores;
    req.onsuccess = this.onSucess;


  }

  private initStores(ev: any) {
    let db: IDBDatabase = ev.target.result as IDBDatabase;
    if (!db.objectStoreNames.contains(DB_EXAM_STORE_NAME)) {
      const examsObjectStore = db.createObjectStore(DB_EXAM_STORE_NAME, {keyPath: 'id', autoIncrement: true});
    }
  }

  private onSucess(ev: any) {
    this.db = ev.target.result as IDBDatabase;
    console.log(this.db);
  }
}
