import { SQLiteDatabase } from "expo-sqlite";

export enum ContentType {
  VIDEO = "Video",
  MEME = "Meme",
  NEWS = "News",
  WEBSITE = "Website",
  IMAGE = "Image",
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
};

export async function initDatabase(db: SQLiteDatabase) {
  const DATABASE_VERSION = 1;
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

  await db.execAsync(`PRAGMA user_version = ${DATABASE_VERSION}`);
}

export async function saveContent(
  db: SQLiteDatabase,
  content: ContentItem
): Promise<ContentItem> {
  const result = await db.runAsync(
    `INSERT INTO contents (type, url, title, imageUrl, description, summary, comment, category, tags)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
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
    ]
  );

  return { ...content, id: result.lastInsertRowId };
}

export async function getAllContents(
  db: SQLiteDatabase
): Promise<ContentItem[]> {
  const items = await db.getAllAsync<ContentItem & { tags: string }>(
    "SELECT * FROM contents ORDER BY created DESC"
  );

  return items.map((item) => ({
    ...item,
    tags: item.tags ? JSON.parse(item.tags) : [],
  }));
}

export async function deleteContent(
  db: SQLiteDatabase,
  id: number
): Promise<void> {
  await db.runAsync("DELETE FROM contents WHERE id = ?", [id]);
}
