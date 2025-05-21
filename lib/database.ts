import { SQLiteDatabase } from "expo-sqlite";

export enum ContentType {
  VIDEO = "Video",
  MEME = "Meme",
  NEWS = "News",
  WEBSITE = "Website",
  IMAGE = "Image",
  DIRECTION = "Direction",
}

export type ContentItem = {
  id?: number;
  type: ContentType;
  url?: string;
  title?: string;
  imageUrl?: string;
  description?: string;
  summary?: string;
  comment?: string;
  category?: string;
  tags?: string[];
  created?: string;
  isFavorite?: boolean;
  directions?: string;
  latitude?: number;
  longitude?: number;
};

export async function initDatabase(db: SQLiteDatabase) {
  const DATABASE_VERSION = 3;
  const versionResult = await db.getFirstAsync<{ user_version: number }>(
    "PRAGMA user_version"
  );
  let currentDbVersion = versionResult?.user_version ?? 0;

  if (currentDbVersion >= DATABASE_VERSION) {
    return;
  }

  if (currentDbVersion === 0) {
    await db.execAsync(`
      PRAGMA journal_mode = 'wal';
      CREATE TABLE IF NOT EXISTS contents (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        type TEXT NOT NULL,
        url TEXT,
        title TEXT,
        imageUrl TEXT,
        description TEXT,
        summary TEXT,
        comment TEXT,
        category TEXT,
        tags TEXT,
        created TEXT DEFAULT CURRENT_TIMESTAMP
      );
    `);
    currentDbVersion = 1;
  }

  if (currentDbVersion === 1) {
    await db.execAsync(`
      ALTER TABLE contents ADD COLUMN isFavorite INTEGER DEFAULT 0;
    `);
    currentDbVersion = 2;
  }

  if (currentDbVersion === 2) {
    await db.execAsync(`
      ALTER TABLE contents ADD COLUMN directions TEXT;
      ALTER TABLE contents ADD COLUMN latitude REAL;
      ALTER TABLE contents ADD COLUMN longitude REAL;
    `);
    currentDbVersion = 3;
  }

  await db.execAsync(`PRAGMA user_version = ${DATABASE_VERSION}`);
}

export async function saveContent(
  db: SQLiteDatabase,
  content: ContentItem
): Promise<ContentItem> {
  if (content.id) {
    await db.runAsync(
      `UPDATE contents SET type = ?, url = ?, title = ?, imageUrl = ?, description = ?, summary = ?, comment = ?, category = ?, tags = ?, isFavorite = ?, directions = ?, latitude = ?, longitude = ? WHERE id = ?`,
      [
        content.type,
        content.url || null,
        content.title || null,
        content.imageUrl || null,
        content.description || null,
        content.summary || null,
        content.comment || null,
        content.category || null,
        content.tags ? JSON.stringify(content.tags) : null,
        content.isFavorite ? 1 : 0,
        content.directions || null,
        content.latitude || null,
        content.longitude || null,
        content.id,
      ]
    );
    return content;
  } else {
    const result = await db.runAsync(
      `INSERT INTO contents (type, url, title, imageUrl, description, summary, comment, category, tags, isFavorite, directions, latitude, longitude)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        content.type,
        content.url || null,
        content.title || null,
        content.imageUrl || null,
        content.description || null,
        content.summary || null,
        content.comment || null,
        content.category || null,
        content.tags ? JSON.stringify(content.tags) : null,
        content.isFavorite ? 1 : 0,
        content.directions || null,
        content.latitude || null,
        content.longitude || null,
      ]
    );

    return { ...content, id: result.lastInsertRowId };
  }
}

export async function getAllContents(
  db: SQLiteDatabase
): Promise<ContentItem[]> {
  const items = await db.getAllAsync<
    Omit<ContentItem, "tags" | "isFavorite"> & {
      tags: string;
      isFavorite: number;
    }
  >("SELECT * FROM contents ORDER BY created DESC");

  return items.map((item) => ({
    ...item,
    tags: item.tags ? JSON.parse(item.tags) : [],
    isFavorite: item.isFavorite === 1,
  }));
}

export async function deleteContent(
  db: SQLiteDatabase,
  id: number
): Promise<void> {
  await db.runAsync("DELETE FROM contents WHERE id = ?", [id]);
}
