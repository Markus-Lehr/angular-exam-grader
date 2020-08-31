import {Injectable, SecurityContext} from '@angular/core';
import * as idb from 'idb';
import {IDBPCursorWithValue, OpenDBCallbacks} from 'idb';
import {IDBPDatabase, IDBPTransaction} from 'idb/build/esm/entry';
import {Exam} from './exam';
import {ExamListEntry} from './exam-list-entry';
import {BehaviorSubject} from 'rxjs';
import {DomSanitizer, SafeUrl} from '@angular/platform-browser';
import {memoize} from './memoize';
import * as pdfjsLib from 'pdfjs-dist';

const DB_NAME = 'db1';
const DB_VERSION = 3;

const DB_EXAM_STORE_NAME = 'exams';
const DB_BLOB_STORE_NAME = 'blobs';

@Injectable({
  providedIn: 'root'
})
export class StorageService {

  public examEntries: BehaviorSubject<ExamListEntry[]> = new BehaviorSubject<ExamListEntry[]>([]);
  private db: IDBPDatabase<any> = undefined;
  private collectedEntries: ExamListEntry[] = [];

  constructor(private domSanitizer: DomSanitizer) {
    this.setupDatabase();
  }

  async setupDatabase(): Promise<void> {
    // check for support
    if (!('indexedDB' in window)) {
      console.error('This browser doesn\'t support IndexedDB');
      // TODO throw error
      return;
    }

    const openDBCallbacks: OpenDBCallbacks<any> = {
      upgrade: this.upgrade,
    };

    idb.openDB(DB_NAME, DB_VERSION, openDBCallbacks).then(database => {
      this.db = database;
      this.initExamList();
    });
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
    this.populatePdfs(exam).then(() => {
      // pass
    });
    return await this.evaluateAndFix(exam);
  }

  public async populatePdfs(exam: Exam) {
    for (const customPdf of exam.customPdfs) {
      if (!!customPdf.url && !!customPdf.pages) {
        continue;
      }
      if (customPdf.id < 0) {
        continue;
      }
      customPdf.url = await this.getBlobAsURL(customPdf.id);
      pdfjsLib.GlobalWorkerOptions.workerSrc = './assets/pdf.worker.js';
      pdfjsLib.getDocument(customPdf.url).promise.then(doc => {
        console.log('pdf document', doc);
        console.log('number of pages', doc.numPages);
        customPdf.pages = doc.numPages;
        console.log(customPdf);
      }, reason => {
        console.log(reason);
      });
    }
  }

  @memoize()
  public async getBlobAsURL(id: number): Promise<SafeUrl> {
    await this.waitForDb();
    const tx = this.db.transaction(DB_BLOB_STORE_NAME, 'readwrite');
    const store = tx.objectStore(DB_BLOB_STORE_NAME);
    const blob = await store.get(id);
    return blob ? this.domSanitizer.sanitize(SecurityContext.RESOURCE_URL,
      this.domSanitizer.bypassSecurityTrustResourceUrl(URL.createObjectURL(blob))) : undefined;
  }

  public async createNewExam(): Promise<any> {
    const exam: Exam = {
      date: new Date(),
      customPdfs: [], elementOrder: [], questions: [],
      title: 'New Exam'
    };
    return await this.saveExam(exam);
  }

  public async saveBlob(file: File): Promise<number> {
    const tx = this.db.transaction(DB_BLOB_STORE_NAME, 'readwrite');
    const store = tx.objectStore(DB_BLOB_STORE_NAME);
    return store.put(file);
  }

  private upgrade(database: IDBPDatabase, oldVersion: number, newVersion: number | null, transaction: IDBPTransaction): void {
    if (!database.objectStoreNames.contains(DB_EXAM_STORE_NAME)) {
      database.createObjectStore(DB_EXAM_STORE_NAME, {keyPath: 'id', autoIncrement: true});
    }
    if (!database.objectStoreNames.contains(DB_BLOB_STORE_NAME)) {
      database.createObjectStore(DB_BLOB_STORE_NAME, {autoIncrement: true});
    }
  }

  private initExamList(): void {
    this.collectedEntries = [];
    const tx = this.db.transaction(DB_EXAM_STORE_NAME, 'readonly');
    const store = tx.objectStore(DB_EXAM_STORE_NAME);

    store.openCursor().then(this.manageCursor.bind(this)).then(() => {
      console.log('Finished iterating exam list', this.collectedEntries);
      this.examEntries.next(this.collectedEntries);
    });
  }

  private async waitForDb(): Promise<void> {
    while (!this.db) {
      await new Promise(resolve => setTimeout(resolve, 200));
    }
  }

  private async evaluateAndFix(exam: Exam): Promise<Exam> {
    let changed = false;
    if (!exam.elementOrder) {
      exam.elementOrder = [];
      changed = true;
    }

    for (let i = 0; i < exam.customPdfs.length; i++) {
      const customPdf = exam.customPdfs[i];
      if (typeof customPdf === 'number') {
        exam.customPdfs[i] = {
          id: customPdf
        };
        changed = true;
      }
    }

    const elementCount = (exam.questions?.length || 0) + (exam.customPdfs?.length || 0);
    const pageBreaks = exam.elementOrder.map(entry => Number(entry.type === 'page-break' ? 1 : 0)).reduce((a, b) => a + b, 0) || 0;
    if (elementCount + pageBreaks !== exam.elementOrder.length) {
      console.log('there are not as many elements as there are list entries. Fixing that');
      changed = true;
      exam.elementOrder = [];
      if (!exam.questions) {
        exam.questions = [];
      }
      for (let i = 0; i < exam.questions.length; i++) {
        const question = exam.questions[i];
        exam.elementOrder.push({
          type: 'question',
          index: i
        });
      }
      if (!exam.customPdfs) {
        exam.customPdfs = [];
      }
      for (let i = 0; i < exam.customPdfs.length; i++) {
        const customPdf = exam.customPdfs[i];
        exam.elementOrder.push({
          type: 'question',
          index: i
        });
      }
    }

    for (const question of exam.questions) {
      if (!question.id || typeof question.id !== 'number') {
        changed = true;
        question.id = Math.round(Math.random() * 100000);
      }
    }

    if (changed) {
      await this.saveExam(exam);
      return exam;
    } else {
      return exam;
    }
  }
}
