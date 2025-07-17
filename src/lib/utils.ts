export const getWrappedSlice = (
  arr: number[],
  centerIndex: number,
  range: number
) => {
  const result = [];
  const len = arr.length;

  for (let offset = -range; offset <= range; offset++) {
    const i = (centerIndex + offset + len) % len;
    console.log(i);
    result.push(arr[i]);
  }

  return result;
};
