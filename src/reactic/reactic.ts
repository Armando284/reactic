import { ReacticElement, Props, ReacticTextElement } from './typings'

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

function render(element: ReacticElement, container: HTMLElement | Text) {
  const node =
    element.type === 'TEXT_ELEMENT'
      ? document.createTextNode('')
      : document.createElement(element.type)

  const isProperty = (key: string) => key !== 'children'

  Object.keys(element.props)
    .filter(isProperty)
    .forEach((name) => {
      node[name] = element.props[name]
    })

  element.props.children.forEach((child) => {
    // TODO: What happens if the container is a Text node
    render(child, node)
  })

  container.appendChild(node)
}

let nextUnitOfWork = null

function workLoop(deadline: IdleDeadline) {
  let shouldYield = false
  while (nextUnitOfWork && !shouldYield) {
    nextUnitOfWork = performUnitOfWork(nextUnitOfWork)
    shouldYield = deadline.timeRemaining() < 1
  }
  requestIdleCallback(workLoop)
}

requestIdleCallback(workLoop)

function performUnitOfWork(nextUnitOfWork) {
  // TODO
  // add the element to the DOM
  // create the fibers for the element’s children
  // select the next unit of work
}

export const Reactic = {
  createElement,
  render,
}
