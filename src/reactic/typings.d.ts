export type DomElement = HTMLElement | Text

export type ElementType =
  | keyof HTMLElementTagNameMap
  | 'TEXT_ELEMENT'
  | Function

export interface Props {
  [key: string]: string | number | EventListenerOrEventListenerObject
  children: ReacticElement[]
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

interface Fiber {
  type: ElementType
  props: Props
  parent: Fiber
  child?: Fiber
  sibling?: Fiber
  alternate?: Fiber
  dom: DomELement
  effectTag?: 'UPDATE' | 'PLACEMENT' | 'DELETION'
}
