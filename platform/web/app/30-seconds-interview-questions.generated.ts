/**
 * Generated from Chalarangelo/30-seconds-of-interviews at commit
 * da235b6185721161b7ebc413075b76dc70339ccf. Do not edit by hand; run:
 *   node scripts/sync-30-seconds-interviews.mjs
 *
 * Upstream license: MIT. See THIRD_PARTY_NOTICES.md.
 */

export type ThirtySecondsInterviewQuestion = {
  name: string;
  question: string;
  tags: readonly string[];
  expertise: number;
};

export const THIRTY_SECONDS_INTERVIEW_QUESTIONS = [
  {
    "name": "accessibility-aria",
    "question": "What is ARIA and when should you use it?",
    "tags": [
      "accessibility"
    ],
    "expertise": 1
  },
  {
    "name": "accessibility-tree",
    "question": "What is the Accessibility Tree?",
    "tags": [
      "accessibility"
    ],
    "expertise": 1
  },
  {
    "name": "alt-attribute",
    "question": "What is the purpose of the `alt` attribute on images?",
    "tags": [
      "html"
    ],
    "expertise": 0
  },
  {
    "name": "async-defer-attributes",
    "question": "What are `defer` and `async` attributes on a `<script>` tag?",
    "tags": [
      "html"
    ],
    "expertise": 1
  },
  {
    "name": "batches",
    "question": "Create a function `batches` that returns the maximum number of whole batches that can be cooked from a recipe.\n\n```js\n/**\nIt accepts two objects as arguments: the first object is the recipe\nfor the food, while the second object is the available ingredients.\nEach ingredient's value is a number representing how many units there are.\n\n`batches(recipe, available)`\n*/\n\n// 0 batches can be made\nbatches(\n  { milk: 100, butter: 50, flour: 5 },\n  { milk: 132, butter: 48, flour: 51 }\n)\nbatches(\n  { milk: 100, flour: 4, sugar: 10, butter: 5 },\n  { milk: 1288, flour: 9, sugar: 95 }\n)\n\n// 1 batch can be made\nbatches(\n  { milk: 100, butter: 50, cheese: 10 },\n  { milk: 198, butter: 52, cheese: 10 }\n)\n\n// 2 batches can be made\nbatches(\n  { milk: 2, sugar: 40, butter: 20 },\n  { milk: 5, sugar: 120, butter: 500 }\n)\n```",
    "tags": [
      "javascript"
    ],
    "expertise": 1
  },
  {
    "name": "bem",
    "question": "What is CSS BEM?",
    "tags": [
      "css"
    ],
    "expertise": 0
  },
  {
    "name": "big-o-notation",
    "question": "What is Big O Notation?",
    "tags": [
      "javascript"
    ],
    "expertise": 2
  },
  {
    "name": "bind-function",
    "question": "Create a standalone function `bind` that is functionally equivalent to the method `Function.prototype.bind`.\n\n```js\nfunction example() {\n  console.log(this)\n}\nconst boundExample = bind(example, { a: true })\nboundExample.call({ b: true }) // logs { a: true }\n```",
    "tags": [
      "javascript"
    ],
    "expertise": 1
  },
  {
    "name": "cache-busting",
    "question": "What is the purpose of cache busting and how can you achieve it?",
    "tags": [
      "html"
    ],
    "expertise": 0
  },
  {
    "name": "callback-hell",
    "question": "How can you avoid callback hells?\n\n```js\ngetData(function(a) {\n  getMoreData(a, function(b) {\n    getMoreData(b, function(c) {\n      getMoreData(c, function(d) {\n        getMoreData(d, function(e) {\n          // ...\n        })\n      })\n    })\n  })\n})\n```",
    "tags": [
      "node",
      "javascript"
    ],
    "expertise": 2
  },
  {
    "name": "callback-in-setState",
    "question": "What is the purpose of callback function as an argument of `setState`?",
    "tags": [
      "react",
      "javascript"
    ],
    "expertise": 1
  },
  {
    "name": "callback-refs-vs-finddomnode",
    "question": "Which is the preferred option between callback refs and findDOMNode()?",
    "tags": [
      "react",
      "javascript"
    ],
    "expertise": 2
  },
  {
    "name": "callbacks",
    "question": "What is a callback? Can you show an example using one?",
    "tags": [
      "javascript"
    ],
    "expertise": 1
  },
  {
    "name": "children-prop",
    "question": "What is the `children` prop?",
    "tags": [
      "react",
      "javascript"
    ],
    "expertise": 2
  },
  {
    "name": "class-name",
    "question": "Why does React use `className` instead of `class` like in HTML?",
    "tags": [
      "react"
    ],
    "expertise": 1
  },
  {
    "name": "clone-object",
    "question": "How do you clone an object in JavaScript?",
    "tags": [
      "javascript"
    ],
    "expertise": 1
  },
  {
    "name": "closures",
    "question": "What is a closure? Can you give a useful example of one?",
    "tags": [
      "javascript"
    ],
    "expertise": 2
  },
  {
    "name": "comparing-objects",
    "question": "How do you compare two objects in JavaScript?",
    "tags": [
      "javascript"
    ],
    "expertise": 1
  },
  {
    "name": "context",
    "question": "What is context?",
    "tags": [
      "react",
      "javascript"
    ],
    "expertise": 2
  },
  {
    "name": "cors",
    "question": "What is CORS?",
    "tags": [
      "javascript"
    ],
    "expertise": 1
  },
  {
    "name": "css-box-model",
    "question": "Describe the layout of the CSS Box Model and briefly describe each component.",
    "tags": [
      "css"
    ],
    "expertise": 1
  },
  {
    "name": "css-preprocessors",
    "question": "What are the advantages of using CSS preprocessors?",
    "tags": [
      "css"
    ],
    "expertise": 0
  },
  {
    "name": "css-sibling-selectors",
    "question": "What is the difference between '+' and '~' sibling selectors?.",
    "tags": [
      "css"
    ],
    "expertise": 2
  },
  {
    "name": "css-specificity",
    "question": "Can you describe how CSS specificity works?",
    "tags": [
      "css"
    ],
    "expertise": 2
  },
  {
    "name": "dom",
    "question": "What is the DOM?",
    "tags": [
      "html",
      "javascript"
    ],
    "expertise": 1
  },
  {
    "name": "double-vs-triple-equals",
    "question": "What is the difference between the equality operators `==` and `===`?",
    "tags": [
      "javascript"
    ],
    "expertise": 0
  },
  {
    "name": "element-vs-component",
    "question": "What is the difference between an element and a component in React?",
    "tags": [
      "react",
      "javascript"
    ],
    "expertise": 0
  },
  {
    "name": "em-rem-difference",
    "question": "What is the difference between `em` and `rem` units?",
    "tags": [
      "css"
    ],
    "expertise": 1
  },
  {
    "name": "error-boundaries",
    "question": "What are error boundaries in React?",
    "tags": [
      "react"
    ],
    "expertise": 2
  },
  {
    "name": "event-delegation",
    "question": "What is event delegation and why is it useful? Can you show an example of how to use it?",
    "tags": [
      "javascript"
    ],
    "expertise": 1
  },
  {
    "name": "event-driven-programming",
    "question": "What is event-driven programming?",
    "tags": [
      "javascript"
    ],
    "expertise": 2
  },
  {
    "name": "expression-vs-statement",
    "question": "What is the difference between an expression and a statement in JavaScript?",
    "tags": [
      "javascript"
    ],
    "expertise": 1
  },
  {
    "name": "falsy-truthy",
    "question": "What are truthy and falsy values in JavaScript?",
    "tags": [
      "javascript"
    ],
    "expertise": 1
  },
  {
    "name": "fibonacci",
    "question": "Generate an array, containing the Fibonacci sequence, up until the nth term.",
    "tags": [
      "javascript"
    ],
    "expertise": 1
  },
  {
    "name": "flex-layout",
    "question": "Using flexbox, create a 3-column layout where each column takes up a `col-{n} / 12` ratio of the container.\n\n```html\n<div class=\"row\">\n  <div class=\"col-2\"></div>\n  <div class=\"col-7\"></div>\n  <div class=\"col-3\"></div>\n</div>\n```",
    "tags": [
      "css"
    ],
    "expertise": 0
  },
  {
    "name": "floating-point",
    "question": "What does `0.1 + 0.2 === 0.3` evaluate to?",
    "tags": [
      "javascript"
    ],
    "expertise": 1
  },
  {
    "name": "focus-ring",
    "question": "What is a focus ring? What is the correct solution to handle them?",
    "tags": [
      "css"
    ],
    "expertise": 2
  },
  {
    "name": "for-each-map",
    "question": "What is the difference between the array methods `map()` and `forEach()`?",
    "tags": [
      "javascript"
    ],
    "expertise": 1
  },
  {
    "name": "fragments",
    "question": "What are fragments?",
    "tags": [
      "react",
      "javascript"
    ],
    "expertise": 2
  },
  {
    "name": "functional-programming",
    "question": "What is functional programming?",
    "tags": [
      "javascript"
    ],
    "expertise": 2
  },
  {
    "name": "hoc-component",
    "question": "What are higher-order components?",
    "tags": [
      "react"
    ],
    "expertise": 2
  },
  {
    "name": "hoisting-example",
    "question": "What will the console log in this example?\n\n```js\nvar foo = 1\nvar foobar = function() {\n  console.log(foo)\n  var foo = 2\n}\nfoobar()\n```",
    "tags": [
      "javascript"
    ],
    "expertise": 1
  },
  {
    "name": "hoisting",
    "question": "How does hoisting work in JavaScript?",
    "tags": [
      "javascript"
    ],
    "expertise": 1
  },
  {
    "name": "html-multiple-header-footers",
    "question": "Can a web page contain multiple `<header>` elements? What about `<footer>` elements?",
    "tags": [
      "html"
    ],
    "expertise": 0
  },
  {
    "name": "html-specification-implementation",
    "question": "Discuss the differences between an HTML specification and a browser’s implementation thereof.",
    "tags": [
      "html"
    ],
    "expertise": 1
  },
  {
    "name": "html-vs-react-event-handling",
    "question": "What is the difference between HTML and React event handling?",
    "tags": [
      "react",
      "javascript",
      "html"
    ],
    "expertise": 1
  },
  {
    "name": "html-vs-xhtml",
    "question": "What are some differences that XHTML has compared to HTML?",
    "tags": [
      "html"
    ],
    "expertise": 1
  },
  {
    "name": "html5-semantic-elements-usage",
    "question": "Briefly describe the correct usage of the following HTML5 semantic elements: `<header>`, `<article>`,`<section>`, `<footer>`",
    "tags": [
      "html"
    ],
    "expertise": 0
  },
  {
    "name": "html5-web-storage",
    "question": "What is HTML5 Web Storage? Explain `localStorage` and `sessionStorage`.",
    "tags": [
      "html"
    ],
    "expertise": 2
  },
  {
    "name": "iife",
    "question": "What is the reason for wrapping the entire contents of a JavaScript source file in a function that is immediately invoked?",
    "tags": [
      "javascript"
    ],
    "expertise": 1
  },
  {
    "name": "imperative-vs-declarative",
    "question": "Explain the differences between imperative and declarative programming.",
    "tags": [
      "javascript"
    ],
    "expertise": 2
  },
  {
    "name": "inline-conditional-expressions",
    "question": "What are inline conditional expressions?",
    "tags": [
      "react",
      "javascript"
    ],
    "expertise": 1
  },
  {
    "name": "keys",
    "question": "What is a key? What are the benefits of using it in lists?",
    "tags": [
      "react",
      "javascript"
    ],
    "expertise": 1
  },
  {
    "name": "landmark-roles",
    "question": "What are landmark roles and how can they be useful?",
    "tags": [
      "accessibility"
    ],
    "expertise": 1
  },
  {
    "name": "lexical-vs-dynamic-scoping",
    "question": "What is the difference between lexical scoping and dynamic scoping?",
    "tags": [
      "javascript"
    ],
    "expertise": 1
  },
  {
    "name": "lifecycle-methods",
    "question": "What are the lifecycle methods in React?",
    "tags": [
      "react"
    ],
    "expertise": 1
  },
  {
    "name": "lifecycle",
    "question": "What are the different phases of the component lifecycle in React?",
    "tags": [
      "react"
    ],
    "expertise": 1
  },
  {
    "name": "lift-state",
    "question": "What does lifting state up in React mean?",
    "tags": [
      "react"
    ],
    "expertise": 0
  },
  {
    "name": "mask",
    "question": "Create a function that masks a string of characters with `#` except for the last four (4) characters.\n\n```js\nmask(\"123456789\") // \"#####6789\"\n```",
    "tags": [
      "javascript"
    ],
    "expertise": 1
  },
  {
    "name": "media-properties",
    "question": "Can you name the four types of `@media` properties?",
    "tags": [
      "css"
    ],
    "expertise": 0
  },
  {
    "name": "memoize",
    "question": "What is memoization?",
    "tags": [
      "javascript"
    ],
    "expertise": 2
  },
  {
    "name": "methods-context-react-classes",
    "question": "How do you ensure methods have the correct `this` context in React component classes?",
    "tags": [
      "react",
      "javascript"
    ],
    "expertise": 2
  },
  {
    "name": "mime",
    "question": "What is a MIME type and what is it used for?",
    "tags": [
      "javascript"
    ],
    "expertise": 1
  },
  {
    "name": "mutable-vs-immutable",
    "question": "Contrast mutable and immutable values, and mutating vs non-mutating methods.",
    "tags": [
      "javascript"
    ],
    "expertise": 2
  },
  {
    "name": "nan",
    "question": "What is the only value not equal to itself in JavaScript?",
    "tags": [
      "javascript"
    ],
    "expertise": 2
  },
  {
    "name": "node-error-first-callback",
    "question": "NodeJS often uses a callback pattern where if an error is encountered during execution, this error is passed as the first argument to the callback. What are the advantages of this pattern?\n\n```js\nfs.readFile(filePath, function(err, data) {\n  if (err) {\n    // handle the error, the return is important here\n    // so execution stops here\n    return console.log(err)\n  }\n  // use the data object\n  console.log(data)\n})\n```",
    "tags": [
      "node",
      "javascript"
    ],
    "expertise": 1
  },
  {
    "name": "node-event-loop",
    "question": "What is the event loop in Node.js?",
    "tags": [
      "node",
      "javascript"
    ],
    "expertise": 2
  },
  {
    "name": "null-vs-undefined",
    "question": "What is the difference between `null` and `undefined`?",
    "tags": [
      "javascript"
    ],
    "expertise": 1
  },
  {
    "name": "object-creation",
    "question": "Describe the different ways to create an object. When should certain ways be preferred over others?",
    "tags": [
      "javascript"
    ],
    "expertise": 1
  },
  {
    "name": "parameter-vs-argument",
    "question": "What is the difference between a parameter and an argument?",
    "tags": [
      "javascript"
    ],
    "expertise": 1
  },
  {
    "name": "pass-by-value-reference",
    "question": "Does JavaScript pass by value or by reference?",
    "tags": [
      "javascript"
    ],
    "expertise": 1
  },
  {
    "name": "passing-arguments-to-event-handlers",
    "question": "How do you pass an argument to an event handler or callback?",
    "tags": [
      "react",
      "javascript"
    ],
    "expertise": 1
  },
  {
    "name": "pipe",
    "question": "Create a function `pipe` that performs left-to-right function composition by returning a function that accepts one argument.\n\n```js\nconst square = v => v * v\nconst double = v => v * 2\nconst addOne = v => v + 1\nconst res = pipe(square, double, addOne)\nres(3) // 19; addOne(double(square(3)))\n```",
    "tags": [
      "javascript"
    ],
    "expertise": 2
  },
  {
    "name": "portals",
    "question": "What are portals in React?",
    "tags": [
      "react",
      "javascript"
    ],
    "expertise": 2
  },
  {
    "name": "postfix-vs-prefix-increment",
    "question": "What is the difference between the postfix `i++` and prefix `++i` increment operators?",
    "tags": [
      "javascript"
    ],
    "expertise": 0
  },
  {
    "name": "promise-states",
    "question": "In which states can a Promise be?",
    "tags": [
      "javascript"
    ],
    "expertise": 0
  },
  {
    "name": "promises",
    "question": "What are Promises?",
    "tags": [
      "javascript"
    ],
    "expertise": 1
  },
  {
    "name": "prop-validation",
    "question": "How to apply prop validation in React?",
    "tags": [
      "react"
    ],
    "expertise": 2
  },
  {
    "name": "prototypal-inheritance",
    "question": "How does prototypal inheritance differ from classical inheritance?",
    "tags": [
      "javascript"
    ],
    "expertise": 1
  },
  {
    "name": "pure-functions",
    "question": "What is a pure function?",
    "tags": [
      "javascript"
    ],
    "expertise": 2
  },
  {
    "name": "react-comments",
    "question": "How do you write comments inside a JSX tree in React?",
    "tags": [
      "react"
    ],
    "expertise": 0
  },
  {
    "name": "recursion",
    "question": "What is recursion and when is it useful?",
    "tags": [
      "javascript"
    ],
    "expertise": 2
  },
  {
    "name": "reference-example",
    "question": "What is the output of the following code?\n\n```js\nconst a = [1, 2, 3]\nconst b = [1, 2, 3]\nconst c = \"1,2,3\"\n\nconsole.log(a == c)\nconsole.log(a == b)\n```",
    "tags": [
      "javascript"
    ],
    "expertise": 1
  },
  {
    "name": "refs",
    "question": "What are refs in React? When should they be used?",
    "tags": [
      "react",
      "javascript"
    ],
    "expertise": 2
  },
  {
    "name": "rel-noopener",
    "question": "Where and why is the `rel=\"noopener\"` attribute used?",
    "tags": [
      "html"
    ],
    "expertise": 1
  },
  {
    "name": "rest",
    "question": "What is REST?",
    "tags": [
      "node"
    ],
    "expertise": 1
  },
  {
    "name": "return-semicolon",
    "question": "What does the following function return?\n\n```js\nfunction greet() {\n  return\n  {\n    message: \"hello\"\n  }\n}\n```",
    "tags": [
      "javascript"
    ],
    "expertise": 1
  },
  {
    "name": "semicolons",
    "question": "Are semicolons required in JavaScript?",
    "tags": [
      "javascript"
    ],
    "expertise": 1
  },
  {
    "name": "short-circuit-evaluation",
    "question": "What is short-circuit evaluation in JavaScript?",
    "tags": [
      "javascript"
    ],
    "expertise": 1
  },
  {
    "name": "sprites",
    "question": "What are the advantages of using CSS sprites and how are they utilized?",
    "tags": [
      "css"
    ],
    "expertise": 1
  },
  {
    "name": "stateful-components",
    "question": "What is a stateful component in React?",
    "tags": [
      "react",
      "javascript"
    ],
    "expertise": 0
  },
  {
    "name": "stateless-components",
    "question": "What is a stateless component?",
    "tags": [
      "react",
      "javascript"
    ],
    "expertise": 0
  },
  {
    "name": "static-vs-instance-method",
    "question": "Explain the difference between a static method and an instance method.",
    "tags": [
      "javascript"
    ],
    "expertise": 2
  },
  {
    "name": "sync-vs-async",
    "question": "What is the difference between synchronous and asynchronous code in JavaScript?",
    "tags": [
      "javascript"
    ],
    "expertise": 1
  },
  {
    "name": "this",
    "question": "What is the `this` keyword and how does it work?",
    "tags": [
      "javascript"
    ],
    "expertise": 2
  },
  {
    "name": "typeof-typeof",
    "question": "What does the following code evaluate to?\n\n```js\ntypeof typeof 0\n```",
    "tags": [
      "javascript"
    ],
    "expertise": 1
  },
  {
    "name": "types",
    "question": "What are JavaScript data types?",
    "tags": [
      "javascript"
    ],
    "expertise": 1
  },
  {
    "name": "ui-library-framework-purpose",
    "question": "What is the purpose of JavaScript UI libraries/frameworks like React, Vue, Angular, Hyperapp, etc?",
    "tags": [
      "javascript"
    ],
    "expertise": 2
  },
  {
    "name": "use-strict",
    "question": "What does `'use strict'` do and what are some of the key benefits to using it?",
    "tags": [
      "javascript"
    ],
    "expertise": 2
  },
  {
    "name": "var-let-const",
    "question": "What are the differences between `var`, `let`, `const` and no keyword statements?",
    "tags": [
      "javascript"
    ],
    "expertise": 1
  },
  {
    "name": "virtual-dom",
    "question": "What is a virtual DOM and why is it used in libraries/frameworks?",
    "tags": [
      "javascript"
    ],
    "expertise": 2
  },
  {
    "name": "wcag",
    "question": "What is WCAG? What are the differences between A, AA, and AAA compliance?",
    "tags": [
      "accessibility"
    ],
    "expertise": 0
  },
  {
    "name": "xss",
    "question": "What is a cross-site scripting attack (XSS) and how do you prevent it?",
    "tags": [
      "security",
      "javascript"
    ],
    "expertise": 1
  }
] as const satisfies readonly ThirtySecondsInterviewQuestion[];
