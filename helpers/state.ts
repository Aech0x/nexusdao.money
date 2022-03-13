const setAll = (state: any, properties: any) => {
  if (properties) {
    const props = Object.keys(properties)
    props.forEach((key) => {
      state[key] = properties[key]
    })
  }
}

enum Status {
  Initialized,
  Fetching,
  Success,
  Error
}

export { setAll, Status }
