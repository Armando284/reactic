export interface Props {
  [key: string]: string | number
  children: ReacticElement[]
}

export interface ReacticElement {
  type: keyof HTMLElementTagNameMap | 'TEXT_ELEMENT'
  props: Props
}

export interface ReacticTextElement {
  type: 'TEXT_ELEMENT'
  props: {
    nodeValue: string
    children: []
  }
}