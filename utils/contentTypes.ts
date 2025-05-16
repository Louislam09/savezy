export enum ContentType {
  VIDEO = "Video",
  MEME = "Meme",
  NEWS = "News",
  WEBSITE = "Website",
  IMAGE = "Image",
}

export function getCollectionForType(type: ContentType): string {
  switch (type) {
    case ContentType.VIDEO:
      return "videos";
    case ContentType.MEME:
      return "memes";
    case ContentType.NEWS:
      return "news";
    case ContentType.WEBSITE:
      return "websites";
    case ContentType.IMAGE:
      return "images";
    default:
      throw new Error(`Unknown content type: ${type}`);
  }
}
