export function insertionSort(arr: Array<any>, comparator: Function) {
  for (let i = 1; i < arr.length; i++) {
    const currentValue = arr[i];
    let j;
    for (j = i - 1; j >= 0 && comparator(arr[j], currentValue) > 0; j--) {
      arr[j + 1] = arr[j];
    }
    arr[j + 1] = currentValue;
  }
  return arr;
}