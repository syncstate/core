export default function jsonPatchPathToImmerPath(path: string) {
  const immerPath = path.split('/');
  immerPath.shift();
  return immerPath;
}
