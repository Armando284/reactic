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

export const Reactic = {
  createElement,
  render,
}
