import {Injectable} from '@angular/core';
import * as idb from 'idb';
import {IDBPCursorWithValue, OpenDBCallbacks} from 'idb';
import {IDBPDatabase, IDBPTransaction} from "idb/build/esm/entry";
import {Exam} from "./exam";
import {ExamListEntry} from "./exam-list-entry";
import {BehaviorSubject, Observable, Subject} from "rxjs";

const DB_NAME: string = 'db1'
const DB_VERSION: number = 2;

const DB_EXAM_STORE_NAME: string = 'exams'

@Injectable({
  providedIn: 'root'
})
export class StorageService {

  private db: IDBPDatabase<any> = undefined;
  public examEntries: BehaviorSubject<ExamListEntry[]> = new BehaviorSubject<ExamListEntry[]>([]);

  private collectedEntries: ExamListEntry[] = [];

  constructor() {
    this.setupDatabase();
  }

  async setupDatabase() {
    //check for support
    if (!('indexedDB' in window)) {
      console.error('This browser doesn\'t support IndexedDB');
      //TODO throw error
      return;
    }

    const openDBCallbacks: OpenDBCallbacks<any> = {
      upgrade: this.upgrade,
    }

    idb.openDB(DB_NAME, DB_VERSION, openDBCallbacks).then(database => {
      this.db = database;
      this.initExamList();
    });
  }

  private upgrade(database: IDBPDatabase, oldVersion: number, newVersion: number | null, transaction: IDBPTransaction): void {
    if (!database.objectStoreNames.contains(DB_EXAM_STORE_NAME)) {
      database.createObjectStore(DB_EXAM_STORE_NAME, {keyPath: 'id', autoIncrement: true});
    }
  }

  manageCursor(cursor: IDBPCursorWithValue<any, [string], string> | null):
    Promise<IDBPCursorWithValue<any>> {
    if (!cursor) {
      return;
    }
    const exam = cursor.value as Exam;
    this.collectedEntries.push({
      examName: exam.title,
      lastModified: exam.lastModified || new Date(),
      id: exam.id
    });
    return cursor.continue().then(this.manageCursor.bind(this));
  }

  private initExamList() {
    this.collectedEntries = [];
    const tx = this.db.transaction(DB_EXAM_STORE_NAME, 'readonly');
    const store = tx.objectStore(DB_EXAM_STORE_NAME);

    store.openCursor().then(this.manageCursor.bind(this)).then(() => {
      console.log('Finished iterating exam list', this.collectedEntries);
      this.examEntries.next(this.collectedEntries)
    });
  }

  public async saveExam(exam: Exam): Promise<any> {
    const tx = this.db.transaction(DB_EXAM_STORE_NAME, 'readwrite');
    const store = tx.objectStore(DB_EXAM_STORE_NAME);
    exam.lastModified = new Date();
    const res = await store.put(exam);
    this.initExamList();
    return res;
  }

  public async loadExam(id: number): Promise<Exam> {
    await this.waitForDb();
    const tx = this.db.transaction(DB_EXAM_STORE_NAME, 'readwrite');
    const store = tx.objectStore(DB_EXAM_STORE_NAME);
    const exam = await store.get(id) as Exam;
    if (exam) {
      exam.id = id;
    }
    return exam;
  }

  public async createNewExam(): Promise<any> {
    const exam: Exam = {
      date: new Date(),
      questions: [],
      title: 'New Exam'
    };
    return await this.saveExam(exam);
  }

  private async waitForDb(): Promise<void> {
    while(!this.db) {
      await new Promise(resolve => setTimeout(resolve, 200));
    }
  }
}
