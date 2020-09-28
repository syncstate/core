import { SyncStatePath } from '../index';
import escapeSlashes from './escapeSlashes';

export default function immerPathToJsonPatchPath(path: SyncStatePath) {
  if (path.length === 0) {
    return '';
  }
  return '/' + path.map(p => escapeSlashes(p)).join('/');
}
