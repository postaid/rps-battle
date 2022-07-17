export function* idGenerator (): Generator<number> {
  let id = 0;
  while(true) {
    yield ++id;
  }
}

const globalIdGenerator = idGenerator();

export function getId (): number {
  return globalIdGenerator.next().value;
}