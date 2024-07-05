export type DomElement = HTMLElement | Text

export type ElementType =
  | keyof HTMLElementTagNameMap
  | 'TEXT_ELEMENT'
  | Function

export interface Props {
  [key: string]: any
  children: (ReacticElement | ReacticTextElement)[]
}

export interface ReacticElement {
  type: ElementType
  props: Props
}

export interface ReacticTextElement {
  type: 'TEXT_ELEMENT'
  props: {
    nodeValue: string
    children: []
  }
}

export interface Fiber {
  type?: ElementType
  props: Props
  parent?: Fiber
  child?: Fiber
  sibling?: Fiber
  alternate?: Fiber
  dom: DomElement
  effectTag?: 'UPDATE' | 'PLACEMENT' | 'DELETION'
  hooks?: Hook[]
}

export interface Hook {
  state: any
  queue: any[]
}
