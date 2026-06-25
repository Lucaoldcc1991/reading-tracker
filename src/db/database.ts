import Dexie from 'dexie'
import type { Table } from 'dexie'

/* =========================
   BOOKS
========================= */

export type Book = {
  id?: number
  title: string
  author: string
  genre: string
  series?: string
  country?: string
  publisher?: string
  publicationYear?: number
  pages: number
  readingMonth?: number
  readingYear?: number
  createdAt: number
}

/* =========================
   WISHLIST
========================= */

export type WishlistItem = {
  id?: number
  title: string
  author: string
  genre: string
  createdAt: number
}

/* =========================
   DATABASE
========================= */

class AppDatabase extends Dexie {
  books!: Table<Book, number>
  wishlist!: Table<WishlistItem, number>

  constructor() {
    super('readingTrackerDB')

    /* =========================
       VERSIONE 1 (ESISTENTE)
       NON MODIFICARE PER NON PERDERE DATI
    ========================= */

    this.version(1).stores({
      books:
        '++id, title, author, genre, pages, readingYear, createdAt',
      wishlist:
        '++id, title, author, genre, createdAt'
    })

    /* =========================
       VERSIONE 2 (MIGRAZIONE)
       AGGIUNTA CAMPI: country, series, publisher
    ========================= */

    this.version(2)
      .stores({
        books:
          '++id, title, author, genre, series, country, publisher, pages, readingYear, createdAt',
        wishlist:
          '++id, title, author, genre, createdAt'
      })
      .upgrade(() => {
        // nessuna trasformazione dati necessaria
        // Dexie gestisce automaticamente i nuovi campi opzionali
      })
  }
}

export const db = new AppDatabase()