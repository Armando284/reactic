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

function updateDom(dom, prevProps, nextProps) {
  // TODO
}

function commitRoot() {
  deletions.forEach(commitWork)
  commitWork(rootInProgress.child)
  currentRoot = rootInProgress
  rootInProgress = null
}

function commitWork(fiber: Fiber) {
  if (!fiber) return

  const domParent = fiber.parent.dom

  if (fiber.effectTag === 'PLACEMENT' && fiber.dom != null) {
    domParent.appendChild(fiber.dom)
  } else if (fiber.effectTag === 'UPDATE' && fiber.dom != null) {
    updateDom(fiber.dom, fiber.alternate.props, fiber.props)
  } else if (fiber.effectTag === 'DELETION') {
    domParent.removeChild(fiber.dom)
  }

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
    alternate: currentRoot,
  }

  deletions = []

  nextUnitOfWork = rootInProgress
}

let nextUnitOfWork = null
let rootInProgress = null
let currentRoot = null
let deletions = null

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
  reconcileChildren(fiber, elements)
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

function reconcileChildren(fiberInProgress: Fiber, elements: ReacticElement[]) {
  let index = 0
  let oldFiber = fiberInProgress.alternate && fiberInProgress.alternate.child
  let prevSibling: Fiber = null

  while (index < elements.length || oldFiber != null) {
    const element = elements[index]

    let newFiber: Fiber = null

    const sameType = oldFiber && element && element.type == oldFiber.type
    if (sameType) {
      // update the node
      newFiber = {
        type: oldFiber.type,
        props: element.props,
        dom: oldFiber.dom,
        parent: fiberInProgress,
        alternate: oldFiber,
        effectTag: 'UPDATE',
      }
    }
    if (element && !sameType) {
      // add this node
      newFiber = {
        type: element.type,
        props: element.props,
        dom: null,
        parent: fiberInProgress,
        alternate: null,
        effectTag: 'PLACEMENT',
      }
    }
    if (oldFiber && !sameType) {
      // delete the oldFiber's node
      oldFiber.effectTag = 'DELETION'
      deletions.push(oldFiber)
    }
    if (oldFiber) {
      oldFiber = oldFiber.sibling
    }

    if (index === 0) {
      fiberInProgress.child = newFiber
    } else {
      prevSibling.sibling = newFiber
    }
    prevSibling = newFiber
    index++
  }
}

export const Reactic = {
  createElement,
  render,
}
