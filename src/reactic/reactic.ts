import { ReacticElement, ReacticTextElement, Fiber } from './typings'

function createElement(
  type: keyof HTMLElementTagNameMap,
  props,
  ...children
): ReacticElement {
  return {
    type,
    props: {
      ...props,
      children: children.map((child) =>
        typeof child === 'object' ? child : createTextElement(child)
      ),
    },
  }
}

function createTextElement(text: string): ReacticTextElement {
  return {
    type: 'TEXT_ELEMENT',
    props: {
      nodeValue: text,
      children: [],
    },
  }
}

function createDom(fiber: Fiber): HTMLElement | Text {
  const dom =
    fiber.type == 'TEXT_ELEMENT'
      ? document.createTextNode('')
      : document.createElement(fiber.type)

  const isProperty = (key: string) => key !== 'children'

  Object.keys(fiber.props)
    .filter(isProperty)
    .forEach((name) => {
      dom[name] = fiber.props[name]
    })

  return dom
}

function commitRoot() {
  commitWork(rootInProgress.child)
  rootInProgress = null
}

function commitWork(fiber: Fiber) {
  if (!fiber) return

  const domParent = fiber.parent.dom
  domParent.appendChild(fiber.dom)
  commitWork(fiber.child)
  commitWork(fiber.sibling)
}

function render(element: ReacticElement, container: HTMLElement) {
  rootInProgress = {
    dom: container,
    props: {
      children: [element],
    },
  }

  nextUnitOfWork = rootInProgress
}

let nextUnitOfWork = null
let rootInProgress = null

function workLoop(deadline: IdleDeadline) {
  let shouldYield = false

  while (nextUnitOfWork && !shouldYield) {
    nextUnitOfWork = performUnitOfWork(nextUnitOfWork)
    shouldYield = deadline.timeRemaining() < 1
  }

  if (!nextUnitOfWork && rootInProgress) {
    commitRoot()
  }

  requestIdleCallback(workLoop)
}

requestIdleCallback(workLoop)

function performUnitOfWork(fiber: Fiber) {
  // add dom node
  if (!fiber.dom) {
    fiber.dom = createDom(fiber)
  }
  // Can not render here, it'll cause the user to see unnfinished interface if the browser stops the algorithm for a moment.

  // create new fibers
  const elements = fiber.props.children
  let index = 0
  let prevSibling: Fiber = null
  while (index < elements.length) {
    const element = elements[index]

    const newFiber: Fiber = {
      type: element.type,
      props: element.props,
      parent: fiber,
      dom: null,
    }

    if (index === 0) {
      fiber.child = newFiber
    } else {
      prevSibling.sibling = newFiber
    }
    prevSibling = newFiber
    index++
  }

  // return next unit of work
  if (fiber.child) {
    return fiber.child
  }

  let nextFiber = fiber

  while (nextFiber) {
    if (nextFiber.sibling) {
      return nextFiber.sibling
    }
    nextFiber = nextFiber.parent
  }
}

export const Reactic = {
  createElement,
  render,
}
