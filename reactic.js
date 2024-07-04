'use strict'

function createElement(type, props, ...children) {
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

function createTextElement(text) {
  return {
    type: 'TEXT_ELEMENT',
    props: {
      nodeValue: text,
      children: [],
    },
  }
}

function render(element, container) {
  const node =
    element.type === 'TEXT_ELEMENT'
      ? document.createTextElement('')
      : document.createElement(element.type)

  const isProperty = (key) => key !== 'children'

  Object.keys(element.props)
    .filter(isProperty)
    .forEach((name) => {
      node[name] = element.props[name]
    })

  element.props.children.forEach((child) => {
    render(child, node)
  })

  container.appendChild(node)
}

const Reactic = {
  createElement,
}
