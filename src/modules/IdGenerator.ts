export function* getId (): Generator<number> {
  let id = 0;
  while(true) {
    yield ++id;
  }
}