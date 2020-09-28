import unescapeSlashes from './unescapeSlashes';

export default function jsonPatchPathToImmerPath(path: string) {
  if (!path) {
    return [];
  }

  path = path.replaceAll('\\/', ':::');

  const immerPath = path.split('/');
  immerPath.shift();
  return immerPath.map(p => p.replaceAll(':::', '/'));
}
