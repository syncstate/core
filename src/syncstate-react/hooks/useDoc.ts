import { useEffect, useState, useContext } from 'react';
import SyncStateReactContext from '../components/Context';

//create your forceUpdate hook
function useForceUpdate() {
  const [value, setValue] = useState(0); // integer state
  return () => setValue(value => ++value); // update the state to force render
}

export function useDoc(path: string) {
  const forceUpdate = useForceUpdate();
  const doc: any = useContext(SyncStateReactContext);

  useEffect(() => {
    doc.onPatchPattern(path, () => forceUpdate());
  }, []);
  console.log(path, doc.getStateAtPath(path), 'doc.getStateAtPath(path)');
  return [doc.getStateAtPath(path), doc.dispatch];
}
