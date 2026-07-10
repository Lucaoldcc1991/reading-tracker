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
  cover?: string
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

    this.version(1).stores({
      books:
        '++id, title, author, genre, pages, readingYear, createdAt',
      wishlist:
        '++id, title, author, genre, createdAt'
    })

    this.version(2).stores({
      books:
        '++id, title, author, genre, country, series, pages, readingYear, createdAt',
      wishlist:
        '++id, title, author, genre, createdAt'
    })

    this.version(3).stores({
      books:
        '++id, title, author, genre, country, series, pages, readingYear, createdAt',
      wishlist:
        '++id, title, author, genre, createdAt'
    })
  }
}

export const db = new AppDatabase()