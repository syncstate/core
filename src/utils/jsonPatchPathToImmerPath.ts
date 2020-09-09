export default function jsonPatchPathToImmerPath(path: string) {
  if (!path) {
    return [];
  }
  const immerPath = path.split('/');
  immerPath.shift();
  return immerPath;
}
