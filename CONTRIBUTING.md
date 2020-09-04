# Contributing

We want to make contributing to this project as easy and transparent as possible and we are grateful for, any contributions made by the community. By contributing to SyncState, you agree to abide by the [code of conduct](https://github.com/syncstate/core/blob/master/CODE_OF_CONDUCT.md).

## Reporting Issues and Asking Questions

Before opening an issue, please search the [issue tracker](https://github.com/syncstate/core/issues) to make sure your issue hasn't already been reported.

### Bugs and Improvements

We use the issue tracker to keep track of bugs and improvements to SyncState itself, its examples, and the documentation. We encourage you to open issues to discuss improvements, architecture, theory, internal implementation, etc. If a topic has been discussed before, we will ask you to join the previous discussion.

As SyncState is stable software, changes to its behavior are very carefully considered. Any pull requests that involve breaking changes should be made against the `next` branch.

### Getting Help

As SyncState is very new to the community, we understand that solution to your question can not be found easily. But we would strongly suggest to go through the Documentation and FAQ's , if you still have the query please add your questions on **StackOverflow**. As SyncState will mature we are sure you can easily find answers to your questions.

Some questions may take longer than expected to get answered, in that case we would encourage you to post an issue linking to your question. We will close your issue but this will give people watching the repo an opportunity to see your question and reply to it on StackOverflow if they know the answer.

Please be considerate when doing this as this is not the primary purpose of the issue tracker.

### Help Us Help You

On both websites, it is a good idea to structure your code and question in a way that is easy to read to entice people to answer it. For example, we encourage you to use syntax highlighting, indentation, and split text in paragraphs.

Please keep in mind that people spend their free time trying to help you. You can make it easier for them if you provide versions of the relevant libraries and a runnable small project reproducing your issue. You can put your code on [JSBin](http://jsbin.com) or, for bigger projects, on GitHub. Make sure all the necessary dependencies are declared in `package.json` so anyone can run `yarn install && yarn start` and reproduce your issue.

## Development

Visit the [issue tracker](https://github.com/syncstate/core/issues) to find a list of open issues that need attention.

Fork, then clone the repo:

```sh
git clone https://github.com/syncstate/core.git
```

### Building

#### Building SyncState

```sh
yarn run build
```

### Testing and Linting

To only run linting:

```sh
yarn run lint
```

To only run tests:

```sh
yarn run test
```

To continuously watch and run tests, run the following:

```sh
yarn run test:watch
```

### Docs

Improvements to the documentation are always welcome. You can find them in the on [`syncstate.github.io`](https://github.com/syncstate/syncstate.github.io) path. We use [Docusaurus](https://docusaurus.io/) to build our documentation website. The website is published automatically whenever the `master` branch is updated.

### Examples

SyncState comes with a Todo App example to demonstrate various concepts and best practices.

When adding a new example, please adhere to the style and format of the existing examples, and try to reuse as much code as possible.

#### Testing the Examples

To test the official SyncState examples, run the following:

Install dependencies using yarn

```sh
yarn
```
Then run the example using

```sh
yarn start
```

Not all examples have tests. If you see an example project without tests, you are very welcome to add them in a way consistent with the examples that have tests.

Please visit the [Examples page](https://SyncState.js.org/introduction/examples) for information on running individual examples.

### Sending a Pull Request

For non-trivial changes, please open an issue with a proposal for a new feature or refactoring before starting on the work. We don't want you to waste your efforts on a pull request that we won't want to accept.

In general, the contribution workflow looks like this:

- Open a new issue in the [Issue tracker](https://github.com/syncstate/core/issues).
- Fork the repo.
- Create a new feature branch based off the `master` branch.
- Make sure all tests pass and there are no linting errors.
- Submit a pull request, referencing any issues it addresses.

Please try to keep your pull request focused in scope and avoid including unrelated commits.

After you have submitted your pull request, we'll try to get back to you as soon as possible. We may suggest some changes or improvements.

Thank you for contributing!
