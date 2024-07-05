import {
  ReacticElement,
  ReacticTextElement,
  Fiber,
  Props,
  DomElement,
  ElementType,
  Hook,
} from './typings'

function createElement(
  type: ElementType,
  props: Props,
  ...children: (ReacticElement | ReacticTextElement | string)[]
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

function createDom(fiber: Fiber): DomElement {
  if (typeof fiber.type === 'function') {
    throw new Error('Root element should not be a Function type')
  }

  const dom =
    fiber.type === 'TEXT_ELEMENT'
      ? (document.createTextNode('') as DomElement)
      : (document.createElement(
          fiber.type as keyof HTMLElementTagNameMap
        ) as DomElement)

  updateDom(dom, {} as Props, fiber.props)

  return dom
}

const isEvent = (key: string) => key.startsWith('on')

const isProperty = (key: string) => key !== 'children' && !isEvent(key)

const isNew = (prev: Props, next: Props) => (key: string) =>
  prev[key] !== next[key]

const isGone = (prev: Props, next: Props) => (key: string) => !(key in next)

function updateDom(dom: DomElement, prevProps: Props, nextProps: Props) {
  Object.keys(prevProps)
    .filter(isEvent)
    .filter((key) => !(key in nextProps) || isNew(prevProps, nextProps)(key))
    .forEach((name) => {
      const eventType = name.toLowerCase().substring(2)
      dom.removeEventListener(
        eventType,
        prevProps[name] as EventListenerOrEventListenerObject
      )
    })

  Object.keys(prevProps)
    .filter(isProperty)
    .filter(isGone(prevProps, nextProps))
    .forEach((name) => {
      ;(dom as any)[name] = ''
    })

  Object.keys(nextProps)
    .filter(isProperty)
    .filter(isNew(prevProps, nextProps))
    .forEach((name) => {
      ;(dom as any)[name] = nextProps[name]
    })

  Object.keys(nextProps)
    .filter(isEvent)
    .filter(isNew(prevProps, nextProps))
    .forEach((name) => {
      const eventType = name.toLowerCase().substring(2)
      dom.addEventListener(
        eventType,
        nextProps[name] as EventListenerOrEventListenerObject
      )
    })
}

function commitRoot() {
  deletions.forEach(commitWork)
  commitWork(rootInProgress!.child)
  currentRoot = rootInProgress
  rootInProgress = null
}

function commitWork(fiber: Fiber | null) {
  if (!fiber) return

  let domParentFiber = fiber.parent!
  while (!domParentFiber.dom) {
    domParentFiber = domParentFiber.parent!
  }
  const domParent = domParentFiber.dom

  if (fiber.effectTag === 'PLACEMENT' && fiber.dom != null) {
    domParent.appendChild(fiber.dom)
  } else if (fiber.effectTag === 'UPDATE' && fiber.dom != null) {
    updateDom(fiber.dom, fiber.alternate!.props, fiber.props)
  } else if (fiber.effectTag === 'DELETION') {
    commitDeletion(fiber, domParent)
  }

  commitWork(fiber.child)
  commitWork(fiber.sibling)
}

function commitDeletion(fiber: Fiber, domParent: DomElement) {
  if (fiber.dom) {
    domParent.removeChild(fiber.dom)
  } else {
    commitDeletion(fiber.child!, domParent)
  }
}

function render(element: ReacticElement, container: HTMLElement) {
  rootInProgress = {
    dom: container,
    props: {
      children: [element],
    },
    alternate: currentRoot,
  } as Fiber

  deletions = []

  nextUnitOfWork = rootInProgress
}

let nextUnitOfWork: Fiber | null = null
let rootInProgress: Fiber | null = null
let currentRoot: Fiber | null = null
let deletions: Fiber[] = []

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

function performUnitOfWork(fiber: Fiber): Fiber | null {
  const isFunctionComponent = (fiber.type as any) instanceof Function
  if (isFunctionComponent) {
    updateFunctionComponent(fiber)
  } else {
    updateHostComponent(fiber)
  }

  if (fiber.child) {
    return fiber.child
  }

  let nextFiber = fiber
  while (nextFiber) {
    if (nextFiber.sibling) {
      return nextFiber.sibling
    }
    nextFiber = nextFiber.parent!
  }

  return null
}

let workingFiber: Fiber | null = null
let hookIndex: number | null = null

function updateFunctionComponent(fiber: Fiber) {
  workingFiber = fiber
  hookIndex = 0
  workingFiber.hooks = []

  const children = [(fiber.type as Function)(fiber.props)]
  reconcileChildren(fiber, children)
}

function useState<T>(initial: T): [T, (action: (prevState: T) => T) => void] {
  const oldHook =
    workingFiber!.alternate &&
    workingFiber!.alternate.hooks &&
    workingFiber!.alternate.hooks[hookIndex!]

  const hook: Hook = {
    state: oldHook ? oldHook.state : initial,
    queue: [],
  }

  // Ejecutar todas las acciones en la cola para obtener el estado actualizado
  if (oldHook) {
    oldHook.queue.forEach((action) => {
      hook.state = action(hook.state)
    })
  }

  const setState = (action: (prevState: T) => T) => {
    hook.queue.push(action)
    // Marca la raíz para renderizar de nuevo
    rootInProgress = {
      dom: currentRoot!.dom,
      props: currentRoot!.props,
      alternate: currentRoot,
    } as Fiber
    nextUnitOfWork = rootInProgress
    deletions = []
  }

  // Almacenar el hook en el fiber actual
  workingFiber!.hooks.push(hook)
  hookIndex!++
  return [hook.state, setState]
}

function updateHostComponent(fiber: Fiber) {
  if (!fiber.dom) {
    fiber.dom = createDom(fiber)
  }
  reconcileChildren(fiber, fiber.props.children)
}

function reconcileChildren(fiberInProgress: Fiber, elements: ReacticElement[]) {
  let index = 0
  let oldFiber = fiberInProgress.alternate && fiberInProgress.alternate.child
  let prevSibling: Fiber | null = null

  while (index < elements.length || oldFiber != null) {
    const element = elements[index]
    let newFiber: Fiber | null = null

    const sameType = oldFiber && element && element.type == oldFiber.type

    if (sameType) {
      // Update the node
      newFiber = {
        type: oldFiber.type,
        props: element.props,
        dom: oldFiber.dom,
        parent: fiberInProgress,
        alternate: oldFiber,
        effectTag: 'UPDATE',
      } as Fiber
    } else if (element && !sameType) {
      // Add this node
      newFiber = {
        type: element.type,
        props: element.props,
        dom: null,
        parent: fiberInProgress,
        alternate: null,
        effectTag: 'PLACEMENT',
      } as Fiber
    } else if (oldFiber && !sameType) {
      // Delete the oldFiber's node
      oldFiber.effectTag = 'DELETION'
      deletions.push(oldFiber)
    }

    if (oldFiber) {
      oldFiber = oldFiber.sibling
    }

    if (index === 0) {
      fiberInProgress.child = newFiber
    } else if (prevSibling) {
      prevSibling.sibling = newFiber
    }

    prevSibling = newFiber
    index++
  }
}

export const Reactic = {
  createElement,
  render,
  useState,
}
