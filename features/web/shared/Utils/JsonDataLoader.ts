import fs from 'node:fs';
import path from 'node:path';

export class JsonDataLoader {

  static from<T>(relativePath: string): T {

    const absolutePath = path.resolve(process.cwd(), relativePath);

    if (!fs.existsSync(absolutePath)) {
      throw new Error(`Archivo no encontrado: ${ absolutePath }`);
    }

    const file = fs.readFileSync(absolutePath, 'utf-8');

    return JSON.parse(file) as T;
  }
}
