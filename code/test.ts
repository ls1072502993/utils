interface Typefn {
  name: string
  age: number
}

function fn(cb: (options: Typefn) => void) {
  cb({
    name: 'haha',
    age: 1,
  })
}
