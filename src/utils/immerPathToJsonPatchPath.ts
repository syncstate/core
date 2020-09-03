import { SyncStatePath } from '../index';

export default function immerPathToJsonPatchPath(path: SyncStatePath) {
  if (path.length === 0) {
    return '';
  }
  return '/' + path.join('/');
}
