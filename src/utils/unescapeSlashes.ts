export default function unescapeSlashes(str: string | number) {
  return String(str).replaceAll('\\/', '/');
}
