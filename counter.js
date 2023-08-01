import OBR from "@owlbear-rodeo/sdk"


export function setupCounter(element) {
  let counter = 0
  const setCounter = (count) => {
    counter = count
    element.innerHTML = `count is ${counter}`
    OBR.notification.show(`The Count is: ${counter}`)

  }
  element.addEventListener('click', () => setCounter(counter + 1))
  setCounter(0)
}
