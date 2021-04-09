## Description

[Nest](https://github.com/nestjs/nest) framework TypeScript starter repository.

### Cache strategy

When first user requests list of character ids, we store a deferred object to node-cache state and then, we establish requests to marvel server to get list of all marvel characters to fulfill that deferred promise.
If new requests come while waiting for marvel chunked requests to be done, they wait for the same deferred to be fulfilled. So no new requests go to marvel server.
After fetching all chunks and making up complete list of character ids, we fulfill the deferred object and all requests waiting for it's promise will be responded.
After that we start loop for checking size of marvel characters, and if size is changed on marvel server, we will refresh the cache by requesting all chunks again.

## Installation

```bash
$ npm install
```

## Running the app

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

## Test

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```

## Support

Nest is an MIT-licensed open source project. It can grow thanks to the sponsors and support by the amazing backers. If you'd like to join them, please [read more here](https://docs.nestjs.com/support).

## Stay in touch

- Author - [Kamil Myśliwiec](https://kamilmysliwiec.com)
- Website - [https://nestjs.com](https://nestjs.com/)
- Twitter - [@nestframework](https://twitter.com/nestframework)

## License

Nest is [MIT licensed](LICENSE).
