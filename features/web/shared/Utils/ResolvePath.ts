import fs from 'node:fs';
import path from 'node:path';

function findProjectRoot(startDir: string): string {
  let current = startDir;

  while (true) {
    const pkg = path.join(current, 'package.json');
    if (fs.existsSync(pkg)) {
      return current;
    }

    const parent = path.dirname(current);
    if (parent === current) {
      // Llegamos a la raíz del filesystem
      throw new Error(
        `No se pudo determinar el root del proyecto (package.json no encontrado). Start: ${startDir}`,
      );
    }
    current = parent;
  }
}

export function resolvePathFromProject(relativeOrAbsolutePath: string): string {
  const raw = relativeOrAbsolutePath.trim().replace(/^['"]|['"]$/g, '');

  // Permite que el feature venga con \ o /
  const portable = raw.replace(/[\\]+/g, '/');

  // Si ya es absoluto, no lo tocamos
  if (path.isAbsolute(portable)) {
    if (!fs.existsSync(portable)) {
      throw new Error(`Archivo no encontrado (ruta absoluta): ${portable}`);
    }
    return portable;
  }

  // ⭐ root real del proyecto (robusto aunque cambie el cwd)
  const projectRoot = findProjectRoot(process.cwd());

  const absolute = path.resolve(projectRoot, portable);

  if (!fs.existsSync(absolute)) {
    throw new Error(
      [
        `Archivo no encontrado.`,
        `  path recibido : ${relativeOrAbsolutePath}`,
        `  portable      : ${portable}`,
        `  root proyecto : ${projectRoot}`,
        `  resuelto      : ${absolute}`,
        `  cwd           : ${process.cwd()}`,
      ].join('\n'),
    );
  }

  return absolute;
}
