import { Reactic } from './reactic/reactic.js'

/** @jsx Reactic.createElement */
function Counter() {
  const [state, setState] = Reactic.useState(1)
  return (
    <main>
      <h1>Count: {state}</h1>
      <div className="button-group">
        <button onClick={() => setState((c) => c - 1)}>-</button>
        <button onClick={() => setState((c) => c + 1)}>+</button>
      </div>
    </main>
  )
}
const element = <Counter />
const container = document.getElementById('root')

Reactic.render(element, container)
