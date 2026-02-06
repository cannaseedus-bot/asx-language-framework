/**
 * FILESYSTEM HANDLERS
 * Safe filesystem operations
 */

import fs from "fs-extra";
import path from "path";

type HandlerInput<T> = {
  input: T;
};

type FileEntry = {
  name: string;
  type: "directory" | "file";
  size: number;
  modified: Date;
  children?: FileEntry[];
};

type ReadInput = {
  path: string;
  encoding?: BufferEncoding;
};

type WriteInput = {
  path: string;
  content: string;
  encoding?: BufferEncoding;
};

type ListInput = {
  path?: string;
  recursive?: boolean;
};

type ExistsInput = {
  path: string;
};

type DeleteInput = {
  path: string;
};

type CopyInput = {
  from: string;
  to: string;
  overwrite?: boolean;
};

type JsonReadInput = {
  path: string;
};

type JsonWriteInput = {
  path: string;
  data: unknown;
  spaces?: number;
};

// Base directory for file operations (security sandbox)
const BASE_DIR = path.resolve(__dirname, "../..");

// Ensure path is within BASE_DIR
const safePath = (inputPath: string): string => {
  const resolved = path.resolve(BASE_DIR, inputPath);
  const relative = path.relative(BASE_DIR, resolved);
  if (relative.startsWith("..") || path.isAbsolute(relative)) {
    throw new Error("Access denied: Path outside allowed directory");
  }
  return resolved;
};

const listDirectory = async (
  dirPath: string,
  recursive: boolean
): Promise<FileEntry[]> => {
  const entries = await fs.readdir(dirPath, { withFileTypes: true });
  const results: FileEntry[] = [];

  for (const entry of entries) {
    const entryPath = path.join(dirPath, entry.name);
    const stats = await fs.stat(entryPath);
    const item: FileEntry = {
      name: entry.name,
      type: stats.isDirectory() ? "directory" : "file",
      size: stats.size,
      modified: stats.mtime
    };

    if (entry.isDirectory() && recursive) {
      item.children = await listDirectory(entryPath, recursive);
    }

    results.push(item);
  }

  return results;
};

export default {
  /**
   * Read - Read file contents
   */
  fs_read: async ({ input }: HandlerInput<ReadInput>) => {
    const { path: filePath, encoding = "utf8" } = input;

    try {
      const safe = safePath(filePath);
      const exists = await fs.pathExists(safe);

      if (!exists) {
        return { error: "File not found", path: filePath };
      }

      const content = await fs.readFile(safe, encoding);
      const stats = await fs.stat(safe);

      return {
        success: true,
        path: filePath,
        content,
        size: stats.size,
        modified: stats.mtime
      };
    } catch (err) {
      return {
        error: (err as Error).message,
        path: filePath
      };
    }
  },

  /**
   * Write - Write file contents
   */
  fs_write: async ({ input }: HandlerInput<WriteInput>) => {
    const { path: filePath, content, encoding = "utf8" } = input;

    try {
      const safe = safePath(filePath);
      await fs.ensureFile(safe);
      await fs.writeFile(safe, content, encoding);
      const stats = await fs.stat(safe);

      return {
        success: true,
        path: filePath,
        size: stats.size
      };
    } catch (err) {
      return {
        error: (err as Error).message,
        path: filePath
      };
    }
  },

  /**
   * List - List directory contents
   */
  fs_list: async ({ input }: HandlerInput<ListInput>) => {
    const { path: dirPath = ".", recursive = false } = input;

    try {
      const safe = safePath(dirPath);
      const exists = await fs.pathExists(safe);

      if (!exists) {
        return { error: "Directory not found", path: dirPath };
      }

      const items = await listDirectory(safe, recursive);

      return {
        success: true,
        path: dirPath,
        items
      };
    } catch (err) {
      return {
        error: (err as Error).message,
        path: dirPath
      };
    }
  },

  /**
   * Exists - Check if path exists
   */
  fs_exists: async ({ input }: HandlerInput<ExistsInput>) => {
    const { path: checkPath } = input;

    try {
      const safe = safePath(checkPath);
      const exists = await fs.pathExists(safe);

      let type: "directory" | "file" | null = null;
      if (exists) {
        const stats = await fs.stat(safe);
        type = stats.isDirectory() ? "directory" : "file";
      }

      return {
        exists,
        path: checkPath,
        type
      };
    } catch (err) {
      return {
        error: (err as Error).message,
        path: checkPath
      };
    }
  },

  /**
   * Delete - Delete file or directory
   */
  fs_delete: async ({ input }: HandlerInput<DeleteInput>) => {
    const { path: deletePath } = input;

    try {
      const safe = safePath(deletePath);
      const exists = await fs.pathExists(safe);

      if (!exists) {
        return { error: "Path not found", path: deletePath };
      }

      await fs.remove(safe);

      return {
        success: true,
        path: deletePath
      };
    } catch (err) {
      return {
        error: (err as Error).message,
        path: deletePath
      };
    }
  },

  /**
   * Copy - Copy file or directory
   */
  fs_copy: async ({ input }: HandlerInput<CopyInput>) => {
    const { from, to, overwrite = false } = input;

    try {
      const safeFrom = safePath(from);
      const safeTo = safePath(to);

      const exists = await fs.pathExists(safeFrom);
      if (!exists) {
        return { error: "Source not found", from };
      }

      await fs.copy(safeFrom, safeTo, { overwrite });

      return {
        success: true,
        from,
        to
      };
    } catch (err) {
      return {
        error: (err as Error).message,
        from,
        to
      };
    }
  },

  /**
   * JSON Read - Read and parse JSON file
   */
  fs_json_read: async ({ input }: HandlerInput<JsonReadInput>) => {
    const { path: filePath } = input;

    try {
      const safe = safePath(filePath);
      const data = await fs.readJson(safe);

      return {
        success: true,
        path: filePath,
        data
      };
    } catch (err) {
      return {
        error: (err as Error).message,
        path: filePath
      };
    }
  },

  /**
   * JSON Write - Write JSON file
   */
  fs_json_write: async ({ input }: HandlerInput<JsonWriteInput>) => {
    const { path: filePath, data, spaces = 2 } = input;

    try {
      const safe = safePath(filePath);
      await fs.ensureFile(safe);
      await fs.writeJson(safe, data, { spaces });

      return {
        success: true,
        path: filePath
      };
    } catch (err) {
      return {
        error: (err as Error).message,
        path: filePath
      };
    }
  }
};
