export default function escapeSlashes(str: string | number) {
  return String(str).replaceAll('/', '\\/');
}
