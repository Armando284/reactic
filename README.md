# Reactic

## Overview

Reactic is a lightweight, custom-built React-like library designed to help developers understand the core concepts of React, including the Virtual DOM, reconciliation, and state management.

## Features

- Virtual DOM for efficient UI updates
- Reconciliation with a diffing algorithm
- State management for components

## Motivation

This project was created to deepen my understanding of React's internal workings and improve my frontend development skills.

## Installation

Clone the repository and install dependencies:

```bash
git clone https://github.com/armando284/reactic.git
cd reactic
npm install
```

## Usage

Here's a basic example using Reactic:

```javascript
import Reactic from './reactic.js';

/** @jsx Reactic.createElement */
function Counter() {
  const [state, setState] = Reactic.useState(1)
  return (
    <h1 onClick={() => setState(c => c + 1)}>
      Count: {state}
    </h1>
  )
}

const element = <Counter />
const container = document.getElementById("root")
Reactic.render(element, container)
```

## Contributing

Contributions are welcome! Please follow the steps below:

1. Fork the repository.
2. Create a new branch (`git checkout -b feature-branch`).
3. Make your changes.
4. Commit your changes (`git commit -am 'Add new feature'`).
5. Push to the branch (`git push origin feature-branch`).
6. Create a new Pull Request.

## License

Licensed under the MIT License.

## Acknowledgments

Inspired by React, developed by Facebook.