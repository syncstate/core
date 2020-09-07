const globalState = {
  syncStateGuid: 1,
};

export default function getNextId() {
  return ++globalState.syncStateGuid;
}
