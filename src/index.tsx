import { Reactic } from './reactic/reactic.js'

/** @jsx Reactic.createElement */
function Counter() {
  const [state, setState] = Reactic.useState(1)
  return (
    <main>
      <section className="hero">
        <h1>
          Reactic
          <img
            src="../src/assets/reactic.png"
            alt=""
            width="72"
          />
        </h1>
        <span>
          A lightweight, <strong>TypeScript</strong> custom-built React-like
          library designed to help developers understand the core concepts of{' '}
          <strong>React</strong>.
        </span>
      </section>
      <article className="counter">
        <h3>Count: {state}</h3>
        <div className="button-group">
          <button onClick={() => setState((c) => c - 1)}>-</button>
          <button onClick={() => setState((c) => c + 1)}>+</button>
        </div>
      </article>
      <footer>
        <ul>
          <li>
            Public repo:{' '}
            <a
              href="https://github.com/Armando284/reactic"
              target="_blank"
              rel="noopener noreferrer">
              Armando284/reactic
            </a>
          </li>
        </ul>
      </footer>
    </main>
  )
}
const element = <Counter />
const container = document.getElementById('root')

Reactic.render(element, container)
