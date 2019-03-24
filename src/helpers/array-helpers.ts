export function reject<T>(array: T[], callback: (v: T) => boolean): T[] {
  const results: T[] = []
  array.forEach((itemInArray) => {
    if (!callback(itemInArray)) {
      results.push(itemInArray)
    }
  })

  return results
}

export function filter<T>(array: T[], callback: (v: T) => boolean): T[] {
  const results: T[] = []
  array.forEach((itemInArray) => {
    if (callback(itemInArray)) {
      results.push(itemInArray)
    }
  })

  return results
}
