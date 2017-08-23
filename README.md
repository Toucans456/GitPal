# GitBud

> GitBud is an application that allows users to connect with others who are either at the same level or higher to work on open source projects. Users can view current projects, interested users, and pair up to work on a project together.

## Team

  - __Product Owner__: Shaikat Haque
  - __Scrum Master__: Francis Ngo
  - __Development Team Members__: Peter Warner-Medley, Brian Kim

## Table of Contents

1. [Usage](#Usage)
1. [Requirements](#requirements)
1. [Development](#development)
    1. [Installing Dependencies](#installing-dependencies)
    1. [Tasks](#tasks)
1. [Team](#team)
1. [Contributing](#contributing)

## Usage

- Fork and clone the repo
- Install dependencies from the root of the repo by running
```sh
npm install
```
- [Download](https://neo4j.com/download/community-edition) and install neo4j
- Start the neo4j server (OS dependent)
- Seed the database by running:
```sh
npm run seed
```
- Transpile the JSX files with
```sh
npm run dev
```
> _NOTE_ This sets webpack to watch your files for changes
- Run the following command to start the server
```sh
npm start
```
- Open localhost:8080 in your browser to start using the application.

## Requirements

- Node 0.10.x
- [neo4j 3.x](https://neo4j.com/download/)

## Development

### Installing Dependencies

From within the root directory:

```sh
npm install
```
[Download](https://neo4j.com/download/community-edition), install and run neo4j

### Roadmap

View the project roadmap [here](https://github.com/cranebaes/gitbud/issues)


## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for contribution guidelines.
